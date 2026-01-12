# API Usage Examples

This document provides practical examples for using the Vegan Breakfast Shopping App API.

## Complete Shopping Flow Example

### 1. Browse Products

```bash
# Get all products
curl http://localhost:3000/api/products | jq

# Search for specific products
curl "http://localhost:3000/api/products?search=smoothie" | jq

# Filter by category
curl "http://localhost:3000/api/products?category=smoothie-bowl" | jq

# Get a specific product
curl http://localhost:3000/api/products/prod_001 | jq
```

### 2. Create and Manage Cart

```bash
# Create a new cart
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" | jq

# Save the cart ID
CART_ID="<cart-id-from-response>"

# Add items to cart
curl -X POST http://localhost:3000/api/cart/$CART_ID/items \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_001",
    "quantity": 2
  }' | jq

# Add more items
curl -X POST http://localhost:3000/api/cart/$CART_ID/items \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "prod_003",
    "quantity": 1
  }' | jq

# Get cart details
curl http://localhost:3000/api/cart/$CART_ID | jq

# Update item quantity
curl -X PUT http://localhost:3000/api/cart/$CART_ID/items/prod_001 \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 3
  }' | jq

# Remove an item
curl -X DELETE http://localhost:3000/api/cart/$CART_ID/items/prod_003 | jq
```

### 3. UCP Checkout Process

```bash
# Create a checkout session
curl -X POST http://localhost:3000/api/ucp/checkout/sessions \
  -H "Content-Type: application/json" \
  -d "{
    \"cartId\": \"$CART_ID\",
    \"currency\": \"USD\",
    \"returnUrl\": \"https://example.com/success\",
    \"cancelUrl\": \"https://example.com/cancel\"
  }" | jq

# Save the session ID
SESSION_ID="<session-id-from-response>"

# Get checkout session details
curl http://localhost:3000/api/ucp/checkout/sessions/$SESSION_ID | jq

# Complete the checkout
curl -X POST http://localhost:3000/api/ucp/checkout/sessions/$SESSION_ID/complete \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-001"
  }' | jq

# Save the order ID
ORDER_ID="<order-id-from-response>"
```

### 4. Order Management

```bash
# Get order details
curl http://localhost:3000/api/ucp/orders/$ORDER_ID | jq

# Get all orders for a customer
curl "http://localhost:3000/api/ucp/orders?customerId=customer-001" | jq

# Update payment status
curl -X POST http://localhost:3000/api/ucp/orders/$ORDER_ID/payment \
  -H "Content-Type: application/json" \
  -d '{
    "paymentStatus": "completed"
  }' | jq

# Update fulfillment status - Processing
curl -X POST http://localhost:3000/api/ucp/orders/$ORDER_ID/fulfillment \
  -H "Content-Type: application/json" \
  -d '{
    "fulfillmentStatus": "processing"
  }' | jq

# Update fulfillment status - Shipped
curl -X POST http://localhost:3000/api/ucp/orders/$ORDER_ID/fulfillment \
  -H "Content-Type: application/json" \
  -d '{
    "fulfillmentStatus": "shipped"
  }' | jq

# Update fulfillment status - Delivered
curl -X POST http://localhost:3000/api/ucp/orders/$ORDER_ID/fulfillment \
  -H "Content-Type: application/json" \
  -d '{
    "fulfillmentStatus": "delivered"
  }' | jq

# Cancel an order (only if not shipped)
curl -X POST http://localhost:3000/api/ucp/orders/$ORDER_ID/cancel \
  -H "Content-Type: application/json" | jq
```

## Complete Automated Test Script

Save this as `test_flow.sh`:

