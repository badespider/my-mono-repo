import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
      environment: process.env.NEXT_PUBLIC_APP_ENV || 'development',
      node_version: process.version,
      platform: process.platform,
      arch: process.arch,
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
        external: Math.round((process.memoryUsage().external / 1024 / 1024) * 100) / 100,
      },
      services: {
        solana: {
          network: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet',
          rpc_endpoint: process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || 'https://api.devnet.solana.com',
          status: 'configured'
        },
        virtuals: {
          endpoint: process.env.NEXT_PUBLIC_VIRTUALS_ENDPOINT || 'https://api.virtuals.io',
          status: process.env.NEXT_PUBLIC_VIRTUALS_API_KEY ? 'configured' : 'not_configured'
        },
        database: {
          status: process.env.DATABASE_URL ? 'configured' : 'not_configured'
        },
        websocket: {
          endpoint: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001',
          status: 'configured'
        }
      },
      features: {
        debug_mode: process.env.NEXT_PUBLIC_ENABLE_DEBUG_MODE === 'true',
        mock_data: process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true',
        performance_monitoring: process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true',
        analytics: !!process.env.NEXT_PUBLIC_GA_ID,
        error_tracking: !!process.env.SENTRY_DSN
      }
    };

    return NextResponse.json(healthData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0',
        environment: process.env.NEXT_PUBLIC_APP_ENV || 'development'
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  }
}

// Support HEAD requests for simple availability checks
export async function HEAD() {
  try {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}
