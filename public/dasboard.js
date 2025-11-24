// File: public/dashboard.js (FINAL)

document.addEventListener('DOMContentLoaded', () => {
    const keysTableBody = document.getElementById('keysTableBody');
    const messageElement = document.getElementById('message');
    const logoutButton = document.getElementById('logoutButton');
    const token = localStorage.getItem('adminToken');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Tombol logout
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('adminToken');
            window.location.href = 'login.html';
        });
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const renderKeys = (keys) => {
        keysTableBody.innerHTML = '';

        if (keys.length === 0) {
            keysTableBody.innerHTML = `
                <tr><td colspan="8" style="text-align: center;">Tidak ada API Key yang terdaftar.</td></tr>
            `;
            return;
        }

        keys.forEach(key => {
            const row = keysTableBody.insertRow();
            let statusClass = '';

            if (key.status === 'Active') statusClass = 'status-active';
            else if (key.status === 'Expired') statusClass = 'status-expired';
            else if (key.status === 'Inactive') statusClass = 'status-inactive';

            row.insertCell().textContent = key.id;
            row.insertCell().textContent = `${key.firstName} ${key.lastName}`;
            row.insertCell().textContent = key.email;
            row.insertCell().innerHTML = `<span class="${statusClass}">${key.status}</span>`;

            const maskedKey = key.key.substring(0, 8) + "...";
            row.insertCell().textContent = maskedKey;

            row.insertCell().textContent = formatDate(key.createdAt);
            row.insertCell().textContent = formatDate(key.expiresAt);

            const actionCell = row.insertCell();

            // Tombol NONAKTIFKAN
            if (key.status !== 'Inactive') {
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Nonaktifkan';
                deleteBtn.onclick = () => handleDelete(key.id);
                actionCell.appendChild(deleteBtn);
            }

            // Tombol DELETE PERMANEN
            const hardDeleteBtn = document.createElement('button');
            hardDeleteBtn.textContent = 'Delete';
            hardDeleteBtn.classList.add('delete-btn');
            hardDeleteBtn.onclick = () => handleHardDelete(key.id);
            actionCell.appendChild(hardDeleteBtn);
        });
    };

    // Ambil semua API Key
    const fetchKeys = async () => {
        messageElement.textContent = 'Memuat data...';

        try {
            const response = await fetch('/api/admin/keys', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (response.ok) {
                renderKeys(data);
                messageElement.textContent = `Ditemukan ${data.length} API Keys.`;
            } else {
                messageElement.textContent = `Error: ${data.message}`;
            }
        } catch (err) {
            messageElement.textContent = 'Kesalahan koneksi ke server.';
        }
    };

    // === HAPUS / NONAKTIFKAN ===
    const handleDelete = async (keyId) => {
        if (!confirm(`Yakin nonaktifkan Key ID: ${keyId}?`)) return;

        try {
            const response = await fetch(`/api/admin/keys/${keyId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (response.ok) {
                alert('API Key berhasil dinonaktifkan.');
                fetchKeys();
            } else {
                alert(`Gagal: ${data.message}`);
            }
        } catch (err) {
            alert('Kesalahan koneksi saat menghapus.');
        }
    };

    // === HAPUS PERMANEN ===
    const handleHardDelete = async (keyId) => {
        if (!confirm(`Yakin HAPUS PERMANEN Key ID: ${keyId}?`)) return;

        try {
            const response = await fetch(`/api/admin/keys/${keyId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (response.ok) {
                alert('API Key berhasil dihapus permanen.');
                fetchKeys();
            } else {
                alert(`Gagal: ${data.message}`);
            }
        } catch (err) {
            alert('Kesalahan koneksi saat menghapus permanen.');
        }
    };

    fetchKeys();
});
