/**
 * Product-related type definitions
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  currency: string;
  imageUrl: string;
  inStock: boolean;
  stockQuantity: number;
  ingredients: string[];
  allergens: string[];
  nutritionalInfo: NutritionalInfo;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type ProductCategory =
  | 'smoothie-bowl'
  | 'pancakes-waffles'
  | 'tofu-scramble'
  | 'oatmeal-porridge'
  | 'breakfast-burrito'
  | 'avocado-toast'
  | 'chia-pudding'
  | 'granola-muesli'
  | 'fruit-bowl'
  | 'beverages';

export interface NutritionalInfo {
  servingSize: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}
