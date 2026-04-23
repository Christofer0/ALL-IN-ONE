package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type ActivityLog struct {
	ID         uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Action     string         `gorm:"not null" json:"action"`
	EntityType string         `gorm:"not null" json:"entityType"`
	EntityID   *uuid.UUID     `gorm:"type:uuid" json:"entityId"`
	Details    datatypes.JSON `json:"details"`
	CreatedAt  time.Time      `gorm:"default:now()" json:"createdAt"`
}
