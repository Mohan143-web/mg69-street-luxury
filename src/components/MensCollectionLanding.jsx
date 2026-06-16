// ─────────────────────────────────────────────────────────────────────────────
// MensCollectionLanding.jsx — Premium Men Product Page (Drop-in Replacement)
// Replaces the existing MensCollectionLanding function in App.jsx
//
// SETUP: Place this file at src/components/MensCollectionLanding.jsx
// Then in App.jsx replace:
//   import ... MensCollectionLanding ...
// with:
//   import MensCollectionLanding from "./components/MensCollectionLanding.jsx";
//
// IMAGE FOLDER STRUCTURE:
//   public/images/products/utility-set/stone-grey/front.webp
//   public/images/products/utility-set/stone-grey/back.webp
//   public/images/products/utility-set/stone-grey/left.webp
//   public/images/products/utility-set/stone-grey/right.webp
//   public/images/products/utility-set/stone-grey/model-front.webp
//   public/images/products/utility-set/stone-grey/model-back.webp
//   public/images/products/utility-set/stone-grey/flat-front.webp
//   public/images/products/utility-set/stone-grey/flat-back.webp
//   (same structure for matte-black/ and dark-olive/)
//
// Until real WebP files are added, placeholder tiles are shown automatically.
// ─────────────────────────────────────────────────────────────────────────────

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, Minus, Plus, X, ZoomIn } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const BASE = import.meta.env.BASE_URL;

// ── Image manifest ────────────────────────────────────────────────────────────
const VIEWS = [
  { id: "front",       label: "Front View" },
  { id: "back",        label: "Back View" },
  { id: "left",        label: "Left Side" },
  { id: "right",       label: "Right Side" },
  { id: "model-front", label: "Model Front" },
  { id: "model-back",  label: "Model Back" },
  { id: "flat-front",  label: "Flat Lay Front" },
  { id: "flat-back",   label: "Flat Lay Back" },
];

const COLOR_VARIANTS = {
  "stone-grey": {
    label: "Stone Grey",
    hex: "#9E9E8F",
    bg: "#c8c8b8",
  },
  "matte-black": {
    label: "Matte Black",
    hex: "#1A1A1A",
    bg: "#2a2a2a",
  },
  "dark-olive": {
    label: "Dark Olive",
    hex: "#4A4A2A",
    bg: "#5a5a38",
  },
};

function getImages(colorKey) {
  return VIEWS.map((v) => ({
    ...v,
    webp: `${BASE}images/products/utility-set/${colorKey}/${v.id}.webp`,
    jpg:  `${BASE}images/products/utility-set/${colorKey}/${v.id}.jpg`,
  }));
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SOLD_OUT = ["XS"];
const money = (v) => `$${Number(v).toFixed(2)}`;

// ── Placeholder tile (shown until real product photos are added) ──────────────
function Tile({ label, bg, style = {} }) {
  return (
    <div style={{
      width: "100%", height: "100%", background: bg || "#1e1e1e",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 6, ...style,
    }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
        stroke="rgba(255,255,255,0.25)" strokeWidth="1.2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)",
        textAlign: "center", padding: "0 6px", lineHeight: 1.3,
        textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </span>
    </div>
  );
}

// ── Smart image: tries WebP → JPG → placeholder ───────────────────────────────
function ProductPhoto({ webp, jpg, alt, label, bg, style = {}, className = "" }) {
  const [state, setState] = useState("loading"); // loading | loaded | error

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
      {state !== "loaded" && <Tile label={label} bg={bg} />}
      <img
        src={webp}
        alt={alt}
        className={className}
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%", objectFit: "cover",
          opacity: state === "loaded" ? 1 : 0,
          transition: "opacity 0.3s",
          ...style,
        }}
        onLoad={() => setState("loaded")}
        onError={(e) => {
          if (e.target.src !== jpg) { e.target.src = jpg; }
          else setState("error");
        }}
      />
    </div>
  );
}

