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

variable "github_access_token" {
  type = string
}

variable "onghub_congito_region" {
  type = string
}

variable "onghub_cognito_oauth_domain" {
  type = string
}

variable "onghub_cognito_teo_client_id" {
  type = string
}

variable "onghub_cognito_user_pool_id" {
  type = string
}
