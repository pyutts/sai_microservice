require('dotenv').config({ path: __dirname + '/../.env' });
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Config for microservice routes
const services = {
  users: process.env.USER_SERVICE_URL,
  customers: process.env.CUSTOMER_SERVICE_URL,
  products: process.env.PRODUCT_SERVICE_URL,
  transactions: process.env.TRANSACTION_SERVICE_URL
};

// Register all microservice proxies
Object.entries(services).forEach(([key, target]) => {
  if (target) {
    app.use(`/api/${key}`, createProxyMiddleware({
      target,
      changeOrigin: true
    }));
    console.log(`🛠️ Proxy setup: /api/${key} → ${target}`);
  } else {
    console.warn(`⚠️ Service URL for '${key}' is not defined in .env`);
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('🌐 API Gateway for E-commerce Microservices');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`🔗 Access microservices via http://localhost:${PORT}/api/...`);
});
