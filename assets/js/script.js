const SUPABASE_URL = "https://mipivcdyyptrvyvwjrpa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pcGl2Y2R5eXB0cnZ5dndqcnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMDAyMDYsImV4cCI6MjA5NTg3NjIwNn0.-0bdeoPQxBDX-ednAhuuqsIs7aibLuv7Pkd4xSMrRmU";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

function renderProducts(products, limit = null) {

    const grid = document.getElementById("product-grid");
    const noProduct = document.getElementById("no-product");

    if (!grid) return;

    grid.innerHTML = "";

    const displayProducts = limit
        ? products.slice(0, limit)
        : products;

    if (displayProducts.length === 0) {

        if (noProduct) {
            noProduct.classList.remove("hidden");
        }

        return;
    }

    if (noProduct) {
        noProduct.classList.add("hidden");
    }

    displayProducts.forEach(product => {

        grid.innerHTML += `
        <div class="card" data-aos="zoom-in">

            <img
                src="${product.image_url}"
                alt="${product.name}"
            >

            <div class="card-content">

                <span class="category">
                    ${product.categories?.name || "Produk"}
                </span>

                <h4>
                    ${product.name}
                </h4>

                <p>
                    Brand: ${product.brand || "-"}
                </p>

                <a
                    href="detail.html?id=${product.id}"
                    class="btn-wa"
                >
                    Lihat Detail
                </a>

            </div>

        </div>`;
    });
}

async function loadProducts(limit = null) {

    const { data, error } = await supabaseClient
        .from("products")
        .select(`
            *,
            categories(name)
        `)
        .order("id", { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    renderProducts(data, limit);

    window.allProducts = data;
}

function setupSearch() {

    const searchInput =
        document.getElementById("search-input");

    if (!searchInput) return;

    searchInput.addEventListener("input", (e) => {

        const keyword =
            e.target.value.toLowerCase();

        const filtered =
            window.allProducts.filter(product => {

                const name =
                    product.name?.toLowerCase() || "";

                const category =
                    product.categories?.name?.toLowerCase() || "";

                return (
                    name.includes(keyword) ||
                    category.includes(keyword)
                );
            });

        renderProducts(filtered);
    });
}
function setupMobileMenu() {

    const menuToggle =
        document.getElementById("mobile-menu");

    const navList =
        document.querySelector(".nav-list");

    if (!menuToggle || !navList) return;

    menuToggle.addEventListener("click", () => {

        navList.classList.toggle("active");
        menuToggle.classList.toggle("active");

    });
}

document.addEventListener("DOMContentLoaded", async () => {

    const isCatalogPage =
        window.location.pathname.includes("catalog.html");

    const isIndexPage =
        window.location.pathname.includes("index.html") ||
        window.location.pathname === "/";

    if (isCatalogPage) {

        await loadProducts();
        setupSearch();

    }

    if (isIndexPage) {

        await loadProducts(4);
    }

    setupMobileMenu();

});