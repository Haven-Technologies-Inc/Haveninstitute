"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Loader2, Mail, CheckCircle2, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      // Simulate email resend (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setResent(true);
      toast.success("Verification email resent successfully!");
    } catch {
      toast.error("Failed to resend email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card glass className="border-white/20 dark:border-zinc-800/50 shadow-2xl shadow-indigo-500/5">
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
              className="relative"
            >
              <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-green-500/25">
                <motion.div
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <CheckCircle2 className="h-10 w-10 text-white" />
                </motion.div>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="absolute -right-1 -top-1 h-8 w-8 rounded-full bg-white dark:bg-zinc-800 shadow-md flex items-center justify-center"
              >
                <Mail className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </motion.div>
            </motion.div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Check your inbox
          </CardTitle>
          <CardDescription className="text-muted-foreground max-w-sm mx-auto">
            We&apos;ve sent a verification link to your email address. Click the
            link to verify your account and get started.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Instructions */}
          <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 p-4 space-y-2">
            <p className="text-sm text-indigo-800 dark:text-indigo-300 font-medium">
              What to do next:
            </p>
            <ol className="text-sm text-indigo-700 dark:text-indigo-400 space-y-1 list-decimal list-inside">
              <li>Open your email inbox</li>
              <li>Look for an email from Haven Institute</li>
              <li>Click the verification link in the email</li>
              <li>You&apos;ll be redirected to sign in</li>
            </ol>
          </div>

          {/* Resend Button */}
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Didn&apos;t receive the email?
            </p>
            <Button
              variant="outline"
              className="bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700"
              onClick={handleResendEmail}
              disabled={isResending || resent}
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : resent ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Email resent
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Resend verification email
                </>
              )}
            </Button>
          </div>

          {/* Spam Notice */}
          <p className="text-center text-xs text-muted-foreground">
            Make sure to check your spam or junk folder if you don&apos;t see
            the email in your inbox.
          </p>

          {/* Back to Login */}
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
