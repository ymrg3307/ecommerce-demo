import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState
} from 'react';
import { login as loginRequest, logout as logoutRequest, SessionUser } from '../lib/api';

type AuthState = {
  user: SessionUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);
const STORAGE_KEY = 'ctt-demo-session';

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { user: SessionUser; token: string };
      setUser(parsed.user);
      setToken(parsed.token);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const value: AuthState = {
    user,
    token,
    async login(email, password) {
      const session = await loginRequest({ email, password });
      setUser(session.user);
      setToken(session.token);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user: session.user,
          token: session.token
        })
      );
    },
    async logout() {
      await logoutRequest(token ?? undefined);
      setUser(null);
      setToken(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}
