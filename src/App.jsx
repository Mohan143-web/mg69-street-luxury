import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Boxes,
  ClipboardList,
  Heart,
  LayoutDashboard,
  Menu,
  Minus,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Tags,
  Truck,
  Users,
  X,
  User
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { categories, collections, products } from "./data/products.js";
import { createCheckoutSession, fetchProducts, hasApi, saveOrder } from "./lib/api.js";
import { readStoredValue, writeStoredValue } from "./lib/storage.js";

const money = (value) => `$${value.toFixed(2)}`;
const previewImage = `${import.meta.env.BASE_URL}og-preview.png`;
const brandLogo = `${import.meta.env.BASE_URL}brand/mg69-logo3.png`;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fallbackImage = products[0].image;
const logoParticles = [
  { x: "8%", y: "18%", size: "5px", delay: "0s" },
  { x: "18%", y: "76%", size: "3px", delay: "0.8s" },
  { x: "33%", y: "10%", size: "4px", delay: "1.3s" },
  { x: "48%", y: "88%", size: "6px", delay: "0.4s" },
  { x: "66%", y: "14%", size: "3px", delay: "1.8s" },
  { x: "76%", y: "70%", size: "5px", delay: "0.2s" },
  { x: "90%", y: "32%", size: "4px", delay: "1.1s" },
  { x: "84%", y: "88%", size: "3px", delay: "2.2s" }
];
const customerLinks = [
  ["home", "Home"],
  ["shop", "Shop"],
  ["men", "Men"],
  ["women", "Women"],
  ["drop-001", "Drop 001"],
  ["wishlist", "Wishlist"],
  ["orders", "Order Tracking"],
  ["checkout", "Checkout"]
];
const adminLinks = [
  ["admin", "Dashboard"],
  ["admin-products", "Products"],
  ["admin-inventory", "Inventory"],
  ["admin-orders", "Orders"],
  ["admin-customers", "Customers"],
  ["admin-discounts", "Discounts"],
  ["admin-analytics", "Analytics"],
  ["admin-shipping", "Shipping"],
  ["admin-settings", "Settings"]
];

function normalizeProduct(product) {
  const image = product.image || product.imageUrl || product.images?.[0]?.src || fallbackImage;

  return {
    ...product,
    id: product.id || product._id,
    colors: (product.colors?.length ? product.colors : [{ name: "Matte Black", hex: "#080807" }]).map((color) =>
      typeof color === "string" ? { name: color, hex: "#080807" } : color
    ),
    image,
    images: product.images?.length ? product.images : [{ label: "Front", src: image }],
    sizes: product.sizes?.length ? product.sizes : ["S", "M", "L"],
    specs: product.specs || { Fit: product.type || "Ready to wear", Stock: `${product.stock || 0} units` },
    stock: product.stock || 0,
    tags: product.tags || []
  };
}

function usePersistentState(key, fallback) {
  const [value, setValue] = useState(() => readStoredValue(key, fallback));

  useEffect(() => {
    writeStoredValue(key, value);
  }, [key, value]);

  return [value, setValue];
}

