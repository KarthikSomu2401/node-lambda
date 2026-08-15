# Environment Variables Reference

This document explains all environment variables used in the Lambda Notes API application.

## Overview

Environment variables are used to configure the application for different environments (development, production, etc.) without changing code. Keep sensitive values (like AWS credentials and passwords) in `.env` file (which is git-ignored) and share the template in `.env.example`.

## Configuration Sections

### Server Configuration

#### `PORT`
- **Description**: HTTP server port number
- **Type**: Number
- **Default**: `3000`
- **Example**: `PORT=3000`
- **Usage**: Set custom port for local development or when running on different servers

#### `NODE_ENV`
- **Description**: Application environment mode
- **Type**: String
- **Options**: `development`, `production`, `test`
- **Default**: `development`
- **Example**: `NODE_ENV=production`
- **Usage**: Changes app behavior (logging, error handling, performance)

#### `LOG_LEVEL`
- **Description**: Controls logging verbosity
- **Type**: String
- **Options**: `error`, `warn`, `info`, `debug`, `trace`
- **Default**: `debug`
- **Example**: `LOG_LEVEL=info`
- **Usage**: Filter log output (less verbose in production)

---

## Database Configuration

#### `MONGODB_URI`
- **Description**: MongoDB connection string
- **Type**: String
- **Default**: `mongodb://127.0.0.1:27017/note_db`
- **Example (Local)**:
  ```
  mongodb://127.0.0.1:27017/note_db
  ```
- **Example (Atlas Cloud)**:
  ```
  mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/note_db?retryWrites=true&w=majority
  ```
- **Usage**: Connect to MongoDB for note storage
- **Security**: Never commit this to version control if it contains credentials

#### `MONGODB_TIMEOUT`
- **Description**: MongoDB connection timeout in milliseconds
- **Type**: Number
- **Default**: `10000` (10 seconds)
- **Example**: `MONGODB_TIMEOUT=15000`
- **Usage**: How long to wait before connection fails

---

## AWS Lambda Configuration

#### `AWS_REGION`
- **Description**: AWS region for Lambda deployment
- **Type**: String
- **Default**: `us-east-1`
- **Options**: Any valid AWS region (us-east-1, us-west-2, eu-west-1, etc.)
- **Example**: `AWS_REGION=us-east-1`
- **Usage**: Where Lambda functions and API Gateway are deployed
- **Note**: Must match GitHub Actions secret for deployment

#### `AWS_ACCESS_KEY_ID`
- **Description**: AWS access key for authentication
- **Type**: String
- **Required**: Only for local testing/deployment
- **Example**: `AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE`
- **Security Warning**: 
  - ⚠️ NEVER commit to version control
  - ⚠️ Use GitHub Secrets for CI/CD
  - ⚠️ Rotate keys regularly
- **How to Get**:
  1. Go to AWS Console → IAM → Users
  2. Create a new access key
  3. Copy the access key ID

#### `AWS_SECRET_ACCESS_KEY`
- **Description**: AWS secret key for authentication
- **Type**: String
- **Required**: Only for local testing/deployment
- **Example**: `AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`
- **Security Warning**:
  - ⚠️ NEVER commit to version control
  - ⚠️ Use GitHub Secrets for CI/CD
  - ⚠️ Store securely
  - ⚠️ Rotate regularly
- **How to Get**:
  1. Same place as access key ID
  2. Only visible once - save securely
  3. Use GitHub Secrets for CI/CD

---

## Lambda Functions

#### `AUTO_TAG_LAMBDA_FUNCTION`
- **Description**: Name of the auto-tagging Lambda function
- **Type**: String
- **Default**: `auto-tag-notes`
- **Example**: `AUTO_TAG_LAMBDA_FUNCTION=auto-tag-notes`
- **Usage**: Name used to invoke the tagging function from main API
- **Must Match**: The function name in AWS Lambda console

---

## Application Configuration

#### `API_BASE_PATH`
- **Description**: Base path for all API routes
- **Type**: String
- **Default**: `/`
- **Example**: `API_BASE_PATH=/api/v1`
- **Usage**: Prefix all routes (e.g., `/api/v1/note` instead of `/note`)

