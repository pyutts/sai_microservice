const CustomerModel = require('../models/customerModel');
const axios = require('axios');

    const CustomerController = {
    createCustomer: async (req, res) => {
        const { userId, name, email, phone, address } = req.body;

        if (!userId || !name || !email) {
        return res.status(400).json({
            message: 'User ID, name, and email are required',
        });
        }

        try {
            const userServiceUrl = `${process.env.USER_SERVICE_URL}/api/users/${userId}`;
            const { status, data } = await axios.get(userServiceUrl);

        if (status !== 200 || !data) {
            return res.status(404).json({
            message: 'User not found in User Service',
            });
        }

        const customerId = await CustomerModel.create(
            userId,
            name,
            email,
            phone,
            address
        );

        return res.status(201).json({
            message: 'Customer created successfully',
            customerId,
        });
        } catch (error) {
        const errMsg = error?.response?.data || error.message;
        console.error('Error creating customer:', errMsg);

        return res.status(500).json({
            message: 'Error creating customer',
            error: errMsg,
        });
        }
    },

    // Mendapatkan customer berdasarkan ID
    getCustomerById: async (req, res) => {
        const { id } = req.params;

        try {
            const customer = await CustomerModel.findById(id);

            if (!customer) {
                return res.status(404).json({ message: 'Customer not found' });
            }

            res.status(200).json(customer);
        } catch (error) {
            console.error('Error getting customer by ID:', error);
            res.status(500).json({ message: 'Error getting customer' });
        }
    },

    // Mendapatkan customer berdasarkan user ID
    getCustomerByUserId: async (req, res) => {
        const { userId } = req.params;

        try {
            const customer = await CustomerModel.findByUserId(userId);

            if (!customer) {
                return res.status(404).json({
                    message: 'Customer not found for this user ID'
                });
            }

            res.status(200).json(customer);
        } catch (error) {
            console.error('Error getting customer by user ID:', error);
            res.status(500).json({ message: 'Error getting customer' });
        }
    },

    // Mengupdate customer
    updateCustomer: async (req, res) => {
        const { id } = req.params;
        const { name, email, phone, address } = req.body;

        try {
            const affectedRows = await CustomerModel.update(id, name, email, phone, address);

            if (affectedRows === 0) {
                return res.status(404).json({
                    message: 'Customer not found or no changes made'
                });
            }

            res.status(200).json({ message: 'Customer updated successfully' });
        } catch (error) {
            console.error('Error updating customer:', error);
            res.status(500).json({ message: 'Error updating customer' });
        }
    },

    // Menghapus customer
    deleteCustomer: async (req, res) => {
        const { id } = req.params;

        try {
            const affectedRows = await CustomerModel.delete(id);

            if (affectedRows === 0) {
                return res.status(404).json({ message: 'Customer not found' });
            }

            res.status(200).json({ message: 'Customer deleted successfully' });
        } catch (error) {
            console.error('Error deleting customer:', error);
            res.status(500).json({ message: 'Error deleting customer' });
        }
    },

    // Mendapatkan semua customer
    getAllCustomers: async (req, res) => {
        try {
            const customers = await CustomerModel.getAll();
            res.status(200).json(customers);
        } catch (error) {
            console.error('Error getting all customers:', error);
            res.status(500).json({ message: 'Error getting all customers' });
        }
    }
};

module.exports = CustomerController;
