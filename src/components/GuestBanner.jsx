import React, { useState } from "react";
import { ShieldAlert, ArrowRight } from "lucide-react";
import IntegratedAuthModal from "./IntegratedAuthModal";

export default function GuestBanner() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 py-2 px-6 flex items-center justify-center gap-4 text-white shadow-lg relative z-[60]">
        <ShieldAlert className="w-4 h-4" />
        <p className="text-xs font-bold uppercase tracking-widest">
          Guest Mode: Connect a wallet to unlock all features
        </p>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase hover:bg-orange-50 transition-colors flex items-center gap-1"
        >
          Setup Wallet <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <IntegratedAuthModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onComplete={() => {
            setIsModalOpen(false);
            window.location.reload();
        }} 
      />
    </>
  );
}
