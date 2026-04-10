// src/lib/supabaseHelpers.js
// ─────────────────────────────────────────────────────────────
// All Supabase operations related to users
// ─────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

// ── Upsert user after Google/Email login (Guest Mode support) ──
export async function upsertUserByEmail({ email, loginMethod }) {
  // First check if user exists by email
  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();

  if (existing) {
    return existing;
  }

  // Create new guest user
  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        email: email.toLowerCase(),
        login_method: loginMethod,
        wallet_address: null,
        wallet_type: null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Supabase upsertUserByEmail error:", error.message);
    throw error;
  }
  return data;
}

// ── Link a wallet to an existing email-based account ──────────
export async function linkWalletToUser(userId, { walletAddress, walletType }) {
  const { data, error } = await supabase
    .from("users")
    .update({
      wallet_address: walletAddress.toLowerCase(),
      wallet_type: walletType,
      updated_at: new Date().toISOString()
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Supabase linkWalletToUser error:", error.message);
    throw error;
  }
  return data;
}

// ── Upsert user after direct Wallet login (standard Wallet path) ──
export async function upsertUserByWallet({ walletAddress, walletType, loginMethod = 'wallet' }) {
  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .single();

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        wallet_address: walletAddress.toLowerCase(),
        wallet_type: walletType,
        login_method: loginMethod,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Supabase upsertUserByWallet error:", error.message);
    throw error;
  }
  return data;
}

// ── Get user by wallet address ───────────────────────────────
export async function getUserByWallet(walletAddress) {
  if (!walletAddress) return null;
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Supabase getUserByWallet error:", error.message);
  }
  return data || null;
}

// ── Get user by email ────────────────────────────────────────
export async function getUserByEmail(email) {
  if (!email) return null;
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Supabase getUserByEmail error:", error.message);
  }
  return data || null;
}