function App() {
  const [catalog, setCatalog] = useState(products);
  const [catalogStatus, setCatalogStatus] = useState(hasApi ? "connecting" : "local");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeCollection, setActiveCollection] = useState("All");
  const [selectedProductId, setSelectedProductId] = useState(products[0].id);
  const [selectedSize, setSelectedSize] = useState(products[0].sizes[1]);
  const [selectedColor, setSelectedColor] = useState(products[0].colors[0].name);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [cart, setCart] = usePersistentState("mg69-cart", []);
  const [wishlist, setWishlist] = usePersistentState("mg69-wishlist", []);
  const [lastOrder, setLastOrder] = usePersistentState("mg69-last-order", null);
  const [appMode, setAppMode] = usePersistentState("mg69-app-mode", "customer");
  const [orderMessage, setOrderMessage] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [route, setRoute] = useState(window.location.hash.replace("#", "") || "home");

  const selectedProduct = catalog.find((product) => product.id === selectedProductId) || catalog[0] || products[0];
  const wishlistProducts = useMemo(
    () => catalog.filter((product) => wishlist.includes(product.id)),
    [catalog, wishlist]
  );

  const filteredProducts = useMemo(() => {
    return catalog.filter((product) => {
      const categoryMatch = activeCategory === "All" || product.category === activeCategory;
      const collectionMatch = activeCollection === "All" || product.collection === activeCollection;
      return categoryMatch && collectionMatch;
    });
  }, [activeCategory, activeCollection, catalog]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const inventoryCount = catalog.reduce((sum, product) => sum + product.stock, 0);

  useEffect(() => {
    const handleHash = () => setRoute(window.location.hash.replace("#", "") || "home");
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      if (!hasApi) return;

      try {
        const apiProducts = await fetchProducts();
        if (!isMounted || !apiProducts?.length) return;
        const normalizedProducts = apiProducts.map(normalizeProduct);
        setCatalog(normalizedProducts);
        setSelectedProductId(normalizedProducts[0].id);
        setCatalogStatus("database");
      } catch {
        if (isMounted) setCatalogStatus("local");
      }
    }

    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (route === "men") {
      setActiveCategory("Men");
      setActiveCollection("All");
    }

    if (route === "women") {
      setActiveCategory("Women");
      setActiveCollection("All");
    }

    if (route === "drop-001") {
      setActiveCategory("All");
      setActiveCollection("Drop 001");
    }

    if (route.startsWith("admin")) {
      setAppMode("admin");
    }
  }, [route]);

  useEffect(() => {
    setSelectedSize(selectedProduct.sizes[0]);
    setSelectedColor(selectedProduct.colors[0].name);
    setSelectedQuantity(1);
  }, [selectedProduct.id]);

  function selectProduct(product) {
    setSelectedProductId(product.id);
    window.location.hash = "product";
  }

  function addToCart() {
    const requestedQuantity = Math.min(selectedQuantity, selectedProduct.stock);

    setCart((current) => {
      const existing = current.find(
        (item) => item.productId === selectedProduct.id && item.size === selectedSize && item.color === selectedColor
      );

      if (existing) {
        return current.map((item) =>
          item.cartId === existing.cartId
            ? { ...item, quantity: Math.min(selectedProduct.stock, item.quantity + requestedQuantity) }
            : item
        );
      }

      return [
        ...current,
        {
          cartId: `${selectedProduct.id}-${selectedSize}-${selectedColor}-${Date.now()}`,
          productId: selectedProduct.id,
          name: selectedProduct.name,
          price: selectedProduct.price,
          size: selectedSize,
          color: selectedColor,
          quantity: requestedQuantity,
          stock: selectedProduct.stock,
          image: selectedProduct.image,
          imageClass: selectedProduct.imageClass
        }
      ];
    });
  }

  function updateQuantity(cartId, delta) {
    setCart((current) =>
      current
        .map((item) => {
          if (item.cartId !== cartId) return item;
          const stockLimit = item.stock || catalog.find((product) => product.id === item.productId)?.stock || 99;
          return { ...item, quantity: Math.min(stockLimit, item.quantity + delta) };
        })
        .filter((item) => item.quantity > 0)
    );
  }

  function toggleWishlist(productId) {
    setWishlist((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]
    );
  }

  async function handleCheckout(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const customerName = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const address = String(form.get("address") || "").trim();

    if (!emailPattern.test(email)) {
      setOrderMessage("Enter a valid email before saving the order draft.");
      return;
    }

    const order = {
      customerName,
      email,
      address,
      items: cart,
      total: subtotal,
      createdAt: new Date().toISOString(),
      orderNumber: `MG69-${Date.now().toString().slice(-6)}`,
      status: "pending-payment"
    };

    setLastOrder(order);
    setOrderMessage(`Order draft saved for ${order.customerName}.`);

    if (!hasApi) {
      setOrderMessage(`Order draft saved for ${order.customerName}. Connect VITE_API_URL to enable Stripe checkout.`);
      return;
    }

    try {
      await saveOrder(order);
      const session = await createCheckoutSession({ customerEmail: email, items: cart });

      if (session?.url) {
        window.location.href = session.url;
        return;
      }

      setOrderMessage(`Order saved for ${order.customerName}. Stripe session is pending configuration.`);
    } catch {
      setOrderMessage(`Order draft saved locally for ${order.customerName}. API checkout is not reachable yet.`);
    }
  }

  return (
    <div className="app" style={{ "--preview": `url(${previewImage})` }}>
      <LuxuryLoader />
      <div className="grain" aria-hidden="true" />
      <Header
        appMode={appMode}
        itemCount={itemCount}
        onMenu={() => setDrawerOpen(true)}
        onMode={setAppMode}
        route={route}
        wishlistCount={wishlist.length}
      />
      <AppDrawer
        appMode={appMode}
        catalogStatus={catalogStatus}
        inventoryCount={inventoryCount}
        itemCount={itemCount}
        onClose={() => setDrawerOpen(false)}
        onMode={setAppMode}
        open={drawerOpen}
        subtotal={subtotal}
        wishlistCount={wishlist.length}
      />

      <main>
        <Hero />
        <CategoryNavigator
          activeCategory={activeCategory}
          activeCollection={activeCollection}
          onCategory={setActiveCategory}
          onCollection={setActiveCollection}
        />
        <StorySections />
        <Shop
          products={filteredProducts}
          selectedProductId={selectedProduct.id}
          wishlist={wishlist}
          onSelect={selectProduct}
          onWishlist={toggleWishlist}
        />
        <ProductStudio
          product={selectedProduct}
          selectedSize={selectedSize}
          selectedColor={selectedColor}
          selectedQuantity={selectedQuantity}
          cart={cart}
          subtotal={subtotal}
          orderMessage={orderMessage}
          onSize={setSelectedSize}
          onColor={setSelectedColor}
          onPurchaseQuantity={setSelectedQuantity}
          onAdd={addToCart}
          onQuantity={updateQuantity}
          onCheckout={handleCheckout}
          wishlist={wishlist}
          onWishlist={toggleWishlist}
        />
        <WishlistPanel
          products={wishlistProducts}
          onSelect={selectProduct}
          onWishlist={toggleWishlist}
        />
        <OrderTracking cart={cart} order={lastOrder} />
        <AdminPanel
          cart={cart}
          catalogStatus={catalogStatus}
          inventoryCount={inventoryCount}
          lastOrder={lastOrder}
          products={catalog}
          subtotal={subtotal}
          wishlistCount={wishlist.length}
        />
      </main>

      <MobileNav itemCount={itemCount} onMenu={() => setDrawerOpen(true)} wishlistCount={wishlist.length} />
    </div>
  );
}

