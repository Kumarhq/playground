/**
 * Universal Commerce Protocol (UCP) Type Definitions
 * Based on UCP specification for agentic commerce
 */

export interface UCPCheckoutSession {
  sessionId: string;
  merchantId: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'expired';
  cartItems: UCPCartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  createdAt: string;
  expiresAt: string;
  metadata?: Record<string, any>;
}

export interface UCPCartItem {
  productId: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
  metadata?: Record<string, any>;
}

export interface UCPCreateCheckoutRequest {
  cartItems: UCPCartItem[];
  currency?: string;
  returnUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, any>;
}

export interface UCPCheckoutResponse {
  sessionId: string;
  checkoutUrl: string;
  expiresAt: string;
}

export interface UCPOrder {
  orderId: string;
  sessionId: string;
  merchantId: string;
  customerId?: string;
  status: OrderStatus;
  items: UCPCartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  shippingAddress?: UCPAddress;
  billingAddress?: UCPAddress;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export type OrderStatus =
  | 'pending_payment'
  | 'payment_processing'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded';

export type FulfillmentStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface UCPAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface UCPWebhookEvent {
  eventId: string;
  eventType: UCPEventType;
  timestamp: string;
  data: {
    orderId: string;
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    fulfillmentStatus?: FulfillmentStatus;
    metadata?: Record<string, any>;
  };
}

export type UCPEventType =
  | 'order.created'
  | 'order.confirmed'
  | 'order.cancelled'
  | 'payment.completed'
  | 'payment.failed'
  | 'shipment.created'
  | 'shipment.in_transit'
  | 'shipment.delivered'
  | 'refund.processed';

export interface UCPIdentityLinkRequest {
  clientId: string;
  redirectUri: string;
  scope: string[];
  state: string;
}

export interface UCPIdentityLinkResponse {
  authorizationUrl: string;
  state: string;
}

export interface UCPTokenRequest {
  grantType: 'authorization_code' | 'refresh_token';
  code?: string;
  refreshToken?: string;
  clientId: string;
  clientSecret: string;
}

export interface UCPTokenResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  refreshToken?: string;
  scope: string[];
}
