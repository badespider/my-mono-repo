# Web Frontend Application

This is the React web frontend for the Portfolio Tracker application, built with Vite and TypeScript.

## Features

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for client-side routing
- **Tailwind CSS** for styling
- **Monorepo aliases** for importing from other packages

## Getting Started

### Development

```bash
# Run the development server
pnpm dev

# The app will be available at http://localhost:3000
```

### Building

```bash
# Build for production
pnpm build

# Preview the production build
pnpm preview
```

### Other Scripts

```bash
# Type checking
pnpm type-check

# Linting
pnpm lint

# Testing
pnpm test
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Header.tsx      # Navigation header
├── pages/              # Page components
│   └── Home.tsx        # Home page
├── App.tsx             # Main app component with routing
├── main.tsx            # React app entry point
├── index.css           # Global styles with Tailwind
└── vite-env.d.ts       # Vite type definitions
```

## Monorepo Integration

The Vite configuration includes aliases for importing from other packages:

```typescript
// Import from backend package
import { apiClient } from '@org/backend';

// Import from mobile package
import { sharedUtils } from '@org/mobile';
```

## Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS & Autoprefixer** - CSS processing
