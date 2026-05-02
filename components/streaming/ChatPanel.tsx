"use client";
import React, { useState, useEffect, useRef } from "react";
import { usePubSub } from "@videosdk.live/react-sdk";
import { Send, X, Smile, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

export const ChatPanel = ({ onClose }: { onClose: () => void }) => {
  const [message, setMessage] = useState("");
  const { publish, messages } = usePubSub("CHAT");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (message.trim()) {
      publish(message, { persist: true });
      setMessage("");
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-white/5">
        <h3 className="font-bold text-white flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          Live Chat
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
          <X size={18} className="text-slate-400" />
        </button>
      </div>

      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex flex-col ${msg.senderId === "LOCAL" ? "items-end" : "items-start"}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  {msg.senderName}
                </span>
                <span className="text-[10px] text-slate-600">
                  {format(new Date(msg.timestamp), "HH:mm")}
                </span>
              </div>
              <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm max-w-[85%]
                ${msg.senderId === "LOCAL" 
                  ? "bg-blue-600 text-white rounded-tr-none" 
                  : "bg-slate-800 text-slate-200 rounded-tl-none border border-white/5"
                }`}
              >
                {msg.message}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="p-4 bg-slate-800/30 border-t border-white/5">
        <div className="flex items-center gap-2 bg-slate-950 border border-white/10 rounded-xl p-2 focus-within:border-blue-500/50 transition-all shadow-inner">
          <button className="p-1.5 text-slate-500 hover:text-white transition-colors">
            <Smile size={18} />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white placeholder:text-slate-600"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="p-1.5 bg-blue-600 disabled:bg-slate-800 text-white rounded-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
