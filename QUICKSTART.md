# Quick Start: GitHub Actions & MongoDB Atlas

This quick start guide will get you up and running with GitHub Actions CI/CD and MongoDB Atlas in 5 minutes.

## 1. Set Up MongoDB Atlas (2 minutes)

1. **Create Account & Cluster:**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up (free tier available)
   - Create a new project
   - Create a cluster (M0 free tier is fine)
   - Wait 2-3 minutes for cluster to be ready

2. **Load Sample Data (Optional but Recommended):**
   - Click on your cluster
   - Go to **Collections** → **Load Sample Dataset**
   - This adds sample data you can explore

3. **Get Connection String:**
   - Click **Connect** button
   - Select **Connect your application**
   - Copy the connection string
   - Add database name: `note_db`
   - Example: `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/note_db?retryWrites=true&w=majority`

## 2. Create AWS IAM Role (2 minutes)

1. **Go to AWS Console:**
   - Sign in to AWS Account
   - Go to IAM → Identity Providers

2. **Add GitHub OIDC Provider (if not exists):**
   - Click "Add Provider" → "OpenID Connect"
   - Provider URL: `https://token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`
   - Click "Get thumbprint" → "Add provider"

3. **Create IAM Role:**
   - Go to IAM → Roles → "Create role"
   - Trusted entity type: "Web Identity"
   - Select the GitHub OIDC provider
   - Provider: `token.actions.githubusercontent.com`
   - Audience: `sts.amazonaws.com`
   - Continue → Review
   - Attach policy: **AdministratorAccess** (for testing; restrict later)
   - Role name: `github-actions-lambda-deploy`
   - Create role

4. **Get Role ARN:**
   - Go to Roles, find `github-actions-lambda-deploy`
   - Copy the ARN (looks like `arn:aws:iam::123456789012:role/github-actions-lambda-deploy`)

## 3. Configure GitHub Secrets (1 minute)

1. **Go to Your Repository:**
   - GitHub.com → Your repository → Settings
   - Secrets and variables → Actions → New repository secret

2. **Add Three Secrets:**

   **Secret 1: AWS_REGION**
   - Name: `AWS_REGION`
   - Value: `us-east-1`
   - Click "Add secret"

   **Secret 2: AWS_ROLE_TO_ASSUME**
   - Name: `AWS_ROLE_TO_ASSUME`
   - Value: `arn:aws:iam::123456789012:role/github-actions-lambda-deploy` (use your role ARN)
   - Click "Add secret"

   **Secret 3: MONGODB_URI**
   - Name: `MONGODB_URI`
   - Value: Your MongoDB connection string from step 1
   - Click "Add secret"

## 4. Push Code & Test (1 minute)

```bash
# Make sure you're in the project directory
cd /path/to/lambda

# Commit and push
git add .
git commit -m "Add GitHub Actions CI/CD"
git push origin main
```

## 5. Monitor Workflow (Self-service)

1. Go to your GitHub repository
2. Click **Actions** tab
3. Watch the workflows run:
   - **CI** runs first (tests, builds)
   - **Deploy** runs second (deploys to Lambda)

4. Check deployment status:
   - Click on the workflow run
   - Look for green checkmarks ✓
   - View logs if needed

## 6. Test Your API (After Deployment)

Once deployment completes:

```bash
# Get your API endpoint from the workflow output or:
aws cloudformation describe-stacks \
  --stack-name notes-api-stack \
  --query 'Stacks[0].Outputs[0].OutputValue' \
  --region us-east-1

# Replace <api-endpoint> with the output
curl https://<api-endpoint>/note
```

## Sample Test Requests

```bash
API="https://<api-endpoint>"

# Get all notes
curl $API/note

# Create a note
curl -X POST $API/note/with-tags \
  -H "Content-Type: application/json" \
  -d '{"title":"My First Note","description":"This is a test note"}'

# Generate tags for content
curl -X POST $API/note/auto-tag \
  -H "Content-Type: application/json" \
  -d '{"title":"Team Meeting","description":"Discuss Q4 roadmap"}'
```

## Load Sample Notes Data

After deployment, load example notes:

```bash
# Locally (if MongoDB is running locally)
node scripts/load-sample-data.js
```

## What's Automated

✅ **CI Workflow**:
- Runs on every push and pull request
- Tests on Node.js 18 and 20
- Validates code and builds

✅ **Deploy Workflow**:
- Runs automatically after CI passes on main branch
- Builds and deploys to AWS Lambda
- Creates API Gateway endpoint
- Takes ~5-10 minutes

## Troubleshooting

### Workflow Failed: "OIDC Provider Not Found"
→ Make sure you added the GitHub OIDC provider in AWS IAM

### Workflow Failed: "Access Denied"
→ Verify the IAM role has permissions and the role ARN is correct

### Deployment Failed: "MongoDB Connection Timeout"
→ Add your GitHub Actions IP range to MongoDB Atlas IP whitelist:
- In Atlas → Security → Network Access → Allow All (for testing)
- For production, add GitHub's IP range

### Can't Find API Endpoint
→ Check workflow logs or run:
```bash
aws cloudformation describe-stacks --stack-name notes-api-stack --region us-east-1
```

## Next Steps

1. ✅ GitHub Actions CI/CD is running
2. ✅ MongoDB Atlas is connected
3. → Test the API endpoints
4. → Explore the sample data
5. → Try the auto-tagging feature
6. → Modify and redeploy

## Useful Commands

```bash
# View workflow logs locally
gh run view --log

# Re-run a failed workflow
gh run rerun <run-id>

# Check Lambda status
aws lambda get-function --function-name notes-api

# View Lambda logs
aws logs tail /aws/lambda/notes-api --follow

# Delete stack (if needed)
aws cloudformation delete-stack --stack-name notes-api-stack
```

## Need Help?

- [GitHub Actions Docs](https://docs.github.com/actions)
- [AWS SAM Docs](https://docs.aws.amazon.com/serverless-application-model/)
- [MongoDB Atlas Docs](https://www.mongodb.com/docs/atlas/)
- See full setup guide: [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md)
