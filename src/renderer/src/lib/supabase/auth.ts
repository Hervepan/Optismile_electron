import { supabase } from "./client";

export const signInWithGoogle = async (): Promise<void> => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "optismile://login-callback",
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;

  if (data?.url) {
    // Securely delegate opening the browser to the Main process
    (window as any).api.auth.openExternal(data.url);
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const handleAuthCallback = async (urlStr: string): Promise<void> => {
  try {
    console.log("Parsing auth callback URL:", urlStr);
    const url = new URL(urlStr.replace("#", "?")); 
    const params = new URLSearchParams(url.search);

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!accessToken || !refreshToken) {
      console.error("No tokens found in deep link. URL might be malformed or missing hash fragment.");
      return;
    }

    console.log("Tokens found, setting session...");
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      console.error("Supabase setSession error:", error.message);
      throw error;
    }
    
    console.log("Session set successfully!");
  } catch (err) {
    console.error("Failed to handle auth callback:", err);
  }
};
