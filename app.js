const products = [
  {
    id: "tee",
    collection: "Collection 001",
    name: "Oversized Heavyweight Tee",
    price: 65,
    label: "No Signal",
    category: "Oversized Tee",
    crop: "crop-tee",
    summary: "A boxy silhouette with dropped shoulders, made for disconnected focus and heavyweight structure.",
    note: "The No Signal tee features a boxy silhouette with dropped shoulders. Designed for a disconnected feel in a noisy world.",
    specs: [
      ["Fabric", "100% Cotton"],
      ["Weight", "240 GSM"],
      ["Fit", "Oversized"]
    ],
    sizes: ["S", "M", "L", "XL"]
  },
  {
    id: "hoodie",
    collection: "Collection 001",
    name: "Midnight City Hoodie",
    price: 120,
    label: "Midnight City",
    category: "Heavy Hoodie",
    crop: "crop-hoodie",
    summary: "A dense fleece layer with sculpted volume, built for cold concrete nights and clean lines.",
    note: "Midnight City uses a heavy hood, ribbed edge construction, and an easy box fit that keeps the silhouette sharp.",
    specs: [
      ["Fabric", "Cotton Fleece"],
      ["Weight", "380 GSM"],
      ["Fit", "Boxy"]
    ],
    sizes: ["S", "M", "L", "XL", "XXL"]
  },
  {
    id: "jersey",
    collection: "Collection 001",
    name: "Afterimage Jersey",
    price: 90,
    label: "Afterimage",
    category: "Layered Jersey",
    crop: "crop-fabric",
    summary: "A low-glare white layer with a soft hand feel, cut to stack cleanly under outerwear.",
    note: "Afterimage is designed as a quiet base layer with subtle texture and a relaxed silhouette.",
    specs: [
      ["Fabric", "Modal Blend"],
      ["Weight", "180 GSM"],
      ["Fit", "Relaxed"]
    ],
    sizes: ["XS", "S", "M", "L"]
  }
];

const state = {
  selected: products[0],
  selectedSize: "M",
  favorites: new Set(),
  bag: []
};

const formatPrice = (value) => `$${value.toFixed(2)}`;

const productList = document.querySelector("#productList");
const detailImage = document.querySelector("#detailImage");
const detailCollection = document.querySelector("#detailCollection");
const detailPrice = document.querySelector("#detailPrice");
const detailName = document.querySelector("#detailName");
const detailSummary = document.querySelector("#detailSummary");
const detailNote = document.querySelector("#detailNote");
const detailFavorite = document.querySelector("#detailFavorite");
const specGrid = document.querySelector("#specGrid");
const sizeOptions = document.querySelector("#sizeOptions");
const addToBag = document.querySelector("#addToBag");
const bagCount = document.querySelector("#bagCount");
const bagState = document.querySelector("#bagState");
const bagItems = document.querySelector("#bagItems");
const subtotal = document.querySelector("#subtotal");

function renderProducts() {
  productList.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = `product-card ${state.selected.id === product.id ? "selected" : ""}`;
    card.innerHTML = `
      <button class="product-thumb image-crop ${product.crop}" type="button" aria-label="View ${product.name}"></button>
      <div class="product-info">
        <div class="product-meta">
          <span>${product.label}</span>
          <span>${product.category}</span>
        </div>
        <h3>${product.name}</h3>
        <p>${product.summary}</p>
      </div>
      <div class="product-actions">
        <strong>${formatPrice(product.price)}</strong>
        <button class="icon-button ${state.favorites.has(product.id) ? "is-loved" : ""}" type="button" aria-label="Favorite ${product.name}">
          <svg><use href="#icon-heart"></use></svg>
        </button>
      </div>
    `;

    card.querySelector(".product-thumb").addEventListener("click", () => {
      state.selected = product;
      state.selectedSize = product.sizes.includes(state.selectedSize) ? state.selectedSize : product.sizes[0];
      render();
      document.querySelector("#details").scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    card.querySelector(".product-info").addEventListener("click", () => {
      state.selected = product;
      state.selectedSize = product.sizes.includes(state.selectedSize) ? state.selectedSize : product.sizes[0];
      render();
    });

    card.querySelector(".product-actions button").addEventListener("click", () => toggleFavorite(product.id));
    productList.appendChild(card);
  });
}

function renderDetail() {
  const product = state.selected;

  detailImage.className = `image-crop detail-image ${product.crop}`;
  detailCollection.textContent = product.collection;
  detailPrice.textContent = formatPrice(product.price);
  detailName.textContent = product.name;
  detailSummary.textContent = product.summary;
  detailNote.textContent = product.note;
  detailFavorite.classList.toggle("is-loved", state.favorites.has(product.id));

  specGrid.innerHTML = product.specs
    .map(([label, value]) => `<div class="spec-card"><span>${label}</span><strong>${value}</strong></div>`)
    .join("");

  sizeOptions.innerHTML = "";
  product.sizes.forEach((size) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `size-chip ${state.selectedSize === size ? "selected" : ""}`;
    button.textContent = size;
    button.setAttribute("aria-pressed", state.selectedSize === size ? "true" : "false");
    button.addEventListener("click", () => {
      state.selectedSize = size;
      renderDetail();
    });
    sizeOptions.appendChild(button);
  });
}

function toggleFavorite(id) {
  if (state.favorites.has(id)) {
    state.favorites.delete(id);
  } else {
    state.favorites.add(id);
  }
  render();
}

function renderBag() {
  const total = state.bag.reduce((sum, item) => sum + item.price, 0);
  bagCount.textContent = state.bag.length;
  subtotal.textContent = formatPrice(total);
  bagState.style.display = state.bag.length ? "none" : "grid";
  bagItems.innerHTML = "";

  state.bag.forEach((item) => {
    const line = document.createElement("article");
    line.className = "bag-line";
    line.innerHTML = `
      <div class="bag-line-image image-crop ${item.crop}"></div>
      <div>
        <h3>${item.name}</h3>
        <span>${item.size} / ${item.category}</span>
      </div>
      <strong>${formatPrice(item.price)}</strong>
    `;
    bagItems.appendChild(line);
  });
}

function render() {
  renderProducts();
  renderDetail();
  renderBag();
}

detailFavorite.addEventListener("click", () => toggleFavorite(state.selected.id));

addToBag.addEventListener("click", () => {
  state.bag.push({
    ...state.selected,
    size: state.selectedSize
  });
  renderBag();
  document.querySelector(".bag-panel").scrollIntoView({ behavior: "smooth", block: "nearest" });
});

document.querySelectorAll("[data-scroll-target]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector(`#${button.dataset.scrollTarget}`).scrollIntoView({ behavior: "smooth" });
  });
});

render();
