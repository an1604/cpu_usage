# Faddom CPU Usage Monitor

A full-stack application for monitoring CPU usage metrics of AWS EC2 instances. The project consists of a React frontend for visualization and a Node.js/Express backend that interfaces with AWS services to fetch CPU metrics.

## Project Overview

This application provides real-time monitoring of CPU usage for AWS EC2 instances through a modern web interface. It leverages AWS CloudWatch to collect metrics and presents them in an intuitive dashboard.

### Proof of Concept

A demonstration video is available in the root directory of this repository: [Watch the Proof of Concept Video](proof.mp4). This video showcases the application's functionality, including:
- Setting up and connecting to AWS EC2 instances
- Monitoring CPU usage in real-time
- Using the interactive dashboard features
- Demonstrating the application's responsiveness and data visualization capabilities

### Architecture

The project is structured as a microservices application with two main components:

- **Frontend**: A React application built with TypeScript that provides a user interface for viewing CPU metrics
- **Backend**: A Node.js/Express service that handles AWS API interactions and serves CPU usage data

## Prerequisites

Before running the application, ensure you have:

- Docker and Docker Compose installed
- AWS credentials with permissions to access EC2 and CloudWatch services
- The following environment variables set up in `backend/.env`:
  - `AWS_ACCESS_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION`
  - `EC2_IP_ADDRESS` (for tests only - in produciton, you will insert the ip address at the front.)
  - `PORT` (default: 5000)

## Running the Application

The easiest way to run the application is using Docker Compose. Follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/an1604/cpu_usage.git
   cd cpu_usage
   ```

2. Create a `.env` file in the `backend` directory with your AWS credentials and configuration:
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. Start the application using Docker Compose:
   ```bash
   docker-compose up --build
   ```

This will:
- Build and start the frontend service on port 3000
- Build and start the backend service on port 5000
- Set up a bridge network for service communication
- Configure the necessary environment variables

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Development

### Frontend Development

The frontend is a React application with TypeScript. To run it locally:

```bash
cd frontend
npm install
npx react-scripts start
```

### Backend Development

The backend is a Node.js/Express service. To run it locally:

```bash
cd backend
npm install
npx ts-node .\src\index.ts
```

## Testing

Both frontend and backend include Jest test suites. To run tests:

```bash
# Frontend tests
cd frontend
npx jest --verbose   

# Backend tests
cd backend
npx jest --verbose   
```
