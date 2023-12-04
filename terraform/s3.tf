module "s3_bucket_files" {
  source = "terraform-aws-modules/s3-bucket/aws"

  bucket = "${local.namespace}-files"

  control_object_ownership = true
  object_ownership         = "BucketOwnerPreferred"
  acl                      = "public-read"

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true

  server_side_encryption_configuration = {
    rule = {
      apply_server_side_encryption_by_default = {
        sse_algorithm = "AES256"
      }
    }
  }
}
