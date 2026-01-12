import { useState, useEffect } from 'react';
import { api, Product, Cart, Order } from './api';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartId, setCartId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    loadProducts();
    initializeCart();
  }, []);

  useEffect(() => {
    if (cartId) {
      loadCart();
    }
  }, [cartId]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const initializeCart = async () => {
    try {
      // Check if cart ID exists in localStorage
      const savedCartId = localStorage.getItem('cartId');
      if (savedCartId) {
        setCartId(savedCartId);
      } else {
        // Create new cart
        const newCart = await api.createCart();
        setCartId(newCart.cart.id);
        localStorage.setItem('cartId', newCart.cart.id);
      }
    } catch (err) {
      console.error('Failed to initialize cart:', err);
    }
  };

  const loadCart = async () => {
    if (!cartId) return;
    try {
      const cartData = await api.getCart(cartId);
      setCart(cartData);
    } catch (err) {
      console.error('Failed to load cart:', err);
      // If cart not found, create new one
      initializeCart();
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (!cartId) return;
    try {
      await api.addToCart(cartId, productId, 1);
      await loadCart();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add to cart');
    }
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (!cartId) return;
    try {
      await api.updateCartItem(cartId, productId, newQuantity);
      await loadCart();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update quantity');
    }
  };

  const handleRemoveFromCart = async (productId: string) => {
    if (!cartId) return;
    try {
      await api.removeFromCart(cartId, productId);
      await loadCart();
    } catch (err) {
      alert('Failed to remove item from cart');
    }
  };

  const handleClearCart = async () => {
    if (!cartId) return;
    if (!window.confirm('Are you sure you want to clear the cart?')) return;
    try {
      await api.clearCart(cartId);
      // Create new cart
      const newCart = await api.createCart();
      setCartId(newCart.cart.id);
      localStorage.setItem('cartId', newCart.cart.id);
      await loadCart();
    } catch (err) {
      alert('Failed to clear cart');
    }
  };

  const handleCheckout = async () => {
    if (!cartId || !cart || cart.items.length === 0) return;

    setCheckingOut(true);
    try {
      // Create UCP checkout session
      const session = await api.createCheckoutSession(cartId);

      // Complete checkout (in real app, this would redirect to payment)
      const completedOrder = await api.completeCheckout(session.sessionId, 'customer-001');

      // Simulate payment completion
      // In production, this would be handled by payment processor
      setTimeout(async () => {
        setOrder(completedOrder);

        // Clear cart and create new one
        const newCart = await api.createCart();
        setCartId(newCart.cart.id);
        localStorage.setItem('cartId', newCart.cart.id);
        setCart(null);
        setCheckingOut(false);
      }, 1000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to complete checkout');
      setCheckingOut(false);
    }
  };

  const handleBackToShopping = () => {
    setOrder(null);
    loadCart();
  };

  if (loading) {
    return <div className="loading">Loading vegan breakfast delights...</div>;
  }

  if (order) {
    return (
      <div className="container">
        <div className="success-message">
          <h2>🎉 Order Placed Successfully!</h2>
          <p>Thank you for your order. Your vegan breakfast is being prepared!</p>

          <div className="order-details">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> {order.orderId}</p>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Payment Status:</strong> {order.paymentStatus}</p>

            <h4 style={{ marginTop: '20px', marginBottom: '10px' }}>Items:</h4>
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <span>{item.name} x{item.quantity}</span>
                <span>${item.totalPrice.toFixed(2)}</span>
              </div>
            ))}

            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #ddd' }}>
              <div className="order-item">
                <span>Subtotal:</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="order-item">
                <span>Tax:</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="order-item">
                <span>Shipping:</span>
                <span>${order.shipping.toFixed(2)}</span>
              </div>
              <div className="order-item" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                <span>Total:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button className="back-btn" onClick={handleBackToShopping}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🌱 Vegan Breakfast Shop</h1>
        <p>Delicious plant-based breakfast delivered fresh to your door</p>
        <span className="badge">Powered by Universal Commerce Protocol (UCP)</span>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="product-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Vegan+Breakfast';
              }}
            />
            <div className="product-info">
              <h3 className="product-title">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-price">${product.price.toFixed(2)}</div>

              <div className="product-tags">
                {product.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>

              <button
                className="add-to-cart-btn"
                onClick={() => handleAddToCart(product.id)}
                disabled={!product.inStock}
              >
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {cart && cart.items.length > 0 && (
        <div className="cart-widget">
          <div className="cart-header">
            <span>🛒 Cart</span>
            <span className="cart-count">{cart.itemCount} items</span>
          </div>

          <div className="cart-items">
            {cart.items.map(item => (
              <div key={item.productId} className="cart-item">
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.product.name}</div>
                  <div className="cart-item-price">${item.totalPrice.toFixed(2)}</div>
                </div>
                <div className="cart-item-controls">
                  <button
                    className="qty-btn"
                    onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                  >
                    +
                  </button>
                  <button
                    className="qty-btn"
                    onClick={() => handleRemoveFromCart(item.productId)}
                    style={{ background: '#ef4444' }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax (8%):</span>
              <span>${(cart.subtotal * 0.08).toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping:</span>
              <span>$5.99</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>${(cart.subtotal + cart.subtotal * 0.08 + 5.99).toFixed(2)}</span>
            </div>
          </div>

          <button
            className="checkout-btn"
            onClick={handleCheckout}
            disabled={checkingOut}
          >
            {checkingOut ? 'Processing...' : 'Checkout with UCP'}
          </button>

          <button className="clear-cart-btn" onClick={handleClearCart}>
            Clear Cart
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
