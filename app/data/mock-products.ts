export interface ShopifyImage {
  url: string
  altText?: string | null
  width?: number | null
  height?: number | null
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: 'polo' | 'cargo' | 'chino' | 'jacket'
  image: string | ShopifyImage | null
  badge?: 'New' | 'Sale' | 'Best Seller'
  sizes: string[]
  colors: string[]
  material: string
  fit: string
}

export const mockProducts: Product[] = [
  // Polo Shirts
  {
    id: '1',
    name: 'Classic Polo Shirt',
    description: 'Timeless polo in premium cotton',
    price: 45,
    originalPrice: undefined,
    category: 'polo',
    image: '/product-placeholder.svg',
    badge: undefined,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Navy', 'White', 'Black'],
    material: '100% Cotton',
    fit: 'Regular'
  },
  {
    id: '2',
    name: 'Slim Fit Polo Shirt',
    description: 'Modern silhouette with breathable fabric',
    price: 55,
    originalPrice: undefined,
    category: 'polo',
    image: '/product-placeholder.svg',
    badge: 'Best Seller',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Charcoal', 'Navy', 'Olive'],
    material: 'Cotton Pique Blend',
    fit: 'Slim'
  },
  {
    id: '3',
    name: 'Striped Polo Shirt',
    description: 'Classic stripes with soft stretch',
    price: 49,
    originalPrice: 59,
    category: 'polo',
    image: '/product-placeholder.svg',
    badge: 'Sale',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Navy', 'Gray', 'Sand'],
    material: 'Cotton-Poly Blend',
    fit: 'Regular'
  },
  {
    id: '4',
    name: 'Premium Pique Polo',
    description: 'Elevated texture with refined finish',
    price: 65,
    originalPrice: undefined,
    category: 'polo',
    image: '/product-placeholder.svg',
    badge: 'New',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Stone', 'Forest'],
    material: 'Pique Cotton',
    fit: 'Regular'
  },

  // Cargo Pants
  {
    id: '5',
    name: 'Urban Cargo Pants',
    description: 'Functional style with multiple pockets',
    price: 75,
    originalPrice: 95,
    category: 'cargo',
    image: '/product-placeholder.svg',
    badge: 'Sale',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Olive', 'Black', 'Sand'],
    material: 'Cotton Twill',
    fit: 'Regular'
  },
  {
    id: '6',
    name: 'Tactical Cargo Pants',
    description: 'Rugged build for everyday utility',
    price: 90,
    originalPrice: undefined,
    category: 'cargo',
    image: '/product-placeholder.svg',
    badge: 'Best Seller',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Charcoal', 'Olive'],
    material: 'Ripstop Cotton Blend',
    fit: 'Relaxed'
  },
  {
    id: '7',
    name: 'Slim Cargo Pants',
    description: 'Streamlined cargo with stretch comfort',
    price: 82,
    originalPrice: undefined,
    category: 'cargo',
    image: '/product-placeholder.svg',
    badge: 'New',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Navy', 'Gray', 'Black'],
    material: 'Stretch Cotton',
    fit: 'Slim'
  },
  {
    id: '8',
    name: 'Relaxed Cargo Pants',
    description: 'Easy fit with brushed finish',
    price: 68,
    originalPrice: undefined,
    category: 'cargo',
    image: '/product-placeholder.svg',
    badge: undefined,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Sand', 'Olive', 'Stone'],
    material: 'Cotton Canvas',
    fit: 'Relaxed'
  },

  // Chino Pants
  {
    id: '9',
    name: 'Essential Chino Pants',
    description: 'Versatile chinos for any occasion',
    price: 65,
    originalPrice: undefined,
    category: 'chino',
    image: '/product-placeholder.svg',
    badge: 'New',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Navy', 'Khaki', 'Stone'],
    material: 'Cotton Twill',
    fit: 'Regular'
  },
  {
    id: '10',
    name: 'Slim Chino Pants',
    description: 'Tailored fit with clean lines',
    price: 72,
    originalPrice: undefined,
    category: 'chino',
    image: '/product-placeholder.svg',
    badge: 'Best Seller',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Navy', 'Taupe'],
    material: 'Stretch Cotton',
    fit: 'Slim'
  },
  {
    id: '11',
    name: 'Tapered Chino Pants',
    description: 'Modern taper with flexible comfort',
    price: 78,
    originalPrice: 88,
    category: 'chino',
    image: '/product-placeholder.svg',
    badge: 'Sale',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Olive', 'Charcoal', 'Sand'],
    material: 'Cotton-Poly Blend',
    fit: 'Tapered'
  },
  {
    id: '12',
    name: 'Stretch Chino Pants',
    description: 'All-day stretch for effortless movement',
    price: 58,
    originalPrice: undefined,
    category: 'chino',
    image: '/product-placeholder.svg',
    badge: undefined,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Navy', 'Gray', 'Camel'],
    material: 'Stretch Cotton',
    fit: 'Regular'
  },

  // Winter Jackets
  {
    id: '13',
    name: 'Insulated Winter Jacket',
    description: 'Stay warm in style',
    price: 150,
    originalPrice: undefined,
    category: 'jacket',
    image: '/product-placeholder.svg',
    badge: undefined,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Navy', 'Olive'],
    material: 'Recycled Polyester',
    fit: 'Regular'
  },
  {
    id: '14',
    name: 'Puffer Jacket',
    description: 'Lightweight warmth with down fill',
    price: 180,
    originalPrice: 200,
    category: 'jacket',
    image: '/product-placeholder.svg',
    badge: 'Sale',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Charcoal', 'Black', 'Forest'],
    material: 'Down Blend',
    fit: 'Regular'
  },
  {
    id: '15',
    name: 'Wool Coat',
    description: 'Refined warmth for cold days',
    price: 195,
    originalPrice: undefined,
    category: 'jacket',
    image: '/product-placeholder.svg',
    badge: 'Best Seller',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Camel', 'Black', 'Gray'],
    material: 'Wool Blend',
    fit: 'Regular'
  },
  {
    id: '16',
    name: 'Bomber Jacket',
    description: 'Classic bomber with modern finish',
    price: 130,
    originalPrice: undefined,
    category: 'jacket',
    image: '/product-placeholder.svg',
    badge: 'New',
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Olive', 'Navy'],
    material: 'Nylon Blend',
    fit: 'Regular'
  }
]
