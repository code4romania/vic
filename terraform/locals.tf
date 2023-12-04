locals {
  namespace       = "vic-${var.env}"
  domain          = "onghub.ro"
  frontend_domain = var.env == "production" ? "vic.${local.domain}" : "vic-${var.env}.${local.domain}"
  backend_domain  = "api.${local.frontend_domain}"
  auth_domain     = "auth.${local.frontend_domain}"
  mail_domain     = "onghub.ro"

  image = {
    repo = data.aws_ecr_repository.ecr.repository_url
    tag  = "main"
  }

  vpc = {
    cidr_block = "10.0.0.0/16"

    public_subnets = [
      "10.0.1.0/24",
      "10.0.2.0/24",
      "10.0.3.0/24"
    ]

    private_subnets = [
      "10.0.4.0/24",
      "10.0.5.0/24",
      "10.0.6.0/24"
    ]
  }
}
