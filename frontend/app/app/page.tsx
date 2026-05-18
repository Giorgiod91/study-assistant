"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardView from "@/components/DashboardView";
import ChatView from "@/components/ChatView";
import ExportView from "@/components/ExportView";
import DeadlinesView from "@/components/DeadlinesView";

type View = "dashboard" | "chat" | "export" | "deadlines";

export default function AppPage() {
  const [view, setView] = useState<View>("dashboard");

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar active={view} onChange={setView} />
      {view === "dashboard" && <DashboardView />}
      {view === "chat" && <ChatView />}
      {view === "export" && <ExportView />}
      {view === "deadlines" && <DeadlinesView />}
    </div>
  );
}
