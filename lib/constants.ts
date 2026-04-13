export const MOCK_PRODUCTS = [
  {
    id: "classic-box",
    slug: "classic-box-5",
    name: "Classic Box",
    description: "A lovely assorted box of our traditional steamed modaks. Perfect for a small family.",
    ingredients: ["Fresh Coconut", "Rice Flour", "Jaggery", "Cardamom", "Saffron"],
    shelf_life: "Best within 24 hours",
    storage_instructions: "Refrigerate if not consuming same day",
    price_label: "₹130 · 5 pieces",
    price: 130,
    image_url: "/images/product-1.png",
  },
  {
    id: "delight-box",
    slug: "delight-box-7",
    name: "Delight Box",
    description: "A delightful assortment of our premium modaks, ideal for gifting or treating yourself.",
    ingredients: ["Fresh Coconut", "Rice Flour", "Jaggery", "Cardamom", "Saffron", "Almonds"],
    shelf_life: "Best within 24 hours",
    storage_instructions: "Refrigerate if not consuming same day",
    price_label: "₹170 · 7 pieces",
    price: 170,
    image_url: "/images/product-2.png",
  },
  {
    id: "celebration-box",
    slug: "celebration-box-11",
    name: "Celebration Box",
    description: "The ultimate celebration box featuring 11 handcrafted modaks. A grand offering for special occasions.",
    ingredients: ["Fresh Coconut", "Rice Flour", "Jaggery", "Cardamom", "Saffron", "Pistachio", "Almonds"],
    shelf_life: "Best within 24 hours",
    storage_instructions: "Refrigerate if not consuming same day",
    price_label: "₹260 · 11 pieces",
    price: 260,
    badge: "Best Value",
    image_url: "/images/product-1.png",
  }
];

export const MOCK_SLOTS = [
  {
    id: "SLOT-11AM",
    label: "11:00 AM – 1:00 PM",
    cutoff_time: "09:30:00",
    max_capacity: 20,
    confirmed_orders: 14,
    is_active: true
  },
  {
    id: "SLOT-3PM",
    label: "3:00 PM – 5:00 PM",
    cutoff_time: "13:30:00",
    max_capacity: 20,
    confirmed_orders: 20,
    is_active: true
  },
  {
    id: "SLOT-7PM",
    label: "7:00 PM – 9:00 PM",
    cutoff_time: "17:30:00",
    max_capacity: 20,
    confirmed_orders: 8,
    is_active: true
  }
];
