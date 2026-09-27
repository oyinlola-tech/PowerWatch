export const MESSAGES = {
  // Auth
  REGISTER_SUCCESS: 'User registered successfully.',
  EMAIL_EXISTS: 'Email already registered.',
  LOGIN_SUCCESS: 'Login successful.',
  LOGOUT_SUCCESS: 'Logout successful.',
  TOKEN_REFRESHED: 'Token refreshed successfully.',
  OTP_SENT: 'OTP sent successfully.',
  OTP_RESENT: 'OTP resent successfully.',
  OTP_VERIFIED: 'OTP verified successfully.',
  PASSWORD_RESET_REQUESTED: 'Password reset OTP sent.',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  INVALID_REFRESH_TOKEN: 'Invalid refresh token.',
  INVALID_OTP: 'Invalid or expired OTP.',
  OTP_ATTEMPTS_EXCEEDED: 'Too many incorrect attempts. Please request a new OTP.',
  ACCOUNT_SUSPENDED: 'This account has been suspended.',
  CANNOT_MODIFY_SELF: 'Admins cannot perform this action on their own account.',
  CANNOT_MODIFY_ADMIN: 'This action cannot be performed on another admin account.',
  UNAUTHORIZED: 'Unauthorized access.',
  FORBIDDEN: 'Forbidden access.',

  // Validation
  VALIDATION_FAILED: 'Validation failed.',
  INVALID_REQUEST: 'Invalid request.',

  // Location
  COUNTRY_NOT_FOUND: 'Country not found.',
  STATE_NOT_FOUND: 'State not found.',
  LGA_NOT_FOUND: 'LGA not found for the given state.',
  CITY_NOT_FOUND: 'City not found for the given LGA.',
  TOWN_NOT_FOUND: 'Town not found for the given city.',
  NEIGHBORHOOD_NOT_FOUND: 'Neighborhood not found for the given town.',
  NEIGHBORHOOD_UNKNOWN: 'Neighborhood not found.',
  INVALID_LOCATION_HIERARCHY: 'Invalid location hierarchy.',

  // Reports
  REPORT_CREATED: 'Power report submitted successfully.',
  REPORT_DELETED: 'Power report deleted successfully.',
  REPORT_NOT_FOUND: 'Power report not found.',
  REPORTS_FETCHED: 'Reports fetched successfully.',
  REPORT_FETCHED: 'Report fetched successfully.',

  // Live Status
  LIVE_STATUS_FETCHED: 'Live status fetched successfully.',

  // Outages
  OUTAGE_STARTED: 'Power outage started.',
  OUTAGE_ENDED: 'Power outage ended.',
  OUTAGE_NOT_FOUND: 'Outage not found.',
  OUTAGES_FETCHED: 'Outages fetched successfully.',

  // Notifications
  NOTIFICATION_SENT: 'Notification sent successfully.',
  NOTIFICATION_DELETED: 'Notification deleted successfully.',
  NOTIFICATION_NOT_FOUND: 'Notification not found.',
  NOTIFICATIONS_FETCHED: 'Notifications fetched successfully.',
  NOTIFICATION_FETCHED: 'Notification fetched successfully.',
  NOTIFICATION_MARKED_READ: 'Notification marked as read.',
  SUBSCRIBED: 'Subscribed to notifications successfully.',
  UNSUBSCRIBED: 'Unsubscribed from notifications successfully.',

  // General
  INTERNAL_ERROR: 'Internal server error.',
  NOT_FOUND: 'Resource not found.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
} as const;
