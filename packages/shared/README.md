# @org/shared

Shared utilities, types, and constants for the monorepo.

## Installation

```bash
pnpm add @org/shared
```

## Usage

### Types

```typescript
import { User, ApiResponse, LoadingState } from '@org/shared';

const user: User = {
  id: '123',
  email: 'user@example.com',
  name: 'John Doe',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const response: ApiResponse<User> = {
  success: true,
  data: user,
};
```

### Validation Utilities

```typescript
import { isValidEmail, isValidUrl, isStrongPassword } from '@org/shared';

const email = 'user@example.com';
if (isValidEmail(email)) {
  console.log('Valid email');
}

const url = 'https://example.com';
if (isValidUrl(url)) {
  console.log('Valid URL');
}
```

### Formatting Utilities

```typescript
import { formatCurrency, formatDate, truncateText } from '@org/shared';

const price = formatCurrency(123.45); // "$123.45"
const date = formatDate(new Date()); // "12/25/2023"
const text = truncateText('Long text here', 10); // "Long te..."
```

### Constants

```typescript
import { API_ENDPOINTS, HTTP_STATUS, STORAGE_KEYS } from '@org/shared';

// Use in API calls
fetch(API_ENDPOINTS.USERS);

// Use in response handling
if (response.status === HTTP_STATUS.OK) {
  // Handle success
}

// Use for local storage
localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Run in watch mode
pnpm dev
```

## Structure

```
src/
├── constants/     # Application constants
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── __tests__/     # Test files
```
