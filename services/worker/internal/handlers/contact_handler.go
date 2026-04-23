package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"scheduler-worker/internal/models"
	"scheduler-worker/internal/repositories"
	"scheduler-worker/internal/services"
)

type ContactHandler struct {
	contactRepo  repositories.ContactRepository
	emailService services.EmailService
}

func NewContactHandler(cr repositories.ContactRepository, es services.EmailService) *ContactHandler {
	return &ContactHandler{cr, es}
}

func (h *ContactHandler) SendMessage(c *gin.Context) {
	var input struct {
		Name       string `json:"name" binding:"required"`
		Email      string `json:"email" binding:"required,email"`
		Subject    string `json:"subject"`
		Message    string `json:"message" binding:"required"`
		IsNotRobot bool   `json:"is_not_robot" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if !input.IsNotRobot {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please confirm you are not a robot"})
		return
	}

	// 1. Save to DB
	message := &models.ContactMessage{
		Name:       input.Name,
		Email:      input.Email,
		Subject:    input.Subject,
		Message:    input.Message,
		IsNotRobot: input.IsNotRobot,
	}

	if err := h.contactRepo.Create(message); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save message"})
		return
	}

	// 2. Schedule Notification Email
	if err := h.emailService.SendContactEmail(input.Name, input.Email, input.Subject, input.Message); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to schedule email notification"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Message sent successfully"})
}

func (h *ContactHandler) GetMessages(c *gin.Context) {
	messages, err := h.contactRepo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch messages"})
		return
	}
	c.JSON(http.StatusOK, messages)
}
