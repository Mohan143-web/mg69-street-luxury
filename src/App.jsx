import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Boxes,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Edit3,
  Heart,
  LayoutDashboard,
  LogOut,
  Maximize2,
  Menu,
  Minus,
  Package,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Tags,
  Trash2,
  Truck,
  Upload,
  Users,
  X,
  User
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createCheckoutSession } from "./api/checkout.js";
import MensCollectionLanding from "./components/MensCollectionLanding.jsx";
import WomensCollectionLanding from "./components/WomensCollectionLanding.jsx";
import { categories, collections, products, utilityCampaignImages } from "./data/products.js";
import {
  createProduct,
  deleteProduct,
  fetchMe,
  fetchOrders,
  fetchProducts,
  getToken,
  hasApi,
  loginUser,
  registerUser,
  setToken,
  updateProduct
} from "./lib/api.js";
import { readStoredValue, writeStoredValue } from "./lib/storage.js";
import OrderConfirmed from "./pages/OrderConfirmed.jsx";

const money = (value) => `$${value.toFixed(2)}`;
const previewImage = `${import.meta.env.BASE_URL}og-preview.png`;
const brandLogo = `${import.meta.env.BASE_URL}brand/mg69-logo3.png`;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fallbackImage = products[0].image;
const BASE_URL = import.meta.env.BASE_URL;

// API-served products use root-relative asset paths (e.g. "/products/x.png").
// On GitHub Pages the app is served under a sub-path, so prefix BASE_URL.
function withBase(src) {
  if (typeof src !== "string" || !src) return src;
  if (/^(https?:|data:|blob:)/.test(src)) return src;
  if (src.startsWith(BASE_URL)) return src;
  return `${BASE_URL}${src.replace(/^\//, "")}`;
}

function withBaseSrcSet(srcSet) {
  if (typeof srcSet !== "string" || !srcSet) return srcSet;
  return srcSet
    .split(",")
    .map((part) => {
      const [url, descriptor] = part.trim().split(/\s+/);
      return descriptor ? `${withBase(url)} ${descriptor}` : withBase(url);
    })
    .join(", ");
}

