import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion as Motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Info,
  Lock,
  MessageSquare,
  Paperclip,
  Send,
  ShieldCheck,
} from "lucide-react";
import * as ethers from "ethers";
import { useNavigate, useParams } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { CONTRACT_ABI, CONTRACT_ADDRESS, TOKEN_ABI } from "../utils/contractABI";
import { apiCall, uploadFileCall } from "../utils/api";

function normalizeStatus(status) {
  const normalized = status?.toUpperCase() || "PENDING";
  return normalized === "DELIVERED" ? "SUBMITTED" : normalized;
}

function getStatusPresentation(status) {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case "FUNDED":
      return { label: "Active", className: "status-badge status-active", progress: 40 };
    case "SUBMITTED":
      return { label: "Pending Review", className: "status-badge status-pending", progress: 70 };
    case "REVISION":
      return { label: "Revision Requested", className: "status-badge status-pending", progress: 70 };
    case "COMPLETED":
      return { label: "Completed", className: "status-badge status-completed", progress: 100 };
    case "DISPUTED":
      return { label: "Disputed", className: "status-badge status-disputed", progress: 25 };
    case "CANCELLED":
      return { label: "Cancelled", className: "status-badge status-cancelled", progress: 0 };
    default:
      return { label: "Pending", className: "status-badge status-pending", progress: 20 };
  }
}

