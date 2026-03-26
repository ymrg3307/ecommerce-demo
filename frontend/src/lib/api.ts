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

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

async function parseJson<T>(response: Response): Promise<T> {
  const json = await response.json();
  if (!response.ok) {
    const message = json.message || 'Request failed.';
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return json as T;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(`${apiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  return parseJson<LoginResponse>(response);
}

export async function logout(token?: string) {
  await fetch(`${apiBaseUrl}/auth/logout`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
}

export async function searchProducts(query: string): Promise<Product[]> {
  const response = await fetch(`${apiBaseUrl}/products?q=${encodeURIComponent(query)}`);
  return parseJson<Product[]>(response);
}

export async function getProduct(id: string): Promise<Product> {
  const response = await fetch(`${apiBaseUrl}/products/${id}`);
  return parseJson<Product>(response);
}
