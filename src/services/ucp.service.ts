import { v4 as uuidv4 } from 'uuid';
import {
  UCPCheckoutSession,
  UCPCreateCheckoutRequest,
  UCPCheckoutResponse,
  UCPOrder,
  UCPWebhookEvent,
  UCPCartItem,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus
} from '../types/ucp.types';
import { cartService } from './cart.service';
import { productService } from './product.service';

/**
 * UCP Service - Implements Universal Commerce Protocol
 * Handles checkout sessions, order management, and webhooks
 */
export class UCPService {
  private checkoutSessions: Map<string, UCPCheckoutSession> = new Map();
  private orders: Map<string, UCPOrder> = new Map();
  private webhookListeners: ((event: UCPWebhookEvent) => void)[] = [];

  private readonly TAX_RATE = 0.08; // 8% tax rate
  private readonly SHIPPING_COST = 5.99;
  private readonly SESSION_EXPIRY_MINUTES = 30;

  /**
   * Create a new UCP checkout session
   */
  createCheckoutSession(
    request: UCPCreateCheckoutRequest,
    merchantId: string
  ): UCPCheckoutResponse {
    const sessionId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.SESSION_EXPIRY_MINUTES * 60000);

    // Calculate totals
    const subtotal = request.cartItems.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );
    const tax = subtotal * this.TAX_RATE;
    const shipping = this.SHIPPING_COST;
    const total = subtotal + tax + shipping;

    const session: UCPCheckoutSession = {
      sessionId,
      merchantId,
      status: 'pending',
      cartItems: request.cartItems,
      subtotal,
      tax,
      shipping,
      total,
      currency: request.currency || 'USD',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      metadata: request.metadata
    };

    this.checkoutSessions.set(sessionId, session);

    // Auto-expire session after timeout
    setTimeout(() => {
      this.expireSession(sessionId);
    }, this.SESSION_EXPIRY_MINUTES * 60000);

    return {
      sessionId,
      checkoutUrl: `/checkout/${sessionId}`,
      expiresAt: expiresAt.toISOString()
    };
  }

  /**
   * Get checkout session by ID
   */
  getCheckoutSession(sessionId: string): UCPCheckoutSession | undefined {
    return this.checkoutSessions.get(sessionId);
  }

  /**
   * Complete checkout and create order
   */
  completeCheckout(
    sessionId: string,
    customerId?: string
  ): UCPOrder {
    const session = this.checkoutSessions.get(sessionId);
    if (!session) {
      throw new Error('Checkout session not found');
    }

    if (session.status !== 'pending' && session.status !== 'active') {
      throw new Error(`Cannot complete checkout in status: ${session.status}`);
    }

    // Check if session has expired
    if (new Date() > new Date(session.expiresAt)) {
      session.status = 'expired';
      throw new Error('Checkout session has expired');
    }

    // Update session status
    session.status = 'completed';

    // Create order
    const orderId = uuidv4();
    const now = new Date().toISOString();

    const order: UCPOrder = {
      orderId,
      sessionId,
      merchantId: session.merchantId,
      customerId,
      status: 'pending_payment',
      items: session.cartItems,
      subtotal: session.subtotal,
      tax: session.tax,
      shipping: session.shipping,
      total: session.total,
      currency: session.currency,
      paymentStatus: 'pending',
      fulfillmentStatus: 'pending',
      createdAt: now,
      updatedAt: now,
      metadata: session.metadata
    };

    this.orders.set(orderId, order);

    // Emit webhook event
    this.emitWebhook({
      eventId: uuidv4(),
      eventType: 'order.created',
      timestamp: now,
      data: {
        orderId,
        status: order.status
      }
    });

    // Update product stock
    session.cartItems.forEach(item => {
      productService.updateStock(item.productId, item.quantity);
    });

    return order;
  }

  /**
   * Cancel checkout session
   */
  cancelCheckoutSession(sessionId: string): boolean {
    const session = this.checkoutSessions.get(sessionId);
    if (!session) return false;

    session.status = 'cancelled';
    return true;
  }

  /**
   * Expire checkout session
   */
  private expireSession(sessionId: string): void {
    const session = this.checkoutSessions.get(sessionId);
    if (session && session.status === 'pending') {
      session.status = 'expired';
    }
  }

  /**
   * Get order by ID
   */
  getOrder(orderId: string): UCPOrder | undefined {
    return this.orders.get(orderId);
  }

  /**
   * Get all orders for a customer
   */
  getCustomerOrders(customerId: string): UCPOrder[] {
    return Array.from(this.orders.values())
      .filter(order => order.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Update order status
   */
  updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): UCPOrder {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.status = status;
    order.updatedAt = new Date().toISOString();

    // Emit webhook event
    this.emitWebhook({
      eventId: uuidv4(),
      eventType: status === 'confirmed' ? 'order.confirmed' : 'order.created',
      timestamp: order.updatedAt,
      data: {
        orderId,
        status
      }
    });

    return order;
  }

  /**
   * Update payment status
   */
  updatePaymentStatus(
    orderId: string,
    paymentStatus: PaymentStatus
  ): UCPOrder {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.paymentStatus = paymentStatus;
    order.updatedAt = new Date().toISOString();

    // Update order status based on payment
    if (paymentStatus === 'completed') {
      order.status = 'confirmed';
    } else if (paymentStatus === 'failed') {
      order.status = 'cancelled';
    }

    // Emit webhook event
    this.emitWebhook({
      eventId: uuidv4(),
      eventType: paymentStatus === 'completed' ? 'payment.completed' : 'payment.failed',
      timestamp: order.updatedAt,
      data: {
        orderId,
        paymentStatus
      }
    });

    return order;
  }

  /**
   * Update fulfillment status
   */
  updateFulfillmentStatus(
    orderId: string,
    fulfillmentStatus: FulfillmentStatus
  ): UCPOrder {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    order.fulfillmentStatus = fulfillmentStatus;
    order.updatedAt = new Date().toISOString();

    // Update order status based on fulfillment
    if (fulfillmentStatus === 'shipped') {
      order.status = 'shipped';
      this.emitWebhook({
        eventId: uuidv4(),
        eventType: 'shipment.created',
        timestamp: order.updatedAt,
        data: {
          orderId,
          fulfillmentStatus
        }
      });
    } else if (fulfillmentStatus === 'delivered') {
      order.status = 'delivered';
      this.emitWebhook({
        eventId: uuidv4(),
        eventType: 'shipment.delivered',
        timestamp: order.updatedAt,
        data: {
          orderId,
          fulfillmentStatus
        }
      });
    }

    return order;
  }

  /**
   * Cancel order
   */
  cancelOrder(orderId: string): UCPOrder {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === 'delivered' || order.status === 'shipped') {
      throw new Error('Cannot cancel order that has been shipped or delivered');
    }

    order.status = 'cancelled';
    order.updatedAt = new Date().toISOString();

    // Emit webhook event
    this.emitWebhook({
      eventId: uuidv4(),
      eventType: 'order.cancelled',
      timestamp: order.updatedAt,
      data: {
        orderId,
        status: 'cancelled'
      }
    });

    // Restore product stock
    order.items.forEach(item => {
      productService.updateStock(item.productId, -item.quantity);
    });

    return order;
  }

  /**
   * Register webhook listener
   */
  registerWebhookListener(listener: (event: UCPWebhookEvent) => void): void {
    this.webhookListeners.push(listener);
  }

  /**
   * Emit webhook event to all listeners
   */
  private emitWebhook(event: UCPWebhookEvent): void {
    this.webhookListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in webhook listener:', error);
      }
    });
  }

  /**
   * Convert cart to UCP cart items
   */
  convertCartToUCPItems(cartId: string): UCPCartItem[] {
    const cartDetails = cartService.getCartWithDetails(cartId);
    if (!cartDetails) {
      throw new Error('Cart not found');
    }

    return cartDetails.items.map(item => ({
      productId: item!.productId,
      name: item!.product.name,
      description: item!.product.description,
      quantity: item!.quantity,
      unitPrice: item!.unitPrice,
      totalPrice: item!.totalPrice,
      imageUrl: item!.product.imageUrl,
      metadata: {
        category: item!.product.category,
        tags: item!.product.tags
      }
    }));
  }
}

export const ucpService = new UCPService();
