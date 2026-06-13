// Variabel Global untuk menyimpan data agar pencarian / filter berjalan responsif
let allProducts = [];
let allCategories = [];
let editingId = null;

async function checkLogin() {
    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (!session) {
        window.location.href = "login.html";
    }
}

async function loadDashboard() {
    const productResult = await supabaseClient
        .from("products")
        .select("*", {
            count: "exact",
            head: true
        });

    const categoryResult = await supabaseClient
        .from("categories")
        .select("*", {
            count: "exact",
            head: true
        });

    document.getElementById("productCount").textContent =
        productResult.count || 0;

    document.getElementById("categoryCount").textContent =
        categoryResult.count || 0;
}

async function loadProducts() {
    const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .order("id", { ascending: true });

    if (error) {
        console.error(error);
        return;
    }

    // Simpan semua data produk yang didapat ke variabel global
    allProducts = data || [];
    
    // Render semua produk ke container
    renderProducts(allProducts);
}

// Fungsi bantu untuk merender list produk ke HTML
function renderProducts(productsList) {
    const container = document.getElementById("productsContainer");
    if (!container) return;

    if (!productsList || productsList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>Belum Ada Produk</h3>
                <p>Produk yang dicari atau ditambahkan akan muncul di sini.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = "";

    productsList.forEach(product => {
        // Cari nama kategori berdasarkan category_id produk
        const categoryObj = allCategories.find(c => c.id === product.category_id);
        const categoryName = categoryObj ? categoryObj.name : "-";

        container.innerHTML += `
            <div class="product-card">
                ${
                    product.image_url
                    ? `
                        <img
                            src="${product.image_url}"
                            alt="${product.name}"
                            class="product-image"
                        >
                    `
                    : ""
                }
                <h3>${product.name}</h3>
                <p>
                    <strong>Category:</strong>
                    ${categoryName}
                </p>
                <p>
                    <strong>Brand:</strong>
                    ${product.brand || "-"}
                </p>
                <p>
                    <strong>Stock:</strong>
                    ${product.stock || 0}
                </p>
                <p>
                    <strong>ID:</strong>
                    ${product.id}
                </p>
                <div class="product-actions">
                    <button
                        class="edit-btn"
                        onclick="editProduct(${product.id})"
                    >
                        Edit
                    </button>
                    <button
                        class="delete-btn"
                        onclick="deleteProduct(${product.id})"
                    >
                        Delete
                    </button>
                </div>
            </div>
        `;
    });
}

// Fungsi untuk memfilter list produk berdasarkan input search bar
function handleSearch(event) {
    const keyword = event.target.value.toLowerCase().trim();

    const filtered = allProducts.filter(product => {
        const productName = (product.name || "").toLowerCase();
        const productBrand = (product.brand || "").toLowerCase();
        
        // Dapatkan nama kategori dari mapping ID
        const categoryObj = allCategories.find(c => c.id === product.category_id);
        const categoryName = categoryObj ? categoryObj.name.toLowerCase() : "";

        // Filter jika keyword cocok dengan nama produk, brand, atau nama kategori
        return productName.includes(keyword) || 
               productBrand.includes(keyword) || 
               categoryName.includes(keyword);
    });

    renderProducts(filtered);
}

async function editProduct(id) {
    const { data, error } = await supabaseClient
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error(error);
        return;
    }

    editingId = id;

    document.getElementById("modalTitle").textContent = "Edit Produk";
    document.getElementById("newName").value = data.name || "";
    document.getElementById("newCategory").value = data.category_id || "";
    document.getElementById("newBrand").value = data.brand || "";
    document.getElementById("newDescription").value = data.description || "";
    document.getElementById("newStock").value = data.stock || 0;
    document.getElementById("productModal").style.display = "flex";
}

async function deleteProduct(id) {
    const confirmDelete = confirm("Yakin ingin menghapus produk ini?");
    if (!confirmDelete) return;

    const { data: product, error: getError } = await supabaseClient
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

    if (getError) {
        console.error(getError);
        alert("PRODUK TIDAK DITEMUKAN..!");
        return;
    }

    /* ==========================
       HAPUS GAMBAR STORAGE
    ========================== */
    if (product.image_url) {
        const fileName = decodeURIComponent(product.image_url.split("/").pop());
        const { error: storageError } = await supabaseClient
            .storage
            .from("product-images")
            .remove([fileName]);

        if (storageError) {
            console.warn("Gagal hapus gambar:", storageError);
        }
    }

    /* ==========================
       HAPUS PRODUK
    ========================== */
    const { error } = await supabaseClient
        .from("products")
        .delete()
        .eq("id", id);

    if (error) {
        console.error(error);
        alert("GAGAL MENGHAPUS PRODUK..!");
        return;
    }

    alert("PRODUK BERHASIL DIHAPUS..!");
    await loadDashboard();
    await loadProducts();
}

