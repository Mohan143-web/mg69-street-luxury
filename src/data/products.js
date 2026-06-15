export const collections = ["All", "MG69 Utility Collection", "Drop 001", "Essentials", "Future Uniform"];

export const categories = ["All", "Men", "Women"];

const productAsset = (fileName) => `${import.meta.env.BASE_URL}products/${fileName}`;
const utilityAsset = (fileName) => `${import.meta.env.BASE_URL}utility/${fileName}`;
const utilityResponsiveImage = (baseName, label, cropClass = "") => ({
  label,
  src: utilityAsset(`${baseName}.jpg`),
  srcSet: `${utilityAsset(`${baseName}-768.jpg`)} 768w, ${utilityAsset(`${baseName}-1200.jpg`)} 1200w, ${utilityAsset(`${baseName}.jpg`)} 1536w`,
  sizes: "(max-width: 820px) 92vw, (max-width: 1180px) 72vw, 50vw",
  width: 1536,
  height: 1024,
  cropClass
});
const firstPieceFront = productAsset("first-piece-front.png");
const firstPieceBack = productAsset("first-piece-back.png");
const luxurySetFront = productAsset("first-piece-front.png");
const luxurySetBack = productAsset("first-piece-back.png");
const utilitySizeStock = { S: 25, M: 25, L: 25, XL: 25, XXL: 25 };
const utilityColors = [
  { name: "Ash Grey", hex: "#918b80" },
  { name: "Matte Black", hex: "#050505" },
  { name: "Dark Olive", hex: "#4a3f25" }
];
const utilityGalleryFor = (colorName, colorClass) => [
  utilityResponsiveImage("utility-campaign-hero", "Front View", `${colorClass} utility-front`),
  utilityResponsiveImage("utility-product-board", "Back View", `${colorClass} utility-back`),
  utilityResponsiveImage("utility-campaign-hero", "Left Side View", `${colorClass} utility-left`),
  utilityResponsiveImage("utility-campaign-hero", "Right Side View", `${colorClass} utility-right`),
  utilityResponsiveImage("utility-campaign-hero", "Full Outfit View", `${colorClass} utility-full`),
  utilityResponsiveImage("utility-product-board", "Fabric Close-Up", `${colorClass} utility-fabric`),
  utilityResponsiveImage("utility-product-board", "Logo Detail", `${colorClass} utility-logo`),
  utilityResponsiveImage("utility-product-board", "Pocket Detail", `${colorClass} utility-pocket`)
].map((image) => ({ ...image, color: colorName }));
const utilityColorVariants = [
  {
    name: "Ash Grey",
    hex: "#918b80",
    images: {
      front: utilityResponsiveImage("utility-campaign-hero", "Ash Grey Front View", "utility-ash utility-front"),
      back: utilityResponsiveImage("utility-product-board", "Ash Grey Back View", "utility-ash utility-back"),
      side: utilityResponsiveImage("utility-campaign-hero", "Ash Grey Side View", "utility-ash utility-left")
    },
    gallery: utilityGalleryFor("Ash Grey", "utility-ash")
  },
  {
    name: "Matte Black",
    hex: "#050505",
    images: {
      front: utilityResponsiveImage("utility-campaign-hero", "Matte Black Front View", "utility-black utility-front"),
      back: utilityResponsiveImage("utility-product-board", "Matte Black Back View", "utility-black utility-back"),
      side: utilityResponsiveImage("utility-campaign-hero", "Matte Black Side View", "utility-black utility-side")
    },
    gallery: utilityGalleryFor("Matte Black", "utility-black")
  },
  {
    name: "Dark Olive",
    hex: "#4a3f25",
    images: {
      front: utilityResponsiveImage("utility-campaign-hero", "Dark Olive Front View", "utility-olive utility-front"),
      back: utilityResponsiveImage("utility-product-board", "Dark Olive Back View", "utility-olive utility-back"),
      side: utilityResponsiveImage("utility-campaign-hero", "Dark Olive Side View", "utility-olive utility-side")
    },
    gallery: utilityGalleryFor("Dark Olive", "utility-olive")
  }
];
const utilityHeroImage = utilityResponsiveImage("utility-campaign-hero", "MG69 Utility campaign model", "utility-full");
const utilityBoardImage = utilityResponsiveImage("utility-product-board", "MG69 Utility product board", "utility-board");

export const utilityCampaignImages = {
  hero: utilityHeroImage,
  board: utilityBoardImage
};

