import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, User, Loader2, KeyRound, Phone, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

type AuthStep = "login" | "signup" | "verify-email-otp" | "forgot-password" | "reset-sent" | "phone-login" | "phone-verify";

const Auth = () => {
  const [step, setStep] = useState<AuthStep>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [pendingSignupData, setPendingSignupData] = useState<{email: string; password: string; fullName: string} | null>(null);
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

  const sendEmailOtp = async (emailAddress: string) => {
    const { error } = await supabase.functions.invoke("send-otp", {
      body: { action: "send", email: emailAddress, type: "email" },
    });
    
    if (error) throw error;
  };

  const verifyEmailOtp = async (emailAddress: string, otp: string) => {
    const { data, error } = await supabase.functions.invoke("send-otp", {
      body: { action: "verify", email: emailAddress, otp, type: "email" },
    });
    
    if (error) throw error;
    return data;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First send OTP for email verification
      await sendEmailOtp(email);
      
      // Store signup data for after verification
      setPendingSignupData({ email, password, fullName });
      
      toast({
        title: "Verification code sent!",
        description: "Please check your email for the 6-digit verification code.",
      });
      
      setStep("verify-email-otp");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (otpCode.length !== 6) {
      toast({ title: "Invalid OTP", description: "Please enter the 6-digit code.", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      // Verify the OTP
      const result = await verifyEmailOtp(pendingSignupData?.email || email, otpCode);
      
      if (!result.success) {
        throw new Error(result.error || "OTP verification failed");
      }

      // If we have pending signup data, complete the registration
      if (pendingSignupData) {
        const { data, error } = await supabase.auth.signUp({
          email: pendingSignupData.email,
          password: pendingSignupData.password,
          options: {
            data: { full_name: pendingSignupData.fullName },
          },
        });

        if (error) throw error;

        if (data.session) {
          toast({
            title: "Account created!",
            description: "Welcome! Your account has been verified and created successfully.",
          });
          navigate("/");
        } else {
          // Auto-confirm should handle this, but fallback to login
          toast({
            title: "Account created!",
            description: "Please sign in with your credentials.",
          });
          setStep("login");
        }
        
        setPendingSignupData(null);
      }
      
      setOtpCode("");
    } catch (error: any) {
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
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
        redirectTo: `${window.location.origin}/reset-password`,
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

  const formatPhoneNumber = (phoneNumber: string): string => {
    let cleaned = phoneNumber.replace(/[^\d+]/g, "");
    if (!cleaned.startsWith("+")) {
      if (cleaned.length >= 10) {
        cleaned = "+" + cleaned;
      }
    }
    return cleaned;
  };

  const validatePhoneNumber = (phoneNumber: string): boolean => {
    const formatted = formatPhoneNumber(phoneNumber);
    return /^\+[1-9]\d{9,14}$/.test(formatted);
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formattedPhone = formatPhoneNumber(phone);
    
    if (!validatePhoneNumber(phone)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number with country code (e.g., +977 9XXXXXXXXX)",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);

    try {
      // Send OTP via our edge function
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { action: "send", phone: formattedPhone, type: "phone" },
      });

      if (error) throw error;

      toast({
        title: "OTP sent!",
        description: `A 6-digit verification code has been sent to ${formattedPhone}`,
      });
      
      // For demo purposes, show the OTP if returned
      if (data?.demo_otp) {
        toast({
          title: "Demo Mode",
          description: `Your OTP code is: ${data.demo_otp}`,
        });
      }
      
      setStep("phone-verify");
    } catch (error: any) {
      toast({ 
        title: "Failed to send OTP", 
        description: error.message || "An error occurred while sending OTP", 
        variant: "destructive" 
      });
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
      const formattedPhone = formatPhoneNumber(phone);
      
      // Verify OTP via our edge function
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { action: "verify", phone: formattedPhone, otp: otpCode, type: "phone" },
      });

      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.error || "OTP verification failed");
      }

      // After phone verification, sign in using Supabase phone auth
      // Note: This requires phone auth to be enabled in Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (authError) {
        // If Supabase phone auth is not enabled, show success but inform user
        toast({ 
          title: "Phone Verified!", 
          description: "Phone authentication is not fully configured. Please use email login.",
        });
        setStep("login");
        setOtpCode("");
        return;
      }

      toast({ title: "Welcome!", description: "You've successfully logged in via phone." });
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
        const formattedPhone = formatPhoneNumber(phone);
        await supabase.functions.invoke("send-otp", {
          body: { action: "send", phone: formattedPhone, type: "phone" },
        });
      } else if (step === "verify-email-otp") {
        await sendEmailOtp(pendingSignupData?.email || email);
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
        <strong>{type === "email" ? (pendingSignupData?.email || email) : phone}</strong>
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
        onClick={type === "email" ? handleVerifyEmailOtp : handleVerifyPhoneOtp}
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
          onClick={() => { setStep("login"); setOtpCode(""); setPendingSignupData(null); }}
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
                {step === "verify-email-otp" && "Verify your email"}
                {step === "forgot-password" && "Reset your password"}
                {step === "reset-sent" && "Check your email"}
                {step === "phone-login" && "Login with phone"}
                {step === "phone-verify" && "Verify your phone"}
              </p>
            </motion.div>
          </div>

          <AnimatePresence mode="wait">
            {/* Email OTP Verification */}
            {step === "verify-email-otp" && renderOtpVerification("email")}
            
            {/* Phone OTP Verification */}
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
                    <motion.form
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onSubmit={handleLogin}
                      className="space-y-4"
                    >
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
                        <Label htmlFor="password">Password</Label>
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

                      <div className="flex items-center justify-between text-sm">
                        <button
                          type="button"
                          onClick={() => setStep("forgot-password")}
                          className="text-accent hover:underline"
                        >
                          Forgot password?
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep("phone-login")}
                          className="text-accent hover:underline flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3" /> Login with phone
                        </button>
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {loading ? "Signing in..." : "Sign In"}
                      </Button>
                    </motion.form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <motion.form
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      onSubmit={handleSignup}
                      className="space-y-4"
                    >
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
                        <Label htmlFor="signupEmail">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signupEmail"
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
                        <Label htmlFor="signupPassword">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signupPassword"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 pr-10"
                            required
                            minLength={6}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Minimum 6 characters
                        </p>
                      </div>

                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {loading ? "Creating account..." : "Create Account"}
                      </Button>
                    </motion.form>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
