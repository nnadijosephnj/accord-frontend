import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

export async function upsertUserByWallet({ walletAddress, walletType = "external" }) {
  if (!walletAddress) {
    throw new Error("walletAddress is required");
  }

  const addr = walletAddress.toLowerCase();

  const { data: existing, error: existingError } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", addr)
    .maybeSingle();

  if (existingError) {
    console.error("Supabase read user error:", existingError.message);
    throw existingError;
  }

  if (existing) {
    if (walletType === "generated" && existing.wallet_type !== "generated") {
      const { data: updated, error: updateError } = await supabase
        .from("users")
        .update({
          wallet_type: "generated",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (updateError) {
        console.error("Supabase upgrade wallet_type error:", updateError.message);
        throw updateError;
      }

      return updated;
    }

    return existing;
  }

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        wallet_address: addr,
        wallet_type: walletType,
      },
    ])
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return getUserByWallet(addr);
    }

    console.error("Supabase upsertUserByWallet error:", error.message);
    throw error;
  }

  return data;
}

export async function getUserByWallet(walletAddress) {
  if (!walletAddress) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .maybeSingle();

  if (error) {
    console.error("Supabase getUserByWallet error:", error.message);
    return null;
  }

  return data || null;
}
