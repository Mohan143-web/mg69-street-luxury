const products = [
  {
    id: "tee",
    collection: "Collection 001",
    name: "Oversized Heavyweight Tee",
    price: 65,
    label: "No Signal",
    category: "Oversized Tee",
    crop: "crop-tee",
    summary: "Box fit. Dropped shoulder. Quiet weight.",
    note: "The No Signal tee is cut boxy with dropped shoulders and a dense hand feel. A future uniform for moving outside the feed.",
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
    summary: "Dense fleece volume for cold concrete nights.",
    note: "Midnight City uses a heavy hood, ribbed edge construction, and a squared silhouette that keeps the shape sharp.",
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
    summary: "Low-glare layer. Soft structure. Clean stack.",
    note: "Afterimage is designed as a quiet base with subtle texture and a relaxed silhouette under outerwear.",
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
const topbar = document.querySelector("#topbar");
let revealObserver;

document.documentElement.classList.add("motion-ready");

function observeRevealTargets(scope = document) {
  if (!revealObserver) return;
  scope.querySelectorAll("[data-reveal]:not(.is-observed)").forEach((element) => {
    element.classList.add("is-observed");
    revealObserver.observe(element);
  });
}

function renderProducts() {
  productList.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = `product-card ${state.selected.id === product.id ? "selected" : ""}`;
    card.setAttribute("data-reveal", "");
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

  observeRevealTargets(productList);
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

revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16, rootMargin: "0px 0px -60px 0px" }
);

observeRevealTargets();

window.setTimeout(() => {
  document.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      element.classList.add("is-visible");
    }
  });
}, 600);

window.addEventListener("scroll", () => {
  topbar.classList.toggle("is-scrolled", window.scrollY > 24);
});

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
    document.querySelector(`#${button.dataset.scrollTarget}`).scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

render();
