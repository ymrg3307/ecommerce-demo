export type LoginPayload = {
  email: string;
  password: string;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type LoginResponse = {
  token: string;
  expiresAt: string;
  user: SessionUser;
};

export type InventoryState = {
  productId: string;
  stockCount: number;
  status: 'IN_STOCK' | 'OUT_OF_STOCK';
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  tags: string[];
  inventory: InventoryState | null;
};

const demoUser: SessionUser = {
  id: 'user-demo-1',
  email: 'demo@cttshop.com',
  name: 'Panel Demo User',
  role: 'customer'
};

const demoProducts: Product[] = [
  {
    id: 'prod-overshirt-001',
    name: 'Stone Utility Overshirt',
    category: 'Men / Casual Shirts',
    price: 59,
    description:
      'A lightweight overshirt designed for quick demo browsing, with structured pockets and a relaxed everyday fit.',
    image:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    tags: ['shirt', 'men', 'utility', 'casual'],
    inventory: {
      productId: 'prod-overshirt-001',
      stockCount: 12,
      status: 'IN_STOCK'
    }
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
    tags: ['dress', 'women', 'midi', 'sale'],
    inventory: {
      productId: 'prod-dress-002',
      stockCount: 8,
      status: 'IN_STOCK'
    }
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
    tags: ['jacket', 'men', 'outerwear', 'featured'],
    inventory: {
      productId: 'prod-jacket-003',
      stockCount: 0,
      status: 'OUT_OF_STOCK'
    }
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
    tags: ['kurta', 'women', 'ethnic', 'festival'],
    inventory: {
      productId: 'prod-kurta-004',
      stockCount: 5,
      status: 'IN_STOCK'
    }
  }
];

function wait(ms = 180) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  await wait();

  if (payload.email !== 'demo@cttshop.com' || payload.password !== 'Demo@123') {
    throw new Error('Invalid email or password.');
  }

  return {
    token: `demo-token-${Date.now()}`,
    expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    user: demoUser
  };
}

export async function logout(token?: string) {
  await wait(80);
  void token;
}

export async function searchProducts(query: string): Promise<Product[]> {
  await wait();
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return [];
  }

  return demoProducts.filter((product) =>
    [product.name, product.category, product.description, ...product.tags]
      .join(' ')
      .toLowerCase()
      .includes(normalized)
  );
}

export async function getProduct(id: string): Promise<Product> {
  await wait();
  const product = demoProducts.find((item) => item.id === id);

  if (!product) {
    throw new Error('Product not found.');
  }

  return product;
}
