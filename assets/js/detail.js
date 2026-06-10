const SUPABASE_URL = "https://mipivcdyyptrvyvwjrpa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pcGl2Y2R5eXB0cnZ5dndqcnBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMDAyMDYsImV4cCI6MjA5NTg3NjIwNn0.-0bdeoPQxBDX-ednAhuuqsIs7aibLuv7Pkd4xSMrRmU";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

const container = document.getElementById("product-detail");

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

async function loadProduct() {

    const { data, error } = await supabaseClient
        .from("products")
        .select(`
            *,
            categories(name)
        `)
        .eq("id", productId)
        .single();

    if (error || !data) {


        return;
    }

    const specsHtml = Object.entries(data.specs || {})
        .map(([key, value]) => `
            <div class="spec-item">
                <strong>${key}</strong>
                <span>${value}</span>
            </div>
        `)
        .join("");

    const waMessage =
        `Halo PT. Khalf Global Teknik, saya ingin menanyakan ketersediaan produk ${data.name}`;

    const waLink =
        `https://wa.me/6285191614070?text=${encodeURIComponent(waMessage)}`;

    container.innerHTML = `
<div class="product-detail">

    <div class="product-image">
        <img src="${data.image_url}" alt="${data.name}">
    </div>

    <div class="product-info">

        <h1>${data.name}</h1>

        <div class="category">
            ${data.categories?.name || "-"}
        </div>

        <div class="brand">
            ${data.brand || "-"}
        </div>

        <div class="specs-box">
            <h3>Detail</h3>

            <div class="description">
            ${data.description || "-"}
            </div>
            ${
    data.specs
    ? Object.entries(data.specs)
        .map(([key, value]) => `
            <div class="spec-item">
                <strong>${key}</strong> : ${value}
            </div>
        `)
        .join("")
    : "<p>Tidak ada spesifikasi.</p>"
}
        </div>

        <div class="action-buttons">

            <a
                href="${waLink}"
                target="_blank"
                class="btn btn-primary"
            >
                Tanyakan Stok
            </a>

            <a
                href="catalog.html"
                class="btn btn-secondary"
            >
                Kembali ke Katalog
            </a>

        </div>

    </div>

</div>
`;
}

loadProduct();