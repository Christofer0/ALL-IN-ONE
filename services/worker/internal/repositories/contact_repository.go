package repositories

import (
	"scheduler-worker/internal/models"
	"gorm.io/gorm"
)

type ContactRepository interface {
	Create(message *models.ContactMessage) error
	GetAll() ([]models.ContactMessage, error)
}

type contactRepository struct {
	db *gorm.DB
}

func NewContactRepository(db *gorm.DB) ContactRepository {
	return &contactRepository{db}
}

func (r *contactRepository) Create(message *models.ContactMessage) error {
	return r.db.Create(message).Error
}

func (r *contactRepository) GetAll() ([]models.ContactMessage, error) {
	var messages []models.ContactMessage
	err := r.db.Order("created_at desc").Find(&messages).Error
	return messages, err
}
