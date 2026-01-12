import { Router, Request, Response } from 'express';
import { productService } from '../services/product.service';

const router = Router();

/**
 * GET /api/products
 * Get all products or search/filter products
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const { category, search, tags } = req.query;

    let products;

    if (search && typeof search === 'string') {
      products = productService.searchProducts(search);
    } else if (category && typeof category === 'string') {
      products = productService.getProductsByCategory(category as any);
    } else if (tags && typeof tags === 'string') {
      const tagArray = tags.split(',').map(t => t.trim());
      products = productService.getProductsByTags(tagArray);
    } else {
      products = productService.getAllProducts();
    }

    res.json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
});

/**
 * GET /api/products/:id
 * Get a single product by ID
 */
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = productService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
});

/**
 * GET /api/products/:id/availability
 * Check product availability
 */
router.get('/:id/availability', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.query;

    const product = productService.getProductById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const requestedQuantity = quantity ? parseInt(quantity as string) : 1;
    const isAvailable = productService.checkAvailability(id, requestedQuantity);

    res.json({
      success: true,
      data: {
        productId: id,
        available: isAvailable,
        inStock: product.inStock,
        stockQuantity: product.stockQuantity,
        requestedQuantity
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check availability'
    });
  }
});

export default router;