export const products = [
  {
    id: "mg69-utility-set",
    name: "MG69 Utility Set",
    collection: "MG69 Utility Collection",
    price: 169,
    category: "Men",
    type: "Utility Bomber + Cargo Set",
    stock: 125,
    featured: true,
    sizeStock: utilitySizeStock,
    imageClass: "crop-utility",
    image: utilityHeroImage.src,
    images: utilityGalleryFor("Ash Grey", "utility-ash"),
    colorVariants: utilityColorVariants,
    tagline: "Premium bomber, oversized hoodie energy, and cargo utility discipline.",
    description:
      "Premium oversized utility bomber jacket paired with cargo pants. Built for comfort, confidence, and luxury streetwear styling.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: utilityColors,
    specs: {
      Fabric: "Utility Shell / Heavy Fleece",
      Inventory: "25 units per size",
      Fit: "Oversized"
    },
    tags: ["MG69 Utility Collection", "Utility Bomber Jacket", "Cargo Pants", "Featured"],
    relatedIds: ["mg69-utility-bomber-jacket", "mg69-utility-oversized-hoodie", "mg69-utility-cargo-pants"]
  },
  {
    id: "mg69-utility-bomber-jacket",
    name: "Utility Bomber Jacket",
    collection: "MG69 Utility Collection",
    price: 139,
    category: "Men",
    type: "Utility Bomber Jacket",
    stock: 125,
    sizeStock: utilitySizeStock,
    imageClass: "crop-utility",
    image: utilityBoardImage.src,
    images: utilityGalleryFor("Ash Grey", "utility-ash"),
    colorVariants: utilityColorVariants,
    tagline: "Structured outer layer with a premium utility silhouette.",
    description: "A luxury utility bomber jacket built with an oversized shape, clean pocketing, and MG69 campaign styling.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: utilityColors,
    specs: {
      Shell: "Premium Utility Twill",
      Hardware: "Matte Metal",
      Fit: "Oversized"
    },
    tags: ["MG69 Utility Collection", "Bomber", "Outerwear"]
  },
  {
    id: "mg69-utility-oversized-hoodie",
    name: "Oversized Hoodie",
    collection: "MG69 Utility Collection",
    price: 98,
    category: "Men",
    type: "Oversized Hoodie",
    stock: 125,
    sizeStock: utilitySizeStock,
    imageClass: "crop-utility",
    image: utilityHeroImage.src,
    images: utilityGalleryFor("Ash Grey", "utility-ash"),
    colorVariants: utilityColorVariants,
    tagline: "Layer-ready heavyweight hoodie for the Utility Collection.",
    description: "A soft oversized hoodie designed to sit under the MG69 bomber or carry the full utility look by itself.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: utilityColors,
    specs: {
      Fabric: "Heavyweight Fleece",
      Hood: "Double Layer",
      Fit: "Oversized"
    },
    tags: ["MG69 Utility Collection", "Hoodie", "Layering"]
  },
  {
    id: "mg69-utility-cargo-pants",
    name: "Cargo Pants",
    collection: "MG69 Utility Collection",
    price: 118,
    category: "Men",
    type: "Cargo Pants",
    stock: 125,
    sizeStock: utilitySizeStock,
    imageClass: "crop-utility",
    image: utilityBoardImage.src,
    images: utilityGalleryFor("Ash Grey", "utility-ash"),
    colorVariants: utilityColorVariants,
    tagline: "Relaxed utility cargo pants with premium pocket detail.",
    description: "A wide-leg utility cargo pant with clean pocket structure, adjustable waist detail, and luxury streetwear proportions.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: utilityColors,
    specs: {
      Fabric: "Utility Cotton Blend",
      Pockets: "Multi Cargo",
      Fit: "Relaxed"
    },
    tags: ["MG69 Utility Collection", "Cargo Pants", "Utility"]
  },
  {
    id: "mg69-luxury-set",
    name: "MG69 Luxury Set",
    collection: "Drop 001",
    price: 189,
    category: "Men",
    type: "Luxury Streetwear Set",
    stock: 50,
    featured: true,
    sizeStock: { S: 8, M: 12, L: 12, XL: 10, XXL: 8 },
    imageClass: "crop-hoodie",
    image: luxurySetFront,
    images: [
      { label: "Front", src: luxurySetFront },
      { label: "Back", src: luxurySetBack },
      { label: "Model Front", src: luxurySetFront },
      { label: "Model Back", src: luxurySetBack }
    ],
    tagline: "Premium oversized luxury streetwear set.",
    description: "Premium oversized luxury streetwear set crafted with heavyweight fabric.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Stone Grey", hex: "#8e8b84" },
      { name: "Matte Black", hex: "#080807" },
      { name: "Cream", hex: "#efebe0" }
    ],
    specs: {
      Fabric: "Heavyweight Cotton Fleece",
      Weight: "420 GSM",
      Fit: "Oversized"
    },
    tags: ["MG69 Luxury Set", "Drop 001", "Featured"]
  },
  {
    id: "mg69-first-piece-smile-hoodie",
    name: "First Piece Smile Hoodie",
    collection: "Drop 001",
    price: 129,
    category: "Men",
    type: "Signature Hoodie",
    stock: 25,
    sizeStock: { S: 5, M: 7, L: 6, XL: 4, XXL: 3 },
    imageClass: "crop-hoodie",
    image: firstPieceFront,
    images: [
      { label: "Front", src: firstPieceFront },
      { label: "Back", src: firstPieceBack }
    ],
    tagline: "MG69 signature piece. Gold mark. Smile message.",
    description: "A black heavyweight hoodie with metallic MG69 front artwork and the Smile Today back graphic.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Matte Black", hex: "#080807" },
      { name: "Gold Print", hex: "#d7a83f" }
    ],
    specs: {
      Fabric: "Cotton Fleece",
      Weight: "420 GSM",
      Fit: "Oversized"
    },
    tags: ["MG69 Signature Piece", "Drop 001", "Smile Hoodie"]
  },
  {
    id: "mg69-heavyweight-tee",
    name: "Oversized Heavyweight Tee",
    collection: "Drop 001",
    price: 65,
    category: "Men",
    type: "Oversized Tee",
    stock: 20,
    sizeStock: { S: 4, M: 7, L: 6, XL: 3 },
    imageClass: "crop-tee",
    image: productAsset("oversized-heavyweight-tee.png"),
    images: [
      { label: "Front", src: productAsset("oversized-heavyweight-tee.png") },
      { label: "Back", src: productAsset("oversized-heavyweight-tee-back.png") }
    ],
    tagline: "Box fit. Dropped shoulder. Quiet weight.",
    description: "A 240 GSM cotton tee with a squared silhouette, clean neckline, and heavy fall through the body.",
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Matte Black", hex: "#080807" },
      { name: "Bone Cream", hex: "#efebe0" }
    ],
    specs: {
      Fabric: "100% Cotton",
      Weight: "240 GSM",
      Fit: "Oversized"
    },
    tags: ["No Signal", "Heavy Cotton", "Drop 001"]
  },
  {
    id: "mg69-midnight-city-hoodie",
    name: "Midnight City Hoodie",
    collection: "Drop 001",
    price: 120,
    category: "Men",
    type: "Heavy Hoodie",
    stock: 14,
    sizeStock: { S: 2, M: 4, L: 4, XL: 3, XXL: 1 },
    imageClass: "crop-hoodie",
    image: productAsset("midnight-city-hoodie.png"),
    images: [
      { label: "Front", src: productAsset("midnight-city-hoodie.png") },
      { label: "Back", src: productAsset("midnight-city-hoodie-back.png") }
    ],
    tagline: "Dense fleece volume for cold concrete nights.",
    description: "A structured 380 GSM fleece hoodie with a heavy hood, ribbed edges, and a boxy luxury streetwear shape.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Asphalt", hex: "#151514" },
      { name: "Silver Fog", hex: "#b9b5aa" }
    ],
    specs: {
      Fabric: "Cotton Fleece",
      Weight: "380 GSM",
      Fit: "Boxy"
    },
    tags: ["Midnight City", "Fleece", "Outer Layer"]
  },
  {
    id: "mg69-afterimage-jersey",
    name: "Afterimage Jersey",
    collection: "Essentials",
    price: 90,
    category: "Women",
    type: "Layered Jersey",
    stock: 18,
    sizeStock: { XS: 3, S: 5, M: 6, L: 4 },
    imageClass: "crop-fabric",
    image: productAsset("afterimage-jersey.png"),
    images: [
      { label: "Front", src: productAsset("afterimage-jersey.png") },
      { label: "Back", src: productAsset("afterimage-jersey-back.png") }
    ],
    tagline: "Low-glare layer. Soft structure. Clean stack.",
    description: "A quiet base layer with subtle texture, built to sit under jackets or carry a minimal full look.",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Bone Cream", hex: "#efebe0" },
      { name: "Chrome Grey", hex: "#929087" }
    ],
    specs: {
      Fabric: "Modal Blend",
      Weight: "180 GSM",
      Fit: "Relaxed"
    },
    tags: ["Afterimage", "Base Layer", "Minimal"]
  },
  {
    id: "mg69-signal-coat",
    name: "Signal Long Coat",
    collection: "Future Uniform",
    price: 210,
    category: "Women",
    type: "Long Coat",
    stock: 8,
    sizeStock: { XS: 1, S: 2, M: 3, L: 2 },
    imageClass: "crop-cover",
    image: productAsset("signal-long-coat.png"),
    images: [
      { label: "Front", src: productAsset("signal-long-coat.png") },
      { label: "Back", src: productAsset("signal-long-coat-back.png") }
    ],
    tagline: "Clean line outerwear with cinematic weight.",
    description: "A long matte shell designed for editorial layering, sharp movement, and quiet street presence.",
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Matte Black", hex: "#080807" },
      { name: "Charcoal", hex: "#20201e" }
    ],
    specs: {
      Fabric: "Cotton Twill",
      Weight: "410 GSM",
      Fit: "Structured"
    },
    tags: ["Outerwear", "Future Uniform", "Limited"]
  }
];
