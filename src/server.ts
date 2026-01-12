import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productsRoutes from './routes/products.routes';
import cartRoutes from './routes/cart.routes';
import ucpRoutes from './routes/ucp.routes';
import { ucpService } from './services/ucp.service';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'vegan-breakfast-ucp-app',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/ucp', ucpRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Vegan Breakfast Shopping App',
    description: 'UCP-compliant vegan breakfast shopping application',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      products: '/api/products',
      cart: '/api/cart',
      ucp: '/api/ucp'
    },
    ucp: {
      version: process.env.UCP_API_VERSION || '1.0',
      merchantId: process.env.UCP_MERCHANT_ID || 'vegan-breakfast-shop',
      capabilities: [
        'checkout',
        'order_management',
        'webhooks'
      ]
    }
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// Register webhook listener for logging
ucpService.registerWebhookListener((event) => {
  console.log('UCP Webhook Event:', JSON.stringify(event, null, 2));
});

// Start server
app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Vegan Breakfast Shopping App with UCP Integration       ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('Available Endpoints:');
  console.log('  📦 Products:  /api/products');
  console.log('  🛒 Cart:      /api/cart');
  console.log('  💳 UCP:       /api/ucp');
  console.log('');
  console.log('Universal Commerce Protocol (UCP) Features:');
  console.log('  ✓ Checkout Sessions');
  console.log('  ✓ Order Management');
  console.log('  ✓ Webhook Events');
  console.log('  ✓ Payment Status Tracking');
  console.log('  ✓ Fulfillment Status Tracking');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
  console.log('═══════════════════════════════════════════════════════════════');
});

export default app;
