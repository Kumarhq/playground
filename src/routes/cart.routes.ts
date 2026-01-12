import { Router, Request, Response } from 'express';
import { cartService } from '../services/cart.service';

const router = Router();

/**
 * POST /api/cart
 * Create a new cart
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const cart = cartService.createCart(userId);

    res.status(201).json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create cart'
    });
  }
});

/**
 * GET /api/cart/:cartId
 * Get cart with details
 */
router.get('/:cartId', (req: Request, res: Response) => {
  try {
    const { cartId } = req.params;
    const cartDetails = cartService.getCartWithDetails(cartId);

    if (!cartDetails) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    res.json({
      success: true,
      data: cartDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cart'
    });
  }
});

/**
 * POST /api/cart/:cartId/items
 * Add item to cart
 */
router.post('/:cartId/items', (req: Request, res: Response) => {
  try {
    const { cartId } = req.params;
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid product ID or quantity'
      });
    }

    const cart = cartService.addItem(cartId, productId, quantity);

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    const cartDetails = cartService.getCartWithDetails(cartId);

    res.json({
      success: true,
      data: cartDetails
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to add item to cart'
    });
  }
});

/**
 * PUT /api/cart/:cartId/items/:productId
 * Update item quantity in cart
 */
router.put('/:cartId/items/:productId', (req: Request, res: Response) => {
  try {
    const { cartId, productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quantity'
      });
    }

    const cart = cartService.updateItemQuantity(cartId, productId, quantity);

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart or item not found'
      });
    }

    const cartDetails = cartService.getCartWithDetails(cartId);

    res.json({
      success: true,
      data: cartDetails
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update item quantity'
    });
  }
});

/**
 * DELETE /api/cart/:cartId/items/:productId
 * Remove item from cart
 */
router.delete('/:cartId/items/:productId', (req: Request, res: Response) => {
  try {
    const { cartId, productId } = req.params;
    const cart = cartService.removeItem(cartId, productId);

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    const cartDetails = cartService.getCartWithDetails(cartId);

    res.json({
      success: true,
      data: cartDetails
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to remove item from cart'
    });
  }
});

/**
 * DELETE /api/cart/:cartId
 * Clear cart
 */
router.delete('/:cartId', (req: Request, res: Response) => {
  try {
    const { cartId } = req.params;
    const cart = cartService.clearCart(cartId);

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to clear cart'
    });
  }
});

export default router;
