"use client";
import React from "react";
import { MeetingProvider } from "@videosdk.live/react-sdk";
import { MeetingView } from "./MeetingView";

interface StreamingContainerProps {
  meetingId: string;
  token: string;
  displayName: string;
  isTutor?: boolean;
}

export default function StreamingContainer({ 
  meetingId, 
  token, 
  displayName,
  isTutor = false
}: StreamingContainerProps) {
  return (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: false,
        webcamEnabled: false,
        name: displayName,
        debugMode: false,
      }}
      token={token}
    >
      <MeetingView isTutor={isTutor} />
    </MeetingProvider>
  );
}
