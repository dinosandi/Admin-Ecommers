# 🛍️ Admin Dashboard - E-Commerce Platform

This is the **Admin Dashboard** for a custom-built E-Commerce platform. It serves as the central management interface for all store operations, including product management, bundle creation, delivery option handling, transaction monitoring, and customer support chat via WebSocket.

The dashboard is built with modern technologies to ensure efficiency, responsiveness, and real-time data flow.

---

## 🚀 Tech Stack

| Technology         | Description                                                      |
|--------------------|------------------------------------------------------------------|
| **React.js**       | UI framework for building interactive and dynamic interfaces     |
| **Material UI**    | Responsive and accessible UI components                          |
| **Tailwind CSS**   | Utility-first CSS framework for custom and rapid styling         |
| **TanStack Query** | Data fetching and state management for server state              |
| **TanStack Router**| Modern declarative routing system                                |
| **WebSocket**      | Real-time communication for live chat between Admin and Customer |

---

## 🧰 Key Features

### ✅ Product & Bundle Management
- Full CRUD operations for individual products
- Create and manage promotional product bundles
- Set pricing, images, descriptions, categories, and stock per item

### 🚚 Delivery Option Configuration
- Configure available delivery methods: **Home Delivery** or **In-store Pickup**
- View delivery selections made by customers during checkout
- Ensure flexibility and logistics tracking

### 💳 Transaction Monitoring
- Track all customer transactions in real-time
- View transaction history filtered by delivery type
- Monitor order statuses, payment progress, and fulfillment

### 💬 Real-Time Customer Support (WebSocket)
- Integrated **live chat** between Admin and Customers
- Built using **WebSocket** for bi-directional, real-time messaging
- Enables support team or admin to respond to customer inquiries instantly
- Displays message history, typing status, and chat timestamps
