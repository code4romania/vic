resource "aws_amplify_app" "amplify_app" {
  name       = "${local.namespace}-amplify-app"
  repository = "https://github.com/code4romania/vic"

  access_token = var.github_access_token

  build_spec = file("${path.module}/amplify/amplify.yml")

  custom_rule {
    source = "/<*>"
    status = "404"
    target = "/index.html"
  }

  custom_rule {
    source = "</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|webp|woff|ttf|map|json)$)([^.]+$)/>"
    status = "200"
    target = "/index.html"
  }
}

# branch_name = var.env == "production" ? "main" : "develop"
# stage       = var.env == "production" ? "PRODUCTION" : "BETA"
resource "aws_amplify_branch" "branch" {
  app_id      = aws_amplify_app.amplify_app.id
  branch_name = "main"
  stage       = "BETA"
  framework   = "React"

  enable_auto_build = true

  environment_variables = {
    AMPLIFY_DIFF_DEPLOY       = false
    AMPLIFY_MONOREPO_APP_ROOT = "frontend"

    VITE_API_URL          = "https://${aws_apprunner_service.backend.service_url}"
    VITE_APP_FRONTEND_URL = "https://${local.frontend_domain}"

    # ONGHub User Pool for VIC Client
    VITE_AWS_REGION           = var.onghub_congito_region
    VITE_COGNITO_OAUTH_DOMAIN = var.onghub_cognito_oauth_domain
    VITE_USER_POOL_CLIENT_ID  = var.onghub_cognito_vic_client_id
    VITE_USER_POOL_ID         = var.onghub_cognito_user_pool_id
  }
}

resource "aws_amplify_domain_association" "domain" {
  app_id      = aws_amplify_app.amplify_app.id
  domain_name = local.frontend_domain

  sub_domain {
    branch_name = aws_amplify_branch.branch.branch_name
    prefix      = ""
  }
}
