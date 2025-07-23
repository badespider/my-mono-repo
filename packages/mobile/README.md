# Mobile Package

## Purpose

The mobile application for the mono-repo built with Expo and React Native. This package provides a cross-platform mobile experience for both iOS and Android devices, sharing business logic with the web frontend while delivering native mobile performance.

## Tech Stack

### Core Technologies

- **Runtime**: Node.js (>=18.0.0)
- **Language**: TypeScript
- **Framework**: Expo SDK ~50.0.0 & React Native 0.73.2
- **Platform**: iOS, Android & Web
- **Navigation**: React Navigation v6

### Key Dependencies

- **react**: Core React library
- **expo**: Expo framework for React Native
- **@react-navigation/native**: Navigation library
- **@react-navigation/native-stack**: Stack navigator
- **react-native-screens**: Native screen primitives
- **react-native-safe-area-context**: Safe area handling

### Development Tools

- **@babel/core**: JavaScript compiler
- **jest-expo**: Testing framework for Expo
- **eslint**: Code linting with Expo config
- **typescript**: TypeScript compiler
- **react-test-renderer**: Testing utilities

## Local Development Commands

### Prerequisites

- Node.js >=18.0.0
- Xcode (for iOS development)
- Android Studio (for Android development)

### Installation

```bash
# Install dependencies (run from project root)
pnpm install
```

### Development

```bash
# Start Expo development server
pnpm expo:start

# Build the app
pnpm expo:build

# Run tests with Jest
pnpm expo:test
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
mobile/
├── src/           # Source code
│   ├── components/    # React Native components
│   ├── screens/       # Screen components
│   ├── navigation/    # Navigation configuration
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API and external services
│   └── utils/         # Utility functions
├── android/       # Android-specific code
├── ios/           # iOS-specific code
├── index.js       # App entry point
├── package.json   # Package configuration
├── tsconfig.json  # TypeScript configuration
├── metro.config.js # Metro bundler configuration
└── README.md      # This file
```

## Platform Setup

### Android Development

1. Install Android Studio
2. Set up Android SDK and build tools
3. Configure Android emulator or connect physical device
4. Set ANDROID_HOME environment variable

### iOS Development (macOS only)

1. Install Xcode from App Store
2. Install Xcode Command Line Tools
3. Install CocoaPods: `sudo gem install cocoapods`
4. Run `pod install` in the ios/ directory

## Development Workflow

### Running the App

1. Start Metro bundler: `npm run start`
2. In a new terminal, run platform-specific command:
   - Android: `npm run android`
   - iOS: `npm run ios`

### Hot Reloading

- Enable "Fast Refresh" in the developer menu
- Changes to JavaScript code will refresh automatically
- Native code changes require rebuilding

### Debugging

- Shake device or press Cmd+D (iOS) / Cmd+M (Android) for developer menu
- Use Flipper for advanced debugging
- Chrome DevTools for JavaScript debugging

## Navigation

Uses React Navigation v6 with:

- Type-safe navigation
- Stack-based navigation pattern
- Deep linking support
- Native performance

## State Management

- React hooks for local state
- Context API for global state
- Consider Redux Toolkit for complex state needs

## API Integration

- Fetch API for HTTP requests
- Environment-specific API endpoints
- Error handling and retry logic
- Loading states and offline support

## Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Generate coverage report
npm run test -- --coverage
```

## Building for Production

### Android

```bash
# Generate signed APK
cd android && ./gradlew assembleRelease

# Generate AAB for Play Store
cd android && ./gradlew bundleRelease
```

### iOS

1. Open `ios/YourApp.xcworkspace` in Xcode
2. Select "Generic iOS Device" as target
3. Product → Archive
4. Distribute to App Store or for testing

## Environment Configuration

Configure environment variables in:

- `android/app/src/main/res/values/strings.xml` (Android)
- `ios/YourApp/Info.plist` (iOS)
- JavaScript config files for runtime variables

## Performance Considerations

- Use FlatList for large lists
- Optimize images and assets
- Implement code splitting where possible
- Profile with Flipper or Xcode Instruments
- Follow React Native performance best practices

## Notes

- This package targets React Native 0.72+
- Uses the new React Native architecture where possible
- Metro bundler handles JavaScript bundling
- Native modules may require additional platform-specific setup
- Hot reloading works for JavaScript changes only
