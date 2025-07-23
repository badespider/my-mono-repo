import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

// Mock react-navigation
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) =>
    children,
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => children,
    Screen: ({ component: Component }: { component: React.ComponentType }) => (
      <Component />
    ),
  }),
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
  });
});
