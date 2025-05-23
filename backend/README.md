# Faddom Backend

## Overview
This backend service provides an API to fetch CPU usage metrics for AWS EC2 instances. It is built with Node.js, TypeScript, and Express, and uses AWS SDK to interact with EC2 and CloudWatch services. The service is containerized using Docker for easy deployment.

## Project Structure
- **src/index.ts**: Entry point. Sets up the Express server, CORS, health check, and API routes.
- **src/routes/metricsRoute.ts**: Defines the `/api/metrics/cpu-usage` endpoint for fetching CPU usage data.
- **src/controllers/metricsController.ts**: Handles business logic for metrics requests.
- **src/services/awsService.ts**: Encapsulates AWS EC2 and CloudWatch interactions.
- **src/config/config.ts**: Loads and validates environment variables.
- **src/middleware/**: Contains middleware for validation and error handling.
- **src/types/**: TypeScript type definitions for metrics and other data structures.

## Environment Variables
The following environment variables must be set for the backend to function:
- `AWS_ACCESS_ID`: AWS access key ID
- `AWS_SECRET_ACCESS_KEY`: AWS secret access key
- `AWS_REGION`: AWS region (e.g., `us-east-1`)
- `EC2_IP_ADDRESS`: Private IP address of the EC2 instance
- `INSTANCE_ID`: EC2 instance ID
- `PORT`: Port for the server (default: 5000)
- `CORS_ORIGIN`: Allowed CORS origin (e.g., `http://localhost:8080`)
- `CI`: Set to `false` unless running in CI

## Docker Usage
### Build the Docker Image
```sh
docker build -t faddom-backend .
```

### Run the Container
Set the required environment variables using `-e` flags or an `.env` file:

**Example with environment variables:**
```sh
docker run -p 3000:3000 \
  -e AWS_ACCESS_ID=your_aws_access_key_id \
  -e AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key \
  -e AWS_REGION=us-east-1 \
  -e EC2_IP_ADDRESS=your_ec2_ip \ #for tests only - in production, you will insert the ip address at each time.
  -e PORT=5000 \
  -e CORS_ORIGIN=http://localhost:8080 \
  -e CI=false \
  faddom-backend
```

**Or with an env file:**
```sh
docker run -p 3000:3000 --env-file .env faddom-backend
```

## Running Locally

To run the backend service locally, follow these steps:

1. **Install Dependencies**: Ensure you have all necessary packages by running:
   ```sh
   npm install
   ```

2. **Run the Server**: Start the server using `ts-node`:
   ```sh
   npx ts-node src/index.ts
   ```

Make sure all required environment variables are set in your environment or in a `.env` file before starting the server. This will allow the backend service to function correctly and connect to AWS services as needed.

3. **Run All Tests**: Execute all tests with detailed output using:
   ```sh
   npx jest --verbose
   ```
