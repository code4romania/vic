variable "env" {
  description = "Environment"
  type        = string

  validation {
    condition     = contains(["production", "staging", "development"], var.env)
    error_message = "Allowed values for env are \"production\", \"staging\" or \"development\"."
  }
}

variable "region" {
  description = "Region where to deploy resources"
  type        = string
  default     = "eu-west-1"
}

variable "route53_zone_id" {
  type = string
}

variable "github_access_token" {
  type = string
}

variable "onghub_congito_region" {
  type = string
}

variable "onghub_cognito_oauth_domain" {
  type = string
}

variable "onghub_cognito_vic_client_id" {
  type = string
}

variable "onghub_cognito_user_pool_id" {
  type = string
}

variable "bastion_public_key" {
  description = "Public SSH key used to connect to the bastion"
  type        = string
}

variable "expo_push_notifications_access_token" {
  description = "Expo push notifications access token"
  type        = string
}
