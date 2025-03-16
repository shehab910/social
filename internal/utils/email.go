package utils

import (
	"net/smtp"
)

type EmailConfig struct {
	FromEmail         string
	FromEmailSmtp     string
	FromEmailPassword string
	FromEmailPort     string
}

func SendEmail(to []string, subject string, body string, cfg EmailConfig) error {

	auth := smtp.PlainAuth(
		"",
		cfg.FromEmail,
		cfg.FromEmailPassword,
		cfg.FromEmailSmtp,
	)

	msg := "From: " + cfg.FromEmail + "\r\n" +
		"To: " + to[0] + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/plain; charset=UTF-8\r\n" +
		"\r\n" +
		body + "\r\n"

	return smtp.SendMail(
		cfg.FromEmailSmtp+":"+cfg.FromEmailPort,
		auth,
		cfg.FromEmail,
		to,
		[]byte(msg),
	)
}

func SendVerifyUserEmail(to string, verifyUrl string, cfg EmailConfig) error {
	subject := "Verify your email"

	body := "Click the link to verify your email: " + verifyUrl
	return SendEmail([]string{to}, subject, body, cfg)
}
