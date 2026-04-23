package services

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	"gorm.io/datatypes"

	"scheduler-worker/internal/config"
	"scheduler-worker/internal/models"
	"scheduler-worker/internal/repositories"

	"gopkg.in/gomail.v2"
)

type EmailService interface {
	ScheduleEmail(email *models.ScheduledEmail) error
	UpdateEmail(email *models.ScheduledEmail) error
	CancelEmail(id uint) error
	GetAllEmails() ([]models.ScheduledEmail, error)
	GetAllTemplates() ([]models.EmailTemplate, error)
	CreateTemplate(template *models.EmailTemplate) error
	UpdateTemplate(template *models.EmailTemplate) error
	DeleteTemplate(id uint) error
	RunPendingCron()
	SendContactEmail(name, email, subject, message string) error
}

type emailService struct {
	emailRepo    repositories.EmailRepository
	templateRepo repositories.TemplateRepository
	logRepo      repositories.LogRepository
	activityRepo repositories.ActivityLogRepository
	contactRepo  repositories.ContactRepository
}

func NewEmailService(
	emailRepo repositories.EmailRepository,
	templateRepo repositories.TemplateRepository,
	logRepo repositories.LogRepository,
	activityRepo repositories.ActivityLogRepository,
	contactRepo repositories.ContactRepository,
) EmailService {
	return &emailService{emailRepo, templateRepo, logRepo, activityRepo, contactRepo}
}

func (s *emailService) ScheduleEmail(email *models.ScheduledEmail) error {
	err := s.emailRepo.Create(email)
	if err == nil {
		details, _ := json.Marshal(email)
		s.activityRepo.Create(&models.ActivityLog{
			Action:     "SCHEDULE_CREATED",
			EntityType: "email_schedule",
			Details:    datatypes.JSON(details),
		})
	}
	return err
}

func (s *emailService) UpdateEmail(email *models.ScheduledEmail) error {
	err := s.emailRepo.Update(email)
	if err == nil {
		details, _ := json.Marshal(email)
		s.activityRepo.Create(&models.ActivityLog{
			Action:     "SCHEDULE_UPDATED",
			EntityType: "email_schedule",
			Details:    datatypes.JSON(details),
		})
	}
	return err
}

func (s *emailService) CancelEmail(id uint) error {
	err := s.emailRepo.Delete(id)
	if err == nil {
		s.activityRepo.Create(&models.ActivityLog{
			Action:     "SCHEDULE_CANCELLED",
			EntityType: "email_schedule",
			Details:    datatypes.JSON(fmt.Sprintf(`{"id": %d}`, id)),
		})
	}
	return err
}

func (s *emailService) GetAllEmails() ([]models.ScheduledEmail, error) {
	return s.emailRepo.GetAll()
}

func (s *emailService) GetAllTemplates() ([]models.EmailTemplate, error) {
	return s.templateRepo.GetAll()
}

func (s *emailService) CreateTemplate(template *models.EmailTemplate) error {
	err := s.templateRepo.Create(template)
	if err == nil {
		details, _ := json.Marshal(template)
		s.activityRepo.Create(&models.ActivityLog{
			Action:     "TEMPLATE_CREATED",
			EntityType: "email_template",
			Details:    datatypes.JSON(details),
		})
	}
	return err
}

func (s *emailService) UpdateTemplate(template *models.EmailTemplate) error {
	err := s.templateRepo.Update(template)
	if err == nil {
		details, _ := json.Marshal(template)
		s.activityRepo.Create(&models.ActivityLog{
			Action:     "TEMPLATE_UPDATED",
			EntityType: "email_template",
			Details:    datatypes.JSON(details),
		})
	}
	return err
}

func (s *emailService) DeleteTemplate(id uint) error {
	template, err := s.templateRepo.GetByID(id)
	if err != nil {
		return err
	}

	template.IsActive = false
	err = s.templateRepo.Update(template)
	if err == nil {
		s.activityRepo.Create(&models.ActivityLog{
			Action:     "TEMPLATE_DELETED",
			EntityType: "email_template",
			Details:    datatypes.JSON(fmt.Sprintf(`{"id": %d, "name": "%s"}`, id, template.Name)),
		})
	}
	return err
}

