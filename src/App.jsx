import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  ClipboardList,
  Heart,
  Home,
  LayoutDashboard,
  Menu,
  Minus,
  Package,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Tags,
  Truck,
  User,
  Users,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { categories, collections, products } from "./data/products.js";
import { createCheckoutSession, fetchProducts, hasApi, saveOrder } from "./lib/api.js";
import { readStoredValue, writeStoredValue } from "./lib/storage.js";

const money = (value) => `$${value.toFixed(2)}`;
const previewImage = `${import.meta.env.BASE_URL}og-preview.png`;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fallbackImage = products[0].image;

const customerMenuItems = [
  { label: "Home", href: "#home", icon: Home, note: "Main MG69 landing page" },
  { label: "Shop", href: "#shop", icon: Search, note: "Browse all drops" },
  { label: "Men", href: "#men", icon: User, note: "Men street luxury" },
  { label: "Women", href: "#women", icon: Sparkles, note: "Women street luxury" },
  { label: "Drop 001", href: "#drop-001", icon: Package, note: "Latest collection" },
  { label: "Wishlist", href: "#shop", icon: Heart, note: "Saved favorites" },
  { label: "Track Order", href: "#checkout", icon: Truck, note: "Shipping and order status" },
  { label: "Checkout", href: "#checkout", icon: ShoppingBag, note: "Cart and payment" }
];

const adminMenuItems = [
  { label: "Dashboard", href: "#admin", icon: LayoutDashboard, note: "Business overview" },
  { label: "Products", href: "#admin", icon: Package, note: "Add and edit products" },
  { label: "Inventory", href: "#admin", icon: ClipboardList, note: "Sizes, colors, stock" },
  { label: "Orders", href: "#checkout", icon: ShoppingBag, note: "Order management" },
  { label: "Customers", href: "#admin", icon: Users, note: "Customer profiles" },
  { label: "Discounts", href: "#admin", icon: Tags, note: "Coupons and campaigns" },
  { label: "Analytics", href: "#admin", icon: BarChart3, note: "Sales and traffic" },
  { label: "Settings", href: "#admin", icon: Settings, note: "Store configuration" }
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
  const [orderMessage, setOrderMessage] = useState("");
  const [route, setRoute] = useState(window.location.hash.replace("#", "") || "home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuMode, setMenuMode] = useState("customer");

  const selectedProduct = catalog.find((product) => product.id === selectedProductId) || catalog[0] || products[0];

  const filteredProducts = useMemo(() => {
    return catalog.filter((product) => {
      const categoryMatch = activeCategory === "All" || product.category === activeCategory;
      const collectionMatch = activeCollection === "All" || product.collection === activeCollection;
      return categoryMatch && collectionMatch;
    });
  }, [activeCategory, activeCollection, catalog]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleHash = () => setRoute(window.location.hash.replace("#", "") || "home");
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", isMenuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [isMenuOpen]);

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
      window.location.hash = "shop";
    }

    if (route === "women") {
      setActiveCategory("Women");
      setActiveCollection("All");
      window.location.hash = "shop";
    }

    if (route === "drop-001") {
      setActiveCategory("All");
      setActiveCollection("Drop 001");
      window.location.hash = "shop";
    }
  }, [route]);

  useEffect(() => {
    setSelectedSize(selectedProduct.sizes[0]);
    setSelectedColor(selectedProduct.colors[0].name);
    setSelectedQuantity(1);
  }, [selectedProduct.id]);

  function openMenu(mode = "customer") {
    setMenuMode(mode);
    setIsMenuOpen(true);
  }

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
      status: "pending-payment"
    };

    writeStoredValue("mg69-last-order", order);
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
      <div className="grain" aria-hidden="true" />
      <Header itemCount={itemCount} route={route} onOpenMenu={openMenu} />
      <HamburgerDrawer
        cartCount={itemCount}
        isOpen={isMenuOpen}
        mode={menuMode}
        onClose={() => setIsMenuOpen(false)}
        onMode={setMenuMode}
        productCount={catalog.length}
        wishlistCount={wishlist.length}
      />

      <main>
        <Hero onOpenMenu={openMenu} />
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
        <AdminPanel catalogStatus={catalogStatus} products={catalog} />
      </main>

      <MobileNav itemCount={itemCount} onOpenMenu={openMenu} />
    </div>
  );
}

