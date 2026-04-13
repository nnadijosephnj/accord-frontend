import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion as Motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronRight,
  Copy,
  ImagePlus,
  KeyRound,
  LoaderCircle,
  PencilLine,
  Plus,
  ShieldAlert,
  Trash2,
  Upload,
  Wallet,
  X,
} from "lucide-react";
import { ethers } from "ethers";
import { Insight, getContract } from "thirdweb";
import { useActiveWallet, useWalletDetailsModal } from "thirdweb/react";
import { ownerOf } from "thirdweb/extensions/erc721";
import { useAuth } from "../../context/AuthContext";
import { useNetwork } from "../../context/NetworkContext";
import { useTheme } from "../../context/ThemeContext";
import { useWallet } from "../../context/WalletContext";
import { resolveIpfsUrl, toIpfsUri } from "../../lib/ipfs";
import {
  addAddressBookEntry,
  deleteAddressBookEntry,
  getAddressBookEntries,
  updateAddressBookEntry,
  updateUserByWallet,
} from "../../lib/supabaseHelpers";
import { client } from "../../lib/thirdwebClient";
import { uploadFileCall } from "../../utils/api";

const TABS = [
  { id: "general", label: "General" },
  { id: "security", label: "Security" },
  { id: "advanced", label: "Advanced" },
];

const SAVE_SUCCESS_MESSAGE = "Saved successfully";
const SAVE_ERROR_MESSAGE = "Failed to save. Please try again.";
const INVALID_ADDRESS_MESSAGE =
  "This does not look like a valid wallet address. Please check and try again.";
const TESTNET_WARNING = "TESTNET MODE ACTIVE - No real funds";
const EMAIL_HINT = "For transaction notifications only";

function shortenAddress(address) {
  if (!address) {
    return "Not set";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function readValue(value) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return "Not set";
}

function getInitials(value, fallback = "AC") {
  const safeValue = value?.trim();

  if (!safeValue) {
    return fallback;
  }

  const parts = safeValue.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() || "").join("") || fallback;
}

function getNftKey(nft) {
  return `${nft.tokenAddress}-${nft.id.toString()}`;
}

function getNftImage(nft) {
  return resolveIpfsUrl(
    nft?.metadata?.image_url ||
      nft?.metadata?.image ||
      nft?.metadata?.animation_url ||
      ""
  );
}

function getNftDisplayName(nft) {
  return nft?.metadata?.name?.trim() || `Token #${nft?.id?.toString?.() || ""}`;
}

function isValidEmail(value) {
  if (!value) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function SettingsSection({ title, action, children }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-zinc-400 dark:text-zinc-500">
          {title}
        </p>
        {action}
      </div>
      <div className="overflow-hidden rounded-[28px] border border-zinc-200/80 bg-white shadow-sm dark:border-white/5 dark:bg-[#171717]">
        {children}
      </div>
    </section>
  );
}

function SettingsRow({
  title,
  subtitle,
  value,
  onClick,
  trailing,
  isLast = false,
  disabled = false,
}) {
  const content = (
    <>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-zinc-900 dark:text-white">{title}</p>
        {subtitle ? (
          <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </p>
        ) : null}
      </div>
      {value ? (
        <div className="max-w-[55%] shrink-0 text-right text-sm text-zinc-500 dark:text-zinc-400">
          {value}
        </div>
      ) : null}
      {trailing}
      {onClick ? (
        <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" />
      ) : null}
    </>
  );

  const className = `flex w-full items-center gap-4 px-5 py-4 text-left transition-colors ${
    !isLast ? "border-b border-zinc-100 dark:border-white/5" : ""
  } ${
    onClick && !disabled
      ? "hover:bg-zinc-50/80 dark:hover:bg-white/[0.03]"
      : ""
  } ${disabled ? "cursor-not-allowed opacity-60" : ""}`;

  if (!onClick) {
    return <div className={className}>{content}</div>;
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      {content}
    </button>
  );
}

