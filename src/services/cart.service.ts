import { v4 as uuidv4 } from 'uuid';
import { Cart, CartItem } from '../types/product.types';
import { productService } from './product.service';

export class CartService {
  private carts: Map<string, Cart> = new Map();

  createCart(userId?: string): Cart {
    const cart: Cart = {
      id: uuidv4(),
      userId,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.carts.set(cart.id, cart);
    return cart;
  }

  getCart(cartId: string): Cart | undefined {
    return this.carts.get(cartId);
  }

  addItem(cartId: string, productId: string, quantity: number): Cart | null {
    const cart = this.carts.get(cartId);
    if (!cart) return null;

    // Check product availability
    if (!productService.checkAvailability(productId, quantity)) {
      throw new Error('Product not available in requested quantity');
    }

    // Check if item already exists in cart
    const existingItem = cart.items.find(item => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        addedAt: new Date().toISOString()
      });
    }

    cart.updatedAt = new Date().toISOString();
    return cart;
  }

  updateItemQuantity(cartId: string, productId: string, quantity: number): Cart | null {
    const cart = this.carts.get(cartId);
    if (!cart) return null;

    const item = cart.items.find(item => item.productId === productId);
    if (!item) return null;

    if (quantity <= 0) {
      return this.removeItem(cartId, productId);
    }

    // Check availability for new quantity
    if (!productService.checkAvailability(productId, quantity)) {
      throw new Error('Product not available in requested quantity');
    }

    item.quantity = quantity;
    cart.updatedAt = new Date().toISOString();
    return cart;
  }

  removeItem(cartId: string, productId: string): Cart | null {
    const cart = this.carts.get(cartId);
    if (!cart) return null;

    cart.items = cart.items.filter(item => item.productId !== productId);
    cart.updatedAt = new Date().toISOString();
    return cart;
  }

  clearCart(cartId: string): Cart | null {
    const cart = this.carts.get(cartId);
    if (!cart) return null;

    cart.items = [];
    cart.updatedAt = new Date().toISOString();
    return cart;
  }

  getCartWithDetails(cartId: string) {
    const cart = this.carts.get(cartId);
    if (!cart) return null;

    const items = cart.items.map(item => {
      const product = productService.getProductById(item.productId);
      if (!product) return null;

      return {
        productId: item.productId,
        product: product,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: product.price * item.quantity,
        addedAt: item.addedAt
      };
    }).filter(item => item !== null);

    const subtotal = items.reduce((sum, item) => sum + (item?.totalPrice || 0), 0);

    return {
      cart,
      items,
      subtotal,
      itemCount: items.reduce((sum, item) => sum + (item?.quantity || 0), 0)
    };
  }

  deleteCart(cartId: string): boolean {
    return this.carts.delete(cartId);
  }
}

export const cartService = new CartService();
