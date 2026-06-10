
const productGrid =
document.getElementById("product-grid");

const searchInput =
document.getElementById("search-input");

const noProduct =
document.getElementById("no-product");

let allProducts = [];


// =====================
// LOAD PRODUCTS
// =====================

async function loadProducts() {

    productGrid.innerHTML =
    "<p>Memuat produk...</p>";

    const { data, error } =
    await supabaseClient
        .from("products")
        .select("*")
        .order("id");

    if (error) {

        console.error(error);

        productGrid.innerHTML =
        "<p>Gagal memuat produk.</p>";

        return;
    }

    allProducts = data;

    renderProducts(allProducts);
}


// =====================
// RENDER
// =====================

function renderProducts(products) {

    productGrid.innerHTML = "";

    if(products.length === 0){

        noProduct.classList.remove("hidden");

        return;
    }

    noProduct.classList.add("hidden");

    products.forEach(product => {

        const card =
        document.createElement("div");

        card.className = "card";

        card.innerHTML = `
    <img
        src="${product.image_url}"
        alt="${product.name}"
        loading="lazy"
    >

    <div class="card-content">

        <h3>${product.name}</h3>

        <p>${product.brand || ""}</p>

        <button
            class="detail-btn"
            onclick="window.location.href='detail.html?id=${product.id}'"
        >
            Lihat Detail
        </button>

            </div>
        `;

        productGrid.appendChild(card);

    });

}


// =====================
// SEARCH
// =====================

searchInput.addEventListener(
    "input",
    function () {

        const keyword =
        this.value.toLowerCase();

        const filtered =
        allProducts.filter(product =>

            product.name
            .toLowerCase()
            .includes(keyword)

            ||

            (product.brand || "")
            .toLowerCase()
            .includes(keyword)

        );

        renderProducts(filtered);

    }
);


// =====================
// START
// =====================

loadProducts();