func (s *emailService) RunPendingCron() {
	now := time.Now()
	dateStr := now.Format("2006-01-02")
	timeStr := now.Format("15:04")

	emails, err := s.emailRepo.GetPending()
	if err != nil {
		log.Println("Cron Error: Failed to fetch pending emails:", err)
		return
	}

	for _, email := range emails {
		// Check if it's time or past time
		if email.TargetDate < dateStr || (email.TargetDate == dateStr && email.TargetTime <= timeStr) {
			s.sendEmailReal(&email)
		}
	}
}

func (s *emailService) sendEmailReal(email *models.ScheduledEmail) {
	mailCfg := config.GetMailConfig()
	
	m := gomail.NewMessage()
	m.SetHeader("From", mailCfg.DefaultSender)
	m.SetHeader("To", email.RecipientEmail)
	m.SetHeader("Subject", email.Subject)

	// Convert newlines to <br> for HTML email
	formattedBody := strings.ReplaceAll(email.Body, "\n", "<br>")
	m.SetBody("text/html", formattedBody)

	d := gomail.NewDialer(mailCfg.Server, mailCfg.Port, mailCfg.Username, mailCfg.Password)
	
	// Handle TLS/SSL configuration
	if mailCfg.UseTLS {
		d.TLSConfig = &tls.Config{InsecureSkipVerify: true, ServerName: mailCfg.Server}
	}

	err := d.DialAndSend(m)
	
	now := time.Now()
	statusMsg := fmt.Sprintf("Successfully sent email to %s", email.RecipientEmail)
	email.Status = "sent"
	email.SentAt = &now

	if err != nil {
		log.Printf("[ERROR SEND] To: %s | Error: %v\n", email.RecipientEmail, err)
		statusMsg = fmt.Sprintf("Failed to send email to %s: %v", email.RecipientEmail, err)
		email.Status = "failed" 
	} else {
		log.Printf("[SUCCESS SEND] To: %s\n", email.RecipientEmail)
	}
	
	s.emailRepo.Update(email)
	
	s.logRepo.Create(&models.SchedulerLog{
		ActionType: "EMAIL_SENT",
		EmailID:    &email.ID,
		Message:    statusMsg,
	})

	if email.RepeatRule != "none" {
		s.createNextRecurring(email)
	}
}

func (s *emailService) createNextRecurring(email *models.ScheduledEmail) {
	layout := "2006-01-02"
	t, _ := time.Parse(layout, email.TargetDate)
	var nextDate time.Time

	switch email.RepeatRule {
	case "daily":
		nextDate = t.AddDate(0, 0, 1)
	case "weekly":
		nextDate = t.AddDate(0, 0, 7)
	case "monthly":
		nextDate = t.AddDate(0, 1, 0)
	default:
		return
	}

	newEmail := &models.ScheduledEmail{
		RecipientEmail: email.RecipientEmail,
		Subject:        email.Subject,
		Body:           email.Body,
		TargetDate:     nextDate.Format(layout),
		TargetTime:     email.TargetTime,
		RepeatRule:     email.RepeatRule,
		Status:         "pending",
	}
	s.emailRepo.Create(newEmail)

	s.logRepo.Create(&models.SchedulerLog{
		ActionType: "SCHEDULE_CREATED",
		EmailID:    &newEmail.ID,
		Message:    fmt.Sprintf("Recurring email scheduled for %s", newEmail.TargetDate),
	})
}

func (s *emailService) SendContactEmail(name, email, subject, message string) error {
	now := time.Now()
	dateStr := now.Format("2006-01-02")
	timeStr := now.Format("15:04")
	mailCfg := config.GetMailConfig()

	// Prepare body
	body := fmt.Sprintf(`
		<h3>New Contact Message</h3>
		<p><strong>From:</strong> %s (%s)</p>
		<p><strong>Subject:</strong> %s</p>
		<p><strong>Message:</strong></p>
		<p>%s</p>
	`, name, email, subject, strings.ReplaceAll(message, "\n", "<br>"))

	scheduledEmail := &models.ScheduledEmail{
		RecipientEmail: mailCfg.AdminEmail, // Use the admin email from config
		Subject:        fmt.Sprintf("Contact: %s", subject),
		Body:           body,
		TargetDate:     dateStr,
		TargetTime:     timeStr,
		RepeatRule:     "none",
		Status:         "pending",
	}

	return s.ScheduleEmail(scheduledEmail)
}
