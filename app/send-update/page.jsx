"use client";
// FILE DESTINATION: app/send-update/page.jsx (new file)
// One-off page for sending the product-update email. Only works when logged in with an
// account listed in ADMIN_EMAILS (app/api/send-update/updateEmail.js). Delete after sending.

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getToken() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || "";
}

export default function SendUpdatePage() {
  const [view, setView] = useState("loading"); // loading | denied | ready
  const [info, setInfo] = useState(null);
  const [status, setStatus] = useState({}); // index -> { s: "sending" | "sent" | "failed", at, msg }
  const [testMsg, setTestMsg] = useState("");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) { setView("denied"); return; }
        const res = await fetch("/api/send-update", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) { setView("denied"); return; }
        setInfo(await res.json());
        setView("ready");
      } catch {
        setView("denied");
      }
    })();
  }, []);

  async function post(body) {
    const token = await getToken();
    const res = await fetch("/api/send-update", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
    return data;
  }

  async function sendTest() {
    setRunning(true);
    setTestMsg("Sending...");
    try {
      const d = await post({ mode: "test" });
      setTestMsg(`Test email sent to ${d.to}. Check your inbox.`);
    } catch (e) {
      setTestMsg(`Failed: ${e.message}`);
    }
    setRunning(false);
  }

  async function sendAll() {
    const left = info.recipients.filter((_, i) => status[i]?.s !== "sent").length;
    if (!window.confirm(`Send this email to ${left} people now?`)) return;
    setRunning(true);
    for (let i = 0; i < info.recipients.length; i++) {
      if (status[i]?.s === "sent") continue; // never send twice to the same person
      setStatus((p) => ({ ...p, [i]: { s: "sending" } }));
      try {
        await post({ mode: "one", index: i });
        setStatus((p) => ({ ...p, [i]: { s: "sent", at: new Date().toLocaleTimeString() } }));
      } catch (e) {
        setStatus((p) => ({ ...p, [i]: { s: "failed", at: new Date().toLocaleTimeString(), msg: e.message } }));
      }
      await sleep(600);
    }
    setRunning(false);
  }

  if (view === "loading") return <div className="p-8 text-gray-500">Loading...</div>;
  if (view === "denied") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-gray-600 text-center">Not allowed. Log in with the admin account and reload this page.</p>
      </div>
    );
  }

  const sentCount = Object.values(status).filter((x) => x.s === "sent").length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Send product update email</h1>
          <p className="text-gray-600 mt-1">Subject: <strong>{info.subject}</strong></p>
          <p className="text-gray-500 text-sm mt-1">Logged in as {info.admin}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="font-semibold text-gray-900">1. Send a test to yourself first</p>
          <button
            onClick={sendTest}
            disabled={running}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold disabled:opacity-50"
          >
            Send test to me
          </button>
          {testMsg && <p className="text-sm text-gray-700">{testMsg}</p>}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <p className="font-semibold text-gray-900">
            2. Send to everyone ({sentCount} of {info.recipients.length} sent)
          </p>
          <button
            onClick={sendAll}
            disabled={running || sentCount === info.recipients.length}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold disabled:opacity-50"
          >
            {running ? "Sending..." : "Send to all"}
          </button>
          <ul className="divide-y divide-gray-100">
            {info.recipients.map((email, i) => {
              const st = status[i];
              return (
                <li key={email} className="py-2 flex items-center justify-between gap-3 text-sm">
                  <span className="text-gray-800 break-all">{email}</span>
                  <span
                    className={
                      st?.s === "sent" ? "text-emerald-600 font-semibold"
                      : st?.s === "failed" ? "text-red-600 font-semibold"
                      : st?.s === "sending" ? "text-amber-600"
                      : "text-gray-400"
                    }
                    title={st?.msg || ""}
                  >
                    {st?.s === "sent" ? `sent ${st.at}` : st?.s === "failed" ? `FAILED ${st.at}${st.msg ? ` (${st.msg})` : ""}` : st?.s === "sending" ? "sending..." : "waiting"}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
