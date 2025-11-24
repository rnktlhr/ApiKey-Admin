// File: controllers/adminController.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Admin, ApiKey } = require('../models'); 

module.exports = {
    async login(req, res) {
        try {
            const { username, password } = req.body;
            
            const admin = await Admin.findOne({ where: { username } });
            if (!admin) {
                return res.status(401).json({ message: 'Kredensial tidak valid.' });
            }
            const isMatch = await bcrypt.compare(password, admin.password); 
            if (!isMatch) {
                return res.status(401).json({ message: 'Kredensial tidak valid.' });
            }

            const token = jwt.sign(
                { id: admin.id, username: admin.username, role: 'admin' },
                process.env.JWT_SECRET || 'secret_key_default_admin', 
                { expiresIn: '1d' }
            );
            res.json({ message: 'Login berhasil!', token: token });

        } catch (err) {
            console.error('Login error:', err);
            res.status(500).json({ message: 'Terjadi kesalahan server saat login.' });
        }
    },

    async getApiKeys(req, res) { 
        try {
            const keys = await ApiKey.findAll({
                attributes: ['id', 'key', 'firstName', 'lastName', 'email', 'expiresAt', 'isActive', 'createdAt'],
                order: [['createdAt', 'DESC']]
            });

            const keysWithStatus = keys.map(key => {
                let status = 'Active';
                const now = new Date();
                const expiresAt = new Date(key.expiresAt);

                if (!key.isActive) {
                    status = 'Inactive'; 
                } else if (expiresAt < now) {
                    status = 'Expired'; 
                }
                return { ...key.toJSON(), status: status };
            });

            res.json(keysWithStatus);
        } catch (err) {
            console.error('Error fetching keys:', err);
            res.status(500).json({ message: 'Gagal mengambil data API Keys.' });
        }
    },

    async deleteApiKey(req, res) {
        try {
            const id = req.params.id;

            const key = await ApiKey.findByPk(id);
            if (!key) {
                return res.status(404).json({ message: 'API Key tidak ditemukan.' });
            }

            await key.destroy();
            return res.json({ message: 'API Key berhasil dihapus.' });

        } catch (err) {
            console.error('Delete API Key Error:', err);
            return res.status(500).json({ message: 'Gagal menghapus API Key.' });
        }
    }

};