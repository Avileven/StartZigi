"use client";
// FILE DESTINATION: app/outreach/page.jsx (new file; create the folder app/outreach)
// Outreach page: shows every account with its status from the database, previews each email,
// sends a test to yourself, and sends to one person or to everyone in a status.
// Only works when logged in with an account listed in the outreach_admins table.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { KINDS, KIND_ORDER, renderEmail } from "@/lib/outreach/templates";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getToken() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || "";
}

async function api(method, body) {
  const token = await getToken();
  const res = await fetch("/api/outreach", {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-GB") : "never");

export default function OutreachPage() {
  const [view, setView] = useState("loading"); // loading | denied | ready
  const [admin, setAdmin] = useState("");
  const [people, setPeople] = useState([]);
  const [filter, setFilter] = useState("unconfirmed");
  const [rowState, setRowState] = useState({}); // userId -> { s: "sending" | "sent" | "failed", msg }
  const [note, setNote] = useState("");
  const [running, setRunning] = useState(false);
  const [preview, setPreview] = useState(null); // { kind, person }

  const load = useCallback(async () => {
    try {
      const d = await api("GET");
      setAdmin(d.admin);
      setPeople(d.people);
      setView("ready");
    } catch {
      setView("denied");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const c = { active: 0 };
    KIND_ORDER.forEach((k) => (c[k] = 0));
    people.forEach((p) => {
      c[p.status] = (c[p.status] || 0) + 1;
    });
    return c;
  }, [people]);

  const rows = useMemo(() => people.filter((p) => p.status === filter), [people, filter]);
  const pending = rows.filter((p) => !p.sent_at && rowState[p.user_id]?.s !== "sent");

  async function sendOne(p) {
    setRowState((s) => ({ ...s, [p.user_id]: { s: "sending" } }));
    try {
      const d = await api("POST", { mode: "send", kind: p.status, userId: p.user_id });
      setRowState((s) => ({ ...s, [p.user_id]: { s: "sent", msg: d.warning || "" } }));
      return true;
    } catch (e) {
      setRowState((s) => ({ ...s, [p.user_id]: { s: "failed", msg: e.message } }));
      return false;
    }
  }

  async function sendAll() {
    if (!window.confirm(`Send "${KINDS[filter].label}" to ${pending.length} people now?`)) return;
    setRunning(true);
    for (const p of pending) {
      await sendOne(p);
      await sleep(700);
    }
    setRunning(false);
    load();
  }

  async function sendTest() {
    setRunning(true);
    setNote("Sending...");
    try {
      const d = await api("POST", { mode: "test", kind: filter });
      setNote(`Test sent to ${d.to}. Check your inbox.`);
    } catch (e) {
      setNote(`Failed: ${e.message}`);
    }
    setRunning(false);
  }

  if (view === "loading") return <div className="p-8 text-gray-500">Loading...</div>;
  if (view === "denied") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-gray-600 text-center">Not allowed. Log in with an admin account and reload this page.</p>
      </div>
    );
  }

  const k = KINDS[filter];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outreach</h1>
          <p className="text-gray-500 text-sm mt-1">Logged in as {admin}. Statuses are read live from the database.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {KIND_ORDER.map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`text-left p-4 rounded-xl border-2 bg-white transition ${filter === key ? "border-indigo-500" : "border-transparent hover:border-gray-200"}`}
            >
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{KINDS[key].label}</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{counts[key] || 0}</p>
            </button>
          ))}
          <div className="p-4 rounded-xl bg-white border-2 border-transparent">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active (no outreach)</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{counts.active || 0}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
          <div>
            <p className="font-semibold text-gray-900">{k.label}</p>
            <p className="text-sm text-gray-500">Subject: {k.subject}</p>
            {k.resendsConfirmation && (
              <p className="text-sm text-amber-700 mt-1">Sending this also triggers a new confirmation email from the system.</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPreview({ kind: filter, person: { username: "", email: admin } })}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 font-semibold"
            >
              Preview
            </button>
            <button
              onClick={sendTest}
              disabled={running}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold disabled:opacity-50"
            >
              Send test to me
            </button>
            <button
              onClick={sendAll}
              disabled={running || pending.length === 0}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold disabled:opacity-50"
            >
              {running ? "Sending..." : `Send to all (${pending.length})`}
            </button>
          </div>
          {note && <p className="text-sm text-gray-700">{note}</p>}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b text-xs text-gray-400 uppercase">
              <tr>
                <th className="p-3">Email</th>
                <th className="p-3">Registered</th>
                <th className="p-3">Days</th>
                <th className="p-3">Last login</th>
                <th className="p-3">Phase</th>
                <th className="p-3">Sent</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((p) => {
                const st = rowState[p.user_id];
                const sent = p.sent_at || st?.s === "sent";
                return (
                  <tr key={p.user_id}>
                    <td className="p-3 break-all">{p.email}</td>
                    <td className="p-3 whitespace-nowrap">{fmt(p.registered)}</td>
                    <td className="p-3">{p.days_since}</td>
                    <td className="p-3 whitespace-nowrap">{fmt(p.last_login)}</td>
                    <td className="p-3">{p.phase || "-"}</td>
                    <td className="p-3 whitespace-nowrap">
                      {st?.s === "failed" ? (
                        <span className="text-red-600 font-semibold" title={st.msg}>FAILED ({st.msg})</span>
                      ) : st?.s === "sending" ? (
                        <span className="text-amber-600">sending...</span>
                      ) : sent ? (
                        <span className="text-emerald-600 font-semibold" title={st?.msg || ""}>
                          {p.sent_at ? fmt(p.sent_at) : "sent now"}
                        </span>
                      ) : (
                        <span className="text-gray-400">not sent</span>
                      )}
                    </td>
                    <td className="p-3 whitespace-nowrap text-right space-x-2">
                      <button onClick={() => setPreview({ kind: filter, person: p })} className="text-indigo-600 font-semibold">
                        Preview
                      </button>
                      <button
                        onClick={() => sendOne(p).then(load)}
                        disabled={running || sent || st?.s === "sending"}
                        className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-semibold disabled:opacity-40"
                      >
                        Send
                      </button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-gray-400">Nobody in this status.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {preview && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate">{KINDS[preview.kind].subject}</p>
                <p className="text-xs text-gray-500 truncate">To: {preview.person.email}</p>
              </div>
              <button onClick={() => setPreview(null)} className="px-3 py-1 rounded-lg border text-sm font-medium">Close</button>
            </div>
            <iframe
              title="Email preview"
              className="flex-1 w-full rounded-b-2xl"
              srcDoc={renderEmail(preview.kind, { name: preview.person.username || "", email: preview.person.email }).html}
            />
          </div>
        </div>
      )}
    </div>
  );
}
