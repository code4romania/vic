# TODO:
# - sms_configuration

resource "aws_cognito_user_pool" "pool" {
  name = "${local.namespace}-pool"

  # When active, DeletionProtection prevents accidental deletion of your user pool.
  # Currently active only in production
  deletion_protection = var.env == "production" ? "ACTIVE" : "INACTIVE"

  username_attributes = [
    "email",
    "phone_number",
  ]

  auto_verified_attributes = [
    "email",
  ]

  username_configuration {
    case_sensitive = false
  }

  mfa_configuration          = "OFF"
  sms_authentication_message = "Your verification code is {####}."

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_message        = "Your verification code is {####}. "
    email_subject        = "Your verification code"
    sms_message          = "Your verification code is {####}. "
  }

  # software_token_mfa_configuration {
  #   enabled = true
  # }

  admin_create_user_config {
    allow_admin_create_user_only = false

    invite_message_template {
      email_message = "Your username is {username} and temporary password is {####}. "
      email_subject = "Your temporary password"
      sms_message   = "Your username is {username} and temporary password is {####}. "
    }
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }

    recovery_mechanism {
      name     = "verified_phone_number"
      priority = 2
    }
  }

  email_configuration {
    email_sending_account = "DEVELOPER"
    source_arn            = data.aws_ses_domain_identity.main.arn
    from_email_address    = "no-reply@${local.mail_domain}"
  }

  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_numbers                  = true
    require_symbols                  = true
    require_uppercase                = true
    temporary_password_validity_days = 30
  }

  lambda_config {
    create_auth_challenge          = aws_lambda_function.amplify_login_create_auth_challenge.arn
    define_auth_challenge          = aws_lambda_function.amplify_login_define_auth_challenge.arn
    verify_auth_challenge_response = aws_lambda_function.amplify_login_verify_auth_challenge_response.arn
    custom_message                 = aws_lambda_function.amplify_login_custom_message.arn
  }
}

resource "aws_cognito_user_pool_client" "onghub_client" {
  name         = "${local.namespace}-client"
  user_pool_id = aws_cognito_user_pool.pool.id

  callback_urls = [
    "https://${local.frontend_domain}",
    "http://localhost:3000"
    # "https://${aws_amplify_app.amplify_app.default_domain}",
  ]
  logout_urls = [
    "https://${local.frontend_domain}",
    "http://localhost:3000"
    # "https://${aws_amplify_app.amplify_app.default_domain}",
  ]

  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code"]
  supported_identity_providers         = ["COGNITO"]
  allowed_oauth_scopes = [
    "aws.cognito.signin.user.admin",
    "email",
    "openid",
    "profile",
  ]

  prevent_user_existence_errors = "ENABLED"

  enable_propagate_additional_user_context_data = false
  enable_token_revocation                       = true

  explicit_auth_flows = [
    "ALLOW_CUSTOM_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_SRP_AUTH",
  ]
}

resource "aws_cognito_user_pool_ui_customization" "ui" {
  css          = file("${path.module}/ui/custom.css")
  image_file   = filebase64("${path.module}/ui/logo.png")
  user_pool_id = aws_cognito_user_pool.pool.id
}

resource "aws_cognito_user_pool_domain" "default" {
  domain       = local.namespace
  user_pool_id = aws_cognito_user_pool.pool.id
}

resource "aws_cognito_user_pool_domain" "custom" {
  domain          = local.auth_domain
  certificate_arn = aws_acm_certificate.main.arn
  user_pool_id    = aws_cognito_user_pool.pool.id
}

resource "aws_route53_record" "auth-cognito-A" {
  name    = aws_cognito_user_pool_domain.custom.domain
  type    = "A"
  zone_id = data.aws_route53_zone.main.zone_id

  alias {
    evaluate_target_health = false

    name    = aws_cognito_user_pool_domain.custom.cloudfront_distribution
    zone_id = aws_cognito_user_pool_domain.custom.cloudfront_distribution_zone_id
  }
}

resource "aws_route53_record" "auth-cognito-AAAA" {
  name    = aws_cognito_user_pool_domain.custom.domain
  type    = "AAAA"
  zone_id = data.aws_route53_zone.main.zone_id

  alias {
    evaluate_target_health = false

    name    = aws_cognito_user_pool_domain.custom.cloudfront_distribution
    zone_id = aws_cognito_user_pool_domain.custom.cloudfront_distribution_zone_id
  }
}