function Header({ itemCount, route, onOpenMenu }) {
  const links = [
    ["home", "Home"],
    ["shop", "Shop"],
    ["men", "Men"],
    ["women", "Women"],
    ["drop-001", "Drop 001"],
    ["lookbook", "Lookbook"],
    ["checkout", "Checkout"]
  ];

  return (
    <header className="topbar">
      <button className="icon-button menu-button" onClick={() => onOpenMenu("customer")} type="button" aria-label="Open menu">
        <Menu />
      </button>
      <a className="brand" href="#home">MG69</a>
      <nav className="primary-nav" aria-label="Primary navigation">
        {links.map(([target, label]) => (
          <a className={route === target ? "active" : ""} href={`#${target}`} key={target}>
            {label}
          </a>
        ))}
      </nav>
      <div className="top-actions">
        <button className="icon-button" onClick={() => onOpenMenu("customer")} type="button" aria-label="Search collection">
          <Search />
        </button>
        <button className="icon-button admin-trigger" onClick={() => onOpenMenu("admin")} type="button" aria-label="Open admin menu">
          <ShieldCheck />
        </button>
        <a className="bag-button" href="#checkout" aria-label="View bag">
          <ShoppingBag />
          <span>{itemCount}</span>
        </a>
      </div>
    </header>
  );
}