// ── Zoom hero image ───────────────────────────────────────────────────────────
function ZoomHero({ image, colorKey, onLightbox }) {
  const [zoomed, setZoomed] = useState(false);
  const [pos, setPos]       = useState({ x: 50, y: 50 });
  const ref                 = useRef(null);
  const variant             = COLOR_VARIANTS[colorKey];

  const onMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({
      x: ((e.clientX - r.left) / r.width)  * 100,
      y: ((e.clientY - r.top)  / r.height) * 100,
    });
  };

  return (
    <div
      ref={ref}
      onMouseEnter={() => setZoomed(true)}
      onMouseLeave={() => setZoomed(false)}
      onMouseMove={onMove}
      style={{ width: "100%", height: "100%", overflow: "hidden",
        cursor: zoomed ? "zoom-out" : "zoom-in", position: "relative" }}
    >
      <div style={{
        width: "100%", height: "100%",
        transformOrigin: `${pos.x}% ${pos.y}%`,
        transform: zoomed ? "scale(2)" : "scale(1)",
        transition: zoomed ? "transform 0.08s" : "transform 0.3s",
      }}>
        <ProductPhoto
          webp={image.webp} jpg={image.jpg}
          alt={image.label} label={image.label}
          bg={variant.bg}
        />
      </div>

      {/* expand button */}
      <button
        onClick={(e) => { e.stopPropagation(); onLightbox(); }}
        aria-label="Open fullscreen"
        style={{
          position: "absolute", top: 14, right: 14,
          background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.15)",
          color: "#fff", width: 36, height: 36, borderRadius: 6,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 2,
        }}
      >
        <Maximize2 size={15} />
      </button>

      {/* zoom hint */}
      {!zoomed && (
        <div style={{
          position: "absolute", bottom: 14, left: 14,
          background: "rgba(0,0,0,0.55)", padding: "4px 10px",
          borderRadius: 4, fontSize: 11, color: "rgba(255,255,255,0.6)",
          display: "flex", alignItems: "center", gap: 5, pointerEvents: "none",
          letterSpacing: "0.06em",
        }}>
          <ZoomIn size={12} /> Hover to zoom
        </div>
      )}

      {/* view label */}
      <div style={{
        position: "absolute", bottom: 14, right: 14,
        background: "rgba(0,0,0,0.55)", padding: "4px 10px",
        borderRadius: 4, fontSize: 11, color: "rgba(255,255,255,0.55)",
        letterSpacing: "0.08em", textTransform: "uppercase",
        pointerEvents: "none",
      }}>
        {image.label}
      </div>
    </div>
  );
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ images, index, colorKey, onClose, onPrev, onNext }) {
  const variant = COLOR_VARIANTS[colorKey];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape")     onClose();
      if (e.key === "ArrowLeft")  onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  const img = images[index];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.96)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}
    >
      {/* close */}
      <button onClick={onClose} aria-label="Close"
        style={{
          position: "absolute", top: 18, right: 18,
          background: "none", border: "1px solid rgba(255,255,255,0.25)",
          color: "#fff", width: 42, height: 42, borderRadius: "50%",
          cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center",
        }}>✕</button>

      {/* prev */}
      <button onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="Previous"
        style={{
          position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)",
          background: "none", border: "1px solid rgba(255,255,255,0.2)",
          color: "#fff", width: 46, height: 46, borderRadius: "50%",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
        <ChevronLeft size={22} />
      </button>

      {/* image */}
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(75vw, 780px)", height: "min(80vh, 780px)", position: "relative" }}
      >
        <ProductPhoto
          webp={img.webp} jpg={img.jpg}
          alt={img.label} label={img.label}
          bg={variant.bg}
          style={{ objectFit: "contain" }}
        />
      </motion.div>

      {/* label */}
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 14,
        letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {img.label} · {index + 1}/{images.length}
      </p>

      {/* thumb strip */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ display: "flex", gap: 8, marginTop: 16 }}
      >
        {images.map((im, i) => (
          <div key={im.id} style={{
            width: 46, height: 46, borderRadius: 4, overflow: "hidden",
            border: `2px solid ${i === index ? "#C9A84C" : "transparent"}`,
            opacity: i === index ? 1 : 0.45,
            cursor: "pointer", background: "#222", flexShrink: 0,
          }}
            onClick={() => { /* parent handles via onIndex */ }}
          >
            <img src={im.webp} alt={im.label}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => { e.target.src = im.jpg; }} />
          </div>
        ))}
      </div>

      {/* next */}
      <button onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Next"
        style={{
          position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)",
          background: "none", border: "1px solid rgba(255,255,255,0.2)",
          color: "#fff", width: 46, height: 46, borderRadius: "50%",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        }}>
        <ChevronRight size={22} />
      </button>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MensCollectionLanding({ products, onAdd, onSelect }) {
  // ── state ──────────────────────────────────────────────────────────────────
  const [colorKey,    setColorKey]    = useState("stone-grey");
  const [imgIndex,    setImgIndex]    = useState(0);
  const [size,        setSize]        = useState("M");
  const [qty,         setQty]         = useState(1);
  const [lightbox,    setLightbox]    = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  // mobile swipe
  const touchX = useRef(null);

  const variant = COLOR_VARIANTS[colorKey];
  const images  = getImages(colorKey);
  const active  = images[imgIndex];

  const goNext = useCallback(() => setImgIndex(i => (i + 1) % images.length), [images.length]);
  const goPrev = useCallback(() => setImgIndex(i => (i - 1 + images.length) % images.length), [images.length]);

  useEffect(() => { setImgIndex(0); }, [colorKey]);

  // find featured product
  const featured =
    products.find(p => p.id === "mg69-utility-set") ||
    products.find(p => p.id === "mg69-luxury-set")  ||
    products.find(p => p.category === "Men")         ||
    products[0];

  const menProducts = products.filter(p => p.category === "Men").slice(0, 4);

  if (!featured) return null;

  function handleAddToCart() {
    onAdd(featured, size, variant.label, qty);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        .mcl-page { background: #0a0a0a; color: #fff; font-family: inherit; }

        /* ── arrivals grid ── */
        .mcl-arrivals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }
        .mcl-arrival-card {
          background: none; border: none; cursor: pointer; text-align: left;
          border-radius: 8px; overflow: hidden;
        }
        .mcl-arrival-card:hover .mcl-arrival-img { transform: scale(1.04); }
        .mcl-arrival-img {
          width: 100%; aspect-ratio: 3/4; object-fit: cover; display: block;
          transition: transform 0.5s; background: #1a1a1a;
        }

        /* ── 3-col product layout ── */
        .mcl-product-layout {
          display: grid;
          grid-template-columns: 88px 1fr 380px;
          gap: 0;
          align-items: start;
        }
        @media (max-width: 1100px) {
          .mcl-product-layout {
            grid-template-columns: 72px 1fr 320px;
          }
        }
        @media (max-width: 860px) {
          .mcl-product-layout {
            grid-template-columns: 1fr;
          }
          .mcl-thumb-col {
            flex-direction: row !important;
            overflow-x: auto;
            overflow-y: visible !important;
            max-height: none !important;
          }
          .mcl-thumb-item { width: 64px !important; height: 80px !important; flex-shrink: 0; }
          .mcl-hero-col { height: 80vw !important; max-height: 520px !important; }
          .mcl-info-col { padding-left: 0 !important; padding-top: 24px; }
        }

        /* ── thumb scrollbar ── */
        .mcl-thumb-col::-webkit-scrollbar { width: 3px; height: 3px; }
        .mcl-thumb-col::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }

        /* ── size buttons ── */
        .mcl-size-btn {
          background: none; border: 1px solid #2a2a2a; color: #aaa;
          padding: 9px 0; border-radius: 4px; font-size: 12px;
          font-weight: 600; letter-spacing: 0.06em; cursor: pointer;
          transition: all 0.15s; font-family: inherit;
        }
        .mcl-size-btn:hover:not(:disabled) { border-color: #C9A84C; color: #C9A84C; }
        .mcl-size-btn.active { background: #C9A84C; border-color: #C9A84C; color: #000; }
        .mcl-size-btn:disabled { opacity: 0.28; cursor: not-allowed; text-decoration: line-through; }

        /* ── color swatches ── */
        .mcl-swatch {
          width: 28px; height: 28px; border-radius: 50%; border: none;
          cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; padding: 0;
        }
        .mcl-swatch:hover { transform: scale(1.12); }
        .mcl-swatch.active {
          box-shadow: 0 0 0 2px #0a0a0a, 0 0 0 4px #C9A84C;
        }

        /* ── CTA buttons ── */
        .mcl-add-btn {
          background: #C9A84C; color: #000; border: none;
          font-weight: 700; letter-spacing: 0.1em; font-size: 13px;
          cursor: pointer; border-radius: 4px; font-family: inherit;
          transition: background 0.2s, transform 0.1s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .mcl-add-btn:hover { background: #d4b560; }
        .mcl-add-btn:active { transform: scale(0.98); }
        .mcl-add-btn.done { background: #1e6b1e; color: #fff; }
        .mcl-wish-btn {
          background: none; border: 1px solid #2a2a2a; color: #aaa;
          border-radius: 4px; cursor: pointer; font-family: inherit;
          display: flex; align-items: center; justify-content: center;
          transition: border-color 0.2s, color 0.2s;
        }
        .mcl-wish-btn:hover { border-color: #C9A84C; color: #C9A84C; }
        .mcl-qty-btn {
          background: none; border: none; color: #fff; cursor: pointer;
          width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
          font-size: 18px; transition: color 0.15s;
        }
        .mcl-qty-btn:hover { color: #C9A84C; }
        .mcl-qty-btn:disabled { opacity: 0.3; cursor: default; }

        /* ── thumb button ── */
        .mcl-thumb-btn {
          background: none; border: none; padding: 0; cursor: pointer;
          display: block; width: 100%;
        }
        .mcl-thumb-btn:focus-visible { outline: 2px solid #C9A84C; outline-offset: 2px; border-radius: 4px; }
      `}</style>

      <div className="mcl-page" id="men">

        {/* ── BREADCRUMB ─────────────────────────────────────────────────── */}
        <div style={{
          padding: "14px 32px", borderBottom: "1px solid #161616",
          display: "flex", gap: 8, alignItems: "center",
        }}>
          {["Home", "Men", "Drop 001", "MG69 Utility Set"].map((c, i, arr) => (
            <span key={c} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <a href={i === 0 ? "#home" : i === 1 ? "#men" : "#drop-001"}
                style={{
                  fontSize: 11, color: i === arr.length - 1 ? "#fff" : "#555",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                  textDecoration: "none",
                }}>{c}</a>
              {i < arr.length - 1 && <span style={{ color: "#333", fontSize: 11 }}>/</span>}
            </span>
          ))}
        </div>

        {/* ── NEW ARRIVALS STRIP ──────────────────────────────────────────── */}
        {menProducts.length > 0 && (
          <div style={{ padding: "40px 32px 32px", borderBottom: "1px solid #111" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#C9A84C",
                  textTransform: "uppercase", margin: "0 0 6px" }}>Men / Drop 001</p>
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>
                  New Arrivals
                </h2>
              </div>
              <a href="#shop" style={{ fontSize: 12, color: "#666", letterSpacing: "0.1em",
                textTransform: "uppercase", textDecoration: "none", borderBottom: "1px solid #333",
                paddingBottom: 2 }}>View All</a>
            </div>
            <div className="mcl-arrivals-grid">
              {menProducts.map(p => (
                <button key={p.id} className="mcl-arrival-card" onClick={() => onSelect(p)} type="button">
                  <div style={{ width: "100%", aspectRatio: "3/4", overflow: "hidden", background: "#1a1a1a", borderRadius: 6 }}>
                    <img
                      src={p.images?.[0]?.src || p.images?.[0] || p.image}
                      alt={p.name}
                      className="mcl-arrival-img"
                      loading="lazy"
                    />
                  </div>
                  <div style={{ padding: "10px 4px 4px" }}>
                    <p style={{ fontSize: 10, color: "#C9A84C", letterSpacing: "0.12em",
                      textTransform: "uppercase", margin: "0 0 4px" }}>{p.collection}</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>{p.name}</p>
                    <p style={{ fontSize: 13, color: "#C9A84C", fontWeight: 700, margin: 0 }}>
                      {money(p.price)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── PREMIUM PRODUCT PAGE ────────────────────────────────────────── */}
        <div style={{ padding: "40px 32px 60px" }}>

          {/* section label */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#C9A84C",
              textTransform: "uppercase", margin: "0 0 6px" }}>Featured Product</p>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>
              MG69 Utility Set — Full Gallery
            </h2>
          </div>

          {/* 3-column layout: thumbs | hero | info */}
          <div className="mcl-product-layout">

            {/* ── LEFT: 8 thumbnails ─────────────────────────────────────── */}
            <div
              className="mcl-thumb-col"
              style={{
                display: "flex", flexDirection: "column",
                gap: 8, maxHeight: 660, overflowY: "auto",
                paddingRight: 10,
              }}
            >
              {images.map((img, i) => (
                <button
                  key={img.id}
                  className="mcl-thumb-btn"
                  onClick={() => setImgIndex(i)}
                  aria-label={img.label}
                  aria-pressed={i === imgIndex}
                >
                  <div
                    className="mcl-thumb-item"
                    style={{
                      width: 72, height: 90, borderRadius: 4, overflow: "hidden",
                      border: `2px solid ${i === imgIndex ? "#C9A84C" : "transparent"}`,
                      background: "#161616", transition: "border-color 0.15s",
                    }}
                  >
                    <ProductPhoto
                      webp={img.webp} jpg={img.jpg}
                      alt={img.label} label={img.label}
                      bg={variant.bg}
                    />
                  </div>
                </button>
              ))}
            </div>

            {/* ── CENTER: Hero + arrows ──────────────────────────────────── */}
            <div style={{ position: "sticky", top: 20, marginLeft: 12 }}>
              <div
                className="mcl-hero-col"
                style={{
                  height: 660, background: "#161616",
                  borderRadius: 8, overflow: "hidden", position: "relative",
                }}
                onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
                onTouchEnd={(e) => {
                  if (touchX.current === null) return;
                  const d = touchX.current - e.changedTouches[0].clientX;
                  if (Math.abs(d) > 40) d > 0 ? goNext() : goPrev();
                  touchX.current = null;
                }}
              >
                <ZoomHero image={active} colorKey={colorKey} onLightbox={() => setLightbox(true)} />

                {/* Prev / Next */}
                <button onClick={goPrev} aria-label="Previous image"
                  style={{
                    position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                    background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.12)",
                    color: "#fff", width: 36, height: 36, borderRadius: "50%",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 2,
                  }}>
                  <ChevronLeft size={18} />
                </button>
                <button onClick={goNext} aria-label="Next image"
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.12)",
                    color: "#fff", width: 36, height: 36, borderRadius: "50%",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 2,
                  }}>
                  <ChevronRight size={18} />
                </button>

                {/* Mobile swipe dots */}
                <div style={{
                  position: "absolute", bottom: 14, left: 0, right: 0,
                  display: "flex", justifyContent: "center", gap: 6, pointerEvents: "none",
                }}>
                  {images.map((_, i) => (
                    <div key={i} style={{
                      width: i === imgIndex ? 18 : 6, height: 6, borderRadius: 3,
                      background: i === imgIndex ? "#C9A84C" : "rgba(255,255,255,0.25)",
                      transition: "width 0.2s",
                    }} />
                  ))}
                </div>
              </div>

              {/* counter */}
              <p style={{ textAlign: "center", fontSize: 11, color: "#444",
                letterSpacing: "0.08em", marginTop: 10 }}>
                {imgIndex + 1} / {images.length}
              </p>
            </div>

            {/* ── RIGHT: Product info ────────────────────────────────────── */}
            <div className="mcl-info-col" style={{ paddingLeft: 36 }}>

              {/* tag */}
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 10, letterSpacing: "0.16em", color: "#C9A84C",
                  textTransform: "uppercase", borderBottom: "1px solid #C9A84C", paddingBottom: 2 }}>
                  Drop 001
                </span>
                <span style={{ fontSize: 10, color: "#444", letterSpacing: "0.1em",
                  textTransform: "uppercase" }}>· Limited Edition</span>
              </div>

              {/* name */}
              <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em",
                margin: "0 0 4px", lineHeight: 1.1 }}>
                MG69 Utility Set
              </h1>
              <p style={{ fontSize: 12, letterSpacing: "0.16em", color: "#555",
                textTransform: "uppercase", margin: "0 0 16px" }}>
                {variant.label} Edition
              </p>

              {/* price + stars */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: "#C9A84C" }}>
                  {money(featured.price)}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: "#C9A84C", letterSpacing: 2, fontSize: 13 }}>★★★★★</span>
                  <span style={{ fontSize: 11, color: "#444" }}>(128)</span>
                </div>
              </div>

              <p style={{ fontSize: 13, color: "#888", lineHeight: 1.7, marginBottom: 24 }}>
                {featured.description || "Premium streetwear set crafted for those who move different. 400GSM heavyweight cotton. Oversized fit with utility cargo detailing."}
              </p>

              {/* feature pills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
                {["400GSM Cotton", "Oversized Fit", "Limited Drop", "Luxury Streetwear"].map(f => (
                  <span key={f} style={{
                    fontSize: 10, letterSpacing: "0.08em", padding: "4px 10px",
                    border: "1px solid #222", borderRadius: 100, color: "#666",
                    textTransform: "uppercase",
                  }}>{f}</span>
                ))}
              </div>

              <div style={{ height: 1, background: "#161616", marginBottom: 22 }} />

              {/* ── COLOR ── */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, letterSpacing: "0.12em",
                    textTransform: "uppercase", color: "#777" }}>Color</span>
                  <span style={{ fontSize: 12, color: "#C9A84C", fontWeight: 600 }}>
                    {variant.label}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  {Object.entries(COLOR_VARIANTS).map(([key, v]) => (
                    <div key={key} style={{ textAlign: "center" }}>
                      <button
                        className={`mcl-swatch${colorKey === key ? " active" : ""}`}
                        onClick={() => setColorKey(key)}
                        aria-label={v.label}
                        style={{ background: v.hex, display: "block", margin: "0 auto 5px" }}
                      />
                      <span style={{ fontSize: 9, color: "#555", letterSpacing: "0.04em",
                        textTransform: "uppercase" }}>{v.label.split(" ")[0]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── SIZE ── */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, letterSpacing: "0.12em",
                    textTransform: "uppercase", color: "#777" }}>Size</span>
                  <button style={{ background: "none", border: "none", color: "#C9A84C",
                    fontSize: 11, cursor: "pointer", textDecoration: "underline",
                    textUnderlineOffset: 3, fontFamily: "inherit" }}>
                    Size Guide
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6 }}>
                  {SIZES.map(s => (
                    <button
                      key={s}
                      className={`mcl-size-btn${size === s ? " active" : ""}`}
                      disabled={SOLD_OUT.includes(s)}
                      onClick={() => setSize(s)}
                    >{s}</button>
                  ))}
                </div>
              </div>

              {/* ── QTY ── */}
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 11, letterSpacing: "0.12em",
                  textTransform: "uppercase", color: "#777", display: "block", marginBottom: 10 }}>
                  Quantity
                </span>
                <div style={{
                  display: "inline-flex", alignItems: "center",
                  border: "1px solid #2a2a2a", borderRadius: 4, overflow: "hidden",
                }}>
                  <button className="mcl-qty-btn" disabled={qty <= 1}
                    onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease">
                    <Minus size={14} />
                  </button>
                  <span style={{ width: 40, textAlign: "center", fontWeight: 700, fontSize: 15 }}>
                    {qty}
                  </span>
                  <button className="mcl-qty-btn" disabled={qty >= 10}
                    onClick={() => setQty(q => Math.min(10, q + 1))} aria-label="Increase">
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* ── CTA row ── */}
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <button
                  className={`mcl-add-btn${addedToCart ? " done" : ""}`}
                  onClick={handleAddToCart}
                  style={{ flex: 1, height: 50 }}
                >
                  {addedToCart ? "✓ Added to Cart" : `Add to Cart — ${money(featured.price * qty)}`}
                </button>
                <button
                  className="mcl-wish-btn"
                  onClick={() => onSelect(featured)}
                  style={{ width: 50, height: 50 }}
                  aria-label="View product detail"
                  title="View full detail"
                >
                  <Maximize2 size={18} />
                </button>
              </div>

              {/* secure badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 24 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="#444" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span style={{ fontSize: 10, color: "#444", letterSpacing: "0.08em",
                  textTransform: "uppercase" }}>Secure Checkout Guaranteed</span>
              </div>

              <div style={{ height: 1, background: "#161616", marginBottom: 20 }} />

              {/* trust grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {[
                  { label: "Premium Fabric",   sub: "400 GSM Heavyweight" },
                  { label: "Secure Payment",   sub: "100% Safe & Secure" },
                  { label: "Fast Shipping",    sub: "Worldwide Delivery" },
                  { label: "Easy Returns",     sub: "14 Day Policy" },
                ].map(b => (
                  <div key={b.label} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%",
                      background: "#C9A84C", marginTop: 5, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#ccc",
                        margin: 0, letterSpacing: "0.04em" }}>{b.label}</p>
                      <p style={{ fontSize: 11, color: "#444", margin: "2px 0 0" }}>{b.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>{/* end info col */}
          </div>{/* end 3-col */}
        </div>{/* end product section */}

        {/* ── LIGHTBOX ─────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {lightbox && (
            <Lightbox
              images={images}
              index={imgIndex}
              colorKey={colorKey}
              onClose={() => setLightbox(false)}
              onPrev={goPrev}
              onNext={goNext}
            />
          )}
        </AnimatePresence>

      </div>{/* end mcl-page */}
    </>
  );
}
