"use client";
import React from "react";
import { useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import { 
  Mic, MicOff, Video, VideoOff, ScreenShare, StopCircle, 
  MessageSquare, Users, PhoneOff, Settings, Radio, Smile
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EMOJIS = ["❤️", "👏", "👍", "😮", "😂", "🔥"];

import { RecordingSettings } from "./RecordingSettings";

export const Controls = ({ 
  onChatToggle, 
  isTutor = false 
}: { 
  onChatToggle: () => void, 
  isTutor?: boolean 
}) => {
  const [showReactions, setShowReactions] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const { publish } = usePubSub("REACTION");

  const { 
    leave, toggleMic, toggleWebcam, toggleScreenShare, 
    startRecording, stopRecording, recordingState,
    localMicOn, localWebcamOn 
  } = useMeeting();

  const isRecording = recordingState === "RECORDING_STARTED";

  return (
    <div className="flex items-center justify-between px-8 py-4 bg-slate-900/80 backdrop-blur-xl border-t border-white/10 w-full relative">
      <AnimatePresence>
        {showReactions && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl z-50"
          >
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  publish(emoji, { persist: false });
                  setShowReactions(false);
                }}
                className="text-2xl p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Live</span>
        </div>
        <div className="h-4 w-[1px] bg-white/10" />
        <span className="text-sm font-medium text-slate-400">Meeting ID: <span className="text-white">XYZ-ABC-123</span></span>
      </div>

      <div className="flex items-center gap-3">
        <ControlButton 
          active={localMicOn} 
          onClick={() => toggleMic()}
          icon={localMicOn ? <Mic size={20} /> : <MicOff size={20} />}
          label="Mute"
        />
        <ControlButton 
          active={localWebcamOn} 
          onClick={() => toggleWebcam()}
          icon={localWebcamOn ? <Video size={20} /> : <VideoOff size={20} />}
          label="Camera"
        />
        <ControlButton 
          active={false} 
          onClick={() => toggleScreenShare()}
          icon={<ScreenShare size={20} />}
          label="Share"
        />
        <ControlButton 
          active={isRecording} 
          onClick={() => isRecording ? stopRecording() : startRecording()}
          icon={isRecording ? <StopCircle size={20} className="text-red-500" /> : <Radio size={20} />}
          label={isRecording ? "Stop" : "Record"}
          danger={isRecording}
        />
        <ControlButton 
          active={showReactions} 
          onClick={() => setShowReactions(!showReactions)}
          icon={<Smile size={20} />}
          label="Reactions"
        />
        
        <div className="h-8 w-[1px] bg-white/10 mx-2" />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => leave()}
          className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-red-600/20"
        >
          <PhoneOff size={18} />
          <span>Leave</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showSettings && isTutor && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10"
            >
              <RecordingSettings onSave={(config) => console.log("Storage config:", config)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3">
        <ControlButton icon={<MessageSquare size={20} />} onClick={onChatToggle} label="Chat" />
        <ControlButton icon={<Users size={20} />} onClick={() => {}} label="Participants" />
        <ControlButton 
          icon={<Settings size={20} />} 
          onClick={() => setShowSettings(true)} 
          label="Settings" 
        />
      </div>
    </div>
  );
};

const ControlButton = ({ 
  icon, 
  onClick, 
  active = false, 
  label,
  danger = false
}: { 
  icon: React.ReactNode, 
  onClick: () => void, 
  active?: boolean,
  label: string,
  danger?: boolean
}) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    title={label}
    className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-center
      ${active 
        ? "bg-white text-slate-900 border-white shadow-lg shadow-white/10" 
        : danger 
          ? "bg-red-500/10 text-red-500 border-red-500/30 hover:bg-red-500/20"
          : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white"
      }`}
  >
    {icon}
  </motion.button>
);
