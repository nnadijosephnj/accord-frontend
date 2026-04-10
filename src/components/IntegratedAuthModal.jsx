import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert } from "lucide-react";
import { ConnectEmbed } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { client, injectiveTestnet } from "../lib/thirdwebClient";

export default function IntegratedAuthModal({ isOpen, onClose, onComplete }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 40 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.9, y: 40 }} 
          className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl"
        >
          <button onClick={onClose} className="absolute top-8 right-8 p-3 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 z-10">
            <X size={20} />
          </button>

          <div className="p-10 pt-14">
            <div className="w-16 h-16 bg-orange-500/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8">
              <ShieldAlert className="text-orange-500 w-8 h-8" />
            </div>

            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-white tracking-tight mb-2 uppercase italic">Join Accord</h2>
              <p className="text-zinc-500 font-medium">Access secure freelance agreements.</p>
            </div>

            <div className="rounded-3xl overflow-hidden border border-white/5 bg-white/5 p-1">
              <ConnectEmbed
                client={client}
                chain={injectiveTestnet}
                wallets={[
                  createWallet("app.keplr"),
                  createWallet("io.metamask"),
                  inAppWallet({
                    auth: {
                      options: ["google", "email"],
                    },
                  }),
                ]}
                theme={"dark"}
                onConnect={() => onComplete()}
                className="!bg-transparent !border-0"
              />
            </div>
          </div>

          <div className="p-10 bg-white/[0.02] border-t border-white/5 text-center">
            <p className="text-[10px] text-zinc-800 font-black uppercase tracking-widest">
              Accord Trust Execution Framework
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