```bash
#!/bin/bash

echo "🌱 Testing Vegan Breakfast Shopping App with UCP"
echo "================================================"

API_BASE="http://localhost:3000/api"

# 1. Get all products
echo -e "\n📦 Step 1: Fetching all products..."
curl -s "$API_BASE/products" | jq -r '.data[] | "\(.id): \(.name) - $\(.price)"'

# 2. Create cart
echo -e "\n🛒 Step 2: Creating cart..."
CART_RESPONSE=$(curl -s -X POST "$API_BASE/cart")
CART_ID=$(echo $CART_RESPONSE | jq -r '.data.id')
echo "Cart ID: $CART_ID"

# 3. Add items to cart
echo -e "\n➕ Step 3: Adding items to cart..."
curl -s -X POST "$API_BASE/cart/$CART_ID/items" \
  -H "Content-Type: application/json" \
  -d '{"productId": "prod_001", "quantity": 2}' | jq '.data.items[] | .product.name'

curl -s -X POST "$API_BASE/cart/$CART_ID/items" \
  -H "Content-Type: application/json" \
  -d '{"productId": "prod_005", "quantity": 1}' | jq '.data.items[] | .product.name'

# 4. View cart
echo -e "\n🛍️ Step 4: Viewing cart..."
CART_DETAILS=$(curl -s "$API_BASE/cart/$CART_ID")
echo $CART_DETAILS | jq '{items: .data.itemCount, subtotal: .data.subtotal}'

# 5. Create checkout session
echo -e "\n💳 Step 5: Creating UCP checkout session..."
SESSION_RESPONSE=$(curl -s -X POST "$API_BASE/ucp/checkout/sessions" \
  -H "Content-Type: application/json" \
  -d "{\"cartId\": \"$CART_ID\"}")
SESSION_ID=$(echo $SESSION_RESPONSE | jq -r '.data.sessionId')
echo "Session ID: $SESSION_ID"
echo $SESSION_RESPONSE | jq '.data'

# 6. Complete checkout
echo -e "\n✅ Step 6: Completing checkout..."
ORDER_RESPONSE=$(curl -s -X POST "$API_BASE/ucp/checkout/sessions/$SESSION_ID/complete" \
  -H "Content-Type: application/json" \
  -d '{"customerId": "test-customer-001"}')
ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.data.orderId')
echo "Order ID: $ORDER_ID"
echo $ORDER_RESPONSE | jq '{orderId: .data.orderId, status: .data.status, total: .data.total}'

# 7. Update payment status
echo -e "\n💰 Step 7: Processing payment..."
curl -s -X POST "$API_BASE/ucp/orders/$ORDER_ID/payment" \
  -H "Content-Type: application/json" \
  -d '{"paymentStatus": "completed"}' | jq '{orderId: .data.orderId, paymentStatus: .data.paymentStatus, status: .data.status}'

# 8. Update fulfillment - Shipped
echo -e "\n📦 Step 8: Updating fulfillment to shipped..."
curl -s -X POST "$API_BASE/ucp/orders/$ORDER_ID/fulfillment" \
  -H "Content-Type: application/json" \
  -d '{"fulfillmentStatus": "shipped"}' | jq '{orderId: .data.orderId, fulfillmentStatus: .data.fulfillmentStatus, status: .data.status}'

# 9. Update fulfillment - Delivered
echo -e "\n🎉 Step 9: Marking as delivered..."
curl -s -X POST "$API_BASE/ucp/orders/$ORDER_ID/fulfillment" \
  -H "Content-Type: application/json" \
  -d '{"fulfillmentStatus": "delivered"}' | jq '{orderId: .data.orderId, fulfillmentStatus: .data.fulfillmentStatus, status: .data.status}'

# 10. Get final order details
echo -e "\n📋 Step 10: Final order details..."
curl -s "$API_BASE/ucp/orders/$ORDER_ID" | jq '{
  orderId: .data.orderId,
  status: .data.status,
  paymentStatus: .data.paymentStatus,
  fulfillmentStatus: .data.fulfillmentStatus,
  total: .data.total,
  items: [.data.items[] | {name: .name, quantity: .quantity, price: .totalPrice}]
}'

echo -e "\n✨ Test completed successfully!"
```

Make it executable:
```bash
chmod +x test_flow.sh
./test_flow.sh
```

## JavaScript/TypeScript Examples

### Using Axios

