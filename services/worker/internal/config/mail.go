package config

import (
	"os"
	"strconv"
)

type MailConfig struct {
	Server        string
	Port          int
	Username      string
	Password      string
	DefaultSender string
	AdminEmail    string
	UseTLS        bool
}

func GetMailConfig() MailConfig {
	port, _ := strconv.Atoi(os.Getenv("MAIL_PORT"))
	useTLS := os.Getenv("MAIL_USE_TLS") == "True"

	return MailConfig{
		Server:        os.Getenv("MAIL_SERVER"),
		Port:          port,
		Username:      os.Getenv("MAIL_USERNAME"),
		Password:      os.Getenv("MAIL_PASSWORD"),
		DefaultSender: os.Getenv("MAIL_DEFAULT_SENDER"),
		AdminEmail:    os.Getenv("MAIL_ADMIN"),
		UseTLS:        useTLS,
	}
}
