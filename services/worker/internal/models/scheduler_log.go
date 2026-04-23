package models

import (
	"time"
)

type SchedulerLog struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	ActionType string    `gorm:"not null" json:"actionType"` // SCHEDULE_CREATED, EMAIL_SENT, etc.
	EmailID    *uint     `json:"emailId"`
	TemplateID *uint     `json:"templateId"`
	Message    string    `json:"message"`
	CreatedAt  time.Time `json:"createdAt"`
}
