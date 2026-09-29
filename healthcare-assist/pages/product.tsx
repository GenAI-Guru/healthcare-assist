"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { useAuth } from "@clerk/nextjs";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { Protect, PricingTable, UserButton } from "@clerk/nextjs";

function ConsultationAssistant() {
  const { getToken } = useAuth();
  const [summary, setSummary] = useState<string>("…loading");

  useEffect(() => {
    let buffer = "";
    (async () => {
      const jwt = await getToken();
      if (!jwt) {
        setSummary("Authentication required");
        return;
      }

      await fetchEventSource("/api", {
        headers: { Authorization: `Bearer ${jwt}` },
        onmessage(ev) {
          buffer += ev.data;
          setSummary(buffer);
        },
        onerror(err) {
          console.error("SSE error:", err);
          // Don't throw - let it retry
        },
      });
    })();
  }, []); // Empty dependency array - run once on mount

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          healthcare-assist
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Consultation summaries, action items, and patient emails
        </p>
      </header>

      {/* Content Card */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 backdrop-blur-lg bg-opacity-95">
          {summary === "…loading" ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-gray-400">
                Preparing a sample consultation draft...
              </div>
            </div>
          ) : (
            <div className="markdown-content text-gray-700 dark:text-gray-300">
              <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                {summary}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Product() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* User Menu in Top Right */}
      <div className="absolute top-4 right-4">
        <UserButton showName={true} />
      </div>

      {/* Subscription Protection */}
      <Protect
        plan="trial_subscriptions"
        fallback={
          <div className="container mx-auto px-4 py-12">
            <header className="text-center mb-12">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                Choose Your Plan
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
                Unlock unlimited healthcare-assist consultation drafts
              </p>
            </header>
            <div className="max-w-4xl mx-auto">
              <PricingTable />
            </div>
          </div>
        }
      >
        <ConsultationAssistant />
      </Protect>
    </main>
  );
}
