package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"scheduler-worker/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	// Try to load .env from several locations
	_ = godotenv.Load(".env")
	_ = godotenv.Load("../.env")
	_ = godotenv.Load("../../core/.env")

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL is not set in .env")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto-migrate the schemas
	err = db.AutoMigrate(&models.ScheduledEmail{}, &models.EmailTemplate{}, &models.SchedulerLog{}, &models.ActivityLog{}, &models.ContactMessage{})
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	DB = db
	log.Println("Database connection established and schemas migrated.")
}