function SegmentedTabs({ activeTab, onChange }) {
  return (
    <div className="inline-flex rounded-2xl bg-zinc-100 p-1 dark:bg-white/5">
      {TABS.map((tab) => {
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all sm:px-5 ${
              active
                ? "bg-orange-500 text-white shadow-[0_10px_24px_rgba(234,88,12,0.28)]"
                : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function ToggleButton({ enabled, enabledLabel, disabledLabel, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-3 rounded-full border px-2 py-1.5 transition-all ${
        enabled
          ? "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-400"
          : "border-zinc-200 bg-zinc-100 text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400"
      }`}
    >
      <span className="px-2 text-xs font-bold uppercase tracking-[0.18em]">
        {enabled ? enabledLabel : disabledLabel}
      </span>
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black transition-all ${
          enabled ? "bg-orange-500 text-white" : "bg-white text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300"
        }`}
      >
        {enabled ? "On" : "Off"}
      </span>
    </button>
  );
}

function ModalShell({ open, onClose, title, description, children, footer }) {
  return (
    <AnimatePresence>
      {open ? (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            aria-label="Close modal"
          />
          <Motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-[30px] border border-zinc-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-[#141414]"
          >
            <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-6 py-5 dark:border-white/5">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{title}</h3>
                {description ? (
                  <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-white/5 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
            {footer ? (
              <div className="border-t border-zinc-100 px-6 py-4 dark:border-white/5">{footer}</div>
            ) : null}
          </Motion.div>
        </Motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ToastStack({ toasts }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[140] flex w-full max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-lg ${
              toast.type === "error"
                ? "border-red-200 bg-white text-red-600 dark:border-red-500/20 dark:bg-[#151515] dark:text-red-400"
                : "border-orange-200 bg-white text-zinc-900 dark:border-orange-500/20 dark:bg-[#151515] dark:text-white"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  toast.type === "error"
                    ? "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400"
                    : "bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400"
                }`}
              >
                {toast.type === "error" ? (
                  <AlertTriangle className="h-3.5 w-3.5" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
              </div>
              <p className="text-sm font-semibold">{toast.message}</p>
            </div>
          </Motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function DashboardSettings() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { address, logout } = useWallet();
  const { user, setUser } = useAuth();
  const { isDark, setTheme } = useTheme();
  const { network, setNetwork, currentChain } = useNetwork();
  const activeWallet = useActiveWallet();
  const walletDetailsModal = useWalletDetailsModal();

  const [activeTab, setActiveTab] = useState("general");
  const [editor, setEditor] = useState(null);
  const [draftValue, setDraftValue] = useState("");
  const [isSavingField, setIsSavingField] = useState(false);
  const [addressBook, setAddressBook] = useState([]);
  const [addressBookLoading, setAddressBookLoading] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({ id: null, nickname: "", savedAddress: "" });
  const [addressError, setAddressError] = useState("");
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarMode, setAvatarMode] = useState("upload");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarSaving, setAvatarSaving] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [nftsLoading, setNftsLoading] = useState(false);
  const [nftsError, setNftsError] = useState("");
  const [selectedNftKey, setSelectedNftKey] = useState("");
  const [toasts, setToasts] = useState([]);
  const [copiedField, setCopiedField] = useState("");
  const [nftOwnershipNotice, setNftOwnershipNotice] = useState("");
  const [walletNotice, setWalletNotice] = useState(null);

  const displayName = readValue(user?.display_name);
  const email = readValue(user?.email);
  const walletType = user?.wallet_type === "generated" ? "generated" : "external";
  const avatarUrl = resolveIpfsUrl(user?.avatar_url || "");
  const activeAvatarLabel =
    displayName !== "Not set" ? displayName : shortenAddress(address || user?.wallet_address);

  useEffect(() => {
    if (!address) {
      return;
    }

    let isMounted = true;

    const loadAddressBook = async () => {
      setAddressBookLoading(true);
      try {
        const entries = await getAddressBookEntries(address);
        if (isMounted) {
          setAddressBook(entries);
        }
      } catch (error) {
        console.error("Failed to load address book:", error);
      } finally {
        if (isMounted) {
          setAddressBookLoading(false);
        }
      }
    };

    loadAddressBook();
    return () => {
      isMounted = false;
    };
  }, [address]);

  useEffect(() => {
    if (!avatarModalOpen || avatarMode !== "nft" || !address) {
      return;
    }

    let isMounted = true;

    const loadOwnedNfts = async () => {
      setNftsLoading(true);
      setNftsError("");

      try {
        const ownedNfts = await Insight.getOwnedNFTs({
          client,
          chains: [currentChain],
          ownerAddress: address,
          includeMetadata: true,
        });

        const eligibleNfts = ownedNfts.filter(
          (nft) => nft.type === "ERC721" && Boolean(getNftImage(nft))
        );

        if (isMounted) {
          setNfts(eligibleNfts);
          if (!eligibleNfts.length) {
            setNftsError("No ERC-721 NFTs with artwork were found for this wallet on the selected network.");
          }
        }
      } catch (error) {
        console.error("Failed to load NFTs:", error);
        if (isMounted) {
          setNfts([]);
          setNftsError("We could not load NFTs from your wallet right now.");
        }
      } finally {
        if (isMounted) {
          setNftsLoading(false);
        }
      }
    };

    loadOwnedNfts();
    return () => {
      isMounted = false;
    };
  }, [address, avatarModalOpen, avatarMode, currentChain]);

  useEffect(() => {
    if (!address || !user?.nft_contract || !user?.nft_token_id) {
      setNftOwnershipNotice("");
      return;
    }

    let isMounted = true;

    const verifyNftOwnership = async () => {
      try {
        const contract = getContract({
          client,
          chain: currentChain,
          address: user.nft_contract,
        });

        const currentOwner = await ownerOf({
          contract,
          tokenId: BigInt(user.nft_token_id),
        });

        if (!isMounted) {
          return;
        }

        if (currentOwner.toLowerCase() === address.toLowerCase()) {
          setNftOwnershipNotice("");
          return;
        }

        const updatedUser = await updateUserByWallet(address, {
          avatar_url: null,
          nft_contract: null,
          nft_token_id: null,
        });

        if (isMounted) {
          setUser(updatedUser);
          setNftOwnershipNotice("NFT no longer owned");
        }
      } catch (error) {
        console.error("Failed to verify NFT ownership:", error);
      }
    };

    verifyNftOwnership();
    return () => {
      isMounted = false;
    };
  }, [address, currentChain, setUser, user?.nft_contract, user?.nft_token_id]);

  const pushToast = (type, message) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, type, message }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  };

  const handleCopy = async (field, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => {
        setCopiedField((current) => (current === field ? "" : current));
      }, 1800);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const handleOpenEditor = (field) => {
    setEditor(field);
    setDraftValue(field === "displayName" ? user?.display_name || "" : user?.email || "");
  };

  const handleSaveEditor = async () => {
    if (!address || !editor) {
      return;
    }

    const trimmedValue = draftValue.trim();
    const payloadKey = editor === "displayName" ? "display_name" : "email";

    if (editor === "email" && !isValidEmail(trimmedValue)) {
      pushToast("error", SAVE_ERROR_MESSAGE);
      return;
    }

    setIsSavingField(true);
    try {
      const updatedUser = await updateUserByWallet(address, {
        [payloadKey]: trimmedValue || null,
      });
      setUser(updatedUser);
      setEditor(null);
      pushToast("success", SAVE_SUCCESS_MESSAGE);
    } catch (error) {
      console.error("Failed to save field:", error);
      pushToast("error", SAVE_ERROR_MESSAGE);
    } finally {
      setIsSavingField(false);
    }
  };

  const handleThemeToggle = async () => {
    if (!address) {
      return;
    }

    const previousTheme = isDark ? "dark" : "light";
    const nextTheme = previousTheme === "dark" ? "light" : "dark";

    setTheme(nextTheme);

    try {
      const updatedUser = await updateUserByWallet(address, { theme: nextTheme });
      setUser(updatedUser);
      pushToast("success", SAVE_SUCCESS_MESSAGE);
    } catch (error) {
      console.error("Failed to save theme:", error);
      setTheme(previousTheme);
      pushToast("error", SAVE_ERROR_MESSAGE);
    }
  };

  const handleNetworkToggle = async () => {
    if (!address) {
      return;
    }

    const previousNetwork = network;
    const nextNetwork = previousNetwork === "testnet" ? "mainnet" : "testnet";

    setNetwork(nextNetwork);

    try {
      const updatedUser = await updateUserByWallet(address, { network: nextNetwork });
      setUser(updatedUser);
      pushToast("success", SAVE_SUCCESS_MESSAGE);
    } catch (error) {
      console.error("Failed to save network:", error);
      setNetwork(previousNetwork);
      pushToast("error", SAVE_ERROR_MESSAGE);
    }
  };

  const openNewAddressModal = () => {
    setAddressForm({ id: null, nickname: "", savedAddress: "" });
    setAddressError("");
    setAddressModalOpen(true);
  };

  const openEditAddressModal = (entry) => {
    setAddressForm({
      id: entry.id,
      nickname: entry.nickname,
      savedAddress: entry.saved_address,
    });
    setAddressError("");
    setAddressModalOpen(true);
  };

  const handleAddressSave = async () => {
    if (!address) {
      return;
    }

    const nickname = addressForm.nickname.trim();
    const savedAddress = addressForm.savedAddress.trim();

    if (!nickname || !savedAddress) {
      setAddressError("Nickname and wallet address are required.");
      return;
    }

    if (!ethers.isAddress(savedAddress)) {
      setAddressError(INVALID_ADDRESS_MESSAGE);
      return;
    }

    setAddressError("");

    try {
      const savedEntry = addressForm.id
        ? await updateAddressBookEntry({
            id: addressForm.id,
            walletAddress: address,
            nickname,
            savedAddress,
          })
        : await addAddressBookEntry({
            walletAddress: address,
            nickname,
            savedAddress,
          });

      setAddressBook((current) => {
        if (addressForm.id) {
          return current.map((entry) => (entry.id === savedEntry.id ? savedEntry : entry));
        }

        return [...current, savedEntry];
      });
      setAddressModalOpen(false);
      pushToast("success", SAVE_SUCCESS_MESSAGE);
    } catch (error) {
      console.error("Failed to save address book entry:", error);
      setAddressError(SAVE_ERROR_MESSAGE);
      pushToast("error", SAVE_ERROR_MESSAGE);
    }
  };

  const handleDeleteAddress = async (entry) => {
    if (!address || !window.confirm(`Delete ${entry.nickname} from your address book?`)) {
      return;
    }

    try {
      await deleteAddressBookEntry({ id: entry.id, walletAddress: address });
      setAddressBook((current) => current.filter((item) => item.id !== entry.id));
      pushToast("success", SAVE_SUCCESS_MESSAGE);
    } catch (error) {
      console.error("Failed to delete address book entry:", error);
      pushToast("error", SAVE_ERROR_MESSAGE);
    }
  };

  const resetAvatarModal = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setAvatarModalOpen(false);
    setAvatarSaving(false);
    setAvatarFile(null);
    setAvatarPreview("");
    setSelectedNftKey("");
    setNftsError("");
  };

  const handleAvatarFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      pushToast("error", SAVE_ERROR_MESSAGE);
      return;
    }

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleUploadAvatar = async () => {
    if (!address || !avatarFile) {
      return;
    }

    setAvatarSaving(true);

    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const uploadResponse = await uploadFileCall("/api/upload/avatar", formData);
      const updatedUser = await updateUserByWallet(address, {
        avatar_url: uploadResponse.ipfs_url || uploadResponse.gateway_url,
        nft_contract: null,
        nft_token_id: null,
      });

      setUser(updatedUser);
      setNftOwnershipNotice("");
      resetAvatarModal();
      pushToast("success", SAVE_SUCCESS_MESSAGE);
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      pushToast("error", SAVE_ERROR_MESSAGE);
    } finally {
      setAvatarSaving(false);
    }
  };

  const handleSaveNftAvatar = async () => {
    if (!address) {
      return;
    }

    const selectedNft = nfts.find((nft) => getNftKey(nft) === selectedNftKey);

    if (!selectedNft) {
      return;
    }

    setAvatarSaving(true);

    try {
      const imageUrl = getNftImage(selectedNft);
      const updatedUser = await updateUserByWallet(address, {
        avatar_url: toIpfsUri(imageUrl),
        nft_contract: selectedNft.tokenAddress.toLowerCase(),
        nft_token_id: selectedNft.id.toString(),
      });

      setUser(updatedUser);
      setNftOwnershipNotice("");
      resetAvatarModal();
      pushToast("success", SAVE_SUCCESS_MESSAGE);
    } catch (error) {
      console.error("Failed to save NFT avatar:", error);
      pushToast("error", SAVE_ERROR_MESSAGE);
    } finally {
      setAvatarSaving(false);
    }
  };

  const handleExportWallet = () => {
    if (walletType === "external") {
      setWalletNotice("external");
      return;
    }

    if (activeWallet?.id !== "inApp") {
      setWalletNotice("generated-reconnect");
      return;
    }

    walletDetailsModal.open({
      client,
      theme: isDark ? "dark" : "light",
      screen: "export",
      hideSwitchWallet: true,
      hideSendFunds: true,
      hideReceiveFunds: true,
      hideBuyFunds: true,
      showTestnetFaucet: false,
    });
  };

  const tabContent = {
    general: (
      <div className="space-y-6">
        {nftOwnershipNotice ? (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300">
            {nftOwnershipNotice}
          </div>
        ) : null}

        <SettingsSection title="Profile">
          <SettingsRow
            title="Display Name"
            value={displayName}
            onClick={() => handleOpenEditor("displayName")}
            trailing={<PencilLine className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" />}
          />
          <SettingsRow
            title="Email"
            subtitle={EMAIL_HINT}
            value={email}
            onClick={() => handleOpenEditor("email")}
            trailing={<PencilLine className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" />}
          />
          <SettingsRow
            title="Profile Photo"
            subtitle={
              user?.nft_contract && user?.nft_token_id
                ? `NFT avatar linked to ${shortenAddress(user.nft_contract)}`
                : "Upload a JPG or PNG, or choose an NFT from your wallet."
            }
            onClick={() => setAvatarModalOpen(true)}
            trailing={
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 dark:border-white/10 dark:bg-white/5">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs font-black text-zinc-500 dark:text-zinc-300">
                    {getInitials(activeAvatarLabel)}
                  </span>
                )}
              </div>
            }
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Appearance">
          <SettingsRow
            title="Theme"
            subtitle="Applies immediately across the entire app."
            value={isDark ? "Dark" : "Light"}
            trailing={
              <ToggleButton
                enabled={isDark}
                enabledLabel="Dark"
                disabledLabel="Light"
                onClick={handleThemeToggle}
              />
            }
            isLast
          />
        </SettingsSection>
      </div>
    ),
    security: (
      <div className="space-y-6">
        <SettingsSection title="Wallet">
          <SettingsRow
            title="Connected Wallet"
            subtitle="Your active Accord wallet"
            value={shortenAddress(address || user?.wallet_address)}
            trailing={
              <button
                type="button"
                onClick={() => handleCopy("wallet", address || user?.wallet_address || "")}
                className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-orange-500 dark:hover:bg-white/5"
              >
                {copiedField === "wallet" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            }
          />
          <div className="px-5 py-4">
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/20 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <Wallet className="h-4 w-4" />
              Disconnect
            </button>
          </div>
        </SettingsSection>
        <SettingsSection
          title="Address Book"
          action={
            <button
              type="button"
              onClick={openNewAddressModal}
              className="inline-flex items-center gap-2 rounded-full border border-orange-200 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-orange-600 transition-colors hover:bg-orange-50 dark:border-orange-500/20 dark:text-orange-400 dark:hover:bg-orange-500/10"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          }
        >
          {addressBookLoading ? (
            <div className="flex items-center justify-center gap-2 px-5 py-10 text-sm text-zinc-500 dark:text-zinc-400">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Loading address book...
            </div>
          ) : addressBook.length ? (
            addressBook.map((entry, index) => (
              <SettingsRow
                key={entry.id}
                title={entry.nickname}
                subtitle={entry.saved_address}
                value={shortenAddress(entry.saved_address)}
                trailing={
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditAddressModal(entry)}
                      className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-orange-500 dark:hover:bg-white/5"
                    >
                      <PencilLine className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(entry)}
                      className="rounded-full p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                }
                isLast={index === addressBook.length - 1}
              />
            ))
          ) : (
            <div className="px-5 py-10">
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">No saved addresses yet</p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Save trusted wallet addresses here to reuse them when creating agreements.
              </p>
            </div>
          )}
        </SettingsSection>
      </div>
    ),
    advanced: (
      <div className="space-y-6">
        <SettingsSection title="Network">
          <SettingsRow
            title="Network"
            subtitle={network === "testnet" ? TESTNET_WARNING : "Mainnet mode enabled"}
            value={network === "testnet" ? "Testnet" : "Mainnet"}
            trailing={
              <ToggleButton
                enabled={network === "mainnet"}
                enabledLabel="Mainnet"
                disabledLabel="Testnet"
                onClick={handleNetworkToggle}
              />
            }
            isLast
          />
        </SettingsSection>
        <SettingsSection title="Wallet">
          <SettingsRow
            title="Export Wallet"
            subtitle={
              walletType === "generated"
                ? "Never share your private key with anyone including Accord."
                : "Only available for wallets created by Accord."
            }
            onClick={handleExportWallet}
            trailing={<KeyRound className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" />}
            isLast
          />
        </SettingsSection>
      </div>
    ),
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <ToastStack toasts={toasts} />
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/dashboard/overview")}
          className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-500 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:text-orange-500 dark:border-white/10 dark:bg-[#151515] dark:text-zinc-300 dark:hover:border-orange-500/20"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-zinc-400 dark:text-zinc-500">
            Account settings
          </p>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white sm:text-3xl">Settings</h1>
        </div>
      </div>
      <div className="overflow-hidden rounded-[34px] border border-zinc-200/80 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)] dark:border-white/5 dark:bg-[#111111]">
        <div className="border-b border-zinc-100 px-5 py-6 dark:border-white/5 sm:px-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Manage your profile, wallet, appearance, and network preferences from one place.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:bg-white/5 dark:text-zinc-300">
                  <Wallet className="h-3.5 w-3.5" />
                  {shortenAddress(address || user?.wallet_address)}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {walletType === "generated" ? "Accord-generated wallet" : "External wallet"}
                </span>
              </div>
            </div>
            <SegmentedTabs activeTab={activeTab} onChange={setActiveTab} />
          </div>
        </div>
        <div className="max-h-[72vh] overflow-y-auto bg-zinc-50/80 px-5 py-6 dark:bg-[#0d0d0d] sm:px-7">
          <AnimatePresence mode="wait">
            <Motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
            >
              {tabContent[activeTab]}
            </Motion.div>
          </AnimatePresence>
        </div>
      </div>
      <ModalShell
        open={Boolean(editor)}
        onClose={() => setEditor(null)}
        title={editor === "displayName" ? "Display Name" : "Email"}
        description={editor === "displayName" ? "Choose how your name appears across Accord." : EMAIL_HINT}
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditor(null)}
              className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEditor}
              disabled={isSavingField}
              className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-orange-600 disabled:opacity-60"
            >
              {isSavingField ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Save
            </button>
          </div>
        }
      >
        <label className="block space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
            {editor === "displayName" ? "Display name" : "Email"}
          </span>
          <input
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
            placeholder={editor === "displayName" ? "Not set" : "name@example.com"}
            className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-colors focus:border-orange-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </label>
      </ModalShell>
      <ModalShell
        open={avatarModalOpen}
        onClose={resetAvatarModal}
        title="Profile Photo"
        description="Upload a new image or choose an NFT you currently own."
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {avatarMode === "upload"
                ? "JPG and PNG only. Images are pinned to Pinata IPFS."
                : "Only ERC-721 NFTs with artwork can be used as your avatar."}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={resetAvatarModal}
                className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={avatarMode === "upload" ? handleUploadAvatar : handleSaveNftAvatar}
                disabled={avatarSaving || (avatarMode === "upload" ? !avatarFile : !selectedNftKey)}
                className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-orange-600 disabled:opacity-60"
              >
                {avatarSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                Save
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAvatarMode("upload")}
              className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                avatarMode === "upload"
                  ? "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
              }`}
            >
              <Upload className="mb-3 h-5 w-5" />
              <p className="text-sm font-semibold">Upload Image</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Choose a JPG or PNG file</p>
            </button>
            <button
              type="button"
              onClick={() => setAvatarMode("nft")}
              className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                avatarMode === "nft"
                  ? "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
              }`}
            >
              <ImagePlus className="mb-3 h-5 w-5" />
              <p className="text-sm font-semibold">Use NFT from Wallet</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Select owned NFT artwork</p>
            </button>
          </div>
          {avatarMode === "upload" ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-3 rounded-[26px] border border-dashed border-zinc-300 px-5 py-10 text-center transition-colors hover:border-orange-300 hover:bg-orange-50/70 dark:border-white/10 dark:hover:border-orange-500/20 dark:hover:bg-orange-500/5"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="h-24 w-24 rounded-full object-cover shadow-sm" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-white/5 dark:text-zinc-500">
                    <Upload className="h-8 w-8" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {avatarFile ? avatarFile.name : "Choose image"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">JPG or PNG up to 5MB</p>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleAvatarFileChange}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {nftsLoading ? (
                <div className="flex items-center justify-center gap-2 rounded-3xl border border-zinc-200 bg-zinc-50 px-5 py-10 text-sm text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Loading NFTs...
                </div>
              ) : nftsError ? (
                <div className="rounded-3xl border border-zinc-200 bg-zinc-50 px-5 py-5 text-sm text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
                  {nftsError}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {nfts.map((nft) => {
                    const key = getNftKey(nft);
                    const selected = key === selectedNftKey;

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedNftKey(key)}
                        className={`overflow-hidden rounded-[24px] border text-left transition-all ${
                          selected
                            ? "border-orange-300 shadow-[0_14px_32px_rgba(234,88,12,0.18)]"
                            : "border-zinc-200 hover:border-orange-200 dark:border-white/10 dark:hover:border-orange-500/20"
                        }`}
                      >
                        <div className="aspect-square bg-zinc-100 dark:bg-white/5">
                          <img src={getNftImage(nft)} alt={getNftDisplayName(nft)} className="h-full w-full object-cover" />
                        </div>
                        <div className="space-y-1 px-3 py-3">
                          <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white">
                            {getNftDisplayName(nft)}
                          </p>
                          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                            {shortenAddress(nft.tokenAddress)}
                          </p>
                          <p className="text-xs text-zinc-400 dark:text-zinc-500">Token #{nft.id.toString()}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </ModalShell>
      <ModalShell
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title={addressForm.id ? "Edit Address" : "Add Address"}
        description="Save trusted wallet addresses to reuse while creating agreements."
        footer={
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setAddressModalOpen(false)}
              className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-500 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddressSave}
              className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-orange-600"
            >
              Save
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300">
            Always double check wallet addresses. Crypto transactions cannot be reversed.
          </div>
          <label className="block space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
              Nickname
            </span>
            <input
              value={addressForm.nickname}
              onChange={(event) => setAddressForm((current) => ({ ...current, nickname: event.target.value }))}
              placeholder="John Client"
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-colors focus:border-orange-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
              Wallet Address
            </span>
            <input
              value={addressForm.savedAddress}
              onChange={(event) => setAddressForm((current) => ({ ...current, savedAddress: event.target.value }))}
              placeholder="0x..."
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-sm text-zinc-900 outline-none transition-colors focus:border-orange-300 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </label>
          {addressError ? <p className="text-sm font-semibold text-red-500">{addressError}</p> : null}
        </div>
      </ModalShell>
      <ModalShell
        open={walletNotice === "external"}
        onClose={() => setWalletNotice(null)}
        title="Export Wallet"
        description="This feature is only available for wallets created by Accord."
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setWalletNotice(null)}
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-zinc-900"
            >
              Close
            </button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          This feature is only available for wallets created by Accord. Your wallet was connected externally via Keplr or MetaMask. To export your private key please open your wallet app directly.
        </p>
      </ModalShell>
      <ModalShell
        open={walletNotice === "generated-reconnect"}
        onClose={() => setWalletNotice(null)}
        title="Reconnect Required"
        description="Your wallet is marked as Accord-generated, but the current active wallet session is not the in-app wallet export flow."
        footer={
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setWalletNotice(null)}
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-zinc-900"
            >
              Close
            </button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          Reconnect with the wallet Accord created for you to open Thirdweb&apos;s export flow securely.
        </p>
      </ModalShell>
    </div>
  );
}
