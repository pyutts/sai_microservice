require('dotenv').config({ path: __dirname + '/../.env' });

const express = require('express');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('User Service API');
});

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
