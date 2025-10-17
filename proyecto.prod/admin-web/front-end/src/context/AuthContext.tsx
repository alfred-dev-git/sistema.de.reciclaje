import { createContext, useContext, useEffect, useState } from 'react';
import { http } from '../api/http';
import { setAuthContextRef } from '../api/https'; //solo para registrar el logout global

type User = { nombre: string; email: string; rol_idrol: number };

type AuthCtx = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({} as any);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    http.get('/auth/me')
      .then(r => setUser(r.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    await http.post('/auth/login', { email, password });
    const me = await http.get('/auth/me');
    setUser(me.data.user);
  };

const logout = async (silent = false) => {
  try {
    if (!silent) await http.post('/auth/logout');
  } catch {
    // Ignorar errores si el token ya expiró
  } finally {
    setUser(null);
  }
};


  // 👇 Esto conecta el AuthContext con los interceptores del https
useEffect(() => {
  setAuthContextRef({ logout: () => logout(true) });
}, []);


  return (
    <Ctx.Provider value={{ user, loading, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
