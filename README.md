# 🌱 Vegan Breakfast Shopping App

A full-stack e-commerce application for ordering delicious vegan breakfast items, built with **Universal Commerce Protocol (UCP)** integration.

## 🎯 Overview

This application demonstrates a complete implementation of Google's Universal Commerce Protocol (UCP), the new open standard for agentic commerce announced in January 2026. It features a comprehensive vegan breakfast shopping experience with product catalog, shopping cart, checkout, and order management.

## ✨ Features

### Core Features
- **Product Catalog**: 10 curated vegan breakfast items with detailed information
- **Shopping Cart**: Full cart management with add, update, remove, and clear functionality
- **UCP Checkout**: Standards-compliant checkout sessions
- **Order Management**: Complete order lifecycle tracking
- **Webhook Events**: Real-time order status notifications
- **Payment Tracking**: Payment status management
- **Fulfillment Tracking**: Shipment and delivery status updates

### UCP Compliance
This application implements the three primary capabilities of UCP:

1. **Checkout Sessions**
   - Complex cart logic with dynamic pricing
   - Tax calculation (8% rate)
   - Shipping cost management
   - Session expiration handling (30 minutes)

2. **Identity Linking** (OAuth 2.0 ready)
   - Prepared for secure authorization
   - Customer ID tracking
   - Token-based authentication support

3. **Order Management**
   - Real-time webhook notifications
   - Order status tracking (pending → confirmed → shipped → delivered)
   - Payment status tracking
   - Fulfillment status tracking
   - Order cancellation support

## 🏗️ Architecture

### Backend (Node.js + TypeScript + Express)
```
src/
├── types/           # TypeScript type definitions
│   ├── ucp.types.ts       # UCP protocol types
│   └── product.types.ts   # Product & cart types
├── services/        # Business logic layer
│   ├── ucp.service.ts     # UCP implementation
│   ├── product.service.ts # Product catalog
│   └── cart.service.ts    # Shopping cart
├── routes/          # API endpoints
│   ├── ucp.routes.ts      # UCP endpoints
│   ├── products.routes.ts # Product endpoints
│   └── cart.routes.ts     # Cart endpoints
├── data/            # Mock data
│   └── products.data.ts   # Vegan breakfast products
└── server.ts        # Express server
```

### Frontend (React + TypeScript + Vite)
```
client/
├── src/
│   ├── App.tsx      # Main application component
│   ├── api.ts       # API client
│   ├── index.css    # Styles
│   └── main.tsx     # Entry point
└── index.html       # HTML template
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd playground
```

2. **Install backend dependencies**
```bash
npm install
```

3. **Install frontend dependencies**
```bash
cd client
npm install
cd ..
```

4. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and configure:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
UCP_MERCHANT_ID=vegan-breakfast-shop
UCP_API_VERSION=1.0
```

### Running the Application

#### Option 1: Run Both Servers Concurrently
```bash
npm run dev:all
```

#### Option 2: Run Separately

**Backend (Terminal 1)**
```bash
npm run dev
```
Server runs on http://localhost:3000

**Frontend (Terminal 2)**
```bash
npm run client
```
Client runs on http://localhost:5173

### Building for Production

**Backend**
```bash
npm run build
npm start
```

**Frontend**
```bash
cd client
npm run build
```

## 📡 API Documentation

### Product Endpoints

#### Get All Products
```http
GET /api/products
```

#### Get Product by ID
```http
GET /api/products/:id
```

#### Search Products
```http
GET /api/products?search=avocado
```

#### Filter by Category
```http
GET /api/products?category=smoothie-bowl
```

### Cart Endpoints

#### Create Cart
```http
POST /api/cart
```

#### Get Cart
```http
GET /api/cart/:cartId
```

#### Add Item to Cart
```http
POST /api/cart/:cartId/items
Content-Type: application/json

{
  "productId": "prod_001",
  "quantity": 2
}
```

#### Update Item Quantity
```http
PUT /api/cart/:cartId/items/:productId
Content-Type: application/json

{
  "quantity": 3
}
```

#### Remove Item from Cart
```http
DELETE /api/cart/:cartId/items/:productId
```

### UCP Endpoints

#### Create Checkout Session
```http
POST /api/ucp/checkout/sessions
Content-Type: application/json

{
  "cartId": "cart-uuid",
  "currency": "USD"
}
```

Response:
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

#### Get Checkout Session
```http
GET /api/ucp/checkout/sessions/:sessionId
```

#### Complete Checkout
```http
POST /api/ucp/checkout/sessions/:sessionId/complete
Content-Type: application/json

{
  "customerId": "customer-001"
}
```

#### Get Order
```http
GET /api/ucp/orders/:orderId
```

#### Get Customer Orders
```http
GET /api/ucp/orders?customerId=customer-001
```

#### Update Payment Status
```http
POST /api/ucp/orders/:orderId/payment
Content-Type: application/json

{
  "paymentStatus": "completed"
}
```

#### Update Fulfillment Status
```http
POST /api/ucp/orders/:orderId/fulfillment
Content-Type: application/json

