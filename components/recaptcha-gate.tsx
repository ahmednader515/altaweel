"use client";

import { useState, useEffect, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface RecaptchaGateProps {
  children: React.ReactNode;
  onVerified?: () => void;
}

const VERIFICATION_KEY = "recaptcha_gate_verified";
const VERIFICATION_EXPIRY_KEY = "recaptcha_gate_expiry";
const VERIFICATION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function RecaptchaGate({ children, onVerified }: RecaptchaGateProps) {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
    // Check if verification is still valid
    const checkVerification = () => {
      if (typeof window === "undefined") return;

      const verified = localStorage.getItem(VERIFICATION_KEY);
      const expiry = localStorage.getItem(VERIFICATION_EXPIRY_KEY);

      if (verified === "true" && expiry) {
        const expiryTime = parseInt(expiry, 10);
        const now = Date.now();

        if (now < expiryTime) {
          setIsVerified(true);
          setIsLoading(false);
          onVerified?.();
          return;
        } else {
          // Verification expired, clear it
          localStorage.removeItem(VERIFICATION_KEY);
          localStorage.removeItem(VERIFICATION_EXPIRY_KEY);
        }
      }

      setIsLoading(false);
    };

    checkVerification();
  }, [onVerified]);

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const handleVerify = async () => {
    if (!recaptchaToken) {
      return;
    }

    setIsLoading(true);

    try {
      // Verify with server
      const response = await axios.post("/api/auth/verify-recaptcha-gate", {
        token: recaptchaToken,
      });

      if (response.data.success) {
        // Store verification with expiry
        const expiryTime = Date.now() + VERIFICATION_DURATION;
        localStorage.setItem(VERIFICATION_KEY, "true");
        localStorage.setItem(VERIFICATION_EXPIRY_KEY, expiryTime.toString());

        setIsVerified(true);
        onVerified?.();
      } else {
        // Reset reCAPTCHA on failure
        recaptchaRef.current?.reset();
        setRecaptchaToken(null);
      }
    } catch (error) {
      console.error("reCAPTCHA verification failed:", error);
      // Reset reCAPTCHA on error
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking verification
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Show gate if not verified
  if (!isVerified) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="w-full max-w-md mx-4 p-8 bg-card rounded-lg shadow-lg border">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">التحقق من الأمان</h2>
              <p className="text-sm text-muted-foreground">
                يرجى إكمال التحقق من reCAPTCHA للوصول إلى الموقع
              </p>
            </div>

            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                onChange={handleRecaptchaChange}
                theme="light"
              />
            </div>

            <Button
              onClick={handleVerify}
              disabled={!recaptchaToken || isLoading}
              className="w-full bg-brand hover:bg-brand/90 text-white"
            >
              {isLoading ? "جاري التحقق..." : "التحقق والمتابعة"}
            </Button>

            <p className="text-xs text-muted-foreground">
              هذا التحقق يساعدنا في حماية الموقع من الروبوتات والهجمات
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show children if verified
  return <>{children}</>;
}

