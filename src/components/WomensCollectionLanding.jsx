import { motion } from "framer-motion";
import { Maximize2 } from "lucide-react";
import { useState } from "react";

const money = (v) => `$${Number(v).toFixed(2)}`;

function ProductPhoto({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: "#15110f" }}>
      {(!loaded || errored) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(201,168,76,0.35)",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase"
          }}
        >
          MG69
        </div>
      )}
      {!errored && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.4s, transform 0.6s"
          }}
        />
      )}
    </div>
  );
}

export default function WomensCollectionLanding({ products, onAdd, onSelect }) {
  const womenProducts = products.filter((p) => p.category === "Women");
  if (!womenProducts.length) {
    return (
      <section id="women" style={{ background: "#0a0a0a", color: "#fff", padding: "56px 32px", borderTop: "1px solid #141414" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#C9A84C", textTransform: "uppercase", margin: "0 0 8px" }}>
          Women / Inventory
        </p>
        <h2 style={{ fontSize: 26, fontWeight: 800, margin: "0 0 10px" }}>Women&apos;s Collection</h2>
        <p style={{ color: "#777", maxWidth: 560, lineHeight: 1.6, margin: "0 0 20px" }}>
          No women&apos;s products are live yet. Add products, stock, and image angles from the admin dashboard to publish this collection.
        </p>
        <a
          href="#admin"
          style={{
            color: "#000",
            background: "#C9A84C",
            borderRadius: 5,
            padding: "12px 18px",
            textDecoration: "none",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            display: "inline-block"
          }}
        >
          Open Admin Inventory
        </a>
      </section>
    );
  }

  return (
    <>
      <style>{`
        .wcl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px}
        .wcl-card{background:#0d0d0d;border:1px solid #181818;border-radius:10px;overflow:hidden;display:flex;flex-direction:column}
        .wcl-img{width:100%;aspect-ratio:3/4;overflow:hidden}
        .wcl-card:hover .wcl-img img{transform:scale(1.05)}
        .wcl-add{background:#C9A84C;color:#000;border:none;font-weight:700;letter-spacing:0.08em;font-size:12px;cursor:pointer;border-radius:5px;padding:11px;font-family:inherit;flex:1;transition:background 0.2s}
        .wcl-add:hover{background:#d4b560}
        .wcl-view{background:none;border:1px solid #242424;color:#999;border-radius:5px;width:44px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color 0.2s,color 0.2s}
        .wcl-view:hover{border-color:#C9A84C;color:#C9A84C}
      `}</style>

      <div id="women" style={{ background: "#0a0a0a", color: "#fff", padding: "44px 32px 56px", borderTop: "1px solid #141414" }}>
        <div style={{ marginBottom: 26 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#C9A84C", textTransform: "uppercase", margin: "0 0 6px" }}>
            Women / Future Uniform
          </p>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.01em" }}>Women&apos;s Collection</h2>
          <p style={{ fontSize: 13, color: "#777", maxWidth: 520, lineHeight: 1.6, margin: 0 }}>
            Quiet structure, editorial weight, and clean lines. The MG69 women&apos;s edit is built to layer and move.
          </p>
        </div>

        <div className="wcl-grid">
          {womenProducts.map((product) => {
            const defaultSize = product.sizes?.find((size) => Number(product.sizeStock?.[size] ?? 1) > 0) || product.sizes?.[0];
            const defaultColor = product.colors?.[0]?.name || "";
            return (
              <motion.article
                className="wcl-card"
                key={product.id}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
              >
                <button
                  className="wcl-img"
                  onClick={() => onSelect(product)}
                  type="button"
                  style={{ border: "none", padding: 0, cursor: "pointer", background: "none" }}
                  aria-label={`View ${product.name}`}
                >
                  <ProductPhoto src={product.images?.[0]?.src || product.image} alt={product.name} />
                </button>
                <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                  <p style={{ fontSize: 10, color: "#C9A84C", letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>
                    {product.collection}
                  </p>
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{product.name}</h3>
                  <p style={{ fontSize: 12, color: "#777", margin: 0, lineHeight: 1.5, minHeight: 34 }}>{product.tagline}</p>
                  <strong style={{ fontSize: 15, color: "#C9A84C", margin: "2px 0 8px" }}>{money(product.price)}</strong>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="wcl-add" onClick={() => onAdd(product, defaultSize, defaultColor, 1)} type="button">
                      Add to bag
                    </button>
                    <button className="wcl-view" onClick={() => onSelect(product)} type="button" aria-label="View detail">
                      <Maximize2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </>
  );
}
