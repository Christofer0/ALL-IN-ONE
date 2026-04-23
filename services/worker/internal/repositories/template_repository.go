package repositories

import (
	"scheduler-worker/internal/models"
	"gorm.io/gorm"
)

type TemplateRepository interface {
	GetAll() ([]models.EmailTemplate, error)
	GetByID(id uint) (*models.EmailTemplate, error)
	Create(template *models.EmailTemplate) error
	Update(template *models.EmailTemplate) error
}
 
type ActivityLogRepository interface {
	Create(log *models.ActivityLog) error
}
 
type templateRepository struct {
	db *gorm.DB
}

func NewTemplateRepository(db *gorm.DB) TemplateRepository {
	return &templateRepository{db}
}

func (r *templateRepository) GetAll() ([]models.EmailTemplate, error) {
	var templates []models.EmailTemplate
	err := r.db.Where("is_active = ?", true).Order("id desc").Find(&templates).Error
	return templates, err
}

func (r *templateRepository) GetByID(id uint) (*models.EmailTemplate, error) {
	var template models.EmailTemplate
	err := r.db.First(&template, id).Error
	return &template, err
}

func (r *templateRepository) Create(template *models.EmailTemplate) error {
	return r.db.Create(template).Error
}

func (r *templateRepository) Update(template *models.EmailTemplate) error {
	return r.db.Save(template).Error
}

// Log Repository
type LogRepository interface {
	Create(log *models.SchedulerLog) error
}

type logRepository struct {
	db *gorm.DB
}

func NewLogRepository(db *gorm.DB) LogRepository {
	return &logRepository{db}
}

func (r *logRepository) Create(log *models.SchedulerLog) error {
	return r.db.Create(log).Error
}

type activityLogRepository struct {
	db *gorm.DB
}

func NewActivityLogRepository(db *gorm.DB) ActivityLogRepository {
	return &activityLogRepository{db}
}

func (r *activityLogRepository) Create(log *models.ActivityLog) error {
	return r.db.Create(log).Error
}
