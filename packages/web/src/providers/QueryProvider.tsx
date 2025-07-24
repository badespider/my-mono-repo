import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode } from 'react';

// Create a client with optimized default configurations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global query defaults
      staleTime: 30000, // 30 seconds
      gcTime: 300000, // 5 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Global mutation defaults
      retry: 1, // Retry mutations once by default
      onError: (error: any) => {
        // Global error handling for mutations
        console.error('Mutation error:', error);
        
        // You can add toast notifications here
        // toast.error(error?.response?.data?.error || 'An error occurred');
      },
    },
  },
});

// Error boundary for React Query
const QueryErrorBoundary = ({ children }: { children: ReactNode }) => {
  return children as JSX.Element;
};

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryErrorBoundary>
        {children}
      </QueryErrorBoundary>
      {/* Show React Query Devtools in development */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
};

export default QueryProvider;

// Export the query client for use in other parts of the app
export { queryClient };
