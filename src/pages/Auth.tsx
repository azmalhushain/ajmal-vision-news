import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, User, Loader2, KeyRound, Phone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AuthStep = "login" | "signup" | "verify-otp" | "forgot-password" | "reset-sent" | "phone-login" | "phone-verify";

const Auth = () => {
  const [step, setStep] = useState<AuthStep>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast({
        title: "Verification email sent!",
        description: "Please check your email for the OTP code.",
      });
      setStep("verify-otp");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: "Welcome back!", description: "You've successfully logged in." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });

      if (error) throw error;

      toast({
        title: "Reset link sent!",
        description: "Check your email for the password reset link.",
      });
      setStep("reset-sent");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
      const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });

      if (error) throw error;

      toast({
        title: "OTP sent!",
        description: "Check your phone for the verification code.",
      });
      setStep("phone-verify");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      toast({ title: "Invalid OTP", description: "Please enter the 6-digit code.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "signup",
      });

      if (error) throw error;

      toast({ title: "Account verified!", description: "Your account has been verified successfully." });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (otpCode.length !== 6) {
      toast({ title: "Invalid OTP", description: "Please enter the 6-digit code.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otpCode,
        type: "sms",
      });

      if (error) throw error;

      toast({ title: "Welcome!", description: "You've successfully logged in." });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);

    try {
      if (step === "phone-verify") {
        const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;
        await supabase.auth.signInWithOtp({ phone: formattedPhone });
      } else {
        await supabase.auth.resend({ type: "signup", email });
      }
      toast({ title: "OTP Resent!", description: "A new verification code has been sent." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const renderOtpVerification = (type: "email" | "phone") => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-center mb-4">
        <div className="p-4 rounded-full bg-accent/10">
          <KeyRound className="h-8 w-8 text-accent" />
        </div>
      </div>
      
      <p className="text-center text-sm text-muted-foreground">
        We've sent a 6-digit code to{" "}
        <strong>{type === "email" ? email : phone}</strong>
      </p>

      <div className="flex justify-center">
        <InputOTP value={otpCode} onChange={setOtpCode} maxLength={6}>
          <InputOTPGroup>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>

      <Button
        onClick={type === "email" ? handleVerifyOtp : handleVerifyPhoneOtp}
        className="w-full"
        disabled={loading || otpCode.length !== 6}
      >
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {loading ? "Verifying..." : "Verify Code"}
      </Button>

      <div className="text-center space-y-2">
        <button onClick={handleResendOtp} disabled={loading} className="text-sm text-accent hover:underline">
          Didn't receive code? Resend
        </button>
        <br />
        <button
          onClick={() => { setStep("login"); setOtpCode(""); }}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 mx-auto"
        >
          <ArrowLeft className="h-3 w-3" /> Back to login
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 rounded-2xl shadow-2xl">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-blue-400 bg-clip-text text-transparent">
                Ajmal Vision News
              </h1>
              <p className="text-muted-foreground mt-2">
                {step === "login" && "Welcome back"}
                {step === "signup" && "Create your account"}
                {step === "verify-otp" && "Verify your email"}
                {step === "forgot-password" && "Reset your password"}
                {step === "reset-sent" && "Check your email"}
                {step === "phone-login" && "Login with phone"}
                {step === "phone-verify" && "Verify your phone"}
              </p>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {/* OTP Verification */}
            {step === "verify-otp" && renderOtpVerification("email")}
            {step === "phone-verify" && renderOtpVerification("phone")}

            {/* Forgot Password */}
            {step === "forgot-password" && (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleForgotPassword}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="reset-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>

                <button
                  type="button"
                  onClick={() => setStep("login")}
                  className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" /> Back to login
                </button>
              </motion.form>
            )}

            {/* Reset Sent Confirmation */}
            {step === "reset-sent" && (
              <motion.div
                key="reset-sent"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <div className="p-4 rounded-full bg-green-500/10 inline-block">
                  <Mail className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="font-semibold">Check your email</h3>
                <p className="text-sm text-muted-foreground">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <Button onClick={() => setStep("login")} variant="outline" className="w-full">
                  Back to Login
                </Button>
              </motion.div>
            )}

            {/* Phone Login */}
            {step === "phone-login" && (
              <motion.form
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handlePhoneLogin}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+977 9XXXXXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Include country code (e.g., +977 for Nepal)
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>

                <button
                  type="button"
                  onClick={() => setStep("login")}
                  className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" /> Back to email login
                </button>
              </motion.form>
            )}

            {/* Login/Signup Forms */}
            {(step === "login" || step === "signup") && (
              <motion.div
                key="main"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Tabs value={step} onValueChange={(v) => setStep(v as "login" | "signup")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center">
                          <Label htmlFor="password">Password</Label>
                          <button
                            type="button"
                            onClick={() => setStep("forgot-password")}
                            className="text-xs text-accent hover:underline"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {loading ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="fullName"
                            type="text"
                            placeholder="John Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="signup-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {loading ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setStep("phone-login")}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Login with Phone Number
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;