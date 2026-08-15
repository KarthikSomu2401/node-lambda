# Lambda - Notes API

A Node.js REST API for managing notes with MongoDB and Mongoose. This project is designed to be deployed as a serverless application on AWS Lambda in the near future, providing a scalable backend for note management.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB running locally on `127.0.0.1:27017`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/note_db
NODE_ENV=development
AWS_REGION=us-east-1
AUTO_TAG_LAMBDA_FUNCTION=auto-tag-notes
```

3. Start the server:
```bash
npm start
```

The server will start on `http://localhost:3000`

4. (Optional) Load sample data:
```bash
node scripts/load-sample-data.js
```

## Project Structure

```
lambda/
├── index.js                          # Main application entry point
├── lambda-handler.js                 # AWS Lambda handler for Express app
├── package.json                      # Project dependencies and metadata
├── template.yaml                     # SAM template for AWS deployment
├── .env                              # Environment variables (not committed)
├── .env.example                      # Example environment variables
├── .gitignore                        # Git ignore rules
├── README.md                         # This file
└── app/
    ├── model/
    │   └── note.js                   # Note schema definition
    ├── router/
    │   └── router.js                 # API routes
    └── lambda/
        └── auto-tag-function.js      # AWS Lambda function for auto-tagging
```

## Database Schema

### Note
- `title` (String): Title of the note
- `description` (String): Description/content of the note
- `tags` (Array): Auto-generated tags for the note
- `timestamps`: Created and updated timestamps

## API Endpoints

The API provides CRUD operations for notes via the `/note` route:

### Standard CRUD Operations
- `GET /note` - Get all notes
- `POST /note` - Create a new note
- `GET /note/:id` - Get a specific note
- `PUT /note/:id` - Update a note
- `DELETE /note/:id` - Delete a note

### Auto-Tagging Endpoints (Lambda-powered)
- `POST /note/auto-tag` - Generate tags for given title and description
  - Body: `{ "title": "string", "description": "string" }`
  - Returns: `{ "tags": ["tag1", "tag2", ...] }`

- `POST /note/with-tags` - Create a note and automatically generate tags
  - Body: `{ "title": "string", "description": "string" }`
  - Returns: Created note with auto-generated tags

## Deployment

### Local Development

1. **Start MongoDB locally:**
```bash
mongod
```

2. **Install dependencies and start the server:**
```bash
npm install
npm start
```

The server will start on `http://localhost:3000`

### Deployment to AWS Lambda

This project is now ready for AWS Lambda deployment using the AWS Serverless Application Model (SAM).

