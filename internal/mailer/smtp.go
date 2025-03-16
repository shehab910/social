package mailer

import (
	"bytes"
	"net/smtp"
	"text/template"
)

type SmtpMailer struct {
	cfg EmailConfig
}

func NewSmtpMailer(cfg EmailConfig) *SmtpMailer {
	return &SmtpMailer{cfg}
}

func (m *SmtpMailer) Send(templateFile string, username string, email string, data any) error {

	tmpl, err := template.ParseFS(FS, "templates/"+templateFile)
	if err != nil {
		return err
	}

	subject := new(bytes.Buffer)
	if err := tmpl.ExecuteTemplate(subject, "subject", data); err != nil {
		return err
	}

	body := new(bytes.Buffer)
	if err := tmpl.ExecuteTemplate(body, "body", data); err != nil {
		return err
	}

	return sendSingleEmail([]string{email}, subject.String(), body.String(), m.cfg)

}

func (m *SmtpMailer) SendVerificationEmail(data VerifyUserEmailTemplateData) error {
	return m.Send(VerifyUserEmailTemplate, data.Username, data.Email, data)
}

func (m *SmtpMailer) SendWelcomeEmail(data WelcomeEmailTemplateData) error {
	return m.Send(WelcomeEmailTemplate, data.Username, data.Email, data)
}

func sendSingleEmail(to []string, subject string, body string, cfg EmailConfig) error {
	auth := smtp.PlainAuth(
		"",
		cfg.FromEmail,
		cfg.FromEmailPassword,
		cfg.FromEmailSmtp,
	)

	msg := singleHtmlMail(cfg.FromEmail, to[0], subject, body)

	return smtp.SendMail(
		cfg.FromEmailSmtp+":"+cfg.FromEmailPort,
		auth,
		cfg.FromEmail,
		to,
		msg,
	)
}

func singleHtmlMail(fromEmail, toEmail, subject, body string) []byte {
	msg := "From: " + fromEmail + "\r\n" +
		"To: " + toEmail + "\r\n" +
		"Subject: " + subject + "\r\n" +
		"MIME-Version: 1.0\r\n" +
		"Content-Type: text/html; charset=UTF-8\r\n" +
		"\r\n" +
		body + "\r\n"
	return []byte(msg)
}
