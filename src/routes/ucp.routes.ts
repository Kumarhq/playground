import { Router, Request, Response } from 'express';
import { ucpService } from '../services/ucp.service';
import { cartService } from '../services/cart.service';
import { UCPCreateCheckoutRequest } from '../types/ucp.types';

const router = Router();

/**
 * POST /api/ucp/checkout/sessions
 * Create a new UCP checkout session
 */
router.post('/checkout/sessions', (req: Request, res: Response) => {
  try {
    const { cartId, cartItems, currency, returnUrl, cancelUrl, metadata } = req.body;

    let ucpCartItems;

    // If cartId is provided, convert cart to UCP items
    if (cartId) {
      ucpCartItems = ucpService.convertCartToUCPItems(cartId);
    } else if (cartItems) {
      ucpCartItems = cartItems;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either cartId or cartItems must be provided'
      });
    }

    const request: UCPCreateCheckoutRequest = {
      cartItems: ucpCartItems,
      currency,
      returnUrl,
      cancelUrl,
      metadata
    };

    const merchantId = process.env.UCP_MERCHANT_ID || 'vegan-breakfast-shop';
    const response = ucpService.createCheckoutSession(request, merchantId);

    res.status(201).json({
      success: true,
      data: response
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create checkout session'
    });
  }
});

/**
 * GET /api/ucp/checkout/sessions/:sessionId
 * Get checkout session details
 */
router.get('/checkout/sessions/:sessionId', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = ucpService.getCheckoutSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Checkout session not found'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch checkout session'
    });
  }
});

/**
 * POST /api/ucp/checkout/sessions/:sessionId/complete
 * Complete checkout and create order
 */
router.post('/checkout/sessions/:sessionId/complete', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { customerId } = req.body;

    const order = ucpService.completeCheckout(sessionId, customerId);

    res.json({
      success: true,
      data: order
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to complete checkout'
    });
  }
});

/**
 * POST /api/ucp/checkout/sessions/:sessionId/cancel
 * Cancel checkout session
 */
router.post('/checkout/sessions/:sessionId/cancel', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const success = ucpService.cancelCheckoutSession(sessionId);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Checkout session not found'
      });
    }

    res.json({
      success: true,
      message: 'Checkout session cancelled'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to cancel checkout session'
    });
  }
});

/**
 * GET /api/ucp/orders/:orderId
 * Get order details
 */
router.get('/orders/:orderId', (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = ucpService.getOrder(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order'
    });
  }
});

/**
 * GET /api/ucp/orders
 * Get orders for a customer
 */
router.get('/orders', (req: Request, res: Response) => {
  try {
    const { customerId } = req.query;

    if (!customerId || typeof customerId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'customerId query parameter is required'
      });
    }

    const orders = ucpService.getCustomerOrders(customerId);

    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
});

/**
 * POST /api/ucp/orders/:orderId/payment
 * Update payment status
 */
router.post('/orders/:orderId/payment', (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    if (!paymentStatus) {
      return res.status(400).json({
        success: false,
        error: 'paymentStatus is required'
      });
    }

    const order = ucpService.updatePaymentStatus(orderId, paymentStatus);

    res.json({
      success: true,
      data: order
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update payment status'
    });
  }
});

/**
 * POST /api/ucp/orders/:orderId/fulfillment
 * Update fulfillment status
 */
router.post('/orders/:orderId/fulfillment', (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { fulfillmentStatus } = req.body;

    if (!fulfillmentStatus) {
      return res.status(400).json({
        success: false,
        error: 'fulfillmentStatus is required'
      });
    }

    const order = ucpService.updateFulfillmentStatus(orderId, fulfillmentStatus);

    res.json({
      success: true,
      data: order
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update fulfillment status'
    });
  }
});

/**
 * POST /api/ucp/orders/:orderId/cancel
 * Cancel an order
 */
router.post('/orders/:orderId/cancel', (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = ucpService.cancelOrder(orderId);

    res.json({
      success: true,
      data: order
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to cancel order'
    });
  }
});

/**
 * POST /api/ucp/webhooks
 * Webhook endpoint for receiving UCP events
 */
router.post('/webhooks', (req: Request, res: Response) => {
  try {
    const event = req.body;

    // Log webhook event
    console.log('Received UCP webhook:', event);

    // Process webhook event
    // In production, verify webhook signature here

    res.json({
      success: true,
      message: 'Webhook received'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook'
    });
  }
});

export default router;
