# Configuration

This document describes the environment variables and SMTP settings required to run PowerWatch.

## Environment File

Create a `.env` file at the project root. You can copy `.env.example` and update values for your environment.

## Required Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| NODE_ENV | Application environment | development | 
| PORT | HTTP server port | 3000 |
| HOST | Server host binding | 0.0.0.0 |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 3306 |
| DB_USER | Database username | root |
| DB_PASSWORD | Database password | secret |
| DB_NAME | Database name | powerwatch |
| JWT_ACCESS_SECRET | JWT access token secret | random string |
| JWT_REFRESH_SECRET | JWT refresh token secret | random string |
| BCRYPT_SALT_ROUNDS | Password hash salt rounds | 12 |
| RATE_LIMIT_MAX | Max requests per window | 100 |
| RATE_LIMIT_WINDOW_MS | Rate limit window in ms | 60000 |
| CORS_ORIGIN | Allowed origin for browser clients | http://localhost:5173 |
| ADMIN_FIRST_NAME | Initial admin first name | Super |
| ADMIN_LAST_NAME | Initial admin last name | Admin |
| ADMIN_EMAIL | Initial admin email | admin@powerwatch.com |
| ADMIN_PASSWORD | Initial admin password | Admin@123 |

## Optional Service Configuration

| Variable | Purpose | Example |
|----------|---------|---------|
| FIREBASE_PROJECT_ID | Firebase project ID | my-firebase-project |
| FIREBASE_PRIVATE_KEY | Firebase private key | -----BEGIN PRIVATE KEY-----... |
| FIREBASE_CLIENT_EMAIL | Firebase service account email | firebase-admin@... |
| OTP_EXPIRY_MINUTES | OTP expiration in minutes | 10 |

## SMTP / Email Delivery

PowerWatch uses SMTP to send OTP codes for email verification and password reset.

When SMTP environment variables are configured, the application sends a real email to users. If SMTP is not configured, OTP codes are still generated and saved, but in development they are logged to the console.

| Variable | Purpose | Example |
|----------|---------|---------|
| SMTP_HOST | SMTP server host | smtp.gmail.com |
| SMTP_PORT | SMTP server port | 587 |
| SMTP_SECURE | Use secure connection (TLS) | false |
| SMTP_USER | SMTP auth username | your@email.com |
| SMTP_PASS | SMTP auth password | smtp-password |
| SMTP_FROM_EMAIL | Sender email address | no-reply@powerwatch.com |
| SMTP_FROM_NAME | Sender display name | PowerWatch |

## Notes

- Use `SMTP_SECURE=true` for port `465` with SSL/TLS.
- Use `SMTP_SECURE=false` for port `587` with STARTTLS.
- If you use Gmail or another provider, make sure the account allows SMTP access or use an app password.
- `OTP_EXPIRY_MINUTES` defaults to `10` if not set.
