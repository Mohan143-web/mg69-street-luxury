export const collections = ["All", "Drop 001", "Essentials", "Future Uniform"];

export const categories = ["All", "Men", "Women"];

const productAsset = (fileName) => `${import.meta.env.BASE_URL}products/${fileName}`;
const firstPieceFront = productAsset("first-piece-front.png");
const firstPieceBack = productAsset("first-piece-back.png");

export const products = [
  {
    id: "mg69-first-piece-smile-hoodie",
    name: "First Piece Smile Hoodie",
    collection: "Drop 001",
    price: 129,
    category: "Men",
    type: "Signature Hoodie",
    stock: 25,
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
