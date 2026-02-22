"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  Loader2,
  Mail,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type VerifyStatus = "loading" | "success" | "error" | "no-token";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<VerifyStatus>(
    token ? "loading" : "no-token"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const [resendEmail, setResendEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");

  const verifyEmail = useCallback(async (verificationToken: string) => {
    setStatus("loading");
    try {
      const response = await fetch(
        `/api/auth/verify-email?token=${encodeURIComponent(verificationToken)}`
      );

      const result = await response.json();

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(
          result.error || "Verification failed. The link may be invalid or expired."
        );
        toast.error("Email verification failed.");
        return;
      }

      setStatus("success");
      toast.success("Email verified successfully!");
    } catch {
      setStatus("error");
      setErrorMessage(
        "Something went wrong during verification. Please try again."
      );
      toast.error("Email verification failed.");
    }
  }, []);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resendEmail.trim()) {
      setResendError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resendEmail)) {
      setResendError("Please enter a valid email address");
      return;
    }

    setResendError("");
    setIsResending(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail.trim().toLowerCase() }),
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(
          result.error || "Failed to resend verification email."
        );
        return;
      }

      setResendSuccess(true);
      toast.success("Verification email sent!");
    } catch {
      toast.error("Failed to resend verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Loading state
  if (status === "loading") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card
          glass
          className="border-white/20 dark:border-zinc-800/50 shadow-2xl shadow-indigo-500/5"
        >
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4">
              <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Loader2 className="h-10 w-10 text-white animate-spin" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Verifying your email
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Please wait while we verify your email address...
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex justify-center py-4">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-2 w-2 rounded-full bg-indigo-500"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Card
          glass
          className="border-white/20 dark:border-zinc-800/50 shadow-2xl shadow-indigo-500/5"
        >
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.2,
                }}
              >
                <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-green-500/25">
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </div>
              </motion.div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Email verified!
            </CardTitle>
            <CardDescription className="text-muted-foreground max-w-sm mx-auto">
              Your email has been verified successfully. You can now sign in to
              your account.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition-all duration-200"
              asChild
            >
              <Link href="/login">Sign in to your account</Link>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Error state or no-token state
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card
        glass
        className="border-white/20 dark:border-zinc-800/50 shadow-2xl shadow-indigo-500/5"
      >
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.2,
              }}
            >
              <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/25">
                <AlertTriangle className="h-10 w-10 text-white" />
              </div>
            </motion.div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {status === "no-token"
              ? "Missing verification link"
              : "Verification failed"}
          </CardTitle>
          <CardDescription className="text-muted-foreground max-w-sm mx-auto">
            {status === "no-token"
              ? "No verification token was provided. Please use the link from your email."
              : errorMessage ||
                "Invalid or expired verification link. You can request a new one below."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Resend Verification Form */}
          <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 p-4">
            <p className="text-sm text-indigo-800 dark:text-indigo-300 font-medium mb-3">
              Request a new verification email
            </p>

            {resendSuccess ? (
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>
                  Verification email sent! Check your inbox.
                </span>
              </div>
            ) : (
              <form
                onSubmit={handleResendVerification}
                className="space-y-3"
              >
                <div className="space-y-1.5">
                  <Label
                    htmlFor="resend-email"
                    className="text-xs font-medium text-indigo-700 dark:text-indigo-400"
                  >
                    Your email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="resend-email"
                      type="email"
                      placeholder="you@example.com"
                      value={resendEmail}
                      onChange={(e) => {
                        setResendEmail(e.target.value);
                        if (resendError) setResendError("");
                      }}
                      className="pl-10 h-10 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700"
                      disabled={isResending}
                    />
                  </div>
                  {resendError && (
                    <p className="text-xs text-red-500">{resendError}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white"
                  disabled={isResending}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-3.5 w-3.5" />
                      Resend verification email
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
