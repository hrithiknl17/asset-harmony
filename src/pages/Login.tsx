import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Package, LogIn, AlertCircle } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(email, password)) {
      setError(true);
    }
  };

  const fillDemo = () => {
    setEmail("manager@assettrack.com");
    setPassword("demo123");
    setError(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Package className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AssetTrack</h1>
          <p className="text-sm text-muted-foreground mt-1">Manager Login</p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => { setEmail(e.target.value); setError(false); }} placeholder="manager@assettrack.com" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => { setPassword(e.target.value); setError(false); }} placeholder="••••••" />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Invalid credentials. Only managers can access this system.
              </div>
            )}

            <Button type="submit" className="w-full gap-2">
              <LogIn className="h-4 w-4" /> Sign In
            </Button>
          </form>
        </div>

        <div className="rounded-lg border border-dashed bg-card p-4 text-center">
          <p className="text-xs text-muted-foreground mb-2">Demo Credentials</p>
          <p className="font-mono text-xs">manager@assettrack.com</p>
          <p className="font-mono text-xs">demo123</p>
          <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={fillDemo}>
            Auto-fill credentials
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
