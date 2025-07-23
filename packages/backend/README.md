# Backend Package

## Purpose

The backend API server for the mono-repo application. This package provides RESTful APIs and serves as the central data layer for the entire application suite.

## Tech Stack

### Core Technologies

- **Runtime**: Node.js (>=18.0.0)
- **Language**: TypeScript
- **Framework**: Express.js
- **Build Tool**: TypeScript Compiler (tsc)
- **Development Server**: tsx with watch mode

### Key Dependencies

- **express**: Web application framework
- **cors**: Cross-Origin Resource Sharing middleware
- **helmet**: Security middleware for HTTP headers
- **dotenv**: Environment variable management
- **compression**: Response compression middleware

### Development Tools

- **tsx**: TypeScript execution and watch mode
- **jest**: Testing framework
- **eslint**: Code linting
- **typescript**: TypeScript compiler

## Local Development Commands

### Installation

```bash
# Install dependencies (run from project root)
npm install
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

### Code Quality

```bash
# Run linting
npm run lint

# Run tests
npm run test

# Type checking without emit
npm run type-check
```

## Project Structure

```
backend/
├── src/           # Source code
├── dist/          # Compiled JavaScript (after build)
├── package.json   # Package configuration
├── tsconfig.json  # TypeScript configuration
└── README.md      # This file
```

## Environment Setup

Create a `.env` file in the backend directory with required environment variables:

```env
PORT=3000
NODE_ENV=development
# Add other environment variables as needed
```

## API Documentation

The API server will be available at `http://localhost:3000` when running in development mode.

## Notes

- This package uses ES modules with TypeScript
- Hot reload is enabled in development mode
- Production builds are optimized and compressed
- Security headers are applied via Helmet middleware
