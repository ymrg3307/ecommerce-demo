import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState
} from 'react';
import {
  getSession,
  login as loginRequest,
  logout as logoutRequest,
  SessionUser
} from '../lib/api';

type AuthState = {
  initialized: boolean;
  user: SessionUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);
const STORAGE_KEY = 'ctt-demo-session';

export function AuthProvider({ children }: PropsWithChildren) {
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setInitialized(true);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { token: string };
      setToken(parsed.token);

      void getSession(parsed.token)
        .then((session) => {
          setUser(session.user);
          setToken(session.token);
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: session.token }));
        })
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem(STORAGE_KEY);
        })
        .finally(() => {
          setInitialized(true);
        });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setInitialized(true);
    }
  }, []);

  const value: AuthState = {
    initialized,
    user,
    token,
    async login(email, password) {
      const session = await loginRequest({ email, password });
      setUser(session.user);
      setToken(session.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: session.token }));
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