function HamburgerDrawer({ cartCount, isOpen, mode, onClose, onMode, productCount, wishlistCount }) {
  const menuItems = mode === "admin" ? adminMenuItems : customerMenuItems;
  const stats = mode === "admin"
    ? [
        ["Products", productCount],
        ["Orders", cartCount],
        ["Mode", "Admin"]
      ]
    : [
        ["Cart", cartCount],
        ["Wishlist", wishlistCount],
        ["Mode", "Customer"]
      ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="drawer-shell" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button className="drawer-backdrop" onClick={onClose} type="button" aria-label="Close menu" />
          <motion.aside
            className="hamburger-drawer"
            initial={{ x: "-105%" }}
            animate={{ x: 0 }}
            exit={{ x: "-105%" }}
            transition={{ duration: 0.34, ease: "easeOut" }}
            aria-label="MG69 navigation drawer"
          >
            <div className="drawer-top">
              <div>
                <p className="eyebrow">MG69 Interface</p>
                <h2>{mode === "admin" ? "Admin Control" : "Customer Menu"}</h2>
              </div>
              <button className="icon-button" onClick={onClose} type="button" aria-label="Close menu">
                <X />
              </button>
            </div>

            <div className="interface-switch" role="tablist" aria-label="Interface selector">
              <button className={mode === "customer" ? "active" : ""} onClick={() => onMode("customer")} type="button">
                Customer
              </button>
              <button className={mode === "admin" ? "active" : ""} onClick={() => onMode("admin")} type="button">
                Admin
              </button>
            </div>

            <div className="drawer-stats">
              {stats.map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>

            <nav className="drawer-nav" aria-label={`${mode} menu`}>
              {menuItems.map(({ href, icon: Icon, label, note }) => (
                <a href={href} key={label} onClick={onClose}>
                  <Icon size={20} />
                  <span>
                    <strong>{label}</strong>
                    <small>{note}</small>
                  </span>
                </a>
              ))}
            </nav>

            <div className="drawer-action-card">
              <p className="eyebrow">Next setup</p>
              <h3>{mode === "admin" ? "Connect database + admin login" : "Enable login + order tracking"}</h3>
              <p>
                {mode === "admin"
                  ? "Ready for product upload, stock control, discounts, analytics, and order management."
                  : "Ready for customer profile, saved cart, wishlist, tracking, and checkout experience."}
              </p>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Hero({ onOpenMenu }) {
  return (
    <section className="hero" id="home">
      <div className="hero-bg image-crop crop-cover" aria-hidden="true" />
      <div className="hero-glass" aria-hidden="true" />
      <motion.div
        className="hero-content"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <p className="eyebrow">Drop 001 / Street luxury</p>
        <h1>
          <span>MG69</span>
          <span>Street</span>
          <span>Luxury</span>
          <span>Redefined</span>
        </h1>
        <div className="hero-actions">
          <a className="primary-command hero-command" href="#shop">Shop Drop 001</a>
          <button className="secondary-command" onClick={() => onOpenMenu("customer")} type="button">Open Menu</button>
        </div>
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
            <button className={activeCategory === category ? "active" : ""} key={category} onClick={() => onCategory(category)} type="button">
              {category}
            </button>
          ))}
        </div>
      </div>
      <div className="router-block">
        <p className="eyebrow">Collection filter</p>
        <div className="collection-tabs">
          {collections.map((collection) => (
            <button className={activeCollection === collection ? "active" : ""} key={collection} onClick={() => onCollection(collection)} type="button">
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
        <h2>Built for the uncommon. No signal to noise.</h2>
        <div className="manifesto-grid">
          <span>Matte black</span>
          <span>Heavy fabric</span>
          <span>Future uniform</span>
        </div>
      </section>

      <section className="lookbook-section" id="lookbook">
        <div className="section-heading">
          <p className="eyebrow">Lookbook reels</p>
          <h2>Editorial shadows, concrete texture, silver light.</h2>
        </div>
        <div className="lookbook-grid">
          {lookbookVisuals.map(({ image, label }) => (
            <motion.article className="lookbook-card" initial={{ opacity: 0, y: 30 }} key={label} viewport={{ once: true, margin: "-80px" }} whileInView={{ opacity: 1, y: 0 }}>
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
    <motion.article className={`product-card ${isSelected ? "selected" : ""}`} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}>
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
            <img alt={`${product.name} ${gallery.find((image) => image.src === activeImage)?.label || "product"} view`} src={activeImage} />
          </div>
          <button className={`icon-button favorite-floating ${wishlist.includes(product.id) ? "active" : ""}`} onClick={() => onWishlist(product.id)} type="button">
            <Heart />
          </button>
        </div>
        <div className="product-gallery" aria-label={`${product.name} gallery`}>
          {gallery.map((image) => (
            <button className={activeImage === image.src ? "active" : ""} key={image.src} onClick={() => setActiveImage(image.src)} type="button">
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

      <CartPanel cart={cart} orderMessage={orderMessage} subtotal={subtotal} onCheckout={onCheckout} onQuantity={onQuantity} />
    </section>
  );
}

function VariantSelector({ colors, selectedColor, selectedQuantity, selectedSize, sizes, stock, onColor, onPurchaseQuantity, onSize }) {
  return (
    <div className="variant-stack">
      <div>
        <div className="field-heading">
          <span>Color</span>
          <strong>{selectedColor}</strong>
        </div>
        <div className="swatch-row">
          {colors.map((color) => (
            <button className={selectedColor === color.name ? "active" : ""} key={color.name} onClick={() => onColor(color.name)} style={{ "--swatch": color.hex }} type="button">
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
            <button className={selectedSize === size ? "selected" : ""} key={size} onClick={() => onSize(size)} type="button">
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
          <button disabled={selectedQuantity <= 1} onClick={() => onPurchaseQuantity(Math.max(1, selectedQuantity - 1))} type="button"><Minus size={14} /></button>
          <strong>{selectedQuantity}</strong>
          <button disabled={selectedQuantity >= stock} onClick={() => onPurchaseQuantity(Math.min(stock, selectedQuantity + 1))} type="button"><Plus size={14} /></button>
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
        <label><span>Name</span><input name="name" placeholder="Mohan Rajendran" required /></label>
        <label><span>Email</span><input autoComplete="email" inputMode="email" name="email" pattern="[^\s@]+@[^\s@]+\.[^\s@]+" placeholder="you@example.com" required type="text" /></label>
        <label><span>Shipping address</span><textarea name="address" placeholder="Street, city, state, zip" required /></label>
        <div className="checkout-summary">
          <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
          <button className="primary-command compact" disabled={cart.length === 0} type="submit">Save order</button>
        </div>
      </form>

      {orderMessage && <p className="order-message">{orderMessage}</p>}
    </aside>
  );
}

function AdminPanel({ catalogStatus, products }) {
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const averagePrice = products.length ? products.reduce((sum, product) => sum + product.price, 0) / products.length : 0;
  const adminCards = [
    ["Products", `${products.length} active styles`, "Add, edit, hide, and publish MG69 products."],
    ["Inventory", `${totalStock} units`, "Manage size/color stock and low inventory alerts."],
    ["Pricing", `${money(averagePrice)} avg`, "Control prices, discounts, coupons, and drops."],
    ["Orders", "Checkout-ready", "Review saved orders and connect Stripe payments."],
    ["Customers", "Profiles-ready", "Prepare login, wishlist, addresses, and customer history."],
    ["Analytics", "Dashboard-ready", "Track revenue, conversion, traffic, and popular sizes."],
    ["Shipping", "Fulfillment-ready", "Set delivery zones, order tracking, and return rules."],
    ["Settings", catalogStatus === "database" ? "MongoDB live" : "Local fallback", "Connect API, database, payment, and admin login."]
  ];

  return (
    <section className="admin-section" id="admin">
      <div className="section-heading">
        <p className="eyebrow">Admin interface</p>
        <h2>Store control</h2>
        <span className="data-source-pill">{catalogStatus === "database" ? "MongoDB live" : "Local fallback"}</span>
      </div>
      <div className="admin-grid">
        {adminCards.map(([title, stat, text]) => (
          <article key={title}>
            <span>{stat}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function MobileNav({ itemCount, onOpenMenu }) {
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <button onClick={() => onOpenMenu("customer")} type="button"><Menu size={18} />Menu</button>
      <a href="#shop"><Search size={18} />Shop</a>
      <a href="#checkout"><ShoppingBag size={18} />Bag {itemCount}</a>
      <button onClick={() => onOpenMenu("admin")} type="button"><ShieldCheck size={18} />Admin</button>
    </nav>
  );
}

export default App;
