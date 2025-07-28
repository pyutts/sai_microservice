require('dotenv').config({ path: __dirname + '/../.env' });
const express = require('express');
const app = express();
const customerRoutes = require('./routes/customerRoutes');

app.use(express.json());
app.use('/api/customers', customerRoutes);

app.get('/', (req, res) => {
  res.send('Customer Service API');
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`✅ Customer Service running on port ${PORT}`);
});
