# D2 · Day 30 cleanup: drop cognito_id, remove migration notices, delete Cognito pools, update docs

Status: needs-info
Type: task
Blocked by: 24
Tracker card: D2

One PR per repository plus the infrastructure steps: backend migration dropping `user.cognito_id` and the `cognitoId` field; web and mobile remove the login notices; mobile ships a normal OTA-safe release and `ota/update-now` is deleted; READMEs updated (own login, env vars, commands, tests, runtime policy); Cognito pool, app clients and IAM permissions deleted; NGO Hub asked to remove VIC's app client; staging copy of production deleted.

## Comments
