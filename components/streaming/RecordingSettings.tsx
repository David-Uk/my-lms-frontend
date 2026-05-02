"use client";
import React, { useState } from "react";
import { Cloud, Save, CheckCircle2, Server, HardDrive, Database } from "lucide-react";
import { motion } from "framer-motion";

const STORAGE_OPTIONS = [
  { id: "s3", name: "AWS S3", icon: <Cloud size={20} />, color: "text-orange-500" },
  { id: "gcs", name: "Google Cloud", icon: <Database size={20} />, color: "text-blue-500" },
  { id: "cloudinary", name: "Cloudinary", icon: <HardDrive size={20} />, color: "text-indigo-500" },
  { id: "local", name: "Server Storage", icon: <Server size={20} />, color: "text-green-500" },
];

export const RecordingSettings = ({ onSave }: { onSave: (config: any) => void }) => {
  const [selected, setSelected] = useState("s3");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onSave({ storage: selected });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl max-w-sm">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Save className="text-blue-500" size={24} />
        Recording Storage
      </h3>

      <div className="space-y-3 mb-8">
        {STORAGE_OPTIONS.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelected(option.id)}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 
              ${selected === option.id 
                ? "bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
                : "bg-slate-800/50 border-white/5 hover:border-white/10 hover:bg-slate-800"
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-slate-900 ${option.color}`}>
                {option.icon}
              </div>
              <span className={`font-semibold ${selected === option.id ? "text-white" : "text-slate-400"}`}>
                {option.name}
              </span>
            </div>
            {selected === option.id && (
              <CheckCircle2 size={18} className="text-blue-500" />
            )}
          </button>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSave}
        className="w-full py-4 bg-white text-slate-950 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-white/5"
      >
        {isSaved ? (
          <>
            <CheckCircle2 size={20} />
            <span>Config Saved</span>
          </>
        ) : (
          <span>Save Configuration</span>
        )}
      </motion.button>
    </div>
  );
};