function LuxuryLoader() {
  return (
    <div className="luxury-loader" aria-hidden="true">
      <img alt="" src={brandLogo} />
      <span>MG69</span>
    </div>
  );
}

function Header({ appMode, itemCount, onMenu, onMode, route, wishlistCount }) {
  return (
    <header className="topbar">
      <button className="icon-button menu-button" onClick={onMenu} type="button" aria-label="Open menu">
        <Menu />
      </button>
      <a className="brand" href="#home">
        <img alt="" src={brandLogo} />
        <span>MG69</span>
      </a>
      <nav className="primary-nav" aria-label="Primary navigation">
        {customerLinks.slice(0, 7).map(([target, label]) => (
          <a className={route === target ? "active" : ""} href={`#${target}`} key={target}>
            {label}
          </a>
        ))}
      </nav>
      <div className="top-actions">
        <div className="mode-toggle" aria-label="Application mode">
          <button className={appMode === "customer" ? "active" : ""} onClick={() => onMode("customer")} type="button">
            Customer
          </button>
          <button className={appMode === "admin" ? "active" : ""} onClick={() => onMode("admin")} type="button">
            Admin
          </button>
        </div>
        <button className="icon-button" type="button" aria-label="Search collection">
          <Search />
        </button>
        <a className="bag-button wish-counter" href="#wishlist" aria-label="View wishlist">
          <Heart />
          <span>{wishlistCount}</span>
        </a>
        <a className="bag-button" href="#checkout" aria-label="View bag">
          <ShoppingBag />
          <span>{itemCount}</span>
        </a>
      </div>
    </header>
  );
}

