import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  user: { name: string; email: string; role: string } | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const DEMO_CREDENTIALS = {
  email: "manager@assettrack.com",
  password: "demo123",
  user: { name: "Sarah Mitchell", email: "manager@assettrack.com", role: "Manager" },
};

const defaultValue: AuthContextType = {
  isAuthenticated: false,
  user: null,
  login: () => false,
  logout: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultValue);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthContextType["user"]>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("assettrack_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (email: string, password: string) => {
    if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
      setUser(DEMO_CREDENTIALS.user);
      sessionStorage.setItem("assettrack_user", JSON.stringify(DEMO_CREDENTIALS.user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("assettrack_user");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
