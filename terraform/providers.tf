terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.29"
    }
  }

  cloud {
    organization = "code4romania"

    workspaces {
      tags = [
        "vic",
      ]
    }
  }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      app = "vic"
      env = var.env
    }
  }
}

provider "aws" {
  alias  = "acm"
  region = "us-east-1"

  default_tags {
    tags = {
      app = "vic"
      env = var.env
    }
  }
}
