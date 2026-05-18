import { AnimatePresence, motion } from "framer-motion";
import {
  Heart,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  User
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { categories, collections, products } from "./data/products.js";
import { readStoredValue, writeStoredValue } from "./lib/storage.js";

const money = (value) => `$${value.toFixed(2)}`;
const previewImage = `${import.meta.env.BASE_URL}og-preview.png`;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function usePersistentState(key, fallback) {
  const [value, setValue] = useState(() => readStoredValue(key, fallback));

  useEffect(() => {
    writeStoredValue(key, value);
  }, [key, value]);

  return [value, setValue];
}

function App() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeCollection, setActiveCollection] = useState("All");
  const [selectedProductId, setSelectedProductId] = useState(products[0].id);
  const [selectedSize, setSelectedSize] = useState(products[0].sizes[1]);
  const [selectedColor, setSelectedColor] = useState(products[0].colors[0].name);
  const [cart, setCart] = usePersistentState("mg69-cart", []);
  const [wishlist, setWishlist] = usePersistentState("mg69-wishlist", []);
  const [orderMessage, setOrderMessage] = useState("");
  const [route, setRoute] = useState(window.location.hash.replace("#", "") || "home");

  const selectedProduct = products.find((product) => product.id === selectedProductId) || products[0];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch = activeCategory === "All" || product.category === activeCategory;
      const collectionMatch = activeCollection === "All" || product.collection === activeCollection;
      return categoryMatch && collectionMatch;
    });
  }, [activeCategory, activeCollection]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleHash = () => setRoute(window.location.hash.replace("#", "") || "home");
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  useEffect(() => {
    setSelectedSize(selectedProduct.sizes[0]);
    setSelectedColor(selectedProduct.colors[0].name);
  }, [selectedProduct.id]);

  function selectProduct(product) {
    setSelectedProductId(product.id);
    window.location.hash = "product";
  }

  function addToCart() {
    setCart((current) => {
      const existing = current.find(
        (item) => item.productId === selectedProduct.id && item.size === selectedSize && item.color === selectedColor
      );

      if (existing) {
        return current.map((item) =>
          item.cartId === existing.cartId ? { ...item, quantity: item.quantity + 1 } : item
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
          quantity: 1,
          imageClass: selectedProduct.imageClass
        }
      ];
    });
  }

  function updateQuantity(cartId, delta) {
    setCart((current) =>
      current
        .map((item) => (item.cartId === cartId ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  }

  function toggleWishlist(productId) {
    setWishlist((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]
    );
  }

  function handleCheckout(event) {
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
    setOrderMessage(`Order draft saved for ${order.customerName}. Stripe checkout is ready to connect.`);
  }

  return (
    <div className="app" style={{ "--preview": `url(${previewImage})` }}>
      <div className="grain" aria-hidden="true" />
      <Header itemCount={itemCount} route={route} />

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
          cart={cart}
          subtotal={subtotal}
          orderMessage={orderMessage}
          onSize={setSelectedSize}
          onColor={setSelectedColor}
          onAdd={addToCart}
          onQuantity={updateQuantity}
          onCheckout={handleCheckout}
          wishlist={wishlist}
          onWishlist={toggleWishlist}
        />
        <AdminPanel />
      </main>

      <MobileNav itemCount={itemCount} />
    </div>
  );
}

function Header({ itemCount, route }) {
  const links = [
    ["home", "Home"],
    ["shop", "Shop"],
    ["lookbook", "Lookbook"],
    ["checkout", "Checkout"]
  ];

  return (
    <header className="topbar">
      <button className="icon-button menu-button" type="button" aria-label="Open menu">
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
        <button className="icon-button" type="button" aria-label="Search collection">
          <Search />
        </button>
        <a className="bag-button" href="#checkout" aria-label="View bag">
          <ShoppingBag />
          <span>{itemCount}</span>
        </a>
      </div>
    </header>
  );
}

function Hero() {
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
        <a className="primary-command hero-command" href="#shop">Shop Drop 001</a>
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
          {[
            ["crop-hoodie", "Midnight volume"],
            ["crop-cover", "Signal black"],
            ["crop-fabric", "Chrome silence"]
          ].map(([imageClass, label]) => (
            <motion.article
              className="lookbook-card"
              initial={{ opacity: 0, y: 30 }}
              key={label}
              viewport={{ once: true, margin: "-80px" }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className={`image-crop ${imageClass}`} />
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
      <button className={`product-thumb image-crop ${product.imageClass}`} onClick={onSelect} type="button" />
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
  cart,
  subtotal,
  orderMessage,
  onSize,
  onColor,
  onAdd,
  onQuantity,
  onCheckout,
  wishlist,
  onWishlist
}) {
  return (
    <section className="product-studio" id="product">
      <div className="detail-panel">
        <div className="detail-image-wrap">
          <div className={`image-crop detail-image ${product.imageClass}`} />
          <button
            className={`icon-button favorite-floating ${wishlist.includes(product.id) ? "active" : ""}`}
            onClick={() => onWishlist(product.id)}
            type="button"
          >
            <Heart />
          </button>
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
            sizes={product.sizes}
            onColor={onColor}
            onSize={onSize}
          />

          <button className="primary-command full" onClick={onAdd} type="button">Add to cart</button>
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

function VariantSelector({ colors, selectedColor, selectedSize, sizes, onColor, onSize }) {
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
              <div className={`bag-line-image image-crop ${item.imageClass}`} />
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

function AdminPanel() {
  return (
    <section className="admin-section" id="admin">
      <div className="section-heading">
        <p className="eyebrow">Admin-ready</p>
        <h2>Inventory structure</h2>
      </div>
      <div className="admin-grid">
        {products.map((product) => (
          <article key={product.id}>
            <span>{product.category}</span>
            <h3>{product.name}</h3>
            <p>{product.collection} / {product.stock} units / {money(product.price)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function MobileNav({ itemCount }) {
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <a href="#shop"><Search size={18} />Shop</a>
      <a href="#lookbook"><Sparkles size={18} />Lookbook</a>
      <a href="#checkout"><ShoppingBag size={18} />Bag {itemCount}</a>
      <a href="#admin"><User size={18} />Admin</a>
    </nav>
  );
}

export default App;
