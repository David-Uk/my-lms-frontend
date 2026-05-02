"use client";
import React, { useMemo, useRef, useEffect } from "react";
import { useParticipant } from "@videosdk.live/react-sdk";

export const ParticipantView = ({ participantId }: { participantId: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { webcamStream, micStream, webcamOn, micOn, isLocal, displayName } =
    useParticipant(participantId);

  const videoStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (videoRef.current) {
      if (webcamOn && videoStream) {
        videoRef.current.srcObject = videoStream;
        videoRef.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        videoRef.current.srcObject = null;
      }
    }
  }, [webcamOn, videoStream]);

  return (
    <div className="relative group w-full h-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 transition-all duration-300 hover:border-blue-500/50">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
        <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs font-medium text-white border border-white/10">
          {displayName} {isLocal ? "(You)" : ""}
        </span>
      </div>

      <div className="w-full h-full flex items-center justify-center">
        {webcamOn ? (
          <video
            autoPlay
            playsInline
            muted={isLocal}
            ref={videoRef}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {displayName?.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {!micOn && (
        <div className="absolute bottom-4 right-4 z-10">
           <div className="p-1.5 bg-red-500/20 backdrop-blur-md rounded-full border border-red-500/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12"/><circle cx="17" cy="7" r="5"/></svg>
           </div>
        </div>
      )}
    </div>
  );
};
