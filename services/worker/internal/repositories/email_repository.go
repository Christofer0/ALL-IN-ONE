package repositories

import (
	"scheduler-worker/internal/models"
	"gorm.io/gorm"
)

type EmailRepository interface {
	GetAll() ([]models.ScheduledEmail, error)
	GetPending() ([]models.ScheduledEmail, error)
	Create(email *models.ScheduledEmail) error
	Update(email *models.ScheduledEmail) error
	Delete(id uint) error
	GetByID(id uint) (*models.ScheduledEmail, error)
}

type emailRepository struct {
	db *gorm.DB
}

func NewEmailRepository(db *gorm.DB) EmailRepository {
	return &emailRepository{db}
}

func (r *emailRepository) GetAll() ([]models.ScheduledEmail, error) {
	var emails []models.ScheduledEmail
	err := r.db.Order("target_date asc, target_time asc").Find(&emails).Error
	return emails, err
}

func (r *emailRepository) GetPending() ([]models.ScheduledEmail, error) {
	var emails []models.ScheduledEmail
	err := r.db.Where("status = ?", "pending").Find(&emails).Error
	return emails, err
}

func (r *emailRepository) Create(email *models.ScheduledEmail) error {
	return r.db.Create(email).Error
}

func (r *emailRepository) Update(email *models.ScheduledEmail) error {
	return r.db.Save(email).Error
}

func (r *emailRepository) Delete(id uint) error {
	return r.db.Delete(&models.ScheduledEmail{}, id).Error
}

func (r *emailRepository) GetByID(id uint) (*models.ScheduledEmail, error) {
	var email models.ScheduledEmail
	err := r.db.First(&email, id).Error
	return &email, err
}
