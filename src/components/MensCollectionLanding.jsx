import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, Minus, Plus, ZoomIn } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const money = (v) => `$${Number(v).toFixed(2)}`;
const SOLD_OUT = ["XS"];
const COLOR_BG = { "Stone Grey": "#c8c8b8", "Matte Black": "#2a2a2a", "Dark Olive": "#5a5a38" };

function Tile({ label, bg }) {
  return (
    <div style={{ width:"100%", height:"100%", background: bg||"#1e1e1e", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6 }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
      <span style={{ fontSize:9, color:"rgba(255,255,255,0.25)", textAlign:"center", padding:"0 6px", lineHeight:1.3, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</span>
    </div>
  );
}

function ProductPhoto({ src, alt, label, bg, style={} }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  useEffect(() => { setLoaded(false); setErrored(false); }, [src]);
  return (
    <div style={{ width:"100%", height:"100%", position:"relative", overflow:"hidden" }}>
      {(!loaded || errored) && <Tile label={label} bg={bg} />}
      {src && !errored && <img src={src} alt={alt} style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", opacity:loaded?1:0, transition:"opacity 0.3s", ...style }} onLoad={() => setLoaded(true)} onError={() => setErrored(true)} />}
    </div>
  );
}

function ZoomHero({ image, bg, onLightbox }) {
  const [zoomed, setZoomed] = useState(false);
  const [pos, setPos] = useState({ x:50, y:50 });
  const ref = useRef(null);
  const onMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x:((e.clientX-r.left)/r.width)*100, y:((e.clientY-r.top)/r.height)*100 });
  };
  return (
    <div ref={ref} onMouseEnter={() => setZoomed(true)} onMouseLeave={() => setZoomed(false)} onMouseMove={onMove}
      style={{ width:"100%", height:"100%", overflow:"hidden", position:"relative", cursor:zoomed?"zoom-out":"zoom-in" }}>
      <div style={{ width:"100%", height:"100%", transformOrigin:`${pos.x}% ${pos.y}%`, transform:zoomed?"scale(2)":"scale(1)", transition:zoomed?"transform 0.08s":"transform 0.3s" }}>
        <ProductPhoto src={image?.src} alt={image?.label} label={image?.label} bg={bg} />
      </div>
      <button onClick={(e) => { e.stopPropagation(); onLightbox(); }} aria-label="Open fullscreen"
        style={{ position:"absolute", top:14, right:14, background:"rgba(0,0,0,0.55)", border:"1px solid rgba(255,255,255,0.15)", color:"#fff", width:36, height:36, borderRadius:6, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2 }}>
        <Maximize2 size={15} />
      </button>
      {!zoomed && <div style={{ position:"absolute", bottom:14, left:14, background:"rgba(0,0,0,0.55)", padding:"4px 10px", borderRadius:4, fontSize:11, color:"rgba(255,255,255,0.55)", display:"flex", alignItems:"center", gap:5, pointerEvents:"none", letterSpacing:"0.06em" }}><ZoomIn size={12} /> Hover to zoom</div>}
      <div style={{ position:"absolute", bottom:14, right:14, background:"rgba(0,0,0,0.55)", padding:"4px 10px", borderRadius:4, fontSize:11, color:"rgba(255,255,255,0.45)", letterSpacing:"0.08em", textTransform:"uppercase", pointerEvents:"none" }}>{image?.label}</div>
    </div>
  );
}

function Lightbox({ images, index, bg, onClose, onPrev, onNext }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if(e.key==="Escape") onClose(); if(e.key==="ArrowLeft") onPrev(); if(e.key==="ArrowRight") onNext(); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose, onPrev, onNext]);
  const img = images[index];
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} onClick={onClose}
      style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.96)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
      <button onClick={onClose} style={{ position:"absolute", top:18, right:18, background:"none", border:"1px solid rgba(255,255,255,0.25)", color:"#fff", width:42, height:42, borderRadius:"50%", cursor:"pointer", fontSize:20, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
      <button onClick={(e) => { e.stopPropagation(); onPrev(); }} style={{ position:"absolute", left:18, top:"50%", transform:"translateY(-50%)", background:"none", border:"1px solid rgba(255,255,255,0.2)", color:"#fff", width:46, height:46, borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><ChevronLeft size={22} /></button>
      <motion.div key={index} initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.2 }} onClick={(e) => e.stopPropagation()} style={{ width:"min(75vw,780px)", height:"min(80vh,780px)", position:"relative" }}>
        <ProductPhoto src={img?.src} alt={img?.label} label={img?.label} bg={bg} style={{ objectFit:"contain" }} />
      </motion.div>
      <p style={{ color:"rgba(255,255,255,0.4)", fontSize:12, marginTop:14, letterSpacing:"0.1em", textTransform:"uppercase" }}>{img?.label} · {index+1}/{images.length}</p>
      <div onClick={(e) => e.stopPropagation()} style={{ display:"flex", gap:8, marginTop:16 }}>
        {images.map((im,i) => (
          <div key={i} style={{ width:46, height:46, borderRadius:4, overflow:"hidden", border:`2px solid ${i===index?"#C9A84C":"transparent"}`, opacity:i===index?1:0.4, background:"#222", flexShrink:0 }}>
            <img src={im.src} alt={im.label} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={(e) => { e.target.style.display="none"; }} />
          </div>
        ))}
      </div>
      <button onClick={(e) => { e.stopPropagation(); onNext(); }} style={{ position:"absolute", right:18, top:"50%", transform:"translateY(-50%)", background:"none", border:"1px solid rgba(255,255,255,0.2)", color:"#fff", width:46, height:46, borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><ChevronRight size={22} /></button>
    </motion.div>
  );
}

export default function MensCollectionLanding({ products, onAdd, onSelect }) {
  const featured = products.find(p => p.id==="mg69-utility-set") || products.find(p => p.category==="Men") || products[0];
  const menProducts = products.filter(p => p.category==="Men").slice(0,4);
  const defaultVariant = featured?.colorVariants?.[0];
  const [activeVariantName, setActiveVariantName] = useState(defaultVariant?.name||"");
  const [imgIndex, setImgIndex] = useState(0);
  const [size, setSize] = useState("M");
  const [qty, setQty] = useState(1);
  const [lightbox, setLightbox] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const touchX = useRef(null);
  const activeVariant = featured?.colorVariants?.find(v => v.name===activeVariantName) || featured?.colorVariants?.[0];
  const fallbackGallery = featured?.images?.length
    ? featured.images
    : featured?.image
      ? [{ label: "Front View", src: featured.image }]
      : [{ label: "Awaiting Image", src: "" }];
  const images = activeVariant?.gallery?.length ? activeVariant.gallery : fallbackGallery;
  const active = images[Math.min(imgIndex, Math.max(images.length - 1, 0))] || images[0];
  const swatches = featured?.colorVariants?.length
    ? featured.colorVariants
    : (featured?.colors || []).map((color) => {
        const name = typeof color === "string" ? color : color.name;
        return { name, hex: typeof color === "string" ? COLOR_BG[color] || "#2a2a2a" : color.hex || COLOR_BG[name] || "#2a2a2a" };
      });
  const displayVariantName = activeVariant?.name || activeVariantName || swatches[0]?.name || "Matte Black";
  const bg = COLOR_BG[displayVariantName] || "#1e1e1e";
  const goNext = useCallback(() => setImgIndex(i => (images.length ? (i+1)%images.length : 0)), [images.length]);
  const goPrev = useCallback(() => setImgIndex(i => (images.length ? (i-1+images.length)%images.length : 0)), [images.length]);
  useEffect(() => { setImgIndex(0); }, [activeVariantName]);
  if (!featured) {
    return (
      <section id="men" style={{ background:"#0a0a0a", color:"#fff", padding:"56px 32px", borderTop:"1px solid #141414" }}>
        <p style={{ fontSize:11, letterSpacing:"0.18em", color:"#C9A84C", textTransform:"uppercase", margin:"0 0 8px" }}>Men / Inventory</p>
        <h2 style={{ fontSize:26, fontWeight:800, margin:"0 0 10px" }}>Men&apos;s Collection</h2>
        <p style={{ color:"#777", maxWidth:560, lineHeight:1.6, margin:"0 0 20px" }}>
          No men&apos;s products are live yet. Add products, stock, and image angles from the admin dashboard to publish this collection.
        </p>
        <a href="#admin" style={{ color:"#000", background:"#C9A84C", borderRadius:5, padding:"12px 18px", textDecoration:"none", fontSize:12, fontWeight:800, letterSpacing:"0.08em", textTransform:"uppercase", display:"inline-block" }}>
          Open Admin Inventory
        </a>
      </section>
    );
  }

  function handleAddToCart() {
    onAdd(featured, size, displayVariantName, qty);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  return (
    <>
      <style>{`
        .mcl{background:#0a0a0a;color:#fff;font-family:inherit}
        .mcl-ag{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px}
        .mcl-ac{background:none;border:none;cursor:pointer;text-align:left;padding:0}
        .mcl-ai{width:100%;aspect-ratio:3/4;object-fit:cover;display:block;background:#1a1a1a;border-radius:6px;transition:transform 0.5s}
        .mcl-ac:hover .mcl-ai{transform:scale(1.04)}
        .mcl-layout{display:grid;grid-template-columns:80px 1fr 360px;gap:0;align-items:start}
        @media(max-width:1050px){.mcl-layout{grid-template-columns:70px 1fr 300px}}
        @media(max-width:820px){
          .mcl-layout{grid-template-columns:1fr}
          .mcl-thumbs{flex-direction:row!important;overflow-x:auto;overflow-y:visible!important;max-height:none!important;padding-right:0!important;padding-bottom:4px;gap:8px!important}
          .mcl-ti{width:60px!important;height:75px!important;flex-shrink:0}
          .mcl-hero{height:80vw!important;max-height:500px!important;margin-left:0!important}
          .mcl-info{padding-left:0!important;padding-top:24px}
        }
        .mcl-thumbs::-webkit-scrollbar{width:3px;height:3px}
        .mcl-thumbs::-webkit-scrollbar-thumb{background:#2a2a2a;border-radius:2px}
        .mcl-sb{background:none;border:1px solid #242424;color:#999;padding:9px 0;border-radius:4px;font-size:12px;font-weight:600;letter-spacing:0.06em;cursor:pointer;transition:all 0.15s;font-family:inherit;width:100%}
        .mcl-sb:hover:not(:disabled){border-color:#C9A84C;color:#C9A84C}
        .mcl-sb.active{background:#C9A84C;border-color:#C9A84C;color:#000}
        .mcl-sb:disabled{opacity:0.25;cursor:not-allowed;text-decoration:line-through}
        .mcl-sw{width:28px;height:28px;border-radius:50%;border:none;cursor:pointer;padding:0;transition:transform 0.15s,box-shadow 0.15s}
        .mcl-sw:hover{transform:scale(1.12)}
        .mcl-sw.active{box-shadow:0 0 0 2px #0a0a0a,0 0 0 4px #C9A84C}
        .mcl-ab{background:#C9A84C;color:#000;border:none;font-weight:700;letter-spacing:0.1em;font-size:13px;cursor:pointer;border-radius:4px;font-family:inherit;transition:background 0.2s,transform 0.1s;display:flex;align-items:center;justify-content:center;gap:8px}
        .mcl-ab:hover{background:#d4b560}
        .mcl-ab:active{transform:scale(0.98)}
        .mcl-ab.done{background:#1e6b1e;color:#fff}
        .mcl-wb{background:none;border:1px solid #242424;color:#999;border-radius:4px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color 0.2s,color 0.2s}
        .mcl-wb:hover{border-color:#C9A84C;color:#C9A84C}
        .mcl-qb{background:none;border:none;color:#fff;cursor:pointer;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:18px;transition:color 0.15s}
        .mcl-qb:hover{color:#C9A84C}
        .mcl-qb:disabled{opacity:0.25;cursor:default}
        .mcl-tb{background:none;border:none;padding:0;cursor:pointer;display:block;width:100%}
        .mcl-tb:focus-visible{outline:2px solid #C9A84C;outline-offset:2px;border-radius:4px}
      `}</style>

      <div className="mcl" id="men">
        <div style={{ padding:"14px 32px", borderBottom:"1px solid #141414", display:"flex", gap:8, alignItems:"center" }}>
          {["Home","Men","Drop 001",featured.name].map((c,i,arr) => (
            <span key={c} style={{ display:"flex", alignItems:"center", gap:8 }}>
              <a href={i===0?"#home":i===1?"#men":"#drop-001"} style={{ fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", textDecoration:"none", color:i===arr.length-1?"#fff":"#555" }}>{c}</a>
              {i<arr.length-1 && <span style={{ color:"#2a2a2a", fontSize:11 }}>/</span>}
            </span>
          ))}
        </div>

        {menProducts.length > 0 && (
          <div style={{ padding:"40px 32px 32px", borderBottom:"1px solid #0e0e0e" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:20 }}>
              <div>
                <p style={{ fontSize:11, letterSpacing:"0.18em", color:"#C9A84C", textTransform:"uppercase", margin:"0 0 6px" }}>Men / Drop 001</p>
                <h2 style={{ fontSize:22, fontWeight:700, margin:0, letterSpacing:"-0.01em" }}>New Arrivals</h2>
              </div>
              <a href="#shop" style={{ fontSize:12, color:"#555", letterSpacing:"0.1em", textTransform:"uppercase", textDecoration:"none", borderBottom:"1px solid #2a2a2a", paddingBottom:2 }}>View All</a>
            </div>
            <div className="mcl-ag">
              {menProducts.map(p => (
                <button key={p.id} className="mcl-ac" onClick={() => onSelect(p)} type="button">
                  <div style={{ overflow:"hidden", borderRadius:6 }}>
                    <img src={p.images?.[0]?.src||p.image} alt={p.name} className="mcl-ai" loading="lazy" />
                  </div>
                  <div style={{ padding:"10px 2px 4px" }}>
                    <p style={{ fontSize:10, color:"#C9A84C", letterSpacing:"0.12em", textTransform:"uppercase", margin:"0 0 4px" }}>{p.collection}</p>
                    <p style={{ fontSize:13, fontWeight:600, color:"#fff", margin:"0 0 4px" }}>{p.name}</p>
                    <p style={{ fontSize:13, color:"#C9A84C", fontWeight:700, margin:0 }}>{money(p.price)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ padding:"40px 32px 60px" }}>
          <div style={{ marginBottom:28 }}>
            <p style={{ fontSize:11, letterSpacing:"0.18em", color:"#C9A84C", textTransform:"uppercase", margin:"0 0 6px" }}>Featured Product</p>
            <h2 style={{ fontSize:20, fontWeight:700, margin:0, letterSpacing:"-0.01em" }}>{featured.name} — Full Gallery</h2>
          </div>

          <div className="mcl-layout">
            <div className="mcl-thumbs" style={{ display:"flex", flexDirection:"column", gap:8, maxHeight:640, overflowY:"auto", paddingRight:8 }}>
              {images.map((img,i) => (
                <button key={`${img.label}-${i}`} className="mcl-tb" onClick={() => setImgIndex(i)} aria-label={img.label} aria-pressed={i===imgIndex}>
                  <div className="mcl-ti" style={{ width:68, height:85, borderRadius:4, overflow:"hidden", border:`2px solid ${i===imgIndex?"#C9A84C":"transparent"}`, background:"#161616", transition:"border-color 0.15s" }}>
                    <ProductPhoto src={img.src} alt={img.label} label={img.label} bg={bg} />
                  </div>
                </button>
              ))}
            </div>

            <div style={{ position:"sticky", top:20, marginLeft:12 }}>
              <div className="mcl-hero" style={{ height:640, background:"#161616", borderRadius:8, overflow:"hidden", position:"relative" }}
                onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
                onTouchEnd={(e) => { if(touchX.current===null) return; const d=touchX.current-e.changedTouches[0].clientX; if(Math.abs(d)>40) d>0?goNext():goPrev(); touchX.current=null; }}>
                <ZoomHero image={active} bg={bg} onLightbox={() => setLightbox(true)} />
                <button onClick={goPrev} aria-label="Previous" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", background:"rgba(0,0,0,0.5)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff", width:34, height:34, borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2 }}><ChevronLeft size={16} /></button>
                <button onClick={goNext} aria-label="Next" style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"rgba(0,0,0,0.5)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff", width:34, height:34, borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2 }}><ChevronRight size={16} /></button>
                <div style={{ position:"absolute", bottom:14, left:0, right:0, display:"flex", justifyContent:"center", gap:5, pointerEvents:"none" }}>
                  {images.map((_,i) => <div key={i} style={{ width:i===imgIndex?16:5, height:5, borderRadius:3, background:i===imgIndex?"#C9A84C":"rgba(255,255,255,0.2)", transition:"width 0.2s" }} />)}
                </div>
              </div>
              <p style={{ textAlign:"center", fontSize:11, color:"#3a3a3a", letterSpacing:"0.08em", marginTop:10 }}>{Math.min(imgIndex + 1, images.length)} / {images.length}</p>
            </div>

            <div className="mcl-info" style={{ paddingLeft:36 }}>
              <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                <span style={{ fontSize:10, letterSpacing:"0.16em", color:"#C9A84C", textTransform:"uppercase", borderBottom:"1px solid #C9A84C", paddingBottom:2 }}>Drop 001</span>
                <span style={{ fontSize:10, color:"#3a3a3a", letterSpacing:"0.1em", textTransform:"uppercase" }}>· Limited Edition</span>
              </div>
              <h1 style={{ fontSize:26, fontWeight:800, letterSpacing:"-0.02em", margin:"0 0 4px", lineHeight:1.1 }}>{featured.name}</h1>
              <p style={{ fontSize:12, letterSpacing:"0.16em", color:"#555", textTransform:"uppercase", margin:"0 0 16px" }}>{displayVariantName} Edition</p>
              <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
                <span style={{ fontSize:24, fontWeight:700, color:"#C9A84C" }}>{money(featured.price)}</span>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ color:"#C9A84C", letterSpacing:2, fontSize:13 }}>★★★★★</span>
                  <span style={{ fontSize:11, color:"#3a3a3a" }}>(128)</span>
                </div>
              </div>
              <p style={{ fontSize:13, color:"#777", lineHeight:1.7, marginBottom:22 }}>{featured.description}</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:22 }}>
                {Object.entries(featured.specs||{}).map(([k,v]) => (
                  <span key={k} style={{ fontSize:10, letterSpacing:"0.07em", padding:"4px 10px", border:"1px solid #1e1e1e", borderRadius:100, color:"#555", textTransform:"uppercase" }}>{k}: {v}</span>
                ))}
              </div>
              <div style={{ height:1, background:"#141414", marginBottom:20 }} />

              <div style={{ marginBottom:20 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <span style={{ fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase", color:"#666" }}>Color</span>
                  <span style={{ fontSize:12, color:"#C9A84C", fontWeight:600 }}>{displayVariantName}</span>
                </div>
                <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                  {swatches.map(v => (
                    <div key={v.name} style={{ textAlign:"center" }}>
                      <button className={`mcl-sw${displayVariantName===v.name?" active":""}`} onClick={() => setActiveVariantName(v.name)} aria-label={v.name} style={{ background:v.hex, display:"block", margin:"0 auto 5px" }} />
                      <span style={{ fontSize:9, color:"#444", letterSpacing:"0.04em", textTransform:"uppercase" }}>{v.name.split(" ")[0]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:20 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                  <span style={{ fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase", color:"#666" }}>Size</span>
                  <button style={{ background:"none", border:"none", color:"#C9A84C", fontSize:11, cursor:"pointer", textDecoration:"underline", textUnderlineOffset:3, fontFamily:"inherit" }}>Size Guide</button>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:`repeat(${featured.sizes?.length||6},1fr)`, gap:6 }}>
                  {(featured.sizes||["S","M","L","XL","XXL"]).map(s => (
                    <button key={s} className={`mcl-sb${size===s?" active":""}`} disabled={SOLD_OUT.includes(s)} onClick={() => setSize(s)}>{s}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom:20 }}>
                <span style={{ fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase", color:"#666", display:"block", marginBottom:10 }}>Quantity</span>
                <div style={{ display:"inline-flex", alignItems:"center", border:"1px solid #1e1e1e", borderRadius:4, overflow:"hidden" }}>
                  <button className="mcl-qb" disabled={qty<=1} onClick={() => setQty(q => Math.max(1,q-1))} style={{ borderRight:"1px solid #1e1e1e" }} aria-label="Decrease"><Minus size={13} /></button>
                  <span style={{ width:40, textAlign:"center", fontWeight:700, fontSize:15 }}>{qty}</span>
                  <button className="mcl-qb" disabled={qty>=10} onClick={() => setQty(q => Math.min(10,q+1))} style={{ borderLeft:"1px solid #1e1e1e" }} aria-label="Increase"><Plus size={13} /></button>
                </div>
              </div>

              <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                <button className={`mcl-ab${addedToCart?" done":""}`} onClick={handleAddToCart} style={{ flex:1, height:50 }}>
                  {addedToCart ? "✓ Added to Cart" : `Add to Cart — ${money(featured.price*qty)}`}
                </button>
                <button className="mcl-wb" onClick={() => onSelect(featured)} style={{ width:50, height:50 }} aria-label="View full detail"><Maximize2 size={17} /></button>
              </div>

              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:22 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3a3a3a" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span style={{ fontSize:10, color:"#3a3a3a", letterSpacing:"0.08em", textTransform:"uppercase" }}>Secure Checkout Guaranteed</span>
              </div>
              <div style={{ height:1, background:"#141414", marginBottom:18 }} />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {[{label:"Premium Fabric",sub:"400 GSM Heavyweight"},{label:"Secure Payment",sub:"100% Safe & Secure"},{label:"Fast Shipping",sub:"Worldwide Delivery"},{label:"Easy Returns",sub:"14 Day Policy"}].map(b => (
                  <div key={b.label} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                    <div style={{ width:5, height:5, borderRadius:"50%", background:"#C9A84C", marginTop:6, flexShrink:0 }} />
                    <div>
                      <p style={{ fontSize:11, fontWeight:600, color:"#bbb", margin:0, letterSpacing:"0.04em" }}>{b.label}</p>
                      <p style={{ fontSize:10, color:"#3a3a3a", margin:"2px 0 0" }}>{b.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {lightbox && <Lightbox images={images} index={imgIndex} bg={bg} onClose={() => setLightbox(false)} onPrev={goPrev} onNext={goNext} />}
        </AnimatePresence>
      </div>
    </>
  );
}