function normalizeImage(image) {
  if (!image) return image;
  if (typeof image === "string") return withBase(image);
  return { ...image, src: withBase(image.src), srcSet: withBaseSrcSet(image.srcSet) };
}
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
const revealParticles = [
  { x: "12%", y: "22%", size: "3px", delay: "0.1s" },
  { x: "22%", y: "70%", size: "5px", delay: "0.7s" },
  { x: "35%", y: "18%", size: "2px", delay: "1.2s" },
  { x: "52%", y: "80%", size: "4px", delay: "0.4s" },
  { x: "70%", y: "24%", size: "3px", delay: "0.9s" },
  { x: "84%", y: "62%", size: "5px", delay: "1.5s" },
  { x: "92%", y: "34%", size: "2px", delay: "0.2s" }
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
const campaigns = [
  {
    image: `${import.meta.env.BASE_URL}images/products/utility-set/stone-grey/model-front.webp`,
    title: "STONE GREY",
    subtitle: "The anchor colorway. Clean, quiet, authoritative.",
    width: 800,
    height: 1000
  },
  {
    image: `${import.meta.env.BASE_URL}images/products/utility-set/matte-black/model-front.webp`,
    title: "MATTE BLACK",
    subtitle: "Zero compromise. Built for the bold.",
    width: 800,
    height: 1000
  },
  {
    image: `${import.meta.env.BASE_URL}images/products/utility-set/dark-olive/model-front.webp`,
    title: "DARK OLIVE",
    subtitle: "Military utility meets luxury streetwear.",
    width: 800,
    height: 1000
  }
];
const campaignHighlights = [
  ["New Arrivals", "Designed for the Bold"],
  ["Luxury Collection", "Luxury in Every Detail"],
  ["Featured Products", "Streetwear Elevated"],
  ["About MG69", "Where Confidence Meets Style"],
  ["Newsletter Signup", "MG69 Beyond Fashion"]
];

function buildSizeStock(sizes, stock, existingSizeStock) {
  if (existingSizeStock && Object.keys(existingSizeStock).length) return existingSizeStock;

  const base = Math.floor(stock / Math.max(sizes.length, 1));
  const remainder = stock % Math.max(sizes.length, 1);

  return sizes.reduce((map, size, index) => {
    map[size] = base + (index < remainder ? 1 : 0);
    return map;
  }, {});
}

function getSizeStock(product, size) {
  return Math.max(0, Number(product.sizeStock?.[size] ?? product.stock ?? 0));
}

function getStockLabel(count) {
  if (count <= 0) return "Sold out";
  if (count <= 2) return `Only ${count} left`;
  return `${count} left`;
}

function getImageSrc(image = "") {
  return typeof image === "string" ? image : image.src;
}

function getImageSize(image = "") {
  const src = getImageSrc(image) || "";
  if (typeof image === "object" && image.width && image.height) {
    return { width: image.width, height: image.height };
  }
  if (src.includes("utility-")) return { width: 1536, height: 1024 };
  return src.includes("first-piece") ? { width: 1086, height: 1448 } : { width: 627, height: 627 };
}

function ProductImage({ image, alt, className = "", fetchPriority, loading = "lazy", sizes }) {
  const imageData = typeof image === "string" ? { src: image } : image;
  const dimensions = getImageSize(imageData);

  return (
    <img
      alt={alt}
      className={`${className} ${imageData.cropClass || ""}`.trim()}
      fetchpriority={fetchPriority}
      height={dimensions.height}
      loading={loading}
      sizes={sizes || imageData.sizes}
      src={imageData.src}
      srcSet={imageData.srcSet}
      width={dimensions.width}
    />
  );
}

function normalizeColorVariant(variant) {
  if (!variant) return variant;
  return {
    ...variant,
    images: variant.images
      ? Object.fromEntries(Object.entries(variant.images).map(([key, image]) => [key, normalizeImage(image)]))
      : variant.images,
    gallery: variant.gallery?.map(normalizeImage)
  };
}

function normalizeProduct(product) {
  const image = withBase(product.image || product.imageUrl || product.images?.[0]?.src || fallbackImage);
  const sizes = product.sizes?.length ? product.sizes : ["S", "M", "L"];
  const stock = product.stock || 0;

  return {
    ...product,
    id: String(product.id || product._id || ""),
    colors: (product.colors?.length ? product.colors : [{ name: "Matte Black", hex: "#080807" }]).map((color) =>
      typeof color === "string" ? { name: color, hex: "#080807" } : color
    ),
    image,
    images: (product.images?.length ? product.images : [{ label: "Front", src: image }]).map(normalizeImage),
    colorVariants: product.colorVariants?.map(normalizeColorVariant),
    sizes,
    sizeStock: buildSizeStock(sizes, stock, product.sizeStock),
    specs: product.specs || { Fit: product.type || "Ready to wear", Stock: `${product.stock || 0} units` },
    stock,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(products[0].id);
  const [selectedSize, setSelectedSize] = useState(products[0].sizes[1]);
  const [selectedColor, setSelectedColor] = useState(products[0].colors[0].name);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [cart, setCart] = usePersistentState("mg69-cart", []);
  const [wishlist, setWishlist] = usePersistentState("mg69-wishlist", []);
  const [lastOrder, setLastOrder] = usePersistentState("mg69-last-order", null);
  const [appMode, setAppMode] = usePersistentState("mg69-app-mode", "customer");
  const [recentlyViewed, setRecentlyViewed] = usePersistentState("mg69-recently-viewed", []);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [auth, setAuth] = usePersistentState("mg69-auth", { user: null });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [orders, setOrders] = useState([]);
  const [route, setRoute] = useState(window.location.hash.replace("#", "") || "home");
  const routePath = route.replace(/^\//, "").split("?")[0] || "home";
  const currentUser = auth?.user || null;
  const isAdmin = currentUser?.role === "admin";
  const adminUnlocked = isAdmin;
  const visibleAppMode = adminUnlocked && appMode === "admin" ? "admin" : "customer";

  const selectedProduct = catalog.find((product) => product.id === selectedProductId) || catalog[0] || products[0];
  const selectedSizeStock = getSizeStock(selectedProduct, selectedSize);
  const wishlistProducts = useMemo(
    () => catalog.filter((product) => wishlist.includes(product.id)),
    [catalog, wishlist]
  );
  const relatedProducts = useMemo(() => {
    const explicitRelated = selectedProduct.relatedIds?.length
      ? selectedProduct.relatedIds
          .map((id) => catalog.find((product) => product.id === id))
          .filter(Boolean)
      : [];
    const collectionRelated = catalog.filter(
      (product) =>
        product.id !== selectedProduct.id &&
        (product.collection === selectedProduct.collection || product.category === selectedProduct.category)
    );

    return [...explicitRelated, ...collectionRelated]
      .filter((product, index, array) => array.findIndex((item) => item.id === product.id) === index)
      .slice(0, 4);
  }, [catalog, selectedProduct]);
  const recentlyViewedProducts = useMemo(
    () =>
      recentlyViewed
        .filter((id) => id !== selectedProduct.id)
        .map((id) => catalog.find((product) => product.id === id))
        .filter(Boolean)
        .slice(0, 4),
    [catalog, recentlyViewed, selectedProduct.id]
  );

  const filteredProducts = useMemo(() => {
    return catalog.filter((product) => {
      const categoryMatch = activeCategory === "All" || product.category === activeCategory;
      const collectionMatch = activeCollection === "All" || product.collection === activeCollection;
      const query = searchQuery.trim().toLowerCase();
      const searchable = [
        product.name,
        product.collection,
        product.category,
        product.type,
        product.tagline,
        product.description,
        ...(product.tags || [])
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const searchMatch = !query || searchable.includes(query);
      return categoryMatch && collectionMatch && searchMatch;
    });
  }, [activeCategory, activeCollection, catalog, searchQuery]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const inventoryCount = catalog.reduce((sum, product) => sum + product.stock, 0);
  const isOrderConfirmed = routePath === "order-confirmed";

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

  // Validate a stored session on load; drop it if the token is rejected/expired.
  useEffect(() => {
    if (!hasApi || !getToken()) return;

    fetchMe()
      .then((data) => {
        if (data?.user) setAuth({ user: data.user });
      })
      .catch(() => {
        setToken(null);
        setAuth({ user: null });
      });
  }, [setAuth]);

  // Load real orders for authenticated admins.
  useEffect(() => {
    if (!hasApi || !isAdmin) {
      setOrders([]);
      return;
    }

    fetchOrders()
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]));
  }, [isAdmin]);

  useEffect(() => {
    if (!adminUnlocked && appMode === "admin") {
      setAppMode("customer");
    }
  }, [adminUnlocked, appMode, setAppMode]);

  useEffect(() => {
    if (customerLinks.some(([target]) => target === routePath)) {
      setAppMode("customer");
    }

    if (routePath === "men") {
      setActiveCategory("Men");
      setActiveCollection("All");
      window.requestAnimationFrame(() => {
        document.getElementById("men")?.scrollIntoView({ block: "start" });
      });
    }

    if (routePath === "women") {
      setActiveCategory("Women");
      setActiveCollection("All");
    }

    if (routePath === "drop-001") {
      setActiveCategory("All");
      setActiveCollection("Drop 001");
    }

    if (routePath.startsWith("admin")) {
      if (adminUnlocked) setAppMode("admin");
      // Don't pop the sign-in modal while an existing token is still being validated.
      else if (!getToken()) setAuthModalOpen(true);
    }
  }, [routePath, adminUnlocked]);

  // Once a session resolves, close any open auth modal.
  useEffect(() => {
    if (currentUser) setAuthModalOpen(false);
  }, [currentUser]);

  function handleModeChange(mode) {
    if (mode === "admin" && !adminUnlocked) {
      setAuthError("");
      setAuthModalOpen(true);
      return;
    }
    setAppMode(mode);
    window.location.hash = "mode-dashboard";
  }

  async function handleAuthSubmit(mode, formValues) {
    setAuthBusy(true);
    setAuthError("");

    try {
      const data = mode === "register" ? await registerUser(formValues) : await loginUser(formValues);
      if (data?.token) setToken(data.token);
      setAuth({ user: data.user });

      if (Array.isArray(data.user?.wishlist) && data.user.wishlist.length) {
        setWishlist((current) => Array.from(new Set([...current, ...data.user.wishlist])));
      }

      setAuthModalOpen(false);

      if (data.user?.role === "admin") {
        setAppMode("admin");
        window.location.hash = "admin";
      }
    } catch (error) {
      setAuthError(error.message || "Authentication failed. Try again.");
    } finally {
      setAuthBusy(false);
    }
  }

  function handleLogout() {
    setToken(null);
    setAuth({ user: null });
    setAppMode("customer");
  }

  useEffect(() => {
    const nextSize = selectedProduct.sizes.find((size) => getSizeStock(selectedProduct, size) > 0) || selectedProduct.sizes[0];
    setSelectedSize(nextSize);
    setSelectedColor(selectedProduct.colors[0].name);
    setSelectedQuantity(1);
  }, [selectedProduct.id]);

  useEffect(() => {
    setRecentlyViewed((current) => [selectedProduct.id, ...current.filter((id) => id !== selectedProduct.id)].slice(0, 6));
  }, [selectedProduct.id, setRecentlyViewed]);

  useEffect(() => {
    setSelectedQuantity((quantity) => Math.min(Math.max(1, quantity), Math.max(1, selectedSizeStock)));
  }, [selectedSizeStock]);

  function selectProduct(product) {
    setSelectedProductId(product.id);
    window.location.hash = "product";
  }

  function addProductToCart(product, size, color, quantity = 1) {
    const availableStock = getSizeStock(product, size);
    if (availableStock <= 0) return;

    const requestedQuantity = Math.min(quantity, availableStock);

    setCart((current) => {
      const existing = current.find(
        (item) => item.productId === product.id && item.size === size && item.color === color
      );

      if (existing) {
        return current.map((item) =>
          item.cartId === existing.cartId
            ? { ...item, quantity: Math.min(availableStock, item.quantity + requestedQuantity) }
            : item
        );
      }

      return [
        ...current,
        {
          cartId: `${product.id}-${size}-${color}-${Date.now()}`,
          productId: product.id,
          name: product.name,
          price: product.price,
          size,
          color,
          quantity: requestedQuantity,
          stock: availableStock,
          image: product.image,
          imageClass: product.imageClass
        }
      ];
    });
  }

  function addToCart() {
    addProductToCart(selectedProduct, selectedSize, selectedColor, selectedQuantity);
  }

  function buyNow() {
    addToCart();
    window.location.hash = "checkout";
    window.requestAnimationFrame(() => {
      document.getElementById("checkout")?.scrollIntoView({ block: "start" });
    });
  }

  async function addAdminProduct() {
    const template = catalog.find((product) => product.id === "mg69-utility-set") || catalog[0];
    const draft = {
      name: "New MG69 Utility Product",
      price: 169,
      stock: 125,
      category: template?.category || "Men",
      collection: template?.collection || "MG69 Utility Collection",
      type: template?.type,
      sizes: template?.sizes || ["S", "M", "L", "XL", "XXL"],
      sizeStock: { S: 25, M: 25, L: 25, XL: 25, XXL: 25 },
      colors: template?.colors,
      colorVariants: template?.colorVariants,
      image: template?.image,
      images: template?.images,
      tagline: template?.tagline,
      description: template?.description,
      specs: template?.specs,
      tags: [...(template?.tags || []), "Admin Added"]
    };

    if (hasApi && isAdmin) {
      try {
        const created = await createProduct(draft);
        const normalized = normalizeProduct(created);
        setCatalog((current) => [normalized, ...current]);
        setSelectedProductId(normalized.id);
        return;
      } catch (error) {
        setOrderMessage(error.message || "Could not create product on the server.");
      }
    }

    const id = `mg69-admin-product-${Date.now()}`;
    setCatalog((current) => [normalizeProduct({ ...draft, id }), ...current]);
    setSelectedProductId(id);
  }

  function editAdminProduct(productId, updates) {
    setCatalog((current) =>
      current.map((product) =>
        product.id === productId
          ? normalizeProduct({
              ...product,
              ...updates,
              price: Number(updates.price ?? product.price),
              stock: Number(updates.stock ?? product.stock)
            })
          : product
      )
    );

    if (hasApi && isAdmin) {
      updateProduct(productId, updates).catch((error) =>
        setOrderMessage(error.message || "Could not save product changes to the server.")
      );
    }
  }

  function deleteAdminProduct(productId) {
    setCatalog((current) => {
      if (current.length <= 1) return current;
      const nextProducts = current.filter((product) => product.id !== productId);
      if (selectedProductId === productId && nextProducts[0]) {
        setSelectedProductId(nextProducts[0].id);
      }
      return nextProducts;
    });

    if (hasApi && isAdmin) {
      deleteProduct(productId).catch((error) =>
        setOrderMessage(error.message || "Could not delete product on the server.")
      );
    }
  }

  function updateAdminStock(productId, size, delta) {
    let persisted = null;

    setCatalog((current) =>
      current.map((product) => {
        if (product.id !== productId) return product;
        const nextSizeStock = {
          ...product.sizeStock,
          [size]: Math.max(0, Number(product.sizeStock?.[size] || 0) + delta)
        };
        const nextProduct = {
          ...product,
          sizeStock: nextSizeStock,
          stock: Object.values(nextSizeStock).reduce((sum, count) => sum + Number(count || 0), 0)
        };
        persisted = nextProduct;
        return nextProduct;
      })
    );

    if (hasApi && isAdmin && persisted) {
      updateProduct(productId, { sizeStock: persisted.sizeStock, stock: persisted.stock }).catch(() => {});
    }
  }

  function uploadAdminImage(productId, file) {
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);

    setCatalog((current) =>
      current.map((product) =>
        product.id === productId
          ? {
              ...product,
              image: imageUrl,
              images: [{ label: "Uploaded Image", src: imageUrl }, ...(product.images || [])]
            }
          : product
      )
    );
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
    if (cart.length === 0 || checkoutLoading) return;

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

    setCheckoutLoading(true);

    try {
      // The order is persisted server-side when the Stripe session is created.
      const session = await createCheckoutSession(cart, email, { address, customerName });

      if (session?.url) {
        window.location.href = session.url;
        return;
      }

      setOrderMessage(`Order saved for ${order.customerName}. Stripe session is pending configuration.`);
      setCheckoutLoading(false);
    } catch (error) {
      setOrderMessage(error.message || `Order draft saved locally for ${order.customerName}. API checkout is not reachable yet.`);
      setCheckoutLoading(false);
    }
  }

  return (
    <div className="app" style={{ "--preview": `url(${previewImage})` }}>
      <BrandReveal />
      <div className="grain" aria-hidden="true" />
      <Header
        appMode={visibleAppMode}
        authEnabled={hasApi}
        canAccessAdmin={adminUnlocked}
        itemCount={itemCount}
        onAccount={() => {
          setAuthError("");
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onMenu={() => setDrawerOpen(true)}
        onMode={handleModeChange}
        route={routePath}
        user={currentUser}
        wishlistCount={wishlist.length}
      />
      <AppDrawer
        appMode={visibleAppMode}
        canAccessAdmin={adminUnlocked}
        catalogStatus={catalogStatus}
        inventoryCount={inventoryCount}
        itemCount={itemCount}
        onClose={() => setDrawerOpen(false)}
        onMode={handleModeChange}
        open={drawerOpen}
        subtotal={subtotal}
        wishlistCount={wishlist.length}
      />

      <main>
        {isOrderConfirmed ? (
          <OrderConfirmed onClearCart={() => setCart([])} />
        ) : (
          <>
            <Hero />
            <ModeDashboard
              appMode={visibleAppMode}
              catalogStatus={catalogStatus}
              inventoryCount={inventoryCount}
              itemCount={itemCount}
              lastOrder={lastOrder}
              products={catalog}
              subtotal={subtotal}
              wishlistCount={wishlist.length}
            />
            <CategoryNavigator
              activeCategory={activeCategory}
              activeCollection={activeCollection}
              onCategory={setActiveCategory}
              onCollection={setActiveCollection}
              onSearch={setSearchQuery}
              searchQuery={searchQuery}
            />
            {routePath === "men" && (
              <MensCollectionLanding
                products={catalog}
                onAdd={addProductToCart}
                onSelect={selectProduct}
              />
            )}
            {routePath === "women" && (
              <WomensCollectionLanding
                products={catalog}
                onAdd={addProductToCart}
                onSelect={selectProduct}
              />
            )}
            <StorySections />
            <Shop
              products={filteredProducts}
              isLoading={catalogStatus === "connecting"}
              selectedProductId={selectedProduct.id}
              searchQuery={searchQuery}
              wishlist={wishlist}
              onSelect={selectProduct}
              onWishlist={toggleWishlist}
            />
            <ProductStudio
              product={selectedProduct}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              selectedQuantity={selectedQuantity}
              selectedSizeStock={selectedSizeStock}
              cart={cart}
              checkoutLoading={checkoutLoading}
              subtotal={subtotal}
              orderMessage={orderMessage}
              recentlyViewed={recentlyViewedProducts}
              relatedProducts={relatedProducts}
              onSize={setSelectedSize}
              onColor={setSelectedColor}
              onPurchaseQuantity={setSelectedQuantity}
              onAdd={addToCart}
              onBuyNow={buyNow}
              onSelect={selectProduct}
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
            {(adminUnlocked || routePath.startsWith("admin")) && (
              <AdminPanel
                adminUnlocked={adminUnlocked}
                authEnabled={hasApi}
                cart={cart}
                catalogStatus={catalogStatus}
                inventoryCount={inventoryCount}
                lastOrder={lastOrder}
                onAddProduct={addAdminProduct}
                onDeleteProduct={deleteAdminProduct}
                onEditProduct={editAdminProduct}
                onSignIn={() => {
                  setAuthError("");
                  setAuthModalOpen(true);
                }}
                onStock={updateAdminStock}
                onUploadImage={uploadAdminImage}
                orders={orders}
                products={catalog}
                subtotal={subtotal}
                wishlistCount={wishlist.length}
              />
            )}
          </>
        )}
      </main>

      <MobileNav
        canAccessAdmin={adminUnlocked}
        itemCount={itemCount}
        onMenu={() => setDrawerOpen(true)}
        wishlistCount={wishlist.length}
      />
      {hasApi && (
        <AuthModal
          busy={authBusy}
          error={authError}
          onClose={() => setAuthModalOpen(false)}
          onSubmit={handleAuthSubmit}
          open={authModalOpen}
        />
      )}
    </div>
  );
}

function AuthModal({ busy, error, onClose, onSubmit, open }) {
  const [mode, setMode] = useState("login");

  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      email: String(form.get("email") || "").trim(),
      password: String(form.get("password") || "")
    };
    if (mode === "register") payload.name = String(form.get("name") || "").trim();
    onSubmit(mode, payload);
  }

  const field = {
    width: "100%",
    background: "#111",
    border: "1px solid #242424",
    borderRadius: 6,
    color: "#fff",
    padding: "11px 12px",
    fontSize: 14,
    fontFamily: "inherit",
    outline: "none"
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(0,0,0,0.78)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(94vw, 400px)",
              background: "#0c0c0c",
              border: "1px solid #1c1c1c",
              borderRadius: 12,
              padding: "28px 26px",
              boxShadow: "0 30px 80px rgba(0,0,0,0.6)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <p style={{ fontSize: 10, letterSpacing: "0.18em", color: "#C9A84C", textTransform: "uppercase", margin: "0 0 6px" }}>
                  MG69 Account
                </p>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: "#fff", letterSpacing: "-0.01em" }}>
                  {mode === "register" ? "Create account" : "Welcome back"}
                </h2>
              </div>
              <button
                onClick={onClose}
                type="button"
                aria-label="Close"
                style={{ background: "none", border: "none", color: "#666", cursor: "pointer", padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {mode === "register" && (
                <input name="name" placeholder="Full name" autoComplete="name" style={field} />
              )}
              <input name="email" type="email" placeholder="Email" autoComplete="email" required style={field} />
              <input
                name="password"
                type="password"
                placeholder={mode === "register" ? "Password (min 8 chars)" : "Password"}
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                required
                minLength={mode === "register" ? 8 : undefined}
                style={field}
              />

              {error && (
                <p style={{ color: "#ff6b6b", fontSize: 12.5, margin: 0, lineHeight: 1.5 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={busy}
                style={{
                  background: "#C9A84C",
                  color: "#000",
                  border: "none",
                  borderRadius: 6,
                  padding: "12px",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  cursor: busy ? "default" : "pointer",
                  opacity: busy ? 0.6 : 1,
                  marginTop: 4,
                  fontFamily: "inherit"
                }}
              >
                {busy ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}
              </button>
            </form>

            <p style={{ fontSize: 12.5, color: "#666", textAlign: "center", margin: "16px 0 0" }}>
              {mode === "register" ? "Already have an account?" : "New to MG69?"}{" "}
              <button
                onClick={() => setMode(mode === "register" ? "login" : "register")}
                type="button"
                style={{ background: "none", border: "none", color: "#C9A84C", cursor: "pointer", fontSize: 12.5, fontFamily: "inherit", fontWeight: 600 }}
              >
                {mode === "register" ? "Sign in" : "Create one"}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BrandReveal() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!isVisible) return undefined;

    const timer = window.setTimeout(() => setIsVisible(false), prefersReducedMotion ? 1000 : 3600);
    return () => window.clearTimeout(timer);
  }, [isVisible, prefersReducedMotion]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="brand-reveal"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          <div className="reveal-vignette" aria-hidden="true" />
          <div className="reveal-particles" aria-hidden="true">
            {revealParticles.map((particle) => (
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
          <motion.div
            className="reveal-soundwave"
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.72 }}
            animate={{ opacity: [0, 0.36, 0.12], scale: [0.72, 1.08, 1.22] }}
            transition={{ duration: 2.4, ease: "easeOut", repeat: 1 }}
          />
          <motion.div
            className="reveal-emblem"
            initial={{ opacity: 0, scale: 0.72, y: 18 }}
            animate={{ opacity: 1, scale: [0.72, 1.04, 1], y: 0 }}
            transition={{ delay: 0.62, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="reveal-orbit reveal-orbit-one" aria-hidden="true" />
            <span className="reveal-orbit reveal-orbit-two" aria-hidden="true" />
            <span className="reveal-sweep" aria-hidden="true" />
            <img alt="MG69 Street Luxury logo reveal" src={brandLogo} width="1254" height="1254" />
          </motion.div>
          <motion.div
            className="reveal-copy"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.55, duration: 0.86, ease: "easeOut" }}
          >
            <span>MG69</span>
            <strong>Street Luxury Redefined</strong>
          </motion.div>
          <motion.div
            className="reveal-exit-line"
            aria-hidden="true"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1, 0.18], opacity: [0, 1, 0] }}
            transition={{ delay: 2.35, duration: 0.9, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Header({
  appMode,
  authEnabled,
  canAccessAdmin,
  itemCount,
  onAccount,
  onLogout,
  onMenu,
  onMode,
  route,
  user,
  wishlistCount
}) {
  const links = appMode === "admin" ? adminLinks : customerLinks;

  return (
    <header className="topbar">
      <button className="icon-button menu-button" onClick={onMenu} type="button" aria-label="Open menu">
        <Menu />
      </button>
      <a className="brand" href="#home">
        <img alt="" src={brandLogo} width="1254" height="1254" />
        <span>MG69</span>
      </a>
      <nav className="primary-nav" aria-label="Primary navigation">
        {links.slice(0, 7).map(([target, label]) => (
          <a className={route === target ? "active" : ""} href={`#${target}`} key={target}>
            {label}
          </a>
        ))}
      </nav>
      <div className="top-actions">
        {canAccessAdmin && (
          <div className="mode-toggle" aria-label="Application mode">
            <button className={appMode === "customer" ? "active" : ""} onClick={() => onMode("customer")} type="button">
              Customer
            </button>
            <button className={appMode === "admin" ? "active" : ""} onClick={() => onMode("admin")} type="button">
              Admin
            </button>
          </div>
        )}
        {authEnabled &&
          (user ? (
            <div className="account-chip" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  fontSize: 12,
                  color: "#C9A84C",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  whiteSpace: "nowrap"
                }}
              >
                {user.name?.split(" ")[0] || "Account"}
              </span>
              <button className="icon-button" onClick={onLogout} type="button" aria-label="Sign out" title="Sign out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button className="icon-button" onClick={onAccount} type="button" aria-label="Sign in" title="Sign in">
              <User />
            </button>
          ))}
        <a className="icon-button" href="#shop" aria-label="Search collection">
          <Search />
        </a>
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
  canAccessAdmin,
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
                <img alt="" src={brandLogo} width="1254" height="1254" />
                <span>MG69</span>
              </a>
              <button className="icon-button" onClick={onClose} type="button" aria-label="Close menu">
                <X />
              </button>
            </div>

            {canAccessAdmin && (
              <div className="drawer-mode">
                <button
                  className={appMode === "customer" ? "active" : ""}
                  onClick={() => {
                    onMode("customer");
                    onClose();
                  }}
                  type="button"
                >
                  Customer
                </button>
                <button
                  className={appMode === "admin" ? "active" : ""}
                  onClick={() => {
                    onMode("admin");
                    onClose();
                  }}
                  type="button"
                >
                  Admin
                </button>
              </div>
            )}

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

function ModeDashboard({
  appMode,
  catalogStatus,
  inventoryCount,
  itemCount,
  lastOrder,
  products,
  subtotal,
  wishlistCount
}) {
  const activeDrop = products.find((product) => product.collection === "Drop 001") || products[0];
  const lastOrderDate = lastOrder?.createdAt
    ? new Date(lastOrder.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : "Not started";
  const adminCards = [
    ["Cart pipeline", money(subtotal), `${itemCount} units currently in customer bags`],
    ["Catalog", `${products.length} SKUs`, `${catalogStatus === "database" ? "Database" : "Local"} product source active`],
    ["Inventory", `${inventoryCount} units`, "Stock totals across live MG69 pieces"],
    ["Orders", lastOrder ? "1 draft" : "0 drafts", lastOrder ? `${lastOrder.orderNumber} / ${lastOrderDate}` : "No saved order drafts yet"]
  ];
  const customerCards = [
    ["Bag", `${itemCount} items`, `${money(subtotal)} selected for checkout`],
    ["Wishlist", `${wishlistCount} saved`, "Saved pieces stay on this device"],
    ["Order", lastOrder ? lastOrder.orderNumber : "No draft", lastOrder ? `${lastOrderDate} / ${money(lastOrder.total)}` : "Checkout has not been saved yet"],
    ["Featured", activeDrop?.name || "Drop 001", activeDrop ? `${activeDrop.collection} / ${money(activeDrop.price)}` : "Signature product loading"]
  ];
  const cards = appMode === "admin" ? adminCards : customerCards;

  return (
    <section className={`mode-dashboard ${appMode}`} id="mode-dashboard">
      <div className="mode-dashboard-header">
        <p className="eyebrow">{appMode === "admin" ? "Admin data" : "Customer data"}</p>
        <h2>{appMode === "admin" ? "Store command" : "Customer hub"}</h2>
        <a className="secondary-command" href={appMode === "admin" ? "#admin" : "#shop"}>
          {appMode === "admin" ? "Open dashboard" : "Continue shopping"}
        </a>
      </div>

      <div className="mode-dashboard-grid">
        {cards.map(([label, value, body]) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

const fxParticles = [
  { x: "10%", y: "26%", s: "3px", d: "5s", delay: "0s" },
  { x: "20%", y: "70%", s: "2px", d: "6.5s", delay: "0.7s" },
  { x: "32%", y: "16%", s: "2px", d: "5.6s", delay: "1.3s" },
  { x: "46%", y: "82%", s: "3px", d: "7s", delay: "0.4s" },
  { x: "62%", y: "22%", s: "2px", d: "6s", delay: "1.6s" },
  { x: "73%", y: "66%", s: "3px", d: "5.4s", delay: "0.2s" },
  { x: "84%", y: "30%", s: "2px", d: "6.8s", delay: "1.1s" },
  { x: "90%", y: "76%", s: "3px", d: "5.2s", delay: "0.9s" },
  { x: "54%", y: "12%", s: "2px", d: "7.2s", delay: "1.8s" }
];
const fxStage = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } }
};
const fxItem = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }
};
const fxTicker = ["MG69 Street Luxury", "Drop 001 — Live Now", "Utility Collection", "Designed for the Bold", "Free Worldwide Shipping"];

function Hero() {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const featured = products[0];

  function handlePointerMove(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    setPointer({
      x: ((event.clientX - bounds.left) / bounds.width - 0.5) * 2,
      y: ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
    });
  }

  const heroPointerStyle = {
    "--fx-px": `${pointer.x * 9}px`,
    "--fx-py": `${pointer.y * 9}px`
  };

  return (
    <section
      className="fx-hero"
      id="home"
      onPointerLeave={() => setPointer({ x: 0, y: 0 })}
      onPointerMove={handlePointerMove}
      style={heroPointerStyle}
    >
      <div className="fx-layer fx-aurora" aria-hidden="true" />
      <div className="fx-layer fx-grid" aria-hidden="true" />
      <div className="fx-layer fx-scan" aria-hidden="true" />
      <div className="fx-layer fx-stars" aria-hidden="true">
        {fxParticles.map((p) => (
          <span
            key={`${p.x}-${p.y}`}
            style={{ "--x": p.x, "--y": p.y, "--s": p.s, "--d": p.d, "--delay": p.delay }}
          />
        ))}
      </div>
      <div className="fx-layer fx-vignette" aria-hidden="true" />
      <div className="fx-layer fx-grain" aria-hidden="true" />

      <motion.div className="fx-stage" variants={fxStage} initial="hidden" animate="show">
        <motion.span className="fx-kicker" variants={fxItem}>Est. MMXXV · Street Luxury</motion.span>

        <motion.div className="fx-emblem" variants={fxItem}>
          <span className="fx-halo" aria-hidden="true" />
          <span className="fx-glow" aria-hidden="true" />
          <span className="fx-orbit o1" aria-hidden="true" />
          <span className="fx-orbit o2" aria-hidden="true" />
          <motion.img
            src={brandLogo}
            alt="MG69 emblem"
            width="1254"
            height="1254"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
          />
          <span className="fx-reflection" aria-hidden="true" style={{ backgroundImage: `url(${brandLogo})` }} />
        </motion.div>

        <motion.h1 className="fx-title" variants={fxItem}>
          <span className="fx-mark">MG69</span>
          <span className="fx-sub">Street Luxury</span>
        </motion.h1>

        <motion.p className="fx-tagline" variants={fxItem}>
          Premium oversized utility silhouettes — engineered for comfort, confidence, and a future-facing
          streetwear standard.
        </motion.p>

        <motion.div className="fx-cta" variants={fxItem}>
          <a className="fx-btn fx-btn-primary" href="#shop">Enter the Drop →</a>
          <a className="fx-btn fx-btn-ghost" href="#lookbook">View Lookbook</a>
        </motion.div>

        <motion.div className="fx-pillars" variants={fxItem} aria-label="MG69 brand pillars">
          <span>Designed for the Bold</span>
          <span>Luxury Detail</span>
          <span>Streetwear Elevated</span>
        </motion.div>
      </motion.div>

      <motion.a
        className="fx-spec"
        href="#product"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <ProductImage alt={`${featured.name} featured drop`} image={featured.images?.[0] || featured.image} />
        <span className="fx-spec-body">
          <span className="fx-spec-tag">Featured Drop</span>
          <span className="fx-spec-name">{featured.name}</span>
          <span className="fx-spec-price">{money(featured.price)}</span>
        </span>
      </motion.a>

      <div className="fx-ticker" aria-hidden="true">
        <div className="fx-ticker-track">
          {fxTicker.concat(fxTicker).map((word, index) => (
            <span key={`${word}-${index}`}>{word}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryNavigator({ activeCategory, activeCollection, onCategory, onCollection, onSearch, searchQuery }) {
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
      <label className="router-block search-block">
        <span className="eyebrow">Search catalog</span>
        <div className="catalog-search">
          <Search size={18} />
          <input
            aria-label="Search MG69 products"
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search hoodie, tee, coat..."
            type="search"
            value={searchQuery}
          />
        </div>
      </label>
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
        <h2>Royal weight. Street discipline. No signal to noise.</h2>
        <div className="manifesto-grid">
          <span>Cream grounds</span>
          <span>Gold accents</span>
          <span>Black silhouettes</span>
        </div>
      </section>

      <CampaignSection />

      <section className="campaign-sections" aria-label="MG69 campaign sections">
        {campaignHighlights.map(([title, tagline]) => (
          <article key={title}>
            <span>{title}</span>
            <strong>{tagline}</strong>
          </article>
        ))}
        <form className="newsletter-card">
          <label htmlFor="newsletter-email">Newsletter Signup</label>
          <div>
            <input id="newsletter-email" type="email" placeholder="email@mg69.com" />
            <button type="submit">Join</button>
          </div>
        </form>
      </section>
    </>
  );
}

function CampaignSection() {
  return (
    <section className="editorial-campaigns" id="lookbook">
      <div className="editorial-campaigns-inner">
        <p className="editorial-kicker">MG 69 LUXURY</p>

        <h2>Editorial Campaigns</h2>

        <div className="editorial-campaign-grid">
          {campaigns.map((item) => (
            <motion.article
              className="editorial-campaign-card"
              initial={{ opacity: 0, y: 30 }}
              key={item.title}
              viewport={{ once: true, margin: "-80px" }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                width={item.width}
                height={item.height}
              />

              <div>
                <h3>{item.title}</h3>
                <p>{item.subtitle}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Shop({ isLoading, products, searchQuery, selectedProductId, wishlist, onSelect, onWishlist }) {
  return (
    <section className="shop-section" id="shop">
      <div className="collection-campaign-banner">
        <ProductImage
          alt="MG69 Utility Collection banner"
          image={utilityCampaignImages.board}
        />
        <div>
          <p className="eyebrow">MG69 Utility Collection</p>
          <h2>Designed for the Bold.</h2>
          <p>Premium utility streetwear collection.</p>
        </div>
      </div>
      <div className="section-heading">
        <p className="eyebrow">Live catalog</p>
        <h2>Shop MG69</h2>
      </div>
      <div className="shop-toolbar">
        <span>{isLoading ? "Loading catalog" : `${products.length} products`}</span>
        <span><SlidersHorizontal size={16} /> {searchQuery ? `Search: ${searchQuery}` : "Filter-ready architecture"}</span>
      </div>
      <div className="product-list">
        {isLoading ? (
          <ProductSkeletons />
        ) : products.length === 0 ? (
          <div className="empty-panel catalog-empty">
            <Search />
            <h3>No pieces found</h3>
            <p>Try another search or reset the collection filters.</p>
          </div>
        ) : (
          <AnimatePresence>
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
        )}
      </div>
    </section>
  );
}

function ProductSkeletons() {
  return Array.from({ length: 4 }, (_, index) => (
    <article className="product-card product-skeleton" key={`skeleton-${index}`} aria-hidden="true">
      <div className="skeleton-shimmer image" />
      <div className="skeleton-stack">
        <span />
        <strong />
        <p />
      </div>
    </article>
  ));
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
        <ProductImage alt={`${product.name} front product shot`} image={product.images?.[0] || product.image} />
      </button>
      <button className={`wish-button ${isWishlisted ? "active" : ""}`} onClick={onWishlist} type="button">
        <Heart size={18} />
      </button>
      <div className="product-info" onClick={onSelect} role="button" tabIndex={0}>
        <div className="product-meta">
          <span>{product.category}</span>
          <span>{product.collection}</span>
          <span>{getStockLabel(product.stock)}</span>
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
  selectedSizeStock,
  cart,
  checkoutLoading,
  subtotal,
  orderMessage,
  recentlyViewed,
  relatedProducts,
  onSize,
  onColor,
  onPurchaseQuantity,
  onAdd,
  onBuyNow,
  onSelect,
  onQuantity,
  onCheckout,
  wishlist,
  onWishlist
}) {
  const selectedVariant = product.colorVariants?.find((variant) => variant.name === selectedColor);
  const gallery = selectedVariant?.gallery?.length
    ? selectedVariant.gallery
    : product.images?.length
      ? product.images
      : [{ label: "Front", src: product.image }];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const activeImage = gallery[activeIndex] || gallery[0];

  useEffect(() => {
    setActiveIndex(0);
  }, [product.id, selectedColor]);

  return (
    <section className="product-studio" id="product">
      <div className="detail-panel">
        <div className="detail-image-wrap">
          <button className="detail-image" onClick={() => setIsLightboxOpen(true)} type="button">
            <ProductImage
              alt={`${product.name} ${activeImage?.label || "product"} view`}
              image={activeImage}
            />
            <span className="zoom-cue"><Maximize2 size={16} /> Zoom / lightbox</span>
          </button>
          <button
            className={`icon-button favorite-floating ${wishlist.includes(product.id) ? "active" : ""}`}
            onClick={() => onWishlist(product.id)}
            type="button"
            aria-label={wishlist.includes(product.id) ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart />
          </button>
        </div>
        <div className="product-gallery" aria-label={`${product.name} gallery`}>
          {gallery.map((image, index) => (
            <button
              className={activeIndex === index ? "active" : ""}
              key={`${image.label}-${image.color || "base"}-${index}`}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <ProductImage alt={`${product.name} ${image.label} thumbnail`} image={image} />
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
            selectedSizeStock={selectedSizeStock}
            sizeStock={product.sizeStock}
            sizes={product.sizes}
            onColor={onColor}
            onPurchaseQuantity={onPurchaseQuantity}
            onSize={onSize}
          />

          <div className="product-action-row">
            <button className="primary-command full" disabled={selectedSizeStock <= 0} onClick={onAdd} type="button">
              {selectedSizeStock <= 0 ? "Sold out" : `Add ${selectedQuantity} to cart`}
            </button>
            <button className="secondary-command buy-now-command" disabled={selectedSizeStock <= 0} onClick={onBuyNow} type="button">
              Buy Now
            </button>
            <button
              className={`icon-button wishlist-command ${wishlist.includes(product.id) ? "active" : ""}`}
              onClick={() => onWishlist(product.id)}
              type="button"
              aria-label={wishlist.includes(product.id) ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart />
            </button>
          </div>
        </div>
      </div>

      <CartPanel
        cart={cart}
        checkoutLoading={checkoutLoading}
        orderMessage={orderMessage}
        subtotal={subtotal}
        onCheckout={onCheckout}
        onQuantity={onQuantity}
      />
      <ProductRails relatedProducts={relatedProducts} recentlyViewed={recentlyViewed} onSelect={onSelect} />
      <GalleryLightbox
        activeIndex={activeIndex}
        gallery={gallery}
        isOpen={isLightboxOpen}
        productName={product.name}
        onClose={() => setIsLightboxOpen(false)}
        onIndex={setActiveIndex}
      />
    </section>
  );
}

function ProductRails({ relatedProducts, recentlyViewed, onSelect }) {
  return (
    <div className="product-rails">
      <ProductRail title="Related Products" products={relatedProducts} onSelect={onSelect} />
      <ProductRail title="Recently Viewed" products={recentlyViewed} onSelect={onSelect} />
    </div>
  );
}

function ProductRail({ title, products, onSelect }) {
  if (!products?.length) return null;

  return (
    <section className="mini-product-rail" aria-label={title}>
      <div className="rail-heading">
        <p className="eyebrow">{title}</p>
        <span>{products.length} pieces</span>
      </div>
      <div className="mini-product-grid">
        {products.map((product) => (
          <button className="mini-product-card" key={product.id} onClick={() => onSelect(product)} type="button">
            <ProductImage alt={`${product.name} preview`} image={product.images?.[0] || product.image} />
            <span>{product.collection}</span>
            <strong>{product.name}</strong>
            <small>{money(product.price)}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function GalleryLightbox({ activeIndex, gallery, isOpen, productName, onClose, onIndex }) {
  const [touchStart, setTouchStart] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const activeImage = gallery[activeIndex] || gallery[0];

  function move(delta) {
    onIndex((activeIndex + delta + gallery.length) % gallery.length);
  }

  useEffect(() => {
    if (!isOpen) return undefined;

    setIsZoomed(false);

    function handleKey(event) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, gallery.length, isOpen, onClose]);

  if (!activeImage) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="lightbox-shell" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button className="lightbox-backdrop" onClick={onClose} type="button" aria-label="Close product preview" />
          <motion.div
            className="lightbox-panel"
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 24 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <div className="lightbox-topbar">
              <div>
                <span>{activeImage.label}</span>
                <strong>{productName}</strong>
              </div>
              <button className="icon-button" onClick={onClose} type="button" aria-label="Close lightbox">
                <X />
              </button>
            </div>
            <figure
              className={isZoomed ? "zoomed" : ""}
              onTouchEnd={(event) => {
                if (touchStart === null) return;
                const delta = event.changedTouches[0].clientX - touchStart;
                if (Math.abs(delta) > 42) move(delta > 0 ? -1 : 1);
                setTouchStart(null);
              }}
              onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
            >
              <ProductImage
                alt={`${productName} ${activeImage.label} enlarged preview`}
                image={activeImage}
                loading="eager"
                sizes="100vw"
              />
            </figure>
            <div className="lightbox-controls">
              <button onClick={() => move(-1)} type="button"><ChevronLeft size={18} /> Previous</button>
              <button onClick={() => setIsZoomed((value) => !value)} type="button">
                <Maximize2 size={18} /> {isZoomed ? "Fit" : "Zoom"}
              </button>
              <button onClick={() => move(1)} type="button">Next <ChevronRight size={18} /></button>
            </div>
            <div className="lightbox-thumbs">
              {gallery.map((image, index) => (
                <button
                  className={index === activeIndex ? "active" : ""}
                  key={`${image.label}-${image.color || "base"}-${index}`}
                  onClick={() => onIndex(index)}
                  type="button"
                >
                  <ProductImage alt={`${productName} ${image.label} thumbnail`} image={image} />
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function VariantSelector({
  colors,
  selectedColor,
  selectedQuantity,
  selectedSize,
  selectedSizeStock,
  sizeStock,
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
          {sizes.map((size) => {
            const count = Math.max(0, Number(sizeStock?.[size] ?? stock));
            const isSoldOut = count <= 0;

            return (
              <button
                className={`${selectedSize === size ? "selected" : ""} ${isSoldOut ? "sold-out" : ""}`}
                disabled={isSoldOut}
                key={size}
                onClick={() => onSize(size)}
                title={getStockLabel(count)}
                type="button"
              >
                <span>{size}</span>
                <small>{isSoldOut ? "Out" : count}</small>
              </button>
            );
          })}
        </div>
      </div>

      <div className="purchase-controls">
        <div className="stock-strip">
          <span>{getStockLabel(selectedSizeStock)} in {selectedSize}</span>
          <strong>{selectedColor}</strong>
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
            disabled={selectedQuantity >= selectedSizeStock}
            onClick={() => onPurchaseQuantity(Math.min(selectedSizeStock, selectedQuantity + 1))}
            type="button"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CartPanel({ cart, checkoutLoading, subtotal, orderMessage, onQuantity, onCheckout }) {
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
                {item.image && (
                  <ProductImage alt={`${item.name} cart preview`} image={item.image} />
                )}
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
          <button className="primary-command compact" disabled={checkoutLoading || cart.length === 0} type="submit">
            {checkoutLoading ? "Redirecting" : `Checkout / ${money(subtotal)}`}
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
                <ProductImage alt={`${product.name} wishlist preview`} image={product.images?.[0] || product.image} />
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

function AdminPanel({
  adminUnlocked,
  authEnabled,
  cart,
  catalogStatus,
  inventoryCount,
  lastOrder,
  onAddProduct,
  onDeleteProduct,
  onEditProduct,
  onSignIn,
  onStock,
  onUploadImage,
  orders = [],
  products,
  subtotal,
  wishlistCount
}) {
  const [selectedAdminId, setSelectedAdminId] = useState(products[0]?.id || "");
  const selectedAdminProduct = products.find((product) => product.id === selectedAdminId) || products[0];
  const paidOrders = orders.filter((order) => order.status === "paid");
  const ordersRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const orderCountLabel = orders.length ? `${orders.length} orders` : lastOrder ? "1 draft" : "0 orders";
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
      value: orderCountLabel,
      body: orders.length
        ? `${paidOrders.length} paid / ${money(ordersRevenue)} lifetime revenue`
        : "Stripe checkouts and order drafts appear here once customers buy."
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

  useEffect(() => {
    if (!products.some((product) => product.id === selectedAdminId)) {
      setSelectedAdminId(products[0]?.id || "");
    }
  }, [products, selectedAdminId]);

  if (!adminUnlocked) {
    return (
      <section className="admin-section" id="admin">
        <div className="section-heading">
          <p className="eyebrow">Admin interface</p>
          <h2>Command dashboard</h2>
          <span className="data-source-pill">Locked</span>
        </div>
        <div className="empty-panel" style={{ textAlign: "center" }}>
          <Settings />
          <h3>Admin access required</h3>
          <p>
            {authEnabled
              ? "Sign in with an owner or access-member account to manage products, inventory, and orders."
              : "Connect the MG69 API and sign in with an owner account to manage products, inventory, and orders."}
          </p>
          {authEnabled && (
            <button className="primary-command compact" onClick={onSignIn} type="button" style={{ marginTop: 14 }}>
              Sign in as admin
            </button>
          )}
        </div>
      </section>
    );
  }

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

      {selectedAdminProduct && (
        <div className="admin-inventory-dashboard" id="admin-inventory">
          <div className="admin-inventory-sidebar">
            <div className="admin-inventory-heading">
              <div>
                <p className="eyebrow">Inventory system</p>
                <h3>Manage Stock</h3>
              </div>
              <button className="primary-command compact" onClick={onAddProduct} type="button">
                <Plus size={16} /> Add Product
              </button>
            </div>
            <div className="admin-product-list" aria-label="Admin product selector">
              {products.map((product) => (
                <button
                  className={product.id === selectedAdminProduct.id ? "active" : ""}
                  key={product.id}
                  onClick={() => setSelectedAdminId(product.id)}
                  type="button"
                >
                  <ProductImage alt={`${product.name} admin thumbnail`} image={product.images?.[0] || product.image} />
                  <span>{product.collection}</span>
                  <strong>{product.name}</strong>
                  <small>{getStockLabel(product.stock)}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="admin-product-editor" id="admin-products">
            <div className="admin-editor-preview">
              <ProductImage alt={`${selectedAdminProduct.name} admin preview`} image={selectedAdminProduct.images?.[0] || selectedAdminProduct.image} />
            </div>
            <div className="admin-editor-fields">
              <div className="admin-editor-title">
                <div>
                  <p className="eyebrow">Edit Product</p>
                  <h3>{selectedAdminProduct.name}</h3>
                </div>
                <button
                  className="delete-product-button"
                  disabled={products.length <= 1}
                  onClick={() => onDeleteProduct(selectedAdminProduct.id)}
                  type="button"
                >
                  <Trash2 size={16} /> Delete Product
                </button>
              </div>

              <div className="admin-field-grid">
                <label>
                  <span>Product name</span>
                  <input
                    defaultValue={selectedAdminProduct.name}
                    onBlur={(event) => onEditProduct(selectedAdminProduct.id, { name: event.target.value })}
                  />
                </label>
                <label>
                  <span>Price</span>
                  <input
                    defaultValue={selectedAdminProduct.price}
                    min="0"
                    onBlur={(event) => onEditProduct(selectedAdminProduct.id, { price: event.target.value })}
                    type="number"
                  />
                </label>
                <label>
                  <span>Total stock</span>
                  <input
                    defaultValue={selectedAdminProduct.stock}
                    min="0"
                    onBlur={(event) => onEditProduct(selectedAdminProduct.id, { stock: event.target.value })}
                    type="number"
                  />
                </label>
                <label>
                  <span>Collection</span>
                  <input
                    defaultValue={selectedAdminProduct.collection}
                    onBlur={(event) => onEditProduct(selectedAdminProduct.id, { collection: event.target.value })}
                  />
                </label>
              </div>

              <label className="admin-upload-control">
                <Upload size={18} />
                <span>Upload Images</span>
                <input
                  accept="image/*"
                  onChange={(event) => onUploadImage(selectedAdminProduct.id, event.target.files?.[0])}
                  type="file"
                />
              </label>

              <div className="admin-size-stock">
                {selectedAdminProduct.sizes.map((size) => (
                  <article key={size}>
                    <span>{size}</span>
                    <strong>{Number(selectedAdminProduct.sizeStock?.[size] ?? selectedAdminProduct.stock ?? 0)}</strong>
                    <div>
                      <button onClick={() => onStock(selectedAdminProduct.id, size, -1)} type="button"><Minus size={14} /></button>
                      <button onClick={() => onStock(selectedAdminProduct.id, size, 1)} type="button"><Plus size={14} /></button>
                    </div>
                  </article>
                ))}
              </div>

              <div className="admin-orders-panel" id="admin-orders">
                <div>
                  <p className="eyebrow">View Orders</p>
                  <h3>{orders.length ? `${orders.length} orders / ${money(ordersRevenue)}` : lastOrder ? lastOrder.orderNumber : "No orders yet"}</h3>
                </div>
                {orders.length > 0 ? (
                  <div className="admin-orders-list" style={{ display: "flex", flexDirection: "column", gap: 8, margin: "4px 0 12px" }}>
                    {orders.slice(0, 6).map((order) => (
                      <div
                        key={order._id || order.stripeSessionId}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 10,
                          padding: "9px 12px",
                          border: "1px solid #1c1c1c",
                          borderRadius: 6,
                          background: "#0d0d0d"
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <strong style={{ fontSize: 13, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {order.customerName || "Guest"}
                          </strong>
                          <span style={{ fontSize: 11, color: "#777" }}>
                            {order.email || "—"} · {order.items?.length || 0} items
                          </span>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <strong style={{ fontSize: 13, color: "#C9A84C" }}>{money(Number(order.total || 0))}</strong>
                          <span
                            style={{
                              display: "block",
                              fontSize: 10,
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                              color: order.status === "paid" ? "#4caf7d" : "#b9883a"
                            }}
                          >
                            {order.status || "pending"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>
                    {lastOrder
                      ? `${lastOrder.customerName} / ${money(lastOrder.total)} / ${lastOrder.items.length} items (local draft)`
                      : "Stripe paid orders and drafts will appear here once customers buy."}
                  </p>
                )}
                <a className="secondary-command" href="#orders">Open Order Tracking</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function MobileNav({ canAccessAdmin, itemCount, onMenu, wishlistCount }) {
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      <button onClick={onMenu} type="button"><Menu size={18} />Menu</button>
      <a href="#shop"><Search size={18} />Shop</a>
      <a href="#wishlist"><Heart size={18} />Wish {wishlistCount}</a>
      <a href="#checkout"><ShoppingBag size={18} />Bag {itemCount}</a>
      {canAccessAdmin && <a href="#admin"><User size={18} />Admin</a>}
    </nav>
  );
}

export default App;
