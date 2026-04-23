package models

import (
	"time"
)

type ContactMessage struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	Name       string    `gorm:"not null" json:"name"`
	Email      string    `gorm:"not null" json:"email"`
	Subject    string    `json:"subject"`
	Message    string    `gorm:"type:text;not null" json:"message"`
	IsNotRobot bool      `json:"is_not_robot"`
	CreatedAt  time.Time `json:"createdAt"`
}
