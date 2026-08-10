import { AuthError } from "@supabase/supabase-js";

export interface MappedError {
  en: string;
  fa: string;
  technical?: string;
}

export function mapAuthError(error: any): MappedError {
  const message = error?.message || "";
  const code = error?.code || "";
  const status = error?.status;

  // Logging safely (no tokens/keys)
  console.error("[Auth Error]", { code, status, message: message.substring(0, 200) });

  if (message.includes("invalid email")) {
    return { en: "Invalid email", fa: "ایمیل نامعتبر است" };
  }
  
  if (code === "over_email_send_rate_limit" || status === 429 || message.includes("rate limit")) {
    return { 
      en: "Too many requests. Please try again in a few minutes.", 
      fa: "تعداد درخواست زیاد است. چند دقیقه بعد دوباره تلاش کنید" 
    };
  }

  if (message.includes("redirect_uri") || message.includes("Redirect URL")) {
    return {
      en: "Redirect URL not allowed. Please update Supabase configuration.",
      fa: "Redirect URL در Supabase ثبت نشده. https://greeting-helper.vercel.app/auth/callback را اضافه کنید",
      technical: "Ensure https://greeting-helper.vercel.app/auth/callback is in Redirect URLs"
    };
  }

  if (message.includes("email provider disabled") || message.includes("Email signup is disabled")) {
    return {
      en: "Email login is disabled in backend settings.",
      fa: "ورود با ایمیل در Supabase غیرفعال است"
    };
  }

  if (message.includes("user banned") || message.includes("User is disabled")) {
    return {
      en: "This account has been suspended.",
      fa: "این حساب مسدود شده است"
    };
  }

  if (message.includes("fetch failed") || message.includes("NetworkError") || message.includes("Failed to fetch")) {
    return {
      en: "Failed to connect to Auth server. Check your connection.",
      fa: "اتصال به سرور Auth برقرار نشد. اینترنت و URL پروژه را چک کنید"
    };
  }

  if (message.includes("invalid/expired magic link") || message.includes("Email link is invalid or has expired")) {
    return {
      en: "The link has expired or is invalid. Please request a new Magic Link.",
      fa: "لینک منقضی یا نامعتبر است. دوباره Magic Link بفرستید"
    };
  }

  return {
    en: message || "An unexpected authentication error occurred.",
    fa: "خطای غیرمنتظره در احراز هویت رخ داد.",
    technical: message
  };
}
