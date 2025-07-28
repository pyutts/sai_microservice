const pool = require('../config/db');

const CustomerModel = {
    // Menambahkan customer baru
    create: async (userId, name, email, phone, address) => {
        const query = `
        INSERT INTO customers (user_id, name, email, phone, address) 
        VALUES (?, ?, ?, ?, ?)
        `;
        const values = [userId, name, email, phone, address];

        const [result] = await pool.execute(query, values);
        return result.insertId;
    },

    // Mencari customer berdasarkan ID
    findById: async (id) => {
        const [rows] = await pool.execute(
            'SELECT * FROM customers WHERE id = ?',
            [id]
        );
        return rows[0];
    },

    // Mencari customer berdasarkan user_id
    findByUserId: async (userId) => {
        const [rows] = await pool.execute(
            'SELECT * FROM customers WHERE user_id = ?',
            [userId]
        );
        return rows[0];
    },

    // Mengupdate data customer
    update: async (id, name, email, phone, address) => {
        const [result] = await pool.execute(
            'UPDATE customers SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
            [name, email, phone, address, id]
        );
        return result.affectedRows;
    },

    // Menghapus customer
    delete: async (id) => {
        const [result] = await pool.execute(
            'DELETE FROM customers WHERE id = ?',
            [id]
        );
        return result.affectedRows;
    },

    // Mendapatkan semua data customer
    getAll: async () => {
        const [rows] = await pool.execute('SELECT * FROM customers');
        return rows;
    }
};

module.exports = CustomerModel;