#### Prerequisites
- [AWS CLI](https://aws.amazon.com/cli/) installed and configured
- [AWS SAM CLI](https://aws.amazon.com/serverless/sam/) installed
- AWS account with appropriate permissions

#### Deployment Steps

1. **Prepare MongoDB Atlas:**
   - Create a MongoDB Atlas cluster (https://www.mongodb.com/cloud/atlas)
   - Get your connection string
   - Update it in your `.env` file: `MONGODB_URI=mongodb+srv://...`

2. **Configure AWS credentials:**
```bash
aws configure
# Enter your AWS Access Key ID and Secret Access Key
```

3. **Build the SAM application:**
```bash
sam build
```

4. **Deploy to AWS:**
```bash
sam deploy --guided
```

This will prompt you for:
- Stack name (e.g., `notes-api-stack`)
- AWS Region (e.g., `us-east-1`)
- S3 bucket for deployment artifacts
- Confirmation to deploy

5. **Get the API endpoint:**
```bash
aws cloudformation describe-stacks --stack-name notes-api-stack --query 'Stacks[0].Outputs[0].OutputValue'
```

#### Using the Deployed API

Once deployed, your Lambda functions will be accessible via the API Gateway endpoint:

```bash
# Example requests
curl https://<api-endpoint>/note/auto-tag \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"title":"Meeting with team","description":"Discuss project roadmap"}'

curl https://<api-endpoint>/note/with-tags \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"title":"Important Task","description":"Fix critical bug in production"}'
```

## CI/CD with GitHub Actions

This project includes automated CI/CD pipelines for testing and deployment.

### Workflows

1. **CI Workflow** - Runs on pull requests and pushes
   - Installs dependencies
   - Runs linting and tests
   - Validates SAM template
   - Builds application

2. **Deploy Workflow** - Runs on push to main branch
   - Builds SAM application
   - Deploys to AWS Lambda
   - Posts deployment status

### Setup GitHub Actions

1. **Configure AWS OIDC:**
   - Create IAM role for GitHub OIDC provider
   - Add trust relationship for your repository
   - See [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md) for detailed instructions

2. **Set GitHub Secrets:**
   ```
   AWS_REGION = us-east-1
   AWS_ROLE_TO_ASSUME = arn:aws:iam::YOUR_ACCOUNT:role/github-actions-lambda-deploy-role
   MONGODB_URI = mongodb+srv://user:pass@cluster.mongodb.net/note_db
   ```

3. **Push to main branch:**
   ```bash
   git push origin main
   ```

4. **Monitor deployment:**
   - Go to GitHub Actions tab
   - Watch workflow execution
   - Check deployment logs

### MongoDB Atlas Sample Data

1. Create MongoDB Atlas account: https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Load sample dataset (optional):
   - Go to your cluster
   - Click "Collections"
   - Click "Load Sample Dataset"
4. Create database user and get connection string
5. Add to GitHub Secrets as `MONGODB_URI`

### Testing the Workflows

To test locally before pushing:

```bash
# Install act (optional)
brew install act

# Run CI workflow
act push -j test-and-lint

# Run deploy workflow
act push -s AWS_REGION=us-east-1 -s AWS_ROLE_TO_ASSUME=arn:aws:iam::YOUR_ACCOUNT:role/github-actions-lambda-deploy
```

See [QUICKSTART.md](QUICKSTART.md) for step-by-step setup guide.

### Architecture

The application consists of two Lambda functions:

1. **Notes API Lambda (Express.js)**
   - Runtime: Node.js 20.x
   - Memory: 512 MB
   - Handles all CRUD operations
   - Invokes the auto-tag function when needed

2. **Auto-Tag Lambda Function**
   - Runtime: Node.js 20.x
   - Memory: 256 MB
   - Analyzes note content and generates relevant tags
   - Can be invoked asynchronously for better performance

Both functions are connected via API Gateway for easy HTTP access.

## Roadmap

✅ **Completed:**
- Express.js REST API setup
- MongoDB integration with Mongoose
- Basic CRUD operations
- AWS Lambda handler implementation
- Auto-tagging Lambda function
- SAM template for deployment
- **GitHub Actions CI/CD pipelines**
- **MongoDB Atlas integration**
- **Sample data scripts**

**Planned Enhancements:**
- Advanced tagging using AWS Comprehend NLP service
- Scheduled note backups to S3
- WebSocket support for real-time updates
- Authentication and authorization (API keys, JWT)
- Rate limiting and API caching
- Unit and integration tests with Jest
- Docker containerization
- Monitoring with CloudWatch dashboards
- Cost optimization and performance tuning

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port (local development only) |
| `NODE_ENV` | `development` | Environment mode (`development` or `production`) |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/note_db` | MongoDB connection string |
| `MONGODB_TIMEOUT` | `10000` | MongoDB connection timeout (ms) |
| `AWS_REGION` | `us-east-1` | AWS region for Lambda deployment |
| `AUTO_TAG_LAMBDA_FUNCTION` | `auto-tag-notes` | Name of auto-tagging Lambda function |
| `LOG_LEVEL` | `debug` | Logging verbosity |
| `API_BASE_PATH` | `/` | Base path for API routes |
| `REQUEST_TIMEOUT` | `30000` | Request timeout (ms) |

**For complete environment variable documentation, see [ENV_VARIABLES.md](ENV_VARIABLES.md)**

## Technologies

- **Express.js** (v5.2.1) - Web framework
- **Mongoose** (v9.9.2) - MongoDB object modeling
- **em-crud** (v1.0.9) - CRUD operations wrapper
- **esbuild** (v0.28.2) - JavaScript bundler
- **AWS Lambda** - Serverless compute platform
- **AWS API Gateway** - HTTP API management
- **AWS SAM** - Infrastructure as Code
- **Node.js** (v20.x) - Runtime environment

## Development

### Local Development

To run the application locally:

1. Ensure MongoDB is running on `127.0.0.1:27017`
2. Install dependencies: `npm install`
3. Start the server: `npm start`

The server will start on `http://localhost:3000`

### Making Changes

1. Edit the files in the project
2. Restart the server manually for changes to take effect
3. Or use a tool like `nodemon` for automatic restarts:
```bash
npm install --save-dev nodemon
npx nodemon index.js
```

### Testing Lambda Locally

To test Lambda functions locally, you can use SAM CLI:

```bash
# Start local Lambda environment
sam local start-api

# Make requests to the local API
curl http://localhost:3000/note/auto-tag \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Note","description":"Testing auto-tagging"}'
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or Atlas connection string is correct
- Check `MONGODB_URI` in `.env` file
- Verify network connectivity to MongoDB Atlas

### Lambda Deployment Issues
- Ensure AWS credentials are configured: `aws configure`
- Check that required AWS permissions are set
- Review SAM deployment logs for detailed error messages

### Auto-tag Lambda Not Working
- Verify `AUTO_TAG_LAMBDA_FUNCTION` environment variable matches deployed function name
- Check Lambda function IAM permissions
- Review CloudWatch logs for Lambda execution errors

### Node.js Module Issues
- Clear node_modules: `rm -rf node_modules package-lock.json`
- Reinstall dependencies: `npm install`
- Ensure Node.js version is 14 or higher: `node --version`

## License

MIT