#### `REQUEST_TIMEOUT`
- **Description**: HTTP request timeout in milliseconds
- **Type**: Number
- **Default**: `30000` (30 seconds)
- **Example**: `REQUEST_TIMEOUT=60000`
- **Usage**: How long to wait for Lambda invocation response

---

## Setup Instructions

### Local Development

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your local values:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/note_db
   ```

3. Start MongoDB:
   ```bash
   mongod
   ```

4. Run the application:
   ```bash
   npm start
   ```

### For MongoDB Atlas

1. Get your Atlas connection string from https://www.mongodb.com/cloud/atlas
2. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/note_db
   ```
3. Run the application:
   ```bash
   npm start
   ```

### For AWS Deployment (CI/CD)

Set GitHub Secrets instead of .env:
- `AWS_REGION`
- `AWS_ROLE_TO_ASSUME` (role ARN for OIDC)
- `MONGODB_URI`

The GitHub Actions workflow will use these secrets during deployment.

---

## Environment-Specific Configurations

### Development
```env
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug
MONGODB_URI=mongodb://127.0.0.1:27017/note_db
MONGODB_TIMEOUT=10000
AWS_REGION=us-east-1
```

### Production
```env
PORT=3000
NODE_ENV=production
LOG_LEVEL=warn
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/note_db
MONGODB_TIMEOUT=15000
AWS_REGION=us-east-1
```

### Testing
```env
PORT=3000
NODE_ENV=test
LOG_LEVEL=error
MONGODB_URI=mongodb://127.0.0.1:27017/note_db_test
MONGODB_TIMEOUT=5000
```

---

## Common Issues

### "MongoDB Connection Failed"
- Check `MONGODB_URI` is correct
- Ensure MongoDB is running (locally)
- Verify IP is whitelisted (Atlas)
- Check `MONGODB_TIMEOUT` value

### "Lambda Function Not Found"
- Verify `AUTO_TAG_LAMBDA_FUNCTION` matches deployed function name
- Check `AWS_REGION` is correct
- Ensure AWS credentials have Lambda invoke permission

### "Port Already in Use"
- Change `PORT` to an available port
- Or kill process using the port

### "AWS Authentication Failed"
- Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are correct
- Check keys haven't expired
- Confirm IAM user has required permissions

---

## Security Best Practices

1. **Never commit `.env` file**
   - It's in `.gitignore` by default
   - Share `.env.example` instead

2. **Use `.env.example` as template**
   - Show all required variables
   - Use placeholder values
   - Add helpful comments

3. **Rotate AWS credentials**
   - Change keys every 90 days
   - Immediately rotate if exposed

4. **Use GitHub Secrets for CI/CD**
   - Add secrets via GitHub UI
   - Don't store in repository
   - Use `${{ secrets.SECRET_NAME }}` in workflows

5. **Validate on startup**
   - Check critical env vars exist
   - Fail fast if misconfigured
   - Log configuration errors

---

## Reference Table

| Variable | Required | Type | Default | Section |
|----------|----------|------|---------|---------|
| `PORT` | No | Number | 3000 | Server |
| `NODE_ENV` | No | String | development | Server |
| `LOG_LEVEL` | No | String | debug | Server |
| `MONGODB_URI` | Yes | String | local | Database |
| `MONGODB_TIMEOUT` | No | Number | 10000 | Database |
| `AWS_REGION` | No | String | us-east-1 | AWS |
| `AWS_ACCESS_KEY_ID` | No* | String | - | AWS |
| `AWS_SECRET_ACCESS_KEY` | No* | String | - | AWS |
| `AUTO_TAG_LAMBDA_FUNCTION` | No | String | auto-tag-notes | Lambda |
| `API_BASE_PATH` | No | String | / | App |
| `REQUEST_TIMEOUT` | No | Number | 30000 | App |

*Required only for local Lambda testing/deployment

---

## More Information

- [MongoDB Connection Strings](https://www.mongodb.com/docs/manual/reference/connection-string/)
- [MongoDB Atlas Setup](https://www.mongodb.com/docs/atlas/getting-started/)
- [AWS IAM Best Practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
