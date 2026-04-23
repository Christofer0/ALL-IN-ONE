package models

import (
	"time"

	"gorm.io/gorm"
)

type ScheduledEmail struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	RecipientEmail string         `gorm:"not null" json:"to"`
	Subject        string         `gorm:"not null" json:"subject"`
	Body           string         `gorm:"type:text;not null" json:"body"`
	TargetDate     string         `gorm:"not null" json:"date"` // YYYY-MM-DD
	TargetTime     string         `gorm:"not null" json:"time"` // HH:MM
	RepeatRule     string         `gorm:"default:'none'" json:"repeat"`
	Status         string         `gorm:"default:'pending'" json:"status"`
	SentAt         *time.Time     `json:"sentAt"`
	CreatedAt      time.Time      `json:"createdAt"`
	UpdatedAt      time.Time      `json:"updatedAt"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}
