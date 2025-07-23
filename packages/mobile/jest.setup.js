/* eslint-env jest */
/* eslint-disable @typescript-eslint/no-unused-vars */

// Mock expo modules
jest.mock('expo-constants', () => ({
  default: {
    manifest: {},
    platform: { web: {} },
  },
}));

// Mock SafeAreaProvider
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
