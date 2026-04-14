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
        <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-[var(--accord-muted)]">
          {title}
        </p>
        {action}
      </div>
      <div className="overflow-hidden rounded-[10px] border border-[var(--accord-border)] bg-[var(--accord-surface)]">
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
        <p className="text-sm font-semibold text-[var(--accord-text)]">{title}</p>
        {subtitle ? (
          <p className="mt-1 text-xs leading-relaxed text-[var(--accord-muted)]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {value ? (
        <div className="max-w-[55%] shrink-0 text-right text-sm text-[var(--accord-muted)]">
          {value}
        </div>
      ) : null}
      {trailing}
      {onClick ? (
        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--accord-muted)]" />
      ) : null}
    </>
  );

  const className = `flex w-full items-center gap-4 px-5 py-4 text-left transition-colors ${
    !isLast ? "border-b border-[var(--accord-border)]" : ""
  } ${
    onClick && !disabled
      ? "hover:bg-[var(--accord-primary-faint)]"
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
    <div className="inline-flex rounded-[10px] border border-[var(--accord-border)] bg-[var(--accord-input-background)] p-1">
      {TABS.map((tab) => {
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-[8px] px-4 py-2.5 text-sm font-semibold transition-all sm:px-5 ${
              active
                ? "bg-[var(--accord-primary)] text-[var(--accord-primary-contrast)]"
                : "text-[var(--accord-muted)] hover:text-[var(--accord-text)]"
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
          ? "border-[var(--accord-primary-hover-line)] bg-[var(--accord-primary-soft)] text-[var(--accord-primary)]"
          : "border-[var(--accord-border)] bg-[var(--accord-input-background)] text-[var(--accord-muted)]"
      }`}
    >
      <span className="px-2 text-xs font-bold uppercase tracking-[0.18em]">
        {enabled ? enabledLabel : disabledLabel}
      </span>
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black transition-all ${
          enabled ? "bg-[var(--accord-primary)] text-[var(--accord-primary-contrast)]" : "bg-[var(--accord-surface-strong)] text-[var(--accord-muted)]"
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
            className="absolute inset-0 bg-[var(--accord-backdrop)] backdrop-blur-[12px]"
            aria-label="Close modal"
          />
          <Motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            className="glass-modal relative z-10 w-full max-w-lg overflow-hidden"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--accord-border-soft)] px-6 py-5">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-[var(--accord-text)]">{title}</h3>
                {description ? (
                  <p className="mt-1 text-sm leading-relaxed text-[var(--accord-muted)]">
                    {description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="icon-button h-10 w-10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
            {footer ? (
              <div className="border-t border-[var(--accord-border-soft)] px-6 py-4">{footer}</div>
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
            className={`pointer-events-auto rounded-[10px] border px-4 py-3 ${
              toast.type === "error"
                ? "border-[rgba(239,68,68,0.18)] bg-[var(--accord-surface)] text-[var(--accord-danger)]"
                : "border-[var(--accord-primary-line)] bg-[var(--accord-surface)] text-[var(--accord-text)]"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                  toast.type === "error"
                    ? "bg-[rgba(239,68,68,0.12)] text-[var(--accord-danger)]"
                    : "bg-[var(--accord-primary-soft)] text-[var(--accord-primary)]"
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
          <div className="rounded-[10px] border border-[var(--accord-primary-line)] bg-[var(--accord-primary-soft)] px-4 py-3 text-sm font-semibold text-[var(--accord-primary)]">
            {nftOwnershipNotice}
          </div>
        ) : null}

        <SettingsSection title="Profile">
          <SettingsRow
            title="Display Name"
            value={displayName}
            onClick={() => handleOpenEditor("displayName")}
            trailing={<PencilLine className="h-4 w-4 shrink-0 text-[var(--accord-muted)]" />}
          />
          <SettingsRow
            title="Email"
            subtitle={EMAIL_HINT}
            value={email}
            onClick={() => handleOpenEditor("email")}
            trailing={<PencilLine className="h-4 w-4 shrink-0 text-[var(--accord-muted)]" />}
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
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[var(--accord-border)] bg-[var(--accord-input-background)]">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs font-black text-[var(--accord-text)]">
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
                className="icon-button h-10 w-10"
              >
                {copiedField === "wallet" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            }
          />
          <div className="px-5 py-4">
            <button
              type="button"
              onClick={logout}
              className="destructive-button"
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
              className="secondary-button px-3 py-2 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          }
        >
          {addressBookLoading ? (
            <div className="flex items-center justify-center gap-2 px-5 py-10 text-sm text-[var(--accord-muted)]">
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
                      className="icon-button h-10 w-10"
                    >
                      <PencilLine className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(entry)}
                      className="icon-button h-10 w-10 border-[rgba(239,68,68,0.18)] text-[var(--accord-danger)] hover:border-[var(--accord-danger)] hover:bg-[rgba(239,68,68,0.08)] hover:text-[var(--accord-danger)]"
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
              <p className="text-sm font-semibold text-[var(--accord-text)]">No saved addresses yet</p>
              <p className="mt-1 text-sm text-[var(--accord-muted)]">
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
            trailing={<KeyRound className="h-4 w-4 shrink-0 text-[var(--accord-muted)]" />}
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
          className="icon-button h-12 w-12"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.18em] text-[var(--accord-muted)]">
            Account settings
          </p>
          <h1 className="text-2xl font-bold text-[var(--accord-text)] sm:text-3xl">Settings</h1>
        </div>
      </div>
      <div className="overflow-hidden rounded-[10px] border border-[var(--accord-border)] bg-[var(--accord-surface)]">
        <div className="border-b border-[var(--accord-border)] px-5 py-6 sm:px-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm text-[var(--accord-muted)]">
                Manage your profile, wallet, appearance, and network preferences from one place.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accord-border)] bg-[var(--accord-input-background)] px-3 py-1.5 text-xs font-semibold text-[var(--accord-text)]">
                  <Wallet className="h-3.5 w-3.5" />
                  {shortenAddress(address || user?.wallet_address)}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[var(--accord-primary-line)] bg-[var(--accord-primary-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--accord-primary)]">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {walletType === "generated" ? "Accord-generated wallet" : "External wallet"}
                </span>
              </div>
            </div>
            <SegmentedTabs activeTab={activeTab} onChange={setActiveTab} />
          </div>
        </div>
        <div className="max-h-[72vh] overflow-y-auto bg-[var(--accord-background)] px-5 py-6 sm:px-7">
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
              className="secondary-button px-4 py-2 text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEditor}
              disabled={isSavingField}
              className="primary-button px-4 py-2 text-xs disabled:opacity-60"
            >
              {isSavingField ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Save
            </button>
          </div>
        }
      >
        <label className="block space-y-2">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--accord-muted)]">
            {editor === "displayName" ? "Display name" : "Email"}
          </span>
          <input
            value={draftValue}
            onChange={(event) => setDraftValue(event.target.value)}
            placeholder={editor === "displayName" ? "Not set" : "name@example.com"}
            className="field-input"
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
            <p className="text-xs text-[var(--accord-muted)]">
              {avatarMode === "upload"
                ? "JPG and PNG only. Images are pinned to Pinata IPFS."
                : "Only ERC-721 NFTs with artwork can be used as your avatar."}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={resetAvatarModal}
                className="secondary-button px-4 py-2 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={avatarMode === "upload" ? handleUploadAvatar : handleSaveNftAvatar}
                disabled={avatarSaving || (avatarMode === "upload" ? !avatarFile : !selectedNftKey)}
                className="primary-button px-4 py-2 text-xs disabled:opacity-60"
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
                  ? "border-[var(--accord-primary-line)] bg-[var(--accord-primary-soft)] text-[var(--accord-primary)]"
                  : "border-[var(--accord-border)] bg-[var(--accord-input-background)] text-[var(--accord-muted)]"
              }`}
            >
              <Upload className="mb-3 h-5 w-5" />
              <p className="text-sm font-semibold">Upload Image</p>
              <p className="mt-1 text-xs text-[var(--accord-muted)]">Choose a JPG or PNG file</p>
            </button>
            <button
              type="button"
              onClick={() => setAvatarMode("nft")}
              className={`rounded-2xl border px-4 py-4 text-left transition-all ${
                avatarMode === "nft"
                  ? "border-[var(--accord-primary-line)] bg-[var(--accord-primary-soft)] text-[var(--accord-primary)]"
                  : "border-[var(--accord-border)] bg-[var(--accord-input-background)] text-[var(--accord-muted)]"
              }`}
            >
              <ImagePlus className="mb-3 h-5 w-5" />
              <p className="text-sm font-semibold">Use NFT from Wallet</p>
              <p className="mt-1 text-xs text-[var(--accord-muted)]">Select owned NFT artwork</p>
            </button>
          </div>
          {avatarMode === "upload" ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-3 rounded-[26px] border border-dashed border-[var(--accord-border)] bg-[var(--accord-input-background)] px-5 py-10 text-center transition-colors hover:border-[var(--accord-primary-hover-line)] hover:bg-[var(--accord-primary-faint)]"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="h-24 w-24 rounded-full object-cover shadow-sm" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--accord-border)] bg-[var(--accord-surface)] text-[var(--accord-muted)]">
                    <Upload className="h-8 w-8" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-[var(--accord-text)]">
                    {avatarFile ? avatarFile.name : "Choose image"}
                  </p>
                  <p className="mt-1 text-xs text-[var(--accord-muted)]">JPG or PNG up to 5MB</p>
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
                <div className="flex items-center justify-center gap-2 rounded-3xl border border-[var(--accord-border)] bg-[var(--accord-input-background)] px-5 py-10 text-sm text-[var(--accord-muted)]">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Loading NFTs...
                </div>
              ) : nftsError ? (
                <div className="rounded-3xl border border-[var(--accord-border)] bg-[var(--accord-input-background)] px-5 py-5 text-sm text-[var(--accord-muted)]">
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
                            ? "border-[var(--accord-primary-hover-line)] bg-[var(--accord-primary-faint)]"
                            : "border-[var(--accord-border)] hover:border-[var(--accord-primary-hover-line)]"
                        }`}
                      >
                        <div className="aspect-square bg-[var(--accord-input-background)]">
                          <img src={getNftImage(nft)} alt={getNftDisplayName(nft)} className="h-full w-full object-cover" />
                        </div>
                        <div className="space-y-1 px-3 py-3">
                          <p className="truncate text-sm font-semibold text-[var(--accord-text)]">
                            {getNftDisplayName(nft)}
                          </p>
                          <p className="truncate text-xs text-[var(--accord-muted)]">
                            {shortenAddress(nft.tokenAddress)}
                          </p>
                          <p className="text-xs text-[var(--accord-muted)]">Token #{nft.id.toString()}</p>
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
              className="secondary-button px-4 py-2 text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddressSave}
              className="primary-button px-4 py-2 text-xs"
            >
              Save
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="rounded-[10px] border border-[var(--accord-primary-line)] bg-[var(--accord-primary-soft)] px-4 py-3 text-sm text-[var(--accord-primary)]">
            Always double check wallet addresses. Crypto transactions cannot be reversed.
          </div>
          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--accord-muted)]">
              Nickname
            </span>
            <input
              value={addressForm.nickname}
              onChange={(event) => setAddressForm((current) => ({ ...current, nickname: event.target.value }))}
              placeholder="John Client"
              className="field-input"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--accord-muted)]">
              Wallet Address
            </span>
            <input
              value={addressForm.savedAddress}
              onChange={(event) => setAddressForm((current) => ({ ...current, savedAddress: event.target.value }))}
              placeholder="0x..."
              className="field-input font-mono"
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
              className="primary-button px-4 py-2 text-xs"
            >
              Close
            </button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-[var(--accord-muted)]">
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
              className="primary-button px-4 py-2 text-xs"
            >
              Close
            </button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-[var(--accord-muted)]">
          Reconnect with the wallet Accord created for you to open Thirdweb&apos;s export flow securely.
        </p>
      </ModalShell>
    </div>
  );
}




