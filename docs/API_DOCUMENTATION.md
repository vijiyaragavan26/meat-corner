# MEAT CORNER REST API DOCUMENTATION

Centralized REST API for Customer, Admin, and Delivery Partner Portals.

**Base URL**: `http://localhost:5000/api`

---

## 1. Authentication (`/api/auth`)

### POST `/api/auth/register`
Create a customer or partner account.
- **Body**:
  ```json
  {
    "name": "Priya Dharshini",
    "email": "customer@meatcorner.in",
    "phone": "+919876543210",
    "password": "Customer@123",
    "role": "CUSTOMER" // "CUSTOMER" | "ADMIN" | "DELIVERY_PARTNER"
  }
  ```
- **Response**: `{ success: true, data: { token: "...", user: {...} } }`

### POST `/api/auth/login`
- **Body**:
  ```json
  {
    "email": "customer@meatcorner.in",
    "password": "Customer@123"
  }
  ```
- **Response**: `{ success: true, data: { token: "...", user: {...}, deliveryPartner?: {...} } }`

### GET `/api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: Returns active user record and partner details if applicable.

---

## 2. Categories & Products (`/api`)

### GET `/api/categories`
Returns all 8 pure chicken categories:
- Whole Chicken
- Skinless Chicken
- Curry Cut Chicken
- Boneless Chicken
- Chicken Breast
- Chicken Leg
- Chicken Wings
- Chicken Liver & Gizzard

### GET `/api/products`
Query parameters:
- `category`: Category slug (e.g., `curry-cut-chicken`)
- `search`: Search keyword (e.g., `curry`, `breast`, `drumsticks`)
- `bestSeller`: `true`
- `todaySpecial`: `true`
- `recommended`: `true`
- `sortBy`: `price_asc` | `price_desc` | `rating` | `popular`

### GET `/api/products/:id`
Returns full product detail with:
- Multiple images
- Weight variants (`250g`, `500g`, `1kg`, `2kg`)
- Butchery cuts (`Curry cut`, `Biryani cut`, `Small pieces`, `Medium pieces`, `Boneless`, `Skinless`)
- Cleaning & wash preferences (`Standard Clean`, `Turmeric Washed`)
- Available inventory
- Related chicken cuts

### POST `/api/admin/products` *(Admin Only)*
Create new chicken product with variants and inventory limits.

### PUT `/api/admin/products/:id` *(Admin Only)*
Update prices, discounts, stock, or marketing flags.

### DELETE `/api/admin/products/:id` *(Admin Only)*
Deactivate product.

---

## 3. Shopping Cart (`/api/cart`)

### GET `/api/cart`
Returns customer cart items with automatic server-side price calculations:
- Subtotal
- Delivery Fee (Free above threshold, otherwise base ₹30)
- Coupon Discount
- Taxes (5% GST)
- Total Amount Payable

### POST `/api/cart/items`
- **Body**:
  ```json
  {
    "productId": "prod_1",
    "variantId": "var_1_2",
    "quantity": 1,
    "cuttingOption": "Curry Cut (Medium)",
    "cleaningOption": "Standard Clean & Washed"
  }
  ```

### PUT `/api/cart/items/:id`
Update quantity (+/-) or customize cut options.

### DELETE `/api/cart/items/:id`
Remove item.

### POST `/api/cart/apply-coupon`
- **Body**: `{ "code": "MEATFIRST20" }`
Validates:
- Minimum cart value
- Expiration date
- Maximum discount cap
- Usage limits

---

## 4. Orders & Fulfillment (`/api/orders`)

### POST `/api/orders`
Create an order:
1. Validates delivery address & serviceable PIN code (e.g. 638116).
2. Validates live inventory per variant.
3. Calculates exact server-side pricing (NEVER trusts client totals).
4. Generates unique 4-digit Delivery OTP.
5. Deducts stock safely to prevent overselling.
6. Returns created order record.

### GET `/api/orders`
Returns orders belonging to authenticated customer.

### GET `/api/orders/:id`
Returns complete order status, 9-stage progression, customer OTP, assigned rider information, and live GPS coordinates.

### GET `/api/orders/admin/all` *(Admin Only)*
Admin orders queue with status filter.

### PATCH `/api/orders/admin/:id/status` *(Admin Only)*
Status transitions: `CONFIRMED`, `PREPARING`, `READY_FOR_PICKUP`, `CANCELLED`, `REJECTED`.

### POST `/api/orders/admin/:id/assign-partner` *(Admin Only)*
Assigns a verified, online delivery partner to the order.

---

## 5. Payments (`/api/payments`)

### POST `/api/payments/create-order`
Initiates a Razorpay payment order.

### POST `/api/payments/verify`
Server-side HMAC SHA256 payment signature verification:
`crypto.createHmac('sha256', secret).update(order_id + '|' + payment_id).digest('hex')`
Updates payment status to `PAID` upon verified cryptographic match.

---

## 6. Delivery Partner Portal (`/api/delivery`)

### GET `/api/delivery/profile`
Returns driver profile, active delivery count, completed trips, and total wallet balance.

### PATCH `/api/delivery/toggle-online`
Toggles rider availability (Online / Offline).

### GET `/api/delivery/assignments`
Returns orders assigned to rider with store pickup location and customer delivery coordinates.

### POST `/api/delivery/assignments/:id/accept`
Rider accepts delivery task.

### POST `/api/delivery/assignments/:id/reject`
Rider rejects task with reason.

### PATCH `/api/delivery/orders/:id/status`
Rider workflow progression:
`PARTNER_ASSIGNED` -> `PICKED_UP` -> `OUT_FOR_DELIVERY`

### POST `/api/delivery/orders/:id/verify-otp`
- **Body**:
  ```json
  {
    "otp": "4829",
    "cashCollected": 515 // Required for Cash on Delivery
  }
  ```
Validates customer OTP, records COD collection, transitions status to `DELIVERED`, and calculates driver earnings!

### POST `/api/delivery/location`
Streams live GPS coordinates (`lat`, `lng`) to the server for customer map tracking.

### GET `/api/delivery/earnings`
Detailed trip earnings, base fee, distance bonus, and tips history.

---

## 7. Customer Extras & Settings (`/api/customer`)

- `POST /api/customer/check-pincode`: Checks if customer PIN code is within local serviceable zones.
- `GET /api/customer/settings`: Public store hours, phone, free delivery threshold, and addresses.
- `GET /api/customer/addresses`: Manage saved delivery locations (Home, Work, Other).
- `POST /api/customer/addresses`: Add new address with GPS coordinates.
- `GET /api/customer/tickets`: Customer support complaints and replies.
- `POST /api/customer/tickets`: Create new support ticket.
