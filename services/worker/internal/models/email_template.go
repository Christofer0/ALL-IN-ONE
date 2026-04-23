package models

import (
	"time"

	"gorm.io/gorm"
)

type EmailTemplate struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Name      string         `gorm:"not null" json:"name"`
	Icon      string         `json:"icon"`
	Subject   string         `gorm:"not null" json:"subject"`
	Body      string         `gorm:"type:text;not null" json:"body"`
	IsActive  bool           `gorm:"default:true" json:"isActive"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
