export const collections = ["All", "Drop 001", "Essentials", "Future Uniform"];

export const categories = ["All", "Men", "Women"];

export const products = [
  {
    id: "mg69-heavyweight-tee",
    name: "Oversized Heavyweight Tee",
    collection: "Drop 001",
    price: 65,
    category: "Men",
    type: "Oversized Tee",
    stock: 20,
    imageClass: "crop-tee",
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
