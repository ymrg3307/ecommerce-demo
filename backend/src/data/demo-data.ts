import bcrypt from 'bcryptjs';

export type DemoUser = {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: 'customer';
};

export type DemoProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  tags: string[];
};

export type DemoInventory = {
  productId: string;
  stockCount: number;
  status: 'IN_STOCK' | 'OUT_OF_STOCK';
};

const DEMO_PASSWORD = 'Demo@123';

export async function createDemoUser(): Promise<DemoUser> {
  return {
    id: 'user-demo-1',
    email: 'demo@cttshop.com',
    passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10),
    name: 'Panel Demo User',
    role: 'customer'
  };
}

export const demoProducts: DemoProduct[] = [
  {
    id: 'prod-overshirt-001',
    name: 'Stone Utility Overshirt',
    category: 'Men / Casual Shirts',
    price: 59,
    description:
      'A lightweight overshirt designed for quick demo browsing, with structured pockets and a relaxed everyday fit.',
    image:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    tags: ['shirt', 'men', 'utility', 'casual']
  },
  {
    id: 'prod-dress-002',
    name: 'Rust Pleated Midi Dress',
    category: 'Women / Dresses & Jumpsuits',
    price: 74,
    description:
      'A soft pleated midi dress with a flattering waistline that works well for the catalog and product demo.',
    image:
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=800&q=80',
    tags: ['dress', 'women', 'midi', 'sale']
  },
  {
    id: 'prod-jacket-003',
    name: 'Graphite Tech Bomber Jacket',
    category: 'Men / Jackets',
    price: 99,
    description:
      'A clean bomber jacket with contrast lining and simple detailing for a premium product-details presentation.',
    image:
      'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=800&q=80',
    tags: ['jacket', 'men', 'outerwear', 'featured']
  },
  {
    id: 'prod-kurta-004',
    name: 'Indigo Embroidered Kurta Set',
    category: 'Women / Kurtas & Suits',
    price: 68,
    description:
      'An embroidered kurta set created to cover the women category from the SRS while staying compact for the final demo.',
    image:
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',
    tags: ['kurta', 'women', 'ethnic', 'festival']
  }
];

export const demoInventory: DemoInventory[] = [
  { productId: 'prod-overshirt-001', stockCount: 12, status: 'IN_STOCK' },
  { productId: 'prod-dress-002', stockCount: 8, status: 'IN_STOCK' },
  { productId: 'prod-jacket-003', stockCount: 0, status: 'OUT_OF_STOCK' },
  { productId: 'prod-kurta-004', stockCount: 5, status: 'IN_STOCK' }
];

export const demoCredentials = {
  email: 'demo@cttshop.com',
  password: DEMO_PASSWORD
};
