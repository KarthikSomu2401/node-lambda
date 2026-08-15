# GitHub Actions Setup Guide

This document explains how to set up GitHub Actions CI/CD for the Lambda Notes API.

## Workflows Included

### 1. CI Workflow (`.github/workflows/ci.yml`)
- **Trigger**: Runs on push to `main` or `develop` branches, and on pull requests
- **Actions**:
  - Tests on Node.js 18.x and 20.x
  - Lints code
  - Builds application
  - Validates SAM template
  - Checks configuration files

### 2. Deploy Workflow (`.github/workflows/deploy.yml`)
- **Trigger**: Runs on push to `main` branch or manual trigger
- **Actions**:
  - Builds SAM application
  - Deploys to AWS Lambda
  - Creates stack per branch
  - Posts deployment status to PR

## Prerequisites

Before setting up GitHub Actions, ensure you have:

1. **GitHub Repository** - Your code pushed to GitHub
2. **AWS Account** - With appropriate permissions
3. **AWS IAM Role** - Configured for GitHub OIDC
4. **MongoDB Atlas Account** - For cloud database

## Step 1: Set Up AWS IAM Role for GitHub OIDC

GitHub Actions can authenticate to AWS without storing credentials. Follow these steps:

### Create IAM Role for OIDC

1. Go to AWS IAM Console → Roles → Create Role
2. Select "Web Identity" as the trusted entity
3. Choose "OpenID Connect" provider
4. Configure:
   - **Provider URL**: `https://token.actions.githubusercontent.com`
   - **Audience**: `sts.amazonaws.com`
5. Click "Get thumbprint" (if not auto-populated)
6. Create role with name: `github-actions-lambda-deploy`

### Attach Policies

For initial learning only, attach the minimum service permissions needed by
CloudFormation to create the SAM resources. Avoid using `AdministratorAccess`
in a shared or production account. The policy below is intentionally broad for
this sample and should be replaced with a resource-scoped deployment policy.

Attach these permissions to the role:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "lambda:*",
        "apigateway:*",
        "iam:*",
        "s3:*",
        "logs:*"
      ],
      "Resource": "*"
    }
  ]
}
```

### Add Trust Relationship

Edit trust relationships to add:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_AWS_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:KarthikSomu2401@14906593/node-lambda@1335078817:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

Replace:
- `YOUR_AWS_ACCOUNT_ID` - Your AWS account ID
- The `sub` value above is specific to `KarthikSomu2401/node-lambda` and its
  `main` branch. Get the exact value from the OIDC token if the repository is
  renamed or transferred.

## Step 2: Set Up GitHub Secrets

Add these secrets to your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Create these secrets:

### Required Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `AWS_REGION` | AWS region for deployment | `us-east-1` |
| `AWS_ROLE_TO_ASSUME` | ARN of the OIDC role created above | `arn:aws:iam::123456789012:role/github-actions-lambda-deploy` |
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/note_db` |

### Setting Secrets

```bash
# Using GitHub CLI
gh secret set AWS_REGION --body "us-east-1"
gh secret set AWS_ROLE_TO_ASSUME --body "arn:aws:iam::123456789012:role/github-actions-lambda-deploy-role"
gh secret set MONGODB_URI --body "mongodb+srv://user:pass@cluster.mongodb.net/note_db"
```

## Step 3: Get MongoDB Atlas Connection String

### Option 1: Use MongoDB Atlas Sample Data

MongoDB Atlas provides free sample datasets:

1. Go to https://www.mongodb.com/docs/atlas/sample-data/
2. In your Atlas cluster, click **"Load Sample Dataset"**
3. This loads pre-built sample data including:
   - `sample_mflix` - Movie database
   - `sample_restaurants` - Restaurant listings
   - `sample_analytics` - Analytics data
   - And more...

### Option 2: Use MongoDB Atlas with Your Data

1. Create MongoDB Atlas account: https://www.mongodb.com/cloud/atlas
2. Create a cluster (free tier available)
3. Create a database user with credentials
4. Get connection string:
   - Click "Connect" on cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your user password

Format:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/note_db?retryWrites=true&w=majority
```

## Step 4: Load Sample Notes Data

After deploying, load sample notes:

### Locally
```bash
# Ensure MongoDB is running and .env is set
node scripts/load-sample-data.js
```

### Using Lambda
```bash
# The sample data script will be available in deployment
# Can be triggered via Lambda or as a scheduled task
```

## Step 5: Test the Workflow

### Trigger CI Workflow

```bash
# Make a commit and push
git add .
git commit -m "Setup GitHub Actions"
git push origin main
```

Monitor progress:
- Go to your GitHub repo
- Click **Actions** tab
- Watch the workflows run

### Manual Deploy

To manually trigger deployment:

```bash
# Using GitHub CLI
gh workflow run deploy.yml -f environment=prod
```

Or in GitHub UI:
1. Go to **Actions**
2. Select **Deploy to AWS Lambda** workflow
3. Click **Run workflow**
4. Select environment (dev/staging/prod)
5. Click **Run workflow**

## Step 6: Verify Deployment

After deployment completes:

```bash
# Get the API endpoint
aws cloudformation describe-stacks \
  --stack-name notes-api-main \
  --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
  --output table

# Test the API
curl https://<api-endpoint>/note
```

## Monitoring & Debugging

### View Workflow Logs

1. Go to **Actions** tab
2. Select the workflow run
3. Click on job to see detailed logs

### CloudWatch Logs

Monitor Lambda execution:

```bash
# View Lambda logs
aws logs tail /aws/lambda/notes-api --follow

# View API Gateway logs
aws logs tail /aws/apigateway/notes-api --follow
```

### GitHub Actions Logs

Local testing with act:

```bash
# Install act
brew install act

# Run workflow locally
act push -j test-and-lint
```

## Common Issues & Solutions

### Issue: "OIDC Provider Not Found"
**Solution**: Ensure the OIDC provider URL is exactly: `https://token.actions.githubusercontent.com`

### Issue: "Access Denied" Deployment
**Solution**: Verify IAM role policies have sufficient permissions for CloudFormation, Lambda, and API Gateway

### Issue: "MongoDB Connection Timeout"
**Solution**: Add GitHub Actions IP to MongoDB Atlas IP Whitelist (or allow all: 0.0.0.0/0 for testing)

### Issue: "Deployment Changeset Empty"
**Solution**: Make a code change or parameter change, redeploy with `--force`

## Environment-Specific Deployments

For a learning project, you typically deploy to a single environment. The workflow automatically deploys to:
- Stack name: `notes-api-stack`
- Triggered on push to `main` branch

When you're ready to learn about multiple environments, you can modify the workflow to:
1. Add environment variables for stack names
2. Use different branches for different deployments
3. Add approval workflows for production

## Next Steps

1. ✓ Set up AWS IAM OIDC role
2. ✓ Configure GitHub secrets
3. ✓ Set up MongoDB Atlas
4. ✓ Push code to trigger CI
5. ✓ Verify deployment to Lambda
6. Test APIs with sample data
7. Set up monitoring and alerts
8. Configure branch protection rules

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS SAM CLI Documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html)
- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
