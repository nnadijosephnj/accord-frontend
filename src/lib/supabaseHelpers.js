// src/lib/supabaseHelpers.js
// ─────────────────────────────────────────────────────────────
// All Supabase operations related to users
// ─────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

// ── Upsert user after any login ──────────────────────────────
// Called every time a user successfully logs in
// If they already exist → updates. If new → inserts.
export async function upsertUser({ walletAddress, email, loginMethod, walletType }) {
  const { error } = await supabase
    .from("users")
    .upsert(
      {
        wallet_address: walletAddress.toLowerCase(),
        email: email || null,
        login_method: loginMethod,       // 'wallet' | 'google' | 'email'
        wallet_type: walletType,         // 'external' | 'generated'
        updated_at: new Date().toISOString(),
      },
      { onConflict: "wallet_address" }
    );

  if (error) {
    console.error("Supabase upsertUser error:", error.message);
    throw error;
  }
}

// ── Get user by wallet address ───────────────────────────────
export async function getUserByWallet(walletAddress) {
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

// ── Update user email (from Settings page) ──────────────────
export async function updateUserEmail(walletAddress, email) {
  const { error } = await supabase
    .from("users")
    .update({ email: email.toLowerCase() })
    .eq("wallet_address", walletAddress.toLowerCase());

  if (error) {
    console.error("Supabase updateUserEmail error:", error.message);
    throw error;
  }
}

// ── Check if a wallet address already exists ─────────────────
export async function walletExists(walletAddress) {
  const { data } = await supabase
    .from("users")
    .select("wallet_address")
    .eq("wallet_address", walletAddress.toLowerCase())
    .single();

  return !!data;
}
