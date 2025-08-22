import { supabase } from '../supabaseClient';

/** ───────────────────────────────────────────────────────────────
 * Types & Utilities
 * ─────────────────────────────────────────────────────────────── */

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "EMAIL_ALREADY_REGISTERED"
  | "EMAIL_NOT_CONFIRMED"
  | "RATE_LIMITED"
  | "NETWORK"
  | "LINK_EXPIRED_OR_INVALID"
  | "WEAK_PASSWORD"
  | "INVALID_EMAIL"
  | "UNKNOWN";

export type AuthResult<T = unknown> =
  | { success: true; message?: string; data?: T }
  | { success: false; code: AuthErrorCode; message: string; raw?: unknown };

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isStrongPassword = (pwd: string) =>
  // Example: ≥ 8 chars (add your own rules if needed)
  typeof pwd === "string" && pwd.length >= 8;

function normalizeError(err: any): { code: AuthErrorCode; message: string } {
  // Supabase AuthError shape: { message: string; status?: number; name?: string }
  const msg = (err?.message || "").toString().toLowerCase();
  const status = Number(err?.status) || 0;

  if (status === 429 || msg.includes("too many requests")) {
    return { code: "RATE_LIMITED", message: "Too many attempts. Try again later." };
  }
  if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
    return { code: "INVALID_CREDENTIALS", message: "Invalid login credentials." };
  }
  if (msg.includes("email not confirmed") || msg.includes("confirm your email")) {
    return { code: "EMAIL_NOT_CONFIRMED", message: "Please confirm your email to continue." };
  }
  if (msg.includes("already registered") || msg.includes("user already exists") || msg.includes("email already in use")) {
    return { code: "EMAIL_ALREADY_REGISTERED", message: "Email is already registered." };
  }
  if (msg.includes("reset token is invalid") || msg.includes("token expired") || msg.includes("invalid or expired")) {
    return { code: "LINK_EXPIRED_OR_INVALID", message: "This link is invalid or has expired." };
  }
  if (msg.includes("password should be at least") || msg.includes("password too short")) {
    return { code: "WEAK_PASSWORD", message: "Password is too weak. Use at least 8 characters." };
  }
  if (msg.includes("network") || status === 0) {
    return { code: "NETWORK", message: "Network error. Check your connection and try again." };
  }
  return { code: "UNKNOWN", message: err?.message || "Something went wrong." };
}

/** Optional: retry wrapper for transient errors (network/429) */
async function withRetry<T>(fn: () => Promise<T>, times = 2, baseDelayMs = 400): Promise<T> {
  let lastErr: any;
  for (let i = 0; i <= times; i++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      const msg = (err?.message || "").toLowerCase();
      const status = Number(err?.status) || 0;
      const transient = status === 429 || status === 0 || msg.includes("network");
      if (!transient || i === times) break;
      await new Promise((r) => setTimeout(r, baseDelayMs * Math.pow(2, i))); // exp backoff
    }
  }
  throw lastErr;
}

