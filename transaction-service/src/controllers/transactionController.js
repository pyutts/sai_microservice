const TransactionModel = require('../models/transactionModel');
const axios = require('axios');

const TransactionController = {
  createTransaction: async (req, res) => {
    const { customerId, items } = req.body;

    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Customer ID and transaction items are required' });
    }

    try {
      // Validate customer from Customer Service
      const customerUrl = `${process.env.CUSTOMER_SERVICE_URL}/api/customers/${customerId}`;
      const customerResponse = await axios.get(customerUrl);

      if (customerResponse.status !== 200 || !customerResponse.data) {
        return res.status(404).json({ message: 'Customer not found in Customer Service' });
      }

      let totalAmount = 0;
      const processedItems = [];

      // Validate products & update stock
      for (const item of items) {
        const productUrl = `${process.env.PRODUCT_SERVICE_URL}/api/products/${item.productId}`;
        const productResponse = await axios.get(productUrl);

        if (productResponse.status !== 200 || !productResponse.data) {
          return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
        }

        const product = productResponse.data;

        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `Not enough stock for product ${product.name}. Available: ${product.stock}`
          });
        }

        totalAmount += product.price * item.quantity;

        processedItems.push({
          productId: product.id,
          quantity: item.quantity,
          pricePerItem: product.price
        });

        // Update stock in Product Service
        await axios.put(productUrl, {
          stock: product.stock - item.quantity
        });
      }

      // Create transaction & items
      const transactionId = await TransactionModel.createTransaction(customerId, totalAmount, 'pending');

      await Promise.all(
        processedItems.map(item =>
          TransactionModel.addTransactionItem(transactionId, item.productId, item.quantity, item.pricePerItem)
        )
      );

      return res.status(201).json({
        message: 'Transaction created successfully',
        transactionId
      });

    } catch (error) {
      const errMsg = error?.response?.data || error.message;
      console.error('Error creating transaction:', errMsg);
      return res.status(500).json({
        message: 'Error creating transaction',
        error: errMsg
      });
    }
  },

  getTransactionById: async (req, res) => {
    const { id } = req.params;

    try {
      const transactionItems = await TransactionModel.findById(id);

      if (!transactionItems || transactionItems.length === 0) {
        return res.status(404).json({ message: 'Transaction not found' });
      }

      const itemsWithProductDetails = await Promise.all(
        transactionItems.map(async item => {
          try {
            const productUrl = `${process.env.PRODUCT_SERVICE_URL}/api/products/${item.product_id}`;
            const productResponse = await axios.get(productUrl);
            const product = productResponse.data;

            return {
              item_id: item.item_id,
              product_id: item.product_id,
              product_name: product?.name || 'Unknown Product',
              quantity: item.quantity,
              price_per_item: item.price_per_item
            };
          } catch {
            return {
              item_id: item.item_id,
              product_id: item.product_id,
              product_name: 'Unknown Product',
              quantity: item.quantity,
              price_per_item: item.price_per_item
            };
          }
        })
      );

      const { id: transactionId, customer_id, total_amount, status, transaction_date } = transactionItems[0];

      const transaction = {
        id: transactionId,
        customer_id,
        total_amount,
        status,
        transaction_date,
        items: itemsWithProductDetails
      };

      return res.status(200).json(transaction);
    } catch (error) {
      const errMsg = error?.response?.data || error.message;
      console.error('Error getting transaction by ID:', errMsg);
      return res.status(500).json({
        message: 'Error getting transaction',
        error: errMsg
      });
    }
  },

    getTransactionById: async (req, res) => {
        const { id } = req.params;

        try {
            const transactionItems = await TransactionModel.findById(id);
            if (transactionItems.length === 0) {
                return res.status(404).json({ message: 'Transaction not found.' });
            }

            const transaction = {
                id: transactionItems[0].id,
                customer_id: transactionItems[0].customer_id,
                total_amount: transactionItems[0].total_amount,
                status: transactionItems[0].status,
                transaction_date: transactionItems[0].transaction_date,
                items: transactionItems.map(item => ({
                    item_id: item.item_id,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    quantity: item.quantity,
                    price_per_item: item.price_per_item,
                })),
            };

            res.status(200).json(transaction);
        } catch (error) {
            console.error('Error getting transaction by ID:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    },

    getTransactionsByCustomerId: async (req, res) => {
        const { customerId } = req.params;

        try {
            const transactionItems = await TransactionModel.findByCustomerId(customerId);
            if (transactionItems.length === 0) {
                return res.status(404).json({ message: 'No transactions found for this customer.' });
            }

            const transactionsMap = new Map();
            transactionItems.forEach(item => {
                if (!transactionsMap.has(item.id)) {
                    transactionsMap.set(item.id, {
                        id: item.id,
                        customer_id: item.customer_id,
                        total_amount: item.total_amount,
                        status: item.status,
                        transaction_date: item.transaction_date,
                        items: [],
                    });
                }

                transactionsMap.get(item.id).items.push({
                    item_id: item.item_id,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    quantity: item.quantity,
                    price_per_item: item.price_per_item,
                });
            });

            res.status(200).json(Array.from(transactionsMap.values()));
        } catch (error) {
            console.error('Error getting transactions by customer ID:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    },

    updateTransactionStatus: async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;

        const allowedStatus = ['pending', 'completed', 'cancelled'];
        if (!status || !allowedStatus.includes(status)) {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }

        try {
            const affectedRows = await TransactionModel.updateStatus(id, status);
            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Transaction not found or no changes made.' });
            }

            res.status(200).json({ message: 'Transaction status updated successfully.' });
        } catch (error) {
            console.error('Error updating transaction status:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    },

    deleteTransaction: async (req, res) => {
        const { id } = req.params;

        try {
            const affectedRows = await TransactionModel.delete(id);
            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Transaction not found.' });
            }

            res.status(200).json({ message: 'Transaction deleted successfully.' });
        } catch (error) {
            console.error('Error deleting transaction:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    },

    getAllTransactions: async (req, res) => {
        try {
            const transactionItems = await TransactionModel.getAll();
            if (transactionItems.length === 0) {
                return res.status(200).json([]); // No transactions
            }

            const transactionsMap = new Map();
            transactionItems.forEach(item => {
                if (!transactionsMap.has(item.id)) {
                    transactionsMap.set(item.id, {
                        id: item.id,
                        customer_id: item.customer_id,
                        total_amount: item.total_amount,
                        status: item.status,
                        transaction_date: item.transaction_date,
                        items: [],
                    });
                }

                transactionsMap.get(item.id).items.push({
                    item_id: item.item_id,
                    product_id: item.product_id,
                    product_name: item.product_name,
                    quantity: item.quantity,
                    price_per_item: item.price_per_item,
                });
            });

            res.status(200).json(Array.from(transactionsMap.values()));
        } catch (error) {
            console.error('Error getting all transactions:', error);
            res.status(500).json({ message: 'Internal server error.' });
        }
    },
};

module.exports = TransactionController;
