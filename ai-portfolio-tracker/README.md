# AI Portfolio Tracker

A multi-agent AI portfolio tracker for Solana using Virtuals Protocol with advanced monitoring, analysis, rebalancing, and alert capabilities.

## 🚀 Tech Stack

### Frontend Framework

- **Next.js 15** with App Router for SSR and routing
- **TypeScript** for full type safety
- **React 19** for modern UI components

### UI & Styling

- **Chakra UI** for comprehensive component library
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations

### State Management

- **Zustand** for lightweight, scalable state management
- **SWR** for server state management and intelligent caching

### Networking & Real-time

- **Axios** for robust HTTP requests with interceptors
- **Socket.IO Client** for real-time WebSocket connections
- **SWR** for automatic data fetching and revalidation

### Testing

- **Vitest** for fast unit testing
- **React Testing Library** for component testing
- **jsdom** for DOM testing environment

### Code Quality

- **ESLint** with Next.js configuration
- **Prettier** for consistent code formatting
- **Husky** for Git hooks automation
- **lint-staged** for pre-commit quality checks

### CI/CD

- **GitHub Actions** for automated testing and deployment
- Multi-node testing (Node 18.x, 20.x)
- Security auditing and dependency checking
- Lighthouse performance testing
- Docker containerization support

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
│   └── ui/                # UI primitives and base components
├── hooks/                 # Custom React hooks
├── services/              # API clients and external services
├── stores/                # Zustand state stores
├── providers/             # React context providers
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions and helpers
├── test/                  # Test configuration files
└── __tests__/             # Test files and test suites
```

## 🛠️ Installation

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd ai-portfolio-tracker
   ```

2. **Install Dependencies**

   Make sure to use `npm ci` to install dependencies from `package-lock.json`:

   ```bash
   npm ci
   ```

3. **Set Up Environment Variables**

   Copy the example env file and update with actual values:

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual configuration values, such as API keys and URLs
   ```

4. **Initialize Git Hooks**

   Prepare Git hooks with Husky for pre-commit checks:
   
   ```bash
   npm run prepare
   ```

## 🏃‍♂️ Development

### Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with coverage report
npm run test:coverage

# Run tests with interactive UI
npm run test:ui
```

### Code Quality

```bash
# Lint code and check for issues
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code with Prettier
npm run prettier

# Check if code is properly formatted
npm run prettier:check
```

### Production Build

```bash
npm run build
npm start
```

## 📦 Key Features

### State Management

- **Portfolio Store**: Centralized portfolio data with automatic calculations
- **Persistent Storage**: Local storage integration with Zustand persist middleware
- **Real-time Updates**: WebSocket integration for live price feeds

### API Integration

- **Axios Service**: HTTP client with request/response interceptors
- **SWR Hooks**: Data fetching with caching, revalidation, and error handling
- **WebSocket Service**: Real-time data streaming with reconnection logic

### Testing Infrastructure

- **Component Testing**: React Testing Library for UI testing
- **Browser API Mocking**: Built-in mocks for WebAPIs
- **Coverage Reporting**: Comprehensive test coverage analysis

### Development Experience

- **Pre-commit Hooks**: Automatic code quality checks
- **TypeScript**: Full type safety across the application
- **Hot Reloading**: Fast development with Turbopack

## 🔧 Configuration Files

| File                       | Purpose                                     |
| -------------------------- | ------------------------------------------- |
| `package.json`             | Dependencies, scripts, and project metadata |
| `tsconfig.json`            | TypeScript configuration with path mapping  |
| `vitest.config.ts`         | Test runner configuration                   |
| `eslint.config.mjs`        | Linting rules with Prettier integration     |
| `.prettierrc.json`         | Code formatting rules                       |
| `.github/workflows/ci.yml` | CI/CD pipeline configuration                |

## 🌐 Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
# Core API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Solana Network Settings
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com

# Virtuals Protocol
NEXT_PUBLIC_VIRTUALS_API_KEY=your_api_key_here
NEXT_PUBLIC_VIRTUALS_ENDPOINT=https://api.virtuals.io

# Additional APIs for enhanced functionality
COINGECKO_API_KEY=your_coingecko_api_key
BIRDEYE_API_KEY=your_birdeye_api_key
OPENAI_API_KEY=your_openai_api_key
```

### 🚀 Quick Deployment

The application includes automated deployment workflows:

- **Preview deployments** are created automatically for each pull request
- **Staging deployments** occur when pushing to the `develop` branch
- **Production deployments** happen when pushing to the `main` branch

For manual deployment:

```bash
# Deploy to Vercel
npm run deploy:vercel

# Deploy to Netlify
npm run deploy:netlify

# Build Docker image
npm run build:docker
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions.

## 📋 Available Scripts

| Script                   | Description                             |
| ------------------------ | --------------------------------------- |
| `npm run dev`            | Start development server with Turbopack |
| `npm run build`          | Create production build                 |
| `npm run start`          | Start production server                 |
| `npm run test`           | Run tests in watch mode                 |
| `npm run test:run`       | Run tests once                          |
| `npm run test:coverage`  | Generate coverage report                |
| `npm run lint`           | Check code with ESLint                  |
| `npm run lint:fix`       | Auto-fix ESLint issues                  |
| `npm run prettier`       | Format code with Prettier               |
| `npm run prettier:check` | Verify code formatting                  |
| `npm run prepare`        | Set up Git hooks                        |

## 🚀 Deployment

### Vercel (Recommended)

Deploy to Vercel with preview environments for each PR:

```bash
npm install -g vercel
vercel link
vercel --prod
```

### Netlify

Alternatively, use Netlify with automatic build settings:

1. Install and configure Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify deploy --build --prod
   ```

2. Link your repository to Netlify for continuous deployment.

### Docker

Containerize with Docker for consistent environments:

```bash
docker build -t ai-portfolio-tracker .
docker run -p 3000:3000 ai-portfolio-tracker
```

### Manual Deployment

Manually build and start your app for greater control:

```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with proper tests
4. Commit using conventional commits: `git commit -m 'feat: add amazing feature'`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request with a clear description

## 🎯 Development Roadmap

- [ ] **Phase 1**: Basic portfolio tracking and visualization
- [ ] **Phase 2**: Solana wallet integration
- [ ] **Phase 3**: Virtuals Protocol AI agents integration
- [ ] **Phase 4**: Advanced analytics and insights
- [ ] **Phase 5**: Automated rebalancing algorithms
- [ ] **Phase 6**: Mobile app development
- [ ] **Phase 7**: DeFi protocol integrations

## 📚 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Chakra UI Guide](https://chakra-ui.com/docs/getting-started)
- [Zustand State Management](https://zustand.docs.pmnd.rs/)
- [SWR Data Fetching](https://swr.vercel.app/)
- [Vitest Testing Framework](https://vitest.dev/)

## 🆘 Support & Issues

- 📧 Email: [support@example.com]
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/your-repo/discussions)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the Solana ecosystem**