export default function AgreementRoom() {
  const { id } = useParams();
  const { address, signer } = useWallet();
  const navigate = useNavigate();

  const [agreement, setAgreement] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");

  const agreementAmount = agreement?.amount ?? 0;

  const loadAgreement = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiCall(`/api/agreements/${id}`);
      setAgreement(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadMessages = useCallback(async () => {
    try {
      const data = await apiCall(`/api/messages/${id}`);
      setMessages(data || []);
    } catch (error) {
      console.error(error);
    }
  }, [id]);

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadRoom = async () => {
      await Promise.all([loadAgreement(), loadMessages()]);
    };

    loadRoom();
  }, [id, loadAgreement, loadMessages]);

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!message || !agreement) {
      return;
    }

    const allowedStatuses = ["FUNDED", "SUBMITTED", "REVISION", "COMPLETED"];
    if (!allowedStatuses.includes(normalizeStatus(agreement.status))) {
      return;
    }

    try {
      await apiCall("/api/messages", {
        method: "POST",
        body: JSON.stringify({
          agreement_id: id,
          content: message,
        }),
      });
      setMessage("");
      loadMessages();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAction = async (action) => {
    if (!signer || !agreement) {
      return;
    }

    try {
      setActionLoading(true);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const contractId = agreement.contract_agreement_id;

      if (action === "FUND") {
        const tokenAddress = agreement.token_address;
        const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);
        const amountInUnits = ethers.parseUnits(agreementAmount.toString(), 6);

        const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, amountInUnits);
        await approveTx.wait();

        const tx = await contract.createAgreement(
          contractId,
          agreement.freelancer_wallet,
          tokenAddress,
          amountInUnits,
          agreement.max_revisions || 3,
        );
        await tx.wait();

        await apiCall(`/api/agreements/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: "FUNDED" }),
        });
      } else if (action === "SUBMIT") {
        if (!selectedFile) {
          alert("Select a file first");
          return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("agreement_id", id);
        formData.append("file_type", "preview");

        const uploadRes = await uploadFileCall("/api/upload", formData);
        const uploadedFile = Array.isArray(uploadRes) ? uploadRes[0] : uploadRes;

        if (!uploadedFile?.ipfs_hash) {
          throw new Error("Upload succeeded but no IPFS hash was returned");
        }

        const tx = await contract.deliverWork(contractId, uploadedFile.ipfs_hash);
        await tx.wait();

        await apiCall(`/api/agreements/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: "SUBMITTED" }),
        });
      } else if (action === "APPROVE") {
        const tx = await contract.approveWork(contractId, "FINAL_LINK_PLACEHOLDER");
        await tx.wait();
        await apiCall(`/api/agreements/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: "COMPLETED" }),
        });
      } else if (action === "REVISION") {
        const tx = await contract.requestRevision(contractId);
        await tx.wait();
        await apiCall(`/api/agreements/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: "REVISION" }),
        });
      } else if (action === "CANCEL_REQUEST") {
        const tx = await contract.requestCancel(contractId);
        await tx.wait();
      } else if (action === "REFUND") {
        const tx = await contract.executeRefund(contractId);
        await tx.wait();
        await apiCall(`/api/agreements/${id}/status`, {
          method: "PATCH",
          body: JSON.stringify({ status: "CANCELLED" }),
        });
      }

      await loadAgreement();
    } catch (error) {
      console.error(error);
      alert(`Transaction error: ${error.reason || error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !agreement) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--accord-background)] px-6">
        <div className="surface-card flex w-full max-w-md flex-col items-center gap-5 text-center">
          <div className="h-10 w-10 rounded-full border-2 border-[var(--accord-primary-line)] border-t-[var(--accord-primary)] animate-spin" />
          <div>
            <p className="eyebrow text-[var(--accord-primary)]">Agreement room</p>
            <p className="mt-2 text-sm text-[var(--accord-muted)]">Loading agreement details and project messages.</p>
          </div>
        </div>
      </div>
    );
  }

  const normalizedStatus = normalizeStatus(agreement.status);
  const status = getStatusPresentation(agreement.status);
  const isFreelancer = address?.toLowerCase() === agreement.freelancer_wallet.toLowerCase();
  const isClient = address?.toLowerCase() === agreement.client_wallet.toLowerCase();
  const isParticipant = isFreelancer || isClient;
  const canMessage = isParticipant && ["FUNDED", "SUBMITTED", "REVISION", "COMPLETED"].includes(normalizedStatus);

  return (
    <div className="app-shell min-h-screen bg-[var(--accord-background)] text-[var(--accord-text)]">
      <header className="sticky top-0 z-40 border-b border-[var(--accord-border)] bg-[var(--accord-overlay)] backdrop-blur-xl">
        <div className="page-shell flex items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => navigate("/dashboard")} className="icon-button h-10 w-10">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <p className="eyebrow">Agreement room</p>
              <h1 className="truncate text-lg font-semibold text-[var(--accord-text)]">{agreement.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={status.className}>{status.label}</span>
            <span className="hidden rounded-lg border border-[var(--accord-border)] px-3 py-2 text-xs text-[var(--accord-muted)] sm:inline">
              #{agreement.id?.slice(0, 8)}
            </span>
          </div>
        </div>
      </header>

      <main className="page-shell grid gap-6 px-4 pb-10 pt-8 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="surface-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Escrow amount</p>
                <p className="mt-3 text-4xl font-bold text-[var(--accord-primary)]">${Number(agreementAmount).toFixed(2)} USDC</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--accord-primary-line)] bg-[var(--accord-primary-soft)]">
                <ShieldCheck className="h-5 w-5 text-[var(--accord-primary)]" />
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="surface-muted px-4 py-4">
                <p className="metric-label">Deadline</p>
                <p className="mt-3 text-sm font-semibold text-[var(--accord-text)]">{agreement.deadline || "No deadline set"}</p>
              </div>
              <div className="surface-muted px-4 py-4">
                <p className="metric-label">Agreement status</p>
                <p className="mt-3 text-sm font-semibold text-[var(--accord-text)]">{status.label}</p>
              </div>
            </div>

            <div className="mt-6">
              <p className="metric-label">Description</p>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[var(--accord-muted)]">{agreement.description}</p>
            </div>

            <div className="mt-6 grid gap-4 border-t border-[var(--accord-border)] pt-6 sm:grid-cols-2">
              <div className="surface-muted px-4 py-4">
                <p className="metric-label">Freelancer wallet</p>
                <p className="mt-3 break-all text-sm font-medium text-[var(--accord-text)]">{agreement.freelancer_wallet}</p>
              </div>
              <div className="surface-muted px-4 py-4">
                <p className="metric-label">Client wallet</p>
                <p className="mt-3 break-all text-sm font-medium text-[var(--accord-text)]">{agreement.client_wallet}</p>
              </div>
            </div>
          </section>

          <section className="surface-card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow">Progress</p>
                <h2 className="mt-2 text-[18px] font-semibold text-[var(--accord-text)]">Where this agreement stands</h2>
              </div>
              <span className="text-sm font-semibold text-[var(--accord-primary)]">{status.progress}%</span>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-[var(--accord-surface-strong)]">
              <Motion.div
                initial={{ width: 0 }}
                animate={{ width: `${status.progress}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="h-full rounded-full bg-[var(--accord-primary)]"
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="surface-card">
            <p className="eyebrow">Next action</p>
            <AnimatePresence mode="wait">
              {isFreelancer ? (
                <Motion.div key={`freelancer-${normalizedStatus}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-5 space-y-5">
                  {normalizedStatus === "PENDING" ? (
                    <div className="space-y-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--accord-border)] bg-[var(--accord-surface-strong)]">
                        <Clock className="h-5 w-5 text-[var(--accord-muted)]" />
                      </div>
                      <div>
                        <h2 className="section-title">Waiting for funding</h2>
                        <p className="mt-3 text-sm leading-7 text-[var(--accord-muted)]">
                          Share the agreement with your client. Work should begin once the escrow is funded.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {["FUNDED", "REVISION"].includes(normalizedStatus) ? (
                    <div className="space-y-5">
                      <div>
                        <h2 className="section-title">Submit the work</h2>
                        <p className="mt-3 text-sm leading-7 text-[var(--accord-muted)]">
                          Upload the preview or deliverable you want attached to this submission.
                        </p>
                      </div>
                      <label className="block cursor-pointer rounded-[10px] border border-dashed border-[var(--accord-border)] bg-[var(--accord-input-background)] px-4 py-10 text-center transition-colors hover:border-[var(--accord-primary-hover-line)]">
                        <input type="file" className="hidden" onChange={(event) => setSelectedFile(event.target.files?.[0] || null)} />
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--accord-primary-line)] bg-[var(--accord-primary-soft)]">
                          <Paperclip className="h-5 w-5 text-[var(--accord-primary)]" />
                        </div>
                        <p className="mt-4 text-sm font-semibold text-[var(--accord-text)]">
                          {selectedFile ? selectedFile.name : "Choose file to attach"}
                        </p>
                        <p className="mt-2 text-sm text-[var(--accord-muted)]">The upload stays linked to this agreement room.</p>
                      </label>
                      <button
                        type="button"
                        disabled={actionLoading || !selectedFile}
                        onClick={() => handleAction("SUBMIT")}
                        className="primary-button w-full"
                      >
                        {actionLoading ? "Uploading" : "Deliver Work"}
                      </button>
                    </div>
                  ) : null}

                  {normalizedStatus === "SUBMITTED" ? (
                    <div className="space-y-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[rgba(234,179,8,0.18)] bg-[rgba(234,179,8,0.12)]">
                        <FileText className="h-5 w-5 text-[#EAB308]" />
                      </div>
                      <div>
                        <h2 className="section-title">Awaiting client review</h2>
                        <p className="mt-3 text-sm leading-7 text-[var(--accord-muted)]">
                          Your submission is in review. The client can approve the work or request a revision.
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {normalizedStatus === "COMPLETED" ? (
                    <div className="space-y-4">
                      <CheckCircle2 className="h-12 w-12 text-[#22C55E]" />
                      <div>
                        <h2 className="section-title">Agreement completed</h2>
                        <p className="mt-3 text-sm leading-7 text-[var(--accord-muted)]">
                          Funds have been released and this agreement is marked complete.
                        </p>
                      </div>
                    </div>
                  ) : null}
                </Motion.div>
              ) : isClient ? (
                <Motion.div key={`client-${normalizedStatus}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-5 space-y-5">
                  {normalizedStatus === "PENDING" ? (
                    <div className="space-y-5">
                      <div>
                        <h2 className="section-title">Fund the escrow</h2>
                        <p className="mt-3 text-sm leading-7 text-[var(--accord-muted)]">
                          Deposit ${Number(agreementAmount).toFixed(2)} to activate the agreement and lock funds in escrow.
                        </p>
                      </div>
                      <button type="button" disabled={actionLoading} onClick={() => handleAction("FUND")} className="primary-button w-full">
                        {actionLoading ? "Processing" : `Deposit ${Number(agreementAmount).toFixed(2)}`}
                      </button>
                    </div>
                  ) : null}

                  {normalizedStatus === "SUBMITTED" ? (
                    <div className="space-y-4">
                      <div>
                        <h2 className="section-title">Review the submission</h2>
                        <p className="mt-3 text-sm leading-7 text-[var(--accord-muted)]">
                          Approve the work to release funds or request a revision if changes are needed.
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <button type="button" disabled={actionLoading} onClick={() => handleAction("APPROVE")} className="primary-button w-full">
                          Approve Work
                        </button>
                        <button type="button" disabled={actionLoading} onClick={() => handleAction("REVISION")} className="secondary-button w-full">
                          Request Revision
                        </button>
                      </div>
                      <button type="button" disabled={actionLoading} onClick={() => handleAction("CANCEL_REQUEST")} className="destructive-button w-full">
                        Cancel and Dispute
                      </button>
                    </div>
                  ) : null}

                  {normalizedStatus === "COMPLETED" ? (
                    <div className="space-y-4">
                      <CheckCircle2 className="h-12 w-12 text-[#22C55E]" />
                      <div>
                        <h2 className="section-title">Final file available</h2>
                        <p className="mt-3 text-sm leading-7 text-[var(--accord-muted)]">
                          The agreement is complete and the final asset can be downloaded when available.
                        </p>
                      </div>
                      <button type="button" className="secondary-button w-full">
                        Download Final File
                      </button>
                    </div>
                  ) : null}

                  {normalizedStatus === "FUNDED" ? (
                    <div className="space-y-4">
                      <DollarSign className="h-12 w-12 text-[var(--accord-primary)]" />
                      <div>
                        <h2 className="section-title">Escrow is active</h2>
                        <p className="mt-3 text-sm leading-7 text-[var(--accord-muted)]">
                          The freelancer can now deliver work into this agreement room.
                        </p>
                      </div>
                    </div>
                  ) : null}
                </Motion.div>
              ) : (
                <Motion.div key="guest" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-5 space-y-4">
                  <AlertCircle className="h-12 w-12 text-[var(--accord-primary)]" />
                  <div>
                    <h2 className="section-title">Participant access required</h2>
                    <p className="mt-3 text-sm leading-7 text-[var(--accord-muted)]">
                      Connect as the freelancer or client on this agreement to interact with its escrow actions.
                    </p>
                  </div>
                  <button type="button" onClick={() => navigate("/")} className="primary-button w-full">
                    Connect Wallet
                  </button>
                </Motion.div>
              )}
            </AnimatePresence>
          </section>

          <section className="surface-card flex h-[480px] flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--accord-border)] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--accord-primary-line)] bg-[var(--accord-primary-soft)]">
                  <MessageSquare className="h-4 w-4 text-[var(--accord-primary)]" />
                </div>
                <div>
                  <p className="eyebrow">Project notes</p>
                  <h3 className="text-sm font-semibold text-[var(--accord-text)]">Shared updates</h3>
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto py-5">
              {!isParticipant ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <Info className="h-8 w-8 text-[var(--accord-muted)]" />
                  <p className="mt-4 text-sm font-semibold text-[var(--accord-text)]">Private room</p>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--accord-muted)]">Only agreement participants can see and send messages here.</p>
                </div>
              ) : messages.length ? (
                messages.map((item, index) => {
                  const mine = item.sender === address?.toLowerCase();

                  return (
                    <div key={`${item.sender}-${index}`} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-[10px] px-4 py-3 text-sm leading-6 ${
                          mine
                            ? "bg-[var(--accord-primary-soft)] text-[var(--accord-text)]"
                            : "border border-[var(--accord-border)] bg-[var(--accord-input-background)] text-[var(--accord-text)]"
                        }`}
                      >
                        <p>{item.content}</p>
                        <p className="mt-2 text-xs text-[var(--accord-muted)]">{mine ? "You" : "Counterparty"}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <MessageSquare className="h-8 w-8 text-[var(--accord-muted)]" />
                  <p className="mt-4 text-sm font-semibold text-[var(--accord-text)]">No notes yet</p>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--accord-muted)]">Messages added during the project will appear here.</p>
                </div>
              )}
            </div>

            {isParticipant ? (
              canMessage ? (
                <form onSubmit={handleSendMessage} className="flex gap-3 border-t border-[var(--accord-border)] pt-4">
                  <input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Add a progress update"
                    className="field-input flex-1"
                  />
                  <button type="submit" className="primary-button px-4">
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <div className="border-t border-[var(--accord-border)] pt-4">
                  <div className="surface-muted flex items-center gap-3 px-4 py-3">
                    <Lock className="h-4 w-4 text-[var(--accord-muted)]" />
                    <p className="text-sm text-[var(--accord-muted)]">Messaging becomes available after the agreement is funded.</p>
                  </div>
                </div>
              )
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
}