/* ==========================
   ADD PRODUCT & CATEGORIES
========================== */
async function loadCategories() {
    const { data, error } = await supabaseClient
        .from("categories")
        .select("*")
        .order("name");

    if (error) {
        console.error(error);
        return;
    }

    // Simpan data kategori ke variabel global agar bisa dipakai di filter search
    allCategories = data || [];

    const select = document.getElementById("newCategory");
    if (!select) return;

    select.innerHTML = '<option value="">Pilih Kategori</option>';
    allCategories.forEach(category => {
        select.innerHTML += `
            <option value="${category.id}">
                ${category.name}
            </option>
        `;
    });
}

function openModal() {
    editingId = null;
    document.getElementById("modalTitle").textContent = "Tambah Produk";
    document.getElementById("productModal").style.display = "flex";
}

function closeModal() {
    editingId = null;
    document.getElementById("productModal").style.display = "none";
    document.getElementById("newName").value = "";
    document.getElementById("newCategory").value = "";
    document.getElementById("newBrand").value = "";
    document.getElementById("newDescription").value = "";
    document.getElementById("newStock").value = "";

    const imageInput = document.getElementById("newImage");
    if (imageInput) {
        imageInput.value = "";
    }
}

async function saveProduct() {
    const name = document.getElementById("newName").value.trim();
    const category_id = document.getElementById("newCategory").value;
    const brand = document.getElementById("newBrand").value.trim();
    const description = document.getElementById("newDescription").value.trim();
    const stock = Number(document.getElementById("newStock").value);
    const imageInput = document.getElementById("newImage");
    const imageFile = imageInput ? imageInput.files[0] : null;

    /* ==========================
       VALIDASI
    ========================== */
    if (!name) {
        alert("WAJIB DI ISI..!");
        return;
    }

    let image_url = null;

    /* ==========================
       UPLOAD GAMBAR
    ========================== */
    if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error: uploadError } = await supabaseClient
            .storage
            .from("product-images")
            .upload(fileName, imageFile);

        if (uploadError) {
            console.error(uploadError);
            alert("UPLOAD IMAGE GAGAL..!");
            return;
        }

        const { data: publicUrlData } = supabaseClient
            .storage
            .from("product-images")
            .getPublicUrl(fileName);

        image_url = publicUrlData.publicUrl;
    }

    /* ==========================
       SIMPAN PRODUK
    ========================== */
    let error;

    if (editingId) {
        const updateData = {
            name,
            category_id: category_id || null,
            brand,
            description,
            stock: stock || 0
        };

        if (image_url) {
            updateData.image_url = image_url;
        }

        const result = await supabaseClient
            .from("products")
            .update(updateData)
            .eq("id", editingId);

        error = result.error;
    } else {
        const result = await supabaseClient
            .from("products")
            .insert([
                {
                    name,
                    category_id: category_id || null,
                    brand,
                    description,
                    stock: stock || 0,
                    image_url,
                    specs: {}
                }
            ]);

        error = result.error;
    }

    if (error) {
        console.error(error);
        alert(error.message);
        return;
    }

    alert(editingId ? "UPDATE BERHASIL..!" : "PRODUK DITAMBAHKAN..!");

    /* ==========================
       RESET FORM
    ========================== */
    document.getElementById("newName").value = "";
    document.getElementById("newCategory").value = "";
    document.getElementById("newBrand").value = "";
    document.getElementById("newDescription").value = "";
    document.getElementById("newStock").value = "";

    if (imageInput) {
        imageInput.value = "";
    }

    closeModal();

    /* ==========================
       REFRESH DATA
    ========================== */
    await loadDashboard();
    await loadProducts();
}

/* ==========================
   LOGOUT
========================== */
async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = "login.html";
}

/* ==========================
   APP INIT
========================== */
async function init() {
    await checkLogin();
    await loadDashboard();
    
    // loadCategories dipanggil duluan agar saat produk diload, nama kategorinya langsung ter-mapping
    await loadCategories();
    await loadProducts();

    const addBtn = document.getElementById("addProductBtn");
    if (addBtn) {
        addBtn.addEventListener("click", openModal);
    }

    // Menghubungkan elemen Search Bar ke Event Listener 'input'
    const searchBar = document.getElementById("searchProduct");
    if (searchBar) {
        searchBar.addEventListener("input", handleSearch);
    }
}

init();
