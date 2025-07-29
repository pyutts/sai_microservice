require('dotenv').config({ path: __dirname + '/../.env' });
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 3000;

// app.use(express.json());

// USERS service
if (process.env.USER_SERVICE_URL) {
  app.use('/api/users', createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/(.*)" : "/api/users/$1",
      "^/" : "/api/users/",
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[Users Proxy] ${req.method} ${req.originalUrl} → ${proxyReq.path}`);
    }
  }));
}

// CUSTOMERS service
if (process.env.CUSTOMER_SERVICE_URL) {
  app.use('/api/customers', createProxyMiddleware({
    target: process.env.CUSTOMER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/(.*)" : "/api/customers/$1",
      "^/" : "/api/customers/",
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[Customers Proxy] ${req.method} ${req.originalUrl} → ${proxyReq.path}`);
    }
  }));
}

// PRODUCTS service
if (process.env.PRODUCT_SERVICE_URL) {
  app.use('/api/products', createProxyMiddleware({
    target: process.env.PRODUCT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/(.*)" : "/api/products/$1",
      "^/" : "/api/products/",
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[Products Proxy] ${req.method} ${req.originalUrl} → ${proxyReq.path}`);
    }
  }));
}

// TRANSACTIONS service
if (process.env.TRANSACTION_SERVICE_URL) {
  app.use('/api/transactions', createProxyMiddleware({
    target: process.env.TRANSACTION_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/(.*)" : "/api/transactions/$1",
      "^/" : "/api/transactions/",
    },
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[Transactions Proxy] ${req.method} ${req.originalUrl} → ${proxyReq.path}`);
    }
  }));
}

// Root route
app.get('/', (req, res) => {
  res.send('API Gateway for E-commerce Microservices');
});

// Start server
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Access microservices via http://localhost:${PORT}/api/...`);
});
