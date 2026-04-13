import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

function normalizeWalletAddress(walletAddress) {
  if (!walletAddress) {
    throw new Error("walletAddress is required");
  }

  return walletAddress.toLowerCase();
}

export async function upsertUserByWallet({ walletAddress, walletType = "external" }) {
  const addr = normalizeWalletAddress(walletAddress);

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
    .eq("wallet_address", normalizeWalletAddress(walletAddress))
    .maybeSingle();

  if (error) {
    console.error("Supabase getUserByWallet error:", error.message);
    return null;
  }

  return data || null;
}

export async function updateUserByWallet(walletAddress, updates) {
  const addr = normalizeWalletAddress(walletAddress);

  const payload = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("users")
    .update(payload)
    .eq("wallet_address", addr)
    .select()
    .single();

  if (error) {
    console.error("Supabase updateUserByWallet error:", error.message);
    throw error;
  }

  return data;
}

export async function getAddressBookEntries(walletAddress) {
  const addr = normalizeWalletAddress(walletAddress);

  const { data, error } = await supabase
    .from("address_book")
    .select("*")
    .eq("wallet_address", addr)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Supabase getAddressBookEntries error:", error.message);
    throw error;
  }

  return data || [];
}

export async function addAddressBookEntry({ walletAddress, nickname, savedAddress }) {
  const addr = normalizeWalletAddress(walletAddress);

  const { data, error } = await supabase
    .from("address_book")
    .insert([
      {
        wallet_address: addr,
        nickname,
        saved_address: savedAddress.toLowerCase(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Supabase addAddressBookEntry error:", error.message);
    throw error;
  }

  return data;
}

export async function updateAddressBookEntry({
  id,
  walletAddress,
  nickname,
  savedAddress,
}) {
  const addr = normalizeWalletAddress(walletAddress);

  const { data, error } = await supabase
    .from("address_book")
    .update({
      nickname,
      saved_address: savedAddress.toLowerCase(),
    })
    .eq("id", id)
    .eq("wallet_address", addr)
    .select()
    .single();

  if (error) {
    console.error("Supabase updateAddressBookEntry error:", error.message);
    throw error;
  }

  return data;
}

export async function deleteAddressBookEntry({ id, walletAddress }) {
  const addr = normalizeWalletAddress(walletAddress);

  const { error } = await supabase
    .from("address_book")
    .delete()
    .eq("id", id)
    .eq("wallet_address", addr);

  if (error) {
    console.error("Supabase deleteAddressBookEntry error:", error.message);
    throw error;
  }
}