function AppDrawer({
  appMode,
  catalogStatus,
  inventoryCount,
  itemCount,
  onClose,
  onMode,
  open,
  subtotal,
  wishlistCount
}) {
  const links = appMode === "admin" ? adminLinks : customerLinks;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="drawer-shell" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.button
            aria-label="Close navigation menu"
            className="drawer-backdrop"
            onClick={onClose}
            type="button"
          />
          <motion.aside
            className="app-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: "easeOut" }}
          >
            <div className="drawer-header">
              <a className="brand" href="#home" onClick={onClose}>
                <img alt="" src={brandLogo} />
                <span>MG69</span>
              </a>
              <button className="icon-button" onClick={onClose} type="button" aria-label="Close menu">
                <X />
              </button>
            </div>

            <div className="drawer-mode">
              <button className={appMode === "customer" ? "active" : ""} onClick={() => onMode("customer")} type="button">
                Customer
              </button>
              <button className={appMode === "admin" ? "active" : ""} onClick={() => onMode("admin")} type="button">
                Admin
              </button>
            </div>

            <nav className="drawer-nav" aria-label={`${appMode} navigation`}>
              {links.map(([target, label]) => (
                <a href={`#${target}`} key={target} onClick={onClose}>
                  <span>{label}</span>
                  <small>{target.replace("-", " / ")}</small>
                </a>
              ))}
            </nav>

            <div className="drawer-stats">
              <article>
                <span>Cart</span>
                <strong>{itemCount} items</strong>
              </article>
              <article>
                <span>Wishlist</span>
                <strong>{wishlistCount} saved</strong>
              </article>
              <article>
                <span>Inventory</span>
                <strong>{inventoryCount} units</strong>
              </article>
              <article>
                <span>Subtotal</span>
                <strong>{money(subtotal)}</strong>
              </article>
            </div>

            <p className="drawer-footnote">
              {catalogStatus === "database" ? "MongoDB catalog connected" : "Local fallback catalog / database ready"}
            </p>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Hero() {
  return (
    <section className="hero" id="home">
      <div className="hero-cream-field" aria-hidden="true" />
      <div className="hero-gold-beam" aria-hidden="true" />
      <motion.div
        className="hero-content hero-layout"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="hero-copy">
          <p className="eyebrow">Royal streetwear / Drop 001</p>
          <h1>
            <span>MG69</span>
            <span>Street Luxury Redefined</span>
          </h1>
          <p className="hero-line">Cream, black, and gold pieces built for uncommon presence.</p>
          <div className="hero-actions">
            <a className="primary-command hero-command" href="#shop">Shop Drop 001</a>
            <a className="secondary-command" href="#lookbook">View lookbook</a>
          </div>
          <div className="hero-stat-row" aria-label="MG69 brand pillars">
            <span>Metallic gold</span>
            <span>Matte black</span>
            <span>Royal street</span>
          </div>
        </div>
        <motion.div
          className="logo-stage"
          animate={{ y: [0, -10, 0], rotate: [0, 0.4, 0] }}
          transition={{ duration: 7.5, ease: "easeInOut", repeat: Infinity }}
        >
          <div className="logo-aura" aria-hidden="true" />
          <div className="particle-field" aria-hidden="true">
            {logoParticles.map((particle) => (
              <span
                key={`${particle.x}-${particle.y}`}
                style={{
                  "--particle-delay": particle.delay,
                  "--particle-size": particle.size,
                  "--particle-x": particle.x,
                  "--particle-y": particle.y
                }}
              />
            ))}
          </div>
          <img className="hero-logo" alt="MG69 Street Luxury Redefined gold crest logo" src={brandLogo} />
        </motion.div>
      </motion.div>
    </section>
  );
}

function CategoryNavigator({ activeCategory, activeCollection, onCategory, onCollection }) {
  return (
    <section className="commerce-router" aria-label="Shop navigation">
      <div className="router-block">
        <p className="eyebrow">Shop by category</p>
        <div className="segmented-control">
          {categories.map((category) => (
            <button
              className={activeCategory === category ? "active" : ""}
              key={category}
              onClick={() => onCategory(category)}
              type="button"
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      <div className="router-block">
        <p className="eyebrow">Collection filter</p>
        <div className="collection-tabs">
          {collections.map((collection) => (
            <button
              className={activeCollection === collection ? "active" : ""}
              key={collection}
              onClick={() => onCollection(collection)}
              type="button"
            >
              {collection}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function StorySections() {
  const lookbookVisuals = [
    { image: products[1].image, label: "Midnight volume" },
    { image: products[3].image, label: "Signal black" },
    { image: products[2].image, label: "Bone cream" }
  ];

  return (
    <>
      <section className="manifesto">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          Not for everyone
        </motion.p>
        <h2>Royal weight. Street discipline. No signal to noise.</h2>
        <div className="manifesto-grid">
          <span>Cream grounds</span>
          <span>Gold accents</span>
          <span>Black silhouettes</span>
        </div>
      </section>

      <section className="lookbook-section" id="lookbook">
        <div className="section-heading">
          <p className="eyebrow">Lookbook reels</p>
          <h2>Editorial shadows, leather texture, metallic light.</h2>
        </div>
        <div className="lookbook-grid">
          {lookbookVisuals.map(({ image, label }) => (
            <motion.article
              className="lookbook-card"
              initial={{ opacity: 0, y: 30 }}
              key={label}
              viewport={{ once: true, margin: "-80px" }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <img alt={`${label} MG69 lookbook`} src={image} loading="lazy" />
              <span>{label}</span>
            </motion.article>
          ))}
        </div>
      </section>
    </>
  );
}

function Shop({ products, selectedProductId, wishlist, onSelect, onWishlist }) {
  return (
    <section className="shop-section" id="shop">
      <div className="section-heading">
        <p className="eyebrow">Live catalog</p>
        <h2>Shop MG69</h2>
      </div>
      <div className="shop-toolbar">
        <span>{products.length} products</span>
        <span><SlidersHorizontal size={16} /> Filter-ready architecture</span>
      </div>
      <div className="product-list">
        <AnimatePresence mode="popLayout">
          {products.map((product) => (
            <ProductCard
              isSelected={selectedProductId === product.id}
              isWishlisted={wishlist.includes(product.id)}
              key={product.id}
              product={product}
              onSelect={() => onSelect(product)}
              onWishlist={() => onWishlist(product.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

function ProductCard({ product, isSelected, isWishlisted, onSelect, onWishlist }) {
  return (
    <motion.article
      className={`product-card ${isSelected ? "selected" : ""}`}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
    >
      <button className="product-thumb" onClick={onSelect} type="button">
        <img alt={`${product.name} front product shot`} src={product.image} loading="lazy" />
      </button>
      <button className={`wish-button ${isWishlisted ? "active" : ""}`} onClick={onWishlist} type="button">
        <Heart size={18} />
      </button>
      <div className="product-info" onClick={onSelect} role="button" tabIndex={0}>
        <div className="product-meta">
          <span>{product.category}</span>
          <span>{product.collection}</span>
          <span>{product.stock} in stock</span>
        </div>
        <h3>{product.name}</h3>
        <p>{product.tagline}</p>
        <strong>{money(product.price)}</strong>
      </div>
    </motion.article>
  );
}

function ProductStudio({
  product,
  selectedSize,
  selectedColor,
  selectedQuantity,
  cart,
  subtotal,
  orderMessage,
  onSize,
  onColor,
  onPurchaseQuantity,
  onAdd,
  onQuantity,
  onCheckout,
  wishlist,
  onWishlist
}) {
  const gallery = product.images?.length ? product.images : [{ label: "Front", src: product.image }];
  const [activeImage, setActiveImage] = useState(gallery[0].src);

  useEffect(() => {
    setActiveImage(gallery[0].src);
  }, [product.id]);

  return (
    <section className="product-studio" id="product">
      <div className="detail-panel">
        <div className="detail-image-wrap">
          <div className="detail-image">
            <img
              alt={`${product.name} ${gallery.find((image) => image.src === activeImage)?.label || "product"} view`}
              src={activeImage}
            />
          </div>
          <button
            className={`icon-button favorite-floating ${wishlist.includes(product.id) ? "active" : ""}`}
            onClick={() => onWishlist(product.id)}
            type="button"
          >
            <Heart />
          </button>
        </div>
        <div className="product-gallery" aria-label={`${product.name} gallery`}>
          {gallery.map((image) => (
            <button
              className={activeImage === image.src ? "active" : ""}
              key={image.src}
              onClick={() => setActiveImage(image.src)}
              type="button"
            >
              <img alt={`${product.name} ${image.label} thumbnail`} src={image.src} loading="lazy" />
              <span>{image.label}</span>
            </button>
          ))}
        </div>
        <div className="detail-body">
          <div className="detail-kicker">
            <span>{product.collection}</span>
            <strong>{money(product.price)}</strong>
          </div>
          <h2>{product.name}</h2>
          <p>{product.description}</p>

          <div className="spec-grid">
            {Object.entries(product.specs).map(([label, value]) => (
              <div className="spec-card" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>

          <VariantSelector
            colors={product.colors}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            selectedQuantity={selectedQuantity}
            stock={product.stock}
            sizes={product.sizes}
            onColor={onColor}
            onPurchaseQuantity={onPurchaseQuantity}
            onSize={onSize}
          />

          <button className="primary-command full" onClick={onAdd} type="button">
            Add {selectedQuantity} to cart
          </button>
        </div>
      </div>

      <CartPanel
        cart={cart}
        orderMessage={orderMessage}
        subtotal={subtotal}
        onCheckout={onCheckout}
        onQuantity={onQuantity}
      />
    </section>
  );
}

function VariantSelector({
  colors,
  selectedColor,
  selectedQuantity,
  selectedSize,
  sizes,
  stock,
  onColor,
  onPurchaseQuantity,
  onSize
}) {
  return (
    <div className="variant-stack">
      <div>
        <div className="field-heading">
          <span>Color</span>
          <strong>{selectedColor}</strong>
        </div>
        <div className="swatch-row">
          {colors.map((color) => (
            <button
              className={selectedColor === color.name ? "active" : ""}
              key={color.name}
              onClick={() => onColor(color.name)}
              style={{ "--swatch": color.hex }}
              type="button"
            >
              <span />
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="field-heading">
          <span>Size</span>
          <button type="button">Size guide</button>
        </div>
        <div className="size-options">
          {sizes.map((size) => (
            <button
              className={selectedSize === size ? "selected" : ""}
              key={size}
              onClick={() => onSize(size)}
              type="button"
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="purchase-controls">
        <div className="stock-strip">
          <span>{stock} pieces available</span>
          <strong>{selectedSize} / {selectedColor}</strong>
        </div>
        <div className="quantity-control" aria-label="Quantity selector">
          <button
            disabled={selectedQuantity <= 1}
            onClick={() => onPurchaseQuantity(Math.max(1, selectedQuantity - 1))}
            type="button"
          >
            <Minus size={14} />
          </button>
          <strong>{selectedQuantity}</strong>
          <button
            disabled={selectedQuantity >= stock}
            onClick={() => onPurchaseQuantity(Math.min(stock, selectedQuantity + 1))}
            type="button"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CartPanel({ cart, subtotal, orderMessage, onQuantity, onCheckout }) {
  return (
    <aside className="bag-panel" id="checkout">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Checkout flow</p>
          <h2>Bag</h2>
        </div>
        <span className="status-pill">Persistent cart</span>
      </div>

      {cart.length === 0 ? (
        <div className="bag-state">
          <ShoppingBag />
          <p>No pieces added</p>
          <span>Select size/color and add your first MG69 piece.</span>
        </div>
      ) : (
        <div className="bag-items">
          {cart.map((item) => (
            <article className="bag-line" key={item.cartId}>
              <div className={`bag-line-image ${item.image ? "" : `image-crop ${item.imageClass || ""}`}`}>
                {item.image && <img alt={`${item.name} cart preview`} src={item.image} loading="lazy" />}
              </div>
              <div>
                <h3>{item.name}</h3>
                <span>{item.color} / {item.size}</span>
              </div>
              <div className="quantity-stepper">
                <button onClick={() => onQuantity(item.cartId, -1)} type="button"><Minus size={14} /></button>
                <strong>{item.quantity}</strong>
                <button onClick={() => onQuantity(item.cartId, 1)} type="button"><Plus size={14} /></button>
              </div>
            </article>
          ))}
        </div>
      )}

      <form className="checkout-form" onSubmit={onCheckout}>
        <label>
          <span>Name</span>
          <input name="name" placeholder="Mohan Rajendran" required />
        </label>
        <label>
          <span>Email</span>
          <input
            autoComplete="email"
            inputMode="email"
            name="email"
            pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
            placeholder="you@example.com"
            required
            type="text"
          />
        </label>
        <label>
          <span>Shipping address</span>
          <textarea name="address" placeholder="Street, city, state, zip" required />
        </label>
        <div className="checkout-summary">
          <div>
            <span>Subtotal</span>
            <strong>{money(subtotal)}</strong>
          </div>
          <button className="primary-command compact" disabled={cart.length === 0} type="submit">
            Save order
          </button>
        </div>
      </form>

      {orderMessage && <p className="order-message">{orderMessage}</p>}
    </aside>
  );
}

function WishlistPanel({ products, onSelect, onWishlist }) {
  return (
    <section className="wishlist-section" id="wishlist">
      <div className="section-heading">
        <p className="eyebrow">Customer account</p>
        <h2>Wishlist</h2>
      </div>

      {products.length === 0 ? (
        <div className="empty-panel">
          <Heart />
          <h3>No saved pieces</h3>
          <p>Tap the heart on a product to build a saved MG69 wardrobe.</p>
        </div>
      ) : (
        <div className="wishlist-grid">
          {products.map((product) => (
            <motion.article
              className="wishlist-card"
              initial={{ opacity: 0, y: 18 }}
              key={product.id}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <button className="wishlist-image" onClick={() => onSelect(product)} type="button">
                <img alt={`${product.name} wishlist preview`} src={product.image} loading="lazy" />
              </button>
              <div>
                <span>{product.collection}</span>
                <h3>{product.name}</h3>
                <p>{product.tagline}</p>
                <strong>{money(product.price)}</strong>
              </div>
              <button className="icon-button" onClick={() => onWishlist(product.id)} type="button" aria-label="Remove from wishlist">
                <Heart />
              </button>
            </motion.article>
          ))}
        </div>
      )}
    </section>
  );
}

function OrderTracking({ cart, order }) {
  const timeline = [
    ["Order draft", order ? "complete" : "active"],
    ["Payment", order?.status === "paid" ? "complete" : "pending"],
    ["Packing", "pending"],
    ["Shipped", "pending"]
  ];
  const draftItems = order?.items?.length ? order.items : cart;
  const orderTotal = order?.total || cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "Not started";

  return (
    <section className="tracking-section" id="orders">
      <div className="section-heading">
        <p className="eyebrow">Customer service</p>
        <h2>Order tracking</h2>
      </div>

      <div className="tracking-layout">
        <div className="tracking-card">
          <div className="tracking-summary">
            <span>{order?.orderNumber || "MG69 draft order"}</span>
            <strong>{money(orderTotal)}</strong>
          </div>
          <h3>{order ? `Saved for ${order.customerName}` : "No order draft yet"}</h3>
          <p>{order ? `${draftItems.length} line items / ${orderDate}` : "Add products to the bag, then save checkout details to create an order timeline."}</p>
          <div className="tracking-items">
            {draftItems.length === 0 ? (
              <span>No items in tracking yet.</span>
            ) : (
              draftItems.slice(0, 3).map((item) => (
                <span key={item.cartId || item.productId}>{item.name} x {item.quantity}</span>
              ))
            )}
          </div>
        </div>

        <div className="timeline-panel" aria-label="Order timeline">
          {timeline.map(([label, status]) => (
            <div className={`timeline-step ${status}`} key={label}>
              <i />
              <span>{label}</span>
              <strong>{status}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AdminPanel({ cart, catalogStatus, inventoryCount, lastOrder, products, subtotal, wishlistCount }) {
  const modules = [
    {
      id: "admin-dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      value: money(subtotal),
      body: "Live cart subtotal, catalog status, and launch KPIs."
    },
    {
      id: "admin-products",
      icon: Package,
      label: "Products",
      value: `${products.length} SKUs`,
      body: "Product records include category, collection, variants, stock, and imagery."
    },
    {
      id: "admin-inventory",
      icon: Boxes,
      label: "Inventory",
      value: `${inventoryCount} units`,
      body: "Stock counts are ready to sync with MongoDB or Firebase admin flows."
    },
    {
      id: "admin-orders",
      icon: ClipboardList,
      label: "Orders",
      value: lastOrder ? "1 draft" : "0 drafts",
      body: "Checkout saves an order draft locally and can post to the API when configured."
    },
    {
      id: "admin-customers",
      icon: Users,
      label: "Customers",
      value: `${wishlistCount} saved`,
      body: "Wishlist and customer records are ready for Firebase Auth profiles."
    },
    {
      id: "admin-discounts",
      icon: Tags,
      label: "Discounts",
      value: "Drop codes",
      body: "Campaign structure for launch offers, creator codes, and limited drops."
    },
    {
      id: "admin-analytics",
      icon: BarChart3,
      label: "Analytics",
      value: `${cart.length} bag lines`,
      body: "Prepared for revenue, conversion, product demand, and customer insight cards."
    },
    {
      id: "admin-shipping",
      icon: Truck,
      label: "Shipping",
      value: "Zone ready",
      body: "Shipping settings can map to Stripe, Shippo, or a custom fulfillment table."
    },
    {
      id: "admin-settings",
      icon: Settings,
      label: "Settings",
      value: catalogStatus === "database" ? "DB live" : "Local mode",
      body: "Environment-ready controls for API URL, payments, auth, and catalog source."
    }
  ];

  return (
    <section className="admin-section" id="admin">
      <div className="section-heading">
        <p className="eyebrow">Admin interface</p>
        <h2>Command dashboard</h2>
        <span className="data-source-pill">{catalogStatus === "database" ? "MongoDB live" : "Local fallback"}</span>
      </div>
      <div className="admin-grid">
        {modules.map(({ body, icon: Icon, id, label, value }) => (
          <article id={id} key={id}>
            <Icon />
            <span>{label}</span>
            <h3>{value}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function MobileNav({ itemCount, onMenu, wishlistCount }) {
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <button onClick={onMenu} type="button"><Menu size={18} />Menu</button>
      <a href="#shop"><Search size={18} />Shop</a>
      <a href="#wishlist"><Heart size={18} />Wish {wishlistCount}</a>
      <a href="#checkout"><ShoppingBag size={18} />Bag {itemCount}</a>
      <a href="#admin"><User size={18} />Admin</a>
    </nav>
  );
}

export default App;