function buildRedirect(path: string) {
  // Ensure this matches Supabase → Auth → Settings → Redirect URLs
  const base =
    import.meta?.env?.VITE_APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:5173";
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

/** Parse both search & hash for Supabase link params */
function getAuthURLParams() {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  // PKCE style
  const code = search.get("code") || hash.get("code");

  // Legacy style
  const access_token = hash.get("access_token") || search.get("access_token");
  const refresh_token = hash.get("refresh_token") || search.get("refresh_token");

  // Common
  const type = hash.get("type") || search.get("type"); // e.g., signup, recovery

  return { code, access_token, refresh_token, type };
}

/** ───────────────────────────────────────────────────────────────
 * Sign Up (handles existing email)
 * ─────────────────────────────────────────────────────────────── */
export async function signUpUser(email: string, password: string): Promise<AuthResult<{ userId?: string }>> {
  if (!isValidEmail(email)) {
    return { success: false, code: "INVALID_EMAIL", message: "Enter a valid email address." };
  }
  if (!isStrongPassword(password)) {
    return { success: false, code: "WEAK_PASSWORD", message: "Password must be at least 8 characters." };
  }

  try {
    const { data, error } = await withRetry(() =>
      supabase.auth.signUp({
        email,
        password,
        // Optionally preconfigure flow metadata here
      })
    );

    if (error) {
      const { code, message } = normalizeError(error);
      return { success: false, code, message, raw: error };
    }

    // Create user profile with 5 credits and 24-hour reset
    if (data?.user?.id) {
      const resetTime = new Date();
      resetTime.setHours(resetTime.getHours() + 24);
      
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: data.user.id,
          email: email,
          credits: 5,
          credits_reset_at: resetTime.toISOString()
        });
      
      if (profileError) {
        console.error('Error creating user profile:', profileError);
      }
    }

    return {
      success: true,
      message: "Account created. Check your email to confirm your account.",
      data: { userId: data?.user?.id },
    };
  } catch (err: any) {
    const { code, message } = normalizeError(err);
    return { success: false, code, message, raw: err };
  }
}

/** ───────────────────────────────────────────────────────────────
 * Sign In (handles invalid credentials, unconfirmed email, rate limits)
 * ─────────────────────────────────────────────────────────────── */
export async function signInUser(email: string, password: string): Promise<AuthResult<{ userId?: string }>> {
  if (!isValidEmail(email)) {
    return { success: false, code: "INVALID_EMAIL", message: "Enter a valid email address." };
  }

  try {
    const { data, error } = await withRetry(() =>
      supabase.auth.signInWithPassword({ email, password })
    );

    if (error) {
      const { code, message } = normalizeError(error);
      return { success: false, code, message, raw: error };
    }

    return { success: true, message: "Login successful.", data: { userId: data?.user?.id } };
  } catch (err: any) {
    const { code, message } = normalizeError(err);
    return { success: false, code, message, raw: err };
  }
}

/** ───────────────────────────────────────────────────────────────
 * Password Reset: send email
 * ─────────────────────────────────────────────────────────────── */
/**
 * Request a Password Reset Link
 * Sends a reset email to the user
 */
export async function sendPasswordReset(email: string) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: "Password reset link has been sent to your email." };
  } catch (err) {
    console.error("Unexpected error in requestPasswordReset:", err);
    return { success: false, message: "Something went wrong. Please try again later." };
  }
}

/** ───────────────────────────────────────────────────────────────
 * Password Recovery Callback:
 * - Call this on your /reset-password route load
 * - Supports both PKCE (?code=...) and legacy (#access_token=...)
 * - Returns a specific state to drive UI
 * ─────────────────────────────────────────────────────────────── */
export type RecoveryInitResult =
  | { state: "PASSWORD_RECOVERY_READY" }
  | { state: "EMAIL_CONFIRMED"; message?: string }
  | { state: "NO_ACTION" }
  | { state: "ERROR"; code: AuthErrorCode; message: string; raw?: unknown };

export async function initAuthFromURL(): Promise<RecoveryInitResult> {
  // For password reset, just check if we're on the reset page
  if (window.location.pathname === '/reset-password') {
    return { state: "PASSWORD_RECOVERY_READY" };
  }
  return { state: "NO_ACTION" };
}

/** ───────────────────────────────────────────────────────────────
 * Update Password (after recovery init)
 * - Call on your reset form submit
 * ─────────────────────────────────────────────────────────────── */
/**
 * Update Password (After Clicking Reset Link)
 * Supabase will auto-sign-in the user after clicking reset link
 */
export async function updatePassword(newPassword: string) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: "Password has been reset successfully." };
  } catch (err) {
    console.error("Unexpected error in updatePassword:", err);
    return { success: false, message: "Something went wrong. Please try again later." };
  }
}