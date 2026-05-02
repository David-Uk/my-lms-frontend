"use client";
import React, { useState, useMemo } from "react";
import { useMeeting } from "@videosdk.live/react-sdk";
import { ParticipantView } from "./ParticipantView";
import { Controls } from "./Controls";
import { ChatPanel } from "./ChatPanel";
import { ReactionOverlay } from "./ReactionOverlay";
import { motion, AnimatePresence } from "framer-motion";

export const MeetingView = ({ isTutor = false }: { isTutor?: boolean }) => {
  const [joined, setJoined] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const { participants, join } = useMeeting({
    onMeetingJoined: () => {
      setJoined("JOINED");
    },
    onMeetingLeft: () => {
      setJoined(null);
    },
  });

  const participantIds = useMemo(() => Array.from(participants.keys()), [participants]);

  if (!joined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[600px] bg-slate-950 rounded-3xl border border-white/5 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-50" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center"
        >
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-600/40">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11"/><rect width="14" height="12" x="2" y="6" rx="2"/></svg>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Ready to join?</h2>
          <p className="text-slate-400 mb-8 max-w-md">Your camera and microphone are off by default. You can enable them after joining.</p>
          <button
            onClick={() => join()}
            className="px-10 py-4 bg-white text-slate-950 rounded-2xl font-bold text-lg hover:bg-slate-100 transition-all shadow-xl shadow-white/10 active:scale-95"
          >
            Join Meeting
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[800px] bg-slate-950 rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
      <div className="flex flex-1 overflow-hidden p-4 gap-4">
        <div className="flex-1 grid gap-4 relative overflow-y-auto pr-2 custom-scrollbar" 
          style={{ 
            gridTemplateColumns: participantIds.length === 1 ? "1fr" : 
                                 participantIds.length <= 4 ? "repeat(2, 1fr)" : 
                                 "repeat(auto-fit, minmax(300px, 1fr))" 
          }}
        >
          <ReactionOverlay />
          <AnimatePresence>
            {participantIds.map((id) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={participantIds.length === 1 ? "h-full" : "aspect-video"}
              >
                <ParticipantView participantId={id} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {showChat && (
          <motion.div 
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="w-80 flex-shrink-0"
          >
            <ChatPanel onClose={() => setShowChat(false)} />
          </motion.div>
        )}
      </div>

      <Controls onChatToggle={() => setShowChat(!showChat)} isTutor={isTutor} />
    </div>
  );
};
