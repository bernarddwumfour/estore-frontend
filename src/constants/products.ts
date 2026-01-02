// constants/products.ts

import { ProductType } from "@/types/productTypes";

export const products:ProductType[] = [
  {
    id: 1,
    title: "Wireless Over-Ear Headphones",
    basePrice: 49.99,
    description: "Premium over-ear headphones with crystal-clear sound and 30-hour battery life.",
    features: [
      "Active Noise Cancellation",
      "Bluetooth 5.0",
      "30hr Battery Life",
      "Built-in Microphone"
    ],
    options: {
      brand: ["Generic", "Sony", "Bose"],
      color: ["Black", "White", "Blue", "Red"],
      condition: ["New", "Open Box"]
    },
    defaultVariant: "GEN-BLK-NEW",
    variants: [
      {
        sku: "GEN-BLK-NEW",
        attributes: { brand: "Generic", color: "Black", condition: "New" },
        price: 49.99,
        discountAmount: 30.01,
        stock: 0,
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1527814050087-37a3d71eaea1?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "SONY-BLK-NEW",
        attributes: { brand: "Sony", color: "Black", condition: "New" },
        price: 69.99,
        discountAmount: 20.00,
        stock: 12,
        images: [
          "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1527814050087-37a3d71eaea1?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "BOSE-WHT-NEW",
        attributes: { brand: "Bose", color: "White", condition: "New" },
        price: 89.99,
        discountAmount: 30.00,
        stock: 8,
        images: [
          "https://images.unsplash.com/photo-1527814050087-37a3d71eaea1?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "SONY-BLK-OPEN",
        attributes: { brand: "Sony", color: "Black", condition: "Open Box" },
        price: 59.99,
        discountAmount: 20.00,
        stock: 3,
        images: [
          "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1527814050087-37a3d71eaea1?q=80&w=1160&auto=format&fit=crop"
        ]
      }
    ]
  },

  {
    id: 2,
    title: "True Wireless Earbuds",
    basePrice: 79.99,
    description: "Compact earbuds with active noise cancellation and 8-hour playtime per charge.",
    features: [
      "IPX4 Water Resistance",
      "Touch Controls",
      "Wireless Charging Case",
      "Voice Assistant Support"
    ],
    options: {
      brand: ["Generic", "Apple", "Samsung"],
      color: ["Black", "White"],
      condition: ["New"]
    },
    defaultVariant: "GEN-BLK-NEWs",
    variants: [
      {
        sku: "GEN-BLK-NEWs",
        attributes: { brand: "Generic", color: "Black", condition: "New" },
        price: 79.99,
        discountAmount: 50.00,
        stock: 18,
        images: [
          "https://images.unsplash.com/photo-1606741965509-717b9fdd6549?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1631867675167-90a456a90863?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "APPLE-BLK-NEW",
        attributes: { brand: "Apple", color: "Black", condition: "New" },
        price: 129.99,
        discountAmount: 30.00,
        stock: 15,
        images: [
          "https://images.unsplash.com/photo-1631867675167-90a456a90863?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1606741965509-717b9fdd6549?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "SAMSUNG-WHT-NEW",
        attributes: { brand: "Samsung", color: "White", condition: "New" },
        price: 99.99,
        discountAmount: 40.00,
        stock: 22,
        images: [
          "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1606741965509-717b9fdd6549?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1631867675167-90a456a90863?q=80&w=1160&auto=format&fit=crop"
        ]
      }
    ]
  },

  {
    id: 3,
    title: "Smart Watch Pro",
    basePrice: 199.99,
    description: "Track fitness, heart rate, sleep and get notifications with this sleek smartwatch.",
    features: [
      "AMOLED Display",
      "Built-in GPS",
      "Heart Rate Monitor",
      "50m Water Resistance"
    ],
    options: {
      brand: ["Garmin", "Apple", "Samsung"],
      color: ["Gold", "Silver", "Black"],
      size: ["40mm", "44mm"]
    },
    defaultVariant: "GARMIN-GOLD-40-NEW",
    variants: [
      {
        sku: "GARMIN-GOLD-40-NEW",
        attributes: { brand: "Garmin", color: "Gold", size: "40mm" },
        price: 199.99,
        discountAmount: 50.00,
        stock: 8,
        images: [
          "https://images.unsplash.com/photo-1434493566906-db97d9fd7404?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1508685096489-7aac291ba59a?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "APPLE-SILV-40-NEW",
        attributes: { brand: "Apple", color: "Silver", size: "40mm" },
        price: 249.99,
        discountAmount: 50.00,
        stock: 10,
        images: [
          "https://images.unsplash.com/photo-1508685096489-7aac291ba59a?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1434493566906-db97d9fd7404?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "SAMSUNG-BLK-44-NEW",
        attributes: { brand: "Samsung", color: "Black", size: "44mm" },
        price: 229.99,
        discountAmount: 40.00,
        stock: 14,
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1508685096489-7aac291ba59a?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1434493566906-db97d9fd7404?q=80&w=1160&auto=format&fit=crop"
        ]
      }
    ]
  },

  {
    id: 4,
    title: "Portable Bluetooth Speaker",
    basePrice: 89.99,
    description: "Waterproof speaker with deep bass and 20-hour battery for outdoor adventures.",
    features: [
      "IP67 Waterproof",
      "360° Surround Sound",
      "PartyBoost Link",
      "20hr Playtime"
    ],
    options: {
      brand: ["Generic", "JBL", "Ultimate Ears"],
      color: ["Green", "Black", "Blue"],
      size: ["Compact", "Medium"]
    },
    defaultVariant: "GEN-GRN-COMPACT-NEW",
    variants: [
      {
        sku: "GEN-GRN-COMPACT-NEW",
        attributes: { brand: "Generic", color: "Green", size: "Compact" },
        price: 89.99,
        discountAmount: 20.01,
        stock: 30,
        images: [
          "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1589128777073-263566ae5e4d?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1610216705422-caa3fcb6d15d?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "JBL-BLK-COMPACT-NEW",
        attributes: { brand: "JBL", color: "Black", size: "Compact" },
        price: 109.99,
        discountAmount: 30.00,
        stock: 20,
        images: [
          "https://images.unsplash.com/photo-1589128777073-263566ae5e4d?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1610216705422-caa3fcb6d15d?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "UE-BLU-MEDIUM-NEW",
        attributes: { brand: "Ultimate Ears", color: "Blue", size: "Medium" },
        price: 129.99,
        discountAmount: 40.00,
        stock: 16,
        images: [
          "https://images.unsplash.com/photo-1610216705422-caa3fcb6d15d?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1619983081563-430f63602796?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1589128777073-263566ae5e4d?q=80&w=1160&auto=format&fit=crop"
        ]
      }
    ]
  },

  {
    id: 5,
    title: "Gaming Mouse RGB",
    basePrice: 69.99,
    description: "Lightweight mouse with 16,000 DPI sensor and 6 programmable buttons.",
    features: [
      "16,000 DPI Sensor",
      "RGB Custom Lighting",
      "Mechanical Switches",
      "Ultra-lightweight"
    ],
    options: {
      brand: ["SteelSeries", "Logitech", "Razer"],
      color: ["Black", "White"],
      hand: ["Right", "Left"]
    },
    defaultVariant: "STEELSERIES-BLK-RIGHT-NEW",
    variants: [
      {
        sku: "STEELSERIES-BLK-RIGHT-NEW",
        attributes: { brand: "SteelSeries", color: "Black", hand: "Right" },
        price: 69.99,
        discountAmount: 30.00,
        stock: 25,
        images: [
          "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1563297007-0686b7003af7?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1527814050087-37a3d71eaea1?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "LOGITECH-BLK-RIGHT-NEW",
        attributes: { brand: "Logitech", color: "Black", hand: "Right" },
        price: 79.99,
        discountAmount: 40.00,
        stock: 18,
        images: [
          "https://images.unsplash.com/photo-1563297007-0686b7003af7?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1527814050087-37a3d71eaea1?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "RAZER-WHT-RIGHT-NEW",
        attributes: { brand: "Razer", color: "White", hand: "Right" },
        price: 89.99,
        discountAmount: 50.00,
        stock: 12,
        images: [
          "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1527814050087-37a3d71eaea1?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1563297007-0686b7003af7?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "STEELSERIES-BLK-LEFT-NEW",
        attributes: { brand: "SteelSeries", color: "Black", hand: "Left" },
        price: 69.99,
        discountAmount: 30.00,
        stock: 5,
        images: [
          "https://images.unsplash.com/photo-1527814050087-37a3d71eaea1?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1563297007-0686b7003af7?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1160&auto=format&fit=crop"
        ]
      }
    ]
  },

  {
    id: 6,
    title: "Mechanical Gaming Keyboard",
    basePrice: 129.99,
    description: "RGB backlit mechanical keyboard with fast switches and anti-ghosting.",
    features: [
      "Red Linear Switches",
      "PBT Keycaps",
      "Aluminium Frame",
      "N-Key Rollover"
    ],
    options: {
      brand: ["HyperX", "Corsair", "Razer"],
      color: ["Space Gray", "Arctic White"],
      layout: ["Full Size", "Tenkeyless"]
    },
    defaultVariant: "HYPERX-GRAY-FULL-NEW",
    variants: [
      {
        sku: "HYPERX-GRAY-FULL-NEW",
        attributes: { brand: "HyperX", color: "Space Gray", layout: "Full Size" },
        price: 129.99,
        discountAmount: 40.00,
        stock: 15,
        images: [
          "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1626958390898-162d3577f293?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1541140532154-b024d715b909?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "CORSAIR-GRAY-FULL-NEW",
        attributes: { brand: "Corsair", color: "Space Gray", layout: "Full Size" },
        price: 149.99,
        discountAmount: 50.00,
        stock: 12,
        images: [
          "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1626958390898-162d3577f293?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1541140532154-b024d715b909?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "RAZER-WHITE-TKL-NEW",
        attributes: { brand: "Razer", color: "Arctic White", layout: "Tenkeyless" },
        price: 139.99,
        discountAmount: 45.00,
        stock: 9,
        images: [
          "https://images.unsplash.com/photo-1626958390898-162d3577f293?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1541140532154-b024d715b909?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=1160&auto=format&fit=crop"
        ]
      }
    ]
  },

  {
    id: 7,
    title: "Professional DSLR Camera",
    basePrice: 899.00,
    description: "Capture stunning photos and 4K videos with this high-resolution camera kit.",
    features: [
      "24.2 MP Sensor",
      "4K Video Recording",
      "Dual Pixel Autofocus",
      "Wi-Fi / NFC"
    ],
    options: {
      brand: ["Canon", "Nikon", "Sony"],
      color: ["Black"],
      kit: ["Body Only", "Lens Kit"]
    },
    defaultVariant: "CANON-BLK-BODY-NEW",
    variants: [
      {
        sku: "CANON-BLK-BODY-NEW",
        attributes: { brand: "Canon", color: "Black", kit: "Body Only" },
        price: 899.00,
        discountAmount: 201.00,
        stock: 6,
        images: [
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "NIKON-BLK-LENS-NEW",
        attributes: { brand: "Nikon", color: "Black", kit: "Lens Kit" },
        price: 1099.00,
        discountAmount: 300.00,
        stock: 4,
        images: [
          "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "SONY-BLK-BODY-NEW",
        attributes: { brand: "Sony", color: "Black", kit: "Body Only" },
        price: 999.00,
        discountAmount: 250.00,
        stock: 8,
        images: [
          "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?q=80&w=1160&auto=format&fit=crop"
        ]
      }
    ]
  },

  {
    id: 8,
    title: "Ergonomic Office Chair",
    basePrice: 249.99,
    description: "Full mesh executive chair designed for comfort during long work hours.",
    features: [
      "Lumbar Support",
      "Adjustable Armrests",
      "Breathable Mesh",
      "Tilt Lock Mechanism"
    ],
    options: {
      material: ["Mesh", "Leather"],
      color: ["Grey", "Black"],
      size: ["Standard", "Large"]
    },
    defaultVariant: "MESH-GREY-STD-NEW",
    variants: [
      {
        sku: "MESH-GREY-STD-NEW",
        attributes: { material: "Mesh", color: "Grey", size: "Standard" },
        price: 249.99,
        discountAmount: 100.01,
        stock: 18,
        images: [
          "https://images.unsplash.com/photo-1505797149-35ebcb05a5fd?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1589384273441-c5ae2f67184f?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "MESH-BLK-STD-NEW",
        attributes: { material: "Mesh", color: "Black", size: "Standard" },
        price: 269.99,
        discountAmount: 120.00,
        stock: 22,
        images: [
          "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1505797149-35ebcb05a5fd?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1589384273441-c5ae2f67184f?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "LEATHER-BLK-LARGE-NEW",
        attributes: { material: "Leather", color: "Black", size: "Large" },
        price: 349.99,
        discountAmount: 200.00,
        stock: 7,
        images: [
          "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1589384273441-c5ae2f67184f?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1505797149-35ebcb05a5fd?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?q=80&w=1160&auto=format&fit=crop"
        ]
      }
    ]
  },

  {
    id: 9,
    title: "4K Ultra HD Monitor",
    basePrice: 329.99,
    description: "27-inch 4K monitor with HDR support and ultra-thin bezels.",
    features: [
      "IPS Panel",
      "99% sRGB Coverage",
      "HDMI & DisplayPort",
      "Eye-Care Technology"
    ],
    options: {
      brand: ["Dell", "LG", "Samsung"],
      color: ["Silver", "Black"],
      size: ["27-inch", "32-inch"]
    },
    defaultVariant: "DELL-SILV-27-NEW",
    variants: [
      {
        sku: "DELL-SILV-27-NEW",
        attributes: { brand: "Dell", color: "Silver", size: "27-inch" },
        price: 329.99,
        discountAmount: 70.00,
        stock: 14,
        images: [
          "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1551645120-d70bfe84c826?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1547115941-077ca93df952?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1586210579191-c3b216752c01?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "SAMSUNG-SILV-27-NEW",
        attributes: { brand: "Samsung", color: "Silver", size: "27-inch" },
        price: 349.99,
        discountAmount: 90.00,
        stock: 11,
        images: [
          "https://images.unsplash.com/photo-1551645120-d70bfe84c826?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1586210579191-c3b216752c01?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1547115941-077ca93df952?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "LG-BLK-32-NEW",
        attributes: { brand: "LG", color: "Black", size: "32-inch" },
        price: 449.99,
        discountAmount: 120.00,
        stock: 9,
        images: [
          "https://images.unsplash.com/photo-1547115941-077ca93df952?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1586210579191-c3b216752c01?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1551645120-d70bfe84c826?q=80&w=1160&auto=format&fit=crop"
        ]
      }
    ]
  },

  {
    id: 10,
    title: "Minimalist Leather Backpack",
    basePrice: 115.00,
    description: "Premium handcrafted leather bag with a dedicated 15-inch laptop sleeve.",
    features: [
      "Genuine Leather",
      "Water-resistant Lining",
      "Hidden Security Pocket",
      "Padded Straps"
    ],
    options: {
      material: ["Full Grain", "Suede"],
      color: ["Tan", "Dark Brown", "Black"],
      size: ["One Size"]
    },
    defaultVariant: "FULLGRAIN-TAN-ONESIZE-NEW",
    variants: [
      {
        sku: "FULLGRAIN-TAN-ONESIZE-NEW",
        attributes: { material: "Full Grain", color: "Tan", size: "One Size" },
        price: 115.00,
        discountAmount: 0,
        stock: 28,
        images: [
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "FULLGRAIN-DARKBRN-ONESIZE-NEW",
        attributes: { material: "Full Grain", color: "Dark Brown", size: "One Size" },
        price: 125.00,
        discountAmount: 0,
        stock: 15,
        images: [
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "SUEDE-BLK-ONESIZE-NEW",
        attributes: { material: "Suede", color: "Black", size: "One Size" },
        price: 135.00,
        discountAmount: 0,
        stock: 8,
        images: [
          "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1160&auto=format&fit=crop"
        ]
      }
    ]
  },

  {
    id: 11,
    title: "Electric Pour-Over Kettle",
    basePrice: 149.00,
    description: "Precision temperature control kettle for the perfect coffee brewing experience.",
    features: [
      "Gooseneck Spout",
      "LCD Temperature Display",
      "60-min Hold Mode",
      "Built-in Timer"
    ],
    options: {
      brand: ["Generic", "Fellow", "OXO"],
      color: ["Matte Black", "Polished Steel"],
      capacity: ["0.9L", "1.2L"]
    },
    defaultVariant: "GEN-BLK-0.9-NEW",
    variants: [
      {
        sku: "GEN-BLK-0.9-NEW",
        attributes: { brand: "Generic", color: "Matte Black", capacity: "0.9L" },
        price: 149.00,
        discountAmount: 31.00,
        stock: 20,
        images: [
          "https://images.unsplash.com/photo-1574175642654-e910287dfb62?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1582041221344-9694464c2049?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "FELLOW-BLK-0.9-NEW",
        attributes: { brand: "Fellow", color: "Matte Black", capacity: "0.9L" },
        price: 179.00,
        discountAmount: 41.00,
        stock: 12,
        images: [
          "https://images.unsplash.com/photo-1582041221344-9694464c2049?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1574175642654-e910287dfb62?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "OXO-STEEL-1.2-NEW",
        attributes: { brand: "OXO", color: "Polished Steel", capacity: "1.2L" },
        price: 169.00,
        discountAmount: 36.00,
        stock: 9,
        images: [
          "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1574175642654-e910287dfb62?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1582041221344-9694464c2049?q=80&w=1160&auto=format&fit=crop"
        ]
      }
    ]
  },

  {
    id: 12,
    title: "Professional Drone 4K",
    basePrice: 429.00,
    description: "Foldable drone with 3-axis gimbal and obstacle avoidance sensors.",
    features: [
      "4K/60fps Camera",
      "10km Video Transmission",
      "31-min Flight Time",
      "GPS Auto-Return"
    ],
    options: {
      brand: ["Generic", "DJI", "Autel"],
      color: ["Grey", "White"],
      controller: ["Standard", "Pro"]
    },
    defaultVariant: "GEN-GREY-STD-NEW",
    variants: [
      {
        sku: "GEN-GREY-STD-NEW",
        attributes: { brand: "Generic", color: "Grey", controller: "Standard" },
        price: 429.00,
        discountAmount: 170.00,
        stock: 12,
        images: [
          "https://images.unsplash.com/photo-1473960103265-2bc3394c86b1?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1507500199125-51c60a4f5451?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1506947411487-a56738267384?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1521714161819-15534968fc5f?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "DJI-GREY-STD-NEW",
        attributes: { brand: "DJI", color: "Grey", controller: "Standard" },
        price: 499.00,
        discountAmount: 200.00,
        stock: 8,
        images: [
          "https://images.unsplash.com/photo-1507500199125-51c60a4f5451?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1473960103265-2bc3394c86b1?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1521714161819-15534968fc5f?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1506947411487-a56738267384?q=80&w=1160&auto=format&fit=crop"
        ]
      },
      {
        sku: "AUTEL-WHT-PRO-NEW",
        attributes: { brand: "Autel", color: "White", controller: "Pro" },
        price: 599.00,
        discountAmount: 250.00,
        stock: 5,
        images: [
          "https://images.unsplash.com/photo-1521714161819-15534968fc5f?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1506947411487-a56738267384?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1473960103265-2bc3394c86b1?q=80&w=1160&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1507500199125-51c60a4f5451?q=80&w=1160&auto=format&fit=crop"
        ]
      }
    ]
  }
];