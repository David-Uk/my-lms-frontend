"use client";
import React, { useState, useEffect } from "react";
import { usePubSub } from "@videosdk.live/react-sdk";
import { motion, AnimatePresence } from "framer-motion";

const REACTION_TIMEOUT = 4000;

export const ReactionOverlay = () => {
  const [reactions, setReactions] = useState<{ id: string; emoji: string; name: string }[]>([]);

  usePubSub("REACTION", {
    onMessageReceived: (message) => {
      const id = Math.random().toString(36).substring(7);
      setReactions((prev) => [...prev, { id, emoji: message.message, name: message.senderName }]);
      
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== id));
      }, REACTION_TIMEOUT);
    },
  });

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {reactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{ y: "100vh", opacity: 0, x: Math.random() * 80 + 10 + "%" }}
            animate={{ y: "-10vh", opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="absolute bottom-0 flex flex-col items-center"
          >
            <div className="text-4xl filter drop-shadow-lg mb-2">{reaction.emoji}</div>
            <div className="bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] text-white whitespace-nowrap border border-white/10">
              {reaction.name}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