{
  "fulfillmentStatus": "shipped"
}
```

#### Cancel Order
```http
POST /api/ucp/orders/:orderId/cancel
```

## 🔔 Webhook Events

The application emits UCP webhook events for:

- `order.created` - When an order is created
- `order.confirmed` - When payment is confirmed
- `order.cancelled` - When an order is cancelled
- `payment.completed` - When payment succeeds
- `payment.failed` - When payment fails
- `shipment.created` - When shipment begins
- `shipment.in_transit` - During transit
- `shipment.delivered` - When delivered
- `refund.processed` - When refund completes

## 🛍️ Product Catalog

The app features 10 delicious vegan breakfast items:

1. **Acai Berry Bliss Bowl** - Organic acai smoothie bowl ($12.99)
2. **Fluffy Blueberry Pancakes** - Stack with maple syrup ($10.99)
3. **Southwest Tofu Scramble** - High-protein savory dish ($11.99)
4. **Overnight Chocolate Chia Pudding** - Creamy and nutritious ($8.99)
5. **Classic Avocado Toast** - On sourdough with hemp seeds ($9.99)
6. **Peanut Butter Banana Oatmeal** - Warm and comforting ($7.99)
7. **Breakfast Burrito Supreme** - Hearty and portable ($13.99)
8. **Tropical Mango Smoothie Bowl** - Vitamin C packed ($11.99)
9. **Artisan Granola Mix** - House-made crunchy blend ($6.99)
10. **Green Goddess Smoothie** - Nutrient-dense detox drink ($8.99)

All items include:
- Detailed nutritional information
- Allergen warnings
- Ingredient lists
- Category tags
- Stock availability

## 🧪 Testing

### Manual Testing Flow

1. **Browse Products**: View all vegan breakfast items
2. **Add to Cart**: Click "Add to Cart" on any product
3. **Manage Cart**: Update quantities or remove items
4. **Checkout**: Click "Checkout with UCP"
5. **View Order**: See order confirmation with details

### Test UCP Workflow with cURL

```bash
# 1. Create a cart
CART_ID=$(curl -X POST http://localhost:3000/api/cart | jq -r '.data.id')

# 2. Add items to cart
curl -X POST http://localhost:3000/api/cart/$CART_ID/items \
  -H "Content-Type: application/json" \
  -d '{"productId": "prod_001", "quantity": 2}'

# 3. Create checkout session
SESSION=$(curl -X POST http://localhost:3000/api/ucp/checkout/sessions \
  -H "Content-Type: application/json" \
  -d "{\"cartId\": \"$CART_ID\"}" | jq -r '.data.sessionId')

# 4. Complete checkout
ORDER=$(curl -X POST http://localhost:3000/api/ucp/checkout/sessions/$SESSION/complete \
  -H "Content-Type: application/json" \
  -d '{"customerId": "test-customer"}' | jq -r '.data.orderId')

# 5. Update payment status
curl -X POST http://localhost:3000/api/ucp/orders/$ORDER/payment \
  -H "Content-Type: application/json" \
  -d '{"paymentStatus": "completed"}'

# 6. Update fulfillment status
curl -X POST http://localhost:3000/api/ucp/orders/$ORDER/fulfillment \
  -H "Content-Type: application/json" \
  -d '{"fulfillmentStatus": "shipped"}'

# 7. Get order details
curl http://localhost:3000/api/ucp/orders/$ORDER
```

## 🔐 Security Features

- Input validation on all endpoints
- Stock availability checking
- Session expiration (30 minutes)
- Order status validation
- CORS protection
- Environment variable configuration
- Error handling and logging

## 🌐 UCP Integration Details

This application implements UCP based on the official specification:

### Transport Protocol
- REST/HTTP binding
- JSON request/response format
- Standard HTTP status codes

### Data Models
- `UCPCheckoutSession` - Checkout session management
- `UCPOrder` - Order lifecycle tracking
- `UCPWebhookEvent` - Event notifications
- `UCPCartItem` - Standardized cart items

### Business Logic
- **Tax Calculation**: 8% tax rate
- **Shipping Cost**: Flat $5.99
- **Session Expiry**: 30 minutes
- **Currency**: USD (configurable)
- **Stock Management**: Automatic inventory updates

## 📚 Technology Stack

**Backend:**
- Node.js
- TypeScript
- Express.js
- UUID for ID generation
- dotenv for configuration

**Frontend:**
- React 18
- TypeScript
- Vite
- Axios for API calls
- CSS3 for styling

## 🤝 Contributing

This is a demonstration application for UCP integration. Feel free to:
- Add more products
- Implement additional payment providers
- Add user authentication
- Extend order management features
- Improve UI/UX

## 📄 License

MIT License

## 🔗 Resources

- [Universal Commerce Protocol (UCP)](https://ucp.dev/)
- [Google Developers Blog - UCP](https://developers.googleblog.com/under-the-hood-universal-commerce-protocol-ucp/)
- [Google Commerce Announcement](https://blog.google/products/ads-commerce/agentic-commerce-ai-tools-protocol-retailers-platforms/)

## 💡 Future Enhancements

- [ ] Real payment gateway integration (Stripe, PayPal)
- [ ] User authentication with OAuth 2.0
- [ ] Persistent database (PostgreSQL, MongoDB)
- [ ] Email notifications for orders
- [ ] Admin dashboard for order management
- [ ] Inventory management system
- [ ] Product reviews and ratings
- [ ] Mobile app version
- [ ] Multi-currency support
- [ ] Internationalization (i18n)
- [ ] GraphQL API option
- [ ] Agent2Agent (A2A) protocol support
- [ ] Model Context Protocol (MCP) integration

---

**Built with 🌱 by leveraging the Universal Commerce Protocol**
