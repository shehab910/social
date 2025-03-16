package mailer

import "embed"

const (
	VerifyUserEmailTemplate = "verify_user.tmpl"
	WelcomeEmailTemplate    = "welcome.tmpl"
)

type VerifyUserEmailTemplateData struct {
	Username         string
	Email            string
	VerificationLink string
	SupportEmail     string
}

type WelcomeEmailTemplateData struct {
	Username     string
	Email        string
	WelcomeLink  string
	SupportEmail string
}

//--//

//go:embed "templates"
var FS embed.FS

type Client interface {
	Send(templateFile string, username string, email string, data any) error
	SendVerificationEmail(data VerifyUserEmailTemplateData) error
	SendWelcomeEmail(data WelcomeEmailTemplateData) error
}

type EmailConfig struct {
	FromEmail         string
	FromEmailSmtp     string
	FromEmailPassword string
	FromEmailPort     string
	SupportEmail      string
}
