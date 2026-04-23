package main

import (
	"log"
	"net/http"
	"os"

	"scheduler-worker/internal/config"
	"scheduler-worker/internal/handlers"
	"scheduler-worker/internal/models"
	"scheduler-worker/internal/repositories"
	"scheduler-worker/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/robfig/cron/v3"
)

func main() {
	// 1. Init DB & Models
	config.InitDB()
	seedTemplates()

	// 2. Setup Components
	emailRepo := repositories.NewEmailRepository(config.DB)
	templateRepo := repositories.NewTemplateRepository(config.DB)
	logRepo := repositories.NewLogRepository(config.DB)
	activityRepo := repositories.NewActivityLogRepository(config.DB)
	contactRepo := repositories.NewContactRepository(config.DB)
	emailService := services.NewEmailService(emailRepo, templateRepo, logRepo, activityRepo, contactRepo)
	emailHandler := handlers.NewEmailHandler(emailService)
	contactHandler := handlers.NewContactHandler(contactRepo, emailService)

	// 3. Start Scheduler (Cron)
	c := cron.New()
	_, err := c.AddFunc("* * * * *", func() {
		// log.Println("[CRON] Checking pending emails...")
		emailService.RunPendingCron()
	})
	if err != nil {
		log.Fatal("Failed to start cron:", err)
	}
	c.Start()
	log.Println("Background scheduler started (1 min interval).")

	// 4. Setup API Routes
	r := gin.Default()
	r.SetTrustedProxies(nil)

	// CORS Middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}
		c.Next()
	})

	api := r.Group("/api/worker")
	{
		api.GET("/emails", emailHandler.GetEmails)
		api.POST("/emails", emailHandler.CreateEmail)
		api.PUT("/emails/:id", emailHandler.UpdateEmail)
		api.DELETE("/emails/:id", emailHandler.DeleteEmail)
		api.GET("/templates", emailHandler.GetTemplates)
		api.POST("/templates", emailHandler.CreateTemplate)
		api.PUT("/templates/:id", emailHandler.UpdateTemplate)
		api.DELETE("/templates/:id", emailHandler.DeleteTemplate)
		api.GET("/contact/messages", contactHandler.GetMessages)
	}

	r.POST("/api/contact", contactHandler.SendMessage)

	// 5. Run Server
	port := os.Getenv("WORKER_PORT")
	if port == "" {
		port = "9992"
	}
	log.Printf("Worker API running on port %s\n", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to run server:", err)
	}
}

func seedTemplates() {
	var count int64
	config.DB.Model(&models.EmailTemplate{}).Count(&count)
	if count > 0 {
		return
	}

	templates := []models.EmailTemplate{
		{Name: "Weekly Digest", Icon: "📊", Subject: "Weekly Summary – {{date}}", Body: "Hi {{name}},\n\nHere is your weekly summary for the week of {{date}}.\n\n[Add content here]\n\nBest regards,\nBrillian"},
		{Name: "Follow-up", Icon: "🔄", Subject: "Follow-up: {{topic}}", Body: "Hi {{name}},\n\nI wanted to follow up on {{topic}} from our last interaction.\n\n[Add context]\n\nLooking forward to hearing from you.\n\nBest,\nBrillian"},
		{Name: "Invoice Reminder", Icon: "💰", Subject: "Invoice Reminder – Due {{date}}", Body: "Dear {{name}},\n\nThis is a friendly reminder that your invoice #{{invoice}} is due on {{date}}.\n\nPlease process payment at your earliest convenience.\n\nThank you,\nBrillian"},
		{Name: "Morning Report", Icon: "☀️", Subject: "Daily Morning Report – {{date}}", Body: "Good morning!\n\nYour daily report for {{date}}:\n\n📊 Cashflow: [balance]\n✅ Habits: [count]\n📌 Top priority: [task]\n\nHave a productive day!"},
	}

	for _, t := range templates {
		config.DB.Create(&t)
	}
	log.Println("Default templates seeded.")
}
