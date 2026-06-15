const utilityProductAsset = (fileName) => `/utility/products/${fileName}`;
const utilitySizeStock = { S: 25, M: 25, L: 25, XL: 25, XXL: 25 };
const utilityColors = [
  { name: "Stone Grey", hex: "#918b80" },
  { name: "Matte Black", hex: "#050505" },
  { name: "Dark Olive", hex: "#4a3f25" }
];
const utilityViewLabels = [
  ["front-view", "Front View"],
  ["back-view", "Back View"],
  ["left-side-view", "Left Side View"],
  ["right-side-view", "Right Side View"],
  ["model-front-view", "Model Front View"],
  ["model-back-view", "Model Back View"],
  ["flat-lay-front", "Flat Lay Front"],
  ["flat-lay-back", "Flat Lay Back"]
];
const utilityProductImage = (colorSlug, colorName, viewSlug, label) => ({
  label,
  color: colorName,
  src: utilityProductAsset(`${colorSlug}-${viewSlug}.webp`),
  srcSet: `${utilityProductAsset(`${colorSlug}-${viewSlug}.webp`)} 1200w`,
  sizes: "(max-width: 820px) 92vw, (max-width: 1180px) 64vw, 48vw",
  width: 1200,
  height: 1600
});
const utilityGalleryFor = (colorSlug, colorName) =>
  utilityViewLabels.map(([viewSlug, label]) => utilityProductImage(colorSlug, colorName, viewSlug, label));
const utilityColorVariants = [
  {
    name: "Stone Grey",
    hex: "#918b80",
    images: {
      front: utilityProductImage("stone-grey", "Stone Grey", "front-view", "Stone Grey Front View"),
      back: utilityProductImage("stone-grey", "Stone Grey", "back-view", "Stone Grey Back View"),
      side: utilityProductImage("stone-grey", "Stone Grey", "left-side-view", "Stone Grey Side View")
    },
    gallery: utilityGalleryFor("stone-grey", "Stone Grey")
  },
  {
    name: "Matte Black",
    hex: "#050505",
    images: {
      front: utilityProductImage("matte-black", "Matte Black", "front-view", "Matte Black Front View"),
      back: utilityProductImage("matte-black", "Matte Black", "back-view", "Matte Black Back View"),
      side: utilityProductImage("matte-black", "Matte Black", "left-side-view", "Matte Black Side View")
    },
    gallery: utilityGalleryFor("matte-black", "Matte Black")
  },
  {
    name: "Dark Olive",
    hex: "#4a3f25",
    images: {
      front: utilityProductImage("dark-olive", "Dark Olive", "front-view", "Dark Olive Front View"),
      back: utilityProductImage("dark-olive", "Dark Olive", "back-view", "Dark Olive Back View"),
      side: utilityProductImage("dark-olive", "Dark Olive", "left-side-view", "Dark Olive Side View")
    },
    gallery: utilityGalleryFor("dark-olive", "Dark Olive")
  }
];
const utilityDefaultGallery = utilityGalleryFor("stone-grey", "Stone Grey");

export const fallbackProducts = [
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
    imageUrl: utilityDefaultGallery[0].src,
    images: utilityDefaultGallery,
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
    active: true
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
    imageUrl: utilityDefaultGallery[6].src,
    images: utilityDefaultGallery,
    colorVariants: utilityColorVariants,
    tagline: "Structured outer layer with a premium utility silhouette.",
    description: "A luxury utility bomber jacket built with an oversized shape, clean pocketing, and MG69 campaign styling.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: utilityColors,
    specs: { Shell: "Premium Utility Twill", Hardware: "Matte Metal", Fit: "Oversized" },
    tags: ["MG69 Utility Collection", "Bomber", "Outerwear"],
    active: true
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
    imageUrl: utilityDefaultGallery[4].src,
    images: utilityDefaultGallery,
    colorVariants: utilityColorVariants,
    tagline: "Layer-ready heavyweight hoodie for the Utility Collection.",
    description: "A soft oversized hoodie designed to sit under the MG69 bomber or carry the full utility look by itself.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: utilityColors,
    specs: { Fabric: "Heavyweight Fleece", Hood: "Double Layer", Fit: "Oversized" },
    tags: ["MG69 Utility Collection", "Hoodie", "Layering"],
    active: true
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
    imageUrl: utilityDefaultGallery[7].src,
    images: utilityDefaultGallery,
    colorVariants: utilityColorVariants,
    tagline: "Relaxed utility cargo pants with premium pocket detail.",
    description: "A wide-leg utility cargo pant with clean pocket structure, adjustable waist detail, and luxury streetwear proportions.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: utilityColors,
    specs: { Fabric: "Utility Cotton Blend", Pockets: "Multi Cargo", Fit: "Relaxed" },
    tags: ["MG69 Utility Collection", "Cargo Pants", "Utility"],
    active: true
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
    imageUrl: "/products/first-piece-front.png",
    images: [
      { label: "Front", src: "/products/first-piece-front.png" },
      { label: "Back", src: "/products/first-piece-back.png" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Matte Black", hex: "#080807" },
      { name: "Gold Print", hex: "#d7a83f" }
    ],
    specs: { Fabric: "Cotton Fleece", Weight: "420 GSM", Fit: "Oversized" },
    tags: ["MG69 Signature Piece", "Drop 001", "Smile Hoodie"],
    active: true
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
    imageUrl: "/products/oversized-heavyweight-tee.png",
    images: [
      { label: "Front", src: "/products/oversized-heavyweight-tee.png" },
      { label: "Back", src: "/products/oversized-heavyweight-tee-back.png" }
    ],
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { name: "Matte Black", hex: "#080807" },
      { name: "Bone Cream", hex: "#efebe0" }
    ],
    specs: { Fabric: "100% Cotton", Weight: "240 GSM", Fit: "Oversized" },
    tags: ["No Signal", "Heavy Cotton", "Drop 001"],
    active: true
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
    imageUrl: "/products/midnight-city-hoodie.png",
    images: [
      { label: "Front", src: "/products/midnight-city-hoodie.png" },
      { label: "Back", src: "/products/midnight-city-hoodie-back.png" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { name: "Asphalt", hex: "#151514" },
      { name: "Silver Fog", hex: "#b9b5aa" }
    ],
    specs: { Fabric: "Cotton Fleece", Weight: "380 GSM", Fit: "Boxy" },
    tags: ["Midnight City", "Fleece", "Outer Layer"],
    active: true
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
    imageUrl: "/products/afterimage-jersey.png",
    images: [
      { label: "Front", src: "/products/afterimage-jersey.png" },
      { label: "Back", src: "/products/afterimage-jersey-back.png" }
    ],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Bone Cream", hex: "#efebe0" },
      { name: "Chrome Grey", hex: "#929087" }
    ],
    specs: { Fabric: "Modal Blend", Weight: "180 GSM", Fit: "Relaxed" },
    tags: ["Afterimage", "Base Layer", "Minimal"],
    active: true
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
    imageUrl: "/products/signal-long-coat.png",
    images: [
      { label: "Front", src: "/products/signal-long-coat.png" },
      { label: "Back", src: "/products/signal-long-coat-back.png" }
    ],
    sizes: ["XS", "S", "M", "L"],
    colors: [
      { name: "Matte Black", hex: "#080807" },
      { name: "Charcoal", hex: "#20201e" }
    ],
    specs: { Fabric: "Cotton Twill", Weight: "410 GSM", Fit: "Structured" },
    tags: ["Outerwear", "Future Uniform", "Limited"],
    active: true
  }
];
