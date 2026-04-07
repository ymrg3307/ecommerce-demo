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

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  tags: string[];
  clothType: string;
  color: string;
  material: string;
  fit: string;
  brand: string;
};

const authApiBaseUrl = import.meta.env.VITE_AUTH_API_BASE_URL ?? 'http://localhost:3001';
const catalogApiBaseUrl = import.meta.env.VITE_CATALOG_API_BASE_URL ?? 'http://localhost:3002';

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as
    | { message?: string | string[] }
    | null;

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data?.message.join(', ')
      : data?.message ?? 'Request failed.';
    throw new Error(message);
  }

  return data as T;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const response = await fetch(`${authApiBaseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  return parseJson<LoginResponse>(response);
}

export async function logout(token?: string) {
  await fetch(`${authApiBaseUrl}/auth/logout`, {
    method: 'POST',
    headers: token
      ? {
          Authorization: `Bearer ${token}`
        }
      : undefined
  });
}

export async function getSession(token: string): Promise<LoginResponse> {
  const response = await fetch(`${authApiBaseUrl}/auth/session`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return parseJson<LoginResponse>(response);
}

export async function searchProducts(keyword: string): Promise<Product[]> {
  const response = await fetch(
    `${catalogApiBaseUrl}/products?keyword=${encodeURIComponent(keyword)}`
  );
  return parseJson<Product[]>(response);
}

export async function getProduct(id: string): Promise<Product> {
  const response = await fetch(`${catalogApiBaseUrl}/products/${id}`);
  return parseJson<Product>(response);
}