```typescript
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

async function completeShoppingFlow() {
  try {
    // 1. Get products
    const { data: productsRes } = await axios.get(`${API_BASE}/products`);
    console.log('Products:', productsRes.data);

    // 2. Create cart
    const { data: cartRes } = await axios.post(`${API_BASE}/cart`);
    const cartId = cartRes.data.id;
    console.log('Cart created:', cartId);

    // 3. Add items
    await axios.post(`${API_BASE}/cart/${cartId}/items`, {
      productId: 'prod_001',
      quantity: 2
    });

    await axios.post(`${API_BASE}/cart/${cartId}/items`, {
      productId: 'prod_003',
      quantity: 1
    });

    // 4. Create checkout session
    const { data: sessionRes } = await axios.post(
      `${API_BASE}/ucp/checkout/sessions`,
      { cartId }
    );
    const sessionId = sessionRes.data.sessionId;
    console.log('Checkout session:', sessionId);

    // 5. Complete checkout
    const { data: orderRes } = await axios.post(
      `${API_BASE}/ucp/checkout/sessions/${sessionId}/complete`,
      { customerId: 'customer-001' }
    );
    const orderId = orderRes.data.orderId;
    console.log('Order created:', orderId);

    // 6. Process payment
    await axios.post(`${API_BASE}/ucp/orders/${orderId}/payment`, {
      paymentStatus: 'completed'
    });

    // 7. Update fulfillment
    await axios.post(`${API_BASE}/ucp/orders/${orderId}/fulfillment`, {
      fulfillmentStatus: 'shipped'
    });

    // 8. Get order details
    const { data: finalOrder } = await axios.get(
      `${API_BASE}/ucp/orders/${orderId}`
    );
    console.log('Final order:', finalOrder.data);

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

completeShoppingFlow();
```

### Using Fetch API

```javascript
const API_BASE = 'http://localhost:3000/api';

async function checkout() {
  // Create cart
  const cartRes = await fetch(`${API_BASE}/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const { data: cart } = await cartRes.json();

  // Add item
  await fetch(`${API_BASE}/cart/${cart.id}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: 'prod_001',
      quantity: 2
    })
  });

  // Create checkout session
  const sessionRes = await fetch(`${API_BASE}/ucp/checkout/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cartId: cart.id })
  });
  const { data: session } = await sessionRes.json();

  // Complete checkout
  const orderRes = await fetch(
    `${API_BASE}/ucp/checkout/sessions/${session.sessionId}/complete`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId: 'customer-001' })
    }
  );
  const { data: order } = await orderRes.json();

  console.log('Order placed:', order);
  return order;
}

checkout();
```

## Response Examples

### Product Response
```json
{
  "success": true,
  "data": {
    "id": "prod_001",
    "name": "Acai Berry Bliss Bowl",
    "description": "Organic acai smoothie bowl topped with fresh berries...",
    "category": "smoothie-bowl",
    "price": 12.99,
    "currency": "USD",
    "imageUrl": "https://images.unsplash.com/...",
    "inStock": true,
    "stockQuantity": 50,
    "ingredients": ["acai puree", "banana", "blueberries"],
    "allergens": ["tree nuts", "coconut"],
    "tags": ["gluten-free", "organic", "superfood"]
  }
}
```

### Cart Response
```json
{
  "success": true,
  "data": {
    "cart": {
      "id": "cart-uuid",
      "items": [...]
    },
    "items": [
      {
        "productId": "prod_001",
        "product": { ... },
        "quantity": 2,
        "unitPrice": 12.99,
        "totalPrice": 25.98
      }
    ],
    "subtotal": 25.98,
    "itemCount": 2
  }
}
```

### Checkout Session Response
```json
{
  "success": true,
  "data": {
    "sessionId": "session-uuid",
    "checkoutUrl": "/checkout/session-uuid",
    "expiresAt": "2026-01-12T15:30:00Z"
  }
}
```

### Order Response
```json
{
  "success": true,
  "data": {
    "orderId": "order-uuid",
    "sessionId": "session-uuid",
    "merchantId": "vegan-breakfast-shop",
    "customerId": "customer-001",
    "status": "confirmed",
    "items": [...],
    "subtotal": 25.98,
    "tax": 2.08,
    "shipping": 5.99,
    "total": 34.05,
    "currency": "USD",
    "paymentStatus": "completed",
    "fulfillmentStatus": "processing",
    "createdAt": "2026-01-12T14:00:00Z",
    "updatedAt": "2026-01-12T14:05:00Z"
  }
}
```

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error
