import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Package, LogIn, AlertCircle, UserPlus, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const { login, signup } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"manager" | "auditor">("auditor");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isSignup) {
      const res = await signup(email, password, fullName, role);
      if (res.error) setError(res.error);
    } else {
      const res = await login(email, password);
      if (res.error) setError(res.error);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background relative overflow-hidden">
      {/* Floating ambient shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-primary/5 blur-3xl"
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "10%", left: "10%" }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full bg-secondary/5 blur-3xl"
          animate={{ x: [0, -40, 0], y: [0, 40, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{ bottom: "10%", right: "10%" }}
        />
        <motion.div
          className="absolute w-64 h-64 rounded-full bg-accent/5 blur-3xl"
          animate={{ x: [0, 30, 0], y: [0, 50, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: "40%", right: "30%" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-sm space-y-6 relative z-10"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20"
          >
            <Package className="h-8 w-8 text-primary-foreground" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold tracking-tight"
          >
            AssetTrack
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1"
          >
            <Sparkles className="h-3.5 w-3.5" /> Inventory management, simplified
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border bg-card/80 backdrop-blur-sm p-6 shadow-xl shadow-black/5"
        >
          {/* Tab switch */}
          <div className="flex mb-5 rounded-lg bg-muted p-1">
            <button
              onClick={() => { setIsSignup(false); setError(""); }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${!isSignup ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsSignup(true); setError(""); }}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${isSignup ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {isSignup && (
                <motion.div
                  key="name"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Sarah Mitchell" required />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} placeholder="you@company.com" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} placeholder="••••••••" required minLength={6} />
            </div>

            <AnimatePresence mode="wait">
              {isSignup && (
                <motion.div
                  key="role"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <Label>Role</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    {(["manager", "auditor"] as const).map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`rounded-lg border-2 p-3 text-center transition-all ${
                          role === r
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        <p className="text-sm font-medium capitalize">{r}</p>
                        <p className="text-[10px] mt-0.5 text-muted-foreground">
                          {r === "manager" ? "Full access" : "Audit only"}
                        </p>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
              ) : isSignup ? (
                <><UserPlus className="h-4 w-4" /> Create Account</>
              ) : (
                <><LogIn className="h-4 w-4" /> Sign In</>
              )}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
