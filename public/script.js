// --- FUNGSI UTILITY ---
function getToken() { 
    // Mengambil token dari localStorage (asumsi disimpan setelah login admin)
    return localStorage.getItem("adminToken"); // Pastikan namanya 'adminToken' atau sesuaikan
}
// Redirect jika tidak ada token (Guardrail)
if (!getToken()) {
    location.href = "/public/login.html";
}

const out = document.getElementById("out"); // Untuk menampilkan pesan JSON mentah/respons

// --- EVENT LISTENERS ---

// 1. Load User dan API Keys
document.getElementById("loadUsers").addEventListener("click", async () => {
    out.textContent = 'Loading...';
    const token = getToken();
    try {
        const res = await fetch("/api/admin/apikeys", { 
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
            out.textContent = JSON.stringify(data, null, 2);
            renderApiKeysTable(data);
        } else {
            out.textContent = `Error: ${data.message || 'Gagal memuat data.'}`;
        }
    } catch (error) {
        console.error(error);
        out.textContent = `Koneksi Error: ${error.message}`;
    }
});

// 2. Membersihkan API Key yang Kedaluwarsa
document.getElementById("cleanExpired").addEventListener("click", async () => {
    out.textContent = 'Cleaning expired keys...';
    const token = getToken();
    try {
        const res = await fetch("/api/admin/apikeys/expired", {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
            out.textContent = JSON.stringify(data, null, 2);
            document.getElementById("loadUsers").click(); 
        } else {
            out.textContent = `Error: ${data.message || 'Gagal membersihkan keys.'}`;
        }
    } catch (error) {
        console.error(error);
        out.textContent = `Koneksi Error: ${error.message}`;
    }
});

// 3. Logout
document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("adminToken");
    location.href = "/public/login.html";
});

// --- FUNGSI RENDERING ---

function renderApiKeysTable(apiKeys) {
    const wrap = document.getElementById('tableWrap');
    if (!apiKeys || apiKeys.length === 0) {
        wrap.innerHTML = '<div class="alert alert-info">Tidak ada API Key yang terdaftar.</div>';
        return;
    }
    
    let html = `
    <table class="table table-bordered table-striped">
        <thead>
            <tr>
                <th>ID Dokumen</th>
                <th>Nama User</th>
                <th>Email</th>
                <th>API Key</th>
                <th>Dibuat</th>
                <th>Kedaluwarsa</th>
                <th>Aksi</th>
            </tr>
        </thead>
    <tbody>`;

    apiKeys.forEach(k => {
        const keySnippet = k.key.substring(0, 10) + '...';
        const expiresDate = new Date(k.expiresAt).toLocaleDateString();
        const createdDate = new Date(k.createdAt).toLocaleDateString();

        html += `
        <tr>
            <td><small>${k._id || k.id}</small></td>
            <td>${k.firstName} ${k.lastName}</td>
            <td>${k.email}</td>
            <td>${keySnippet}</td>
            <td>${createdDate}</td>
            <td><strong>${expiresDate}</strong></td>
            <td>
                <button class="btn btn-sm btn-danger delete-btn" data-key-id="${k._id || k.id}">Hapus</button>
            </td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    wrap.innerHTML = html;
    
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', handleDeleteKey);
    });

    /* ======================================================
       🔥 TAMBAHAN BARU — listener untuk versi DELETE yang benar
       ====================================================== */
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', handleDeleteKeyV2);
    });
    /* ======================================================
       🔥 TAMBAHAN BARU (AKHIR)
       ====================================================== */
}

// --- FUNGSI HAPUS SATU KEY (VERSI LAMA DIBIARKAN) ---

async function handleDeleteKey(event) {
    const keyId = event.target.dataset.keyId;
    if (!confirm(`Yakin ingin menghapus API Key ID: ${keyId}?`)) return;

    out.textContent = `Menghapus key ${keyId}...`;
    const token = getToken();

    try {
        const res = await fetch(`/api/admin/apikeys/${keyId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        if (res.ok) {
            out.textContent = `Sukses: ${data.message}`;
            document.getElementById("loadUsers").click(); 
        } else {
            out.textContent = `Gagal menghapus: ${data.message || 'Server error.'}`;
        }
    } catch (error) {
        console.error(error);
        out.textContent = `Koneksi Error saat menghapus: ${error.message}`;
    }
}

/* ======================================================
   🔥 TAMBAHAN BARU — FUNGSI DELETE MENGGUNAKAN ROUTE YANG BENAR
   ====================================================== */

async function handleDeleteKeyV2(event) {
    const keyId = event.target.dataset.keyId;
    if (!confirm(`Yakin ingin menghapus API Key ID: ${keyId}?`)) return;

    out.textContent = `Menghapus key ${keyId}...`;
    const token = getToken();

    try {
        const res = await fetch(`/api/admin/keys/${keyId}`, {   // <–– endpoint DELETE sesuai adminRoutes
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await res.json();

        if (res.ok) {
            out.textContent = `Sukses: ${data.message}`;
            document.getElementById("loadUsers").click();
        } else {
            out.textContent = `Gagal menghapus: ${data.message}`;
        }
    } catch (error) {
        console.error(error);
        out.textContent = `Koneksi Error: ${error.message}`;
    }
}

/* ======================================================
   🔥 TAMBAHAN BARU (AKHIR)
   ====================================================== */
