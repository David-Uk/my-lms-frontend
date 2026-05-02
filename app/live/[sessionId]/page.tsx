import React from "react";
import { api, decodeToken, getToken } from "@/lib/api";
import StreamingContainer from "@/components/streaming/StreamingContainer";
import { redirect } from "next/navigation";

interface LiveSessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function LiveSessionPage({ params }: LiveSessionPageProps) {
  const { sessionId } = await params;
  const token = await getToken();

  if (!token) {
    redirect("/login");
  }

  const decoded = decodeToken(token);
  const displayName = decoded ? `${decoded.firstName} ${decoded.lastName}` : "User";
  const isTutor = decoded?.role === "tutor" || decoded?.role === "admin" || decoded?.role === "superadmin";

  try {
    // Fetch meeting details and VideoSDK token from backend
    const data = await api.get<{
      session: any;
      token: string;
      meetingId: string;
    }>(`/live-sessions/join/${sessionId}`);

    return (
      <main className="min-h-screen bg-slate-950 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {data.session.title}
              </h1>
              <p className="text-slate-400 mt-1">
                {data.session.course?.title} • Live Streaming Session
              </p>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white">{displayName}</p>
                  <p className="text-xs text-slate-500">{isTutor ? "Tutor" : "Participant"}</p>
               </div>
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                  {displayName.charAt(0)}
               </div>
            </div>
          </div>

          <StreamingContainer 
            meetingId={data.meetingId} 
            token={data.token} 
            displayName={displayName}
            isTutor={isTutor}
          />
        </div>
      </main>
    );
  } catch (error) {
    console.error("Failed to load live session:", error);
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-slate-900 p-10 rounded-3xl border border-white/5 shadow-2xl">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Session Not Found</h2>
          <p className="text-slate-400 mb-8">The live session you are looking for might have ended or is currently unavailable.</p>
          <a 
            href="/dashboard"
            className="inline-block px-8 py-3 bg-white text-slate-950 rounded-xl font-bold hover:bg-slate-100 transition-colors"
          >
            Go Back Dashboard
          </a>
        </div>
      </div>
    );
  }
}
