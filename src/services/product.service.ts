import { Product, ProductCategory } from '../types/product.types';
import { veganBreakfastProducts } from '../data/products.data';

export class ProductService {
  private products: Product[] = veganBreakfastProducts;

  getAllProducts(): Product[] {
    return this.products.filter(p => p.inStock);
  }

  getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  getProductsByCategory(category: ProductCategory): Product[] {
    return this.products.filter(p => p.category === category && p.inStock);
  }

  searchProducts(query: string): Product[] {
    const searchTerm = query.toLowerCase();
    return this.products.filter(p =>
      p.inStock && (
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        p.ingredients.some(ing => ing.toLowerCase().includes(searchTerm))
      )
    );
  }

  getProductsByTags(tags: string[]): Product[] {
    return this.products.filter(p =>
      p.inStock && tags.some(tag => p.tags.includes(tag))
    );
  }

  checkAvailability(productId: string, quantity: number): boolean {
    const product = this.getProductById(productId);
    if (!product) return false;
    return product.inStock && product.stockQuantity >= quantity;
  }

  updateStock(productId: string, quantity: number): boolean {
    const product = this.products.find(p => p.id === productId);
    if (!product) return false;

    product.stockQuantity -= quantity;
    if (product.stockQuantity <= 0) {
      product.inStock = false;
      product.stockQuantity = 0;
    }
    product.updatedAt = new Date().toISOString();
    return true;
  }
}

export const productService = new ProductService();
