
// venture-profile/[id]/page.js
export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Target,
  AlertCircle,
  Lightbulb,
  Users,
} from "lucide-react";

// [2026-01-08] FIX: helper to create admin client (safe in Server Action + render)
function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, serviceKey);
}

export default async function VentureProfile({ params, searchParams }) {
  const { id } = params;
  const token = searchParams?.token;
  const joined = searchParams?.joined === "1"; // [2026-01-08] NEW: success state after join

  if (!id) return notFound();

  // [2026-01-08] NEW: show a clean “private page” if no token
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center">
          <Lock className="mx-auto text-red-500 mb-4" size={44} />
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Private Page</h1>
          <p className="text-gray-600">
            This venture profile is available only via a valid invitation link.
          </p>
        </div>
      </div>
    );
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return notFound();
  const supabaseAdmin = createSupabaseAdmin();

  // --- invitation validation (we keep it, but we won’t “show invite details” on the UI) ---
  const { data: invitation, error: inviteError } = await supabaseAdmin
    .from("co_founder_invitations")
    .select("status, invitation_token, venture_id")
    .eq("venture_id", id)
    .eq("invitation_token", token)
    .single();

  if (inviteError || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center">
          <Lock className="mx-auto text-red-500 mb-4" size={44} />
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-600">
            This invitation link is not valid, expired, or was already used.
          </p>
        </div>
      </div>
    );
  }

  // --- fetch ONLY business_plans content (as you asked) ---
  const { data: plan, error: planError } = await supabaseAdmin
    .from("business_plans")
    .select("*")
    .eq("venture_id", id)
    .single();

  if (planError || !plan) return notFound();

  // [2026-01-08] FIX: Server Action creates its own admin client + redirects with joined=1
  async function handleAccept() {
    "use server";

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
    const admin = createSupabaseAdmin();

    // Only allow join if invitation is currently "sent"
    const { data: inv, error: invErr } = await admin
      .from("co_founder_invitations")
      .select("status")
      .eq("venture_id", id)
      .eq("invitation_token", token)
      .single();

    if (invErr || !inv) redirect(`/venture-profile/${id}?token=${encodeURIComponent(token)}`);

    if (String(inv.status || "").toLowerCase() !== "sent") {
      // Already accepted / not joinable — just go back without breaking UX
      redirect(`/venture-profile/${id}?token=${encodeURIComponent(token)}`);
    }

    const { error: inviteUpdateErr } = await admin
      .from("co_founder_invitations")
      .update({ status: "accepted" })
      .eq("venture_id", id)
      .eq("invitation_token", token);

    if (inviteUpdateErr) redirect(`/venture-profile/${id}?token=${encodeURIComponent(token)}`);

    // Increment founders_count (lightweight; keep it minimal)
    const { data: venture, error: ventureErr } = await admin
      .from("ventures")
      .select("founders_count")
      .eq("id", id)
      .single();

    if (!ventureErr) {
      await admin
        .from("ventures")
        .update({ founders_count: (venture?.founders_count || 1) + 1 })
        .eq("id", id);
    }

    revalidatePath(`/venture-profile/${id}`);

    // [2026-01-08] NEW: redirect back to same page with success flag
    redirect(`/venture-profile/${id}?token=${encodeURIComponent(token)}&joined=1`);
  }

  // --- UI helpers ---
  const title = plan?.venture_name || plan?.name || "Venture"; // if exists, otherwise fallback
  const completion = plan?.completion_percentage ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto font-sans">
        {/* [2026-01-08] NEW: Success overlay after JOIN */}
        {joined && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="text-green-600" size={28} />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                      Welcome aboard! <Sparkles className="text-yellow-500" size={20} />
                    </h2>
                    <p className="text-gray-700 mt-2 leading-relaxed">
                      You’ve successfully joined <span className="font-bold text-indigo-700">{title}</span> as a co-founder.
                      <br />
                      Let’s build something great together 🚀
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <a
                    href={`/venture-profile/${id}?token=${encodeURIComponent(token)}`}
                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Close
                  </a>
                  {/* אם בעתיד תרצה לשלוח לדשבורד — תחליף כאן ל /dashboard */}
                  <a
                    href={`/dashboard`}
                    className="px-5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold inline-flex items-center gap-2"
                  >
                    Continue <ArrowRight size={18} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* [2026-01-08] NEW: Hero header */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8 sm:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <p className="text-sm font-bold text-indigo-700 tracking-wide uppercase">
                  Venture Invitation
                </p>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-2">
                  {title}
                </h1>
                <p className="text-gray-600 mt-3 max-w-2xl">
                  You’ve been invited to join as a co-founder. Review the venture summary below, then join when you’re ready.
                </p>

                {typeof completion === "number" && (
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 font-medium">Business Plan Completion</span>
                      <span className="text-gray-900 font-bold">{completion}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{ width: `${Math.max(0, Math.min(100, completion))}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* [2026-01-08] NEW: Big CTA */}
              <div className="lg:w-[360px] w-full">
                {String(invitation.status || "").toLowerCase() === "accepted" ? (
                  <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
                    <div className="flex items-center gap-2 text-green-700 font-bold">
                      <CheckCircle2 size={18} />
                      Already Joined
                    </div>
                    <p className="text-green-700/90 text-sm mt-2">
                      This invitation was already accepted.
                    </p>
                    <a
                      href="/dashboard"
                      className="mt-4 inline-flex w-full justify-center items-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                    >
                      Go to Dashboard <ArrowRight size={18} />
                    </a>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6">
                    <div className="text-indigo-900 font-extrabold text-lg">
                      Join as Co-Founder
                    </div>
                    <p className="text-indigo-800/90 text-sm mt-2">
                      Clicking Join will accept the invitation and add you to the venture.
                    </p>

                    <form action={handleAccept}>
                      <button
                        type="submit"
                        className="mt-4 w-full rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-4 text-lg shadow-lg hover:shadow-indigo-200 active:scale-[0.99] transition"
                      >
                        JOIN AS CO-FOUNDER
                      </button>
                    </form>

                    <p className="text-xs text-indigo-800/70 mt-3">
                      You can always leave later if needed.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* [2026-01-08] NEW: Clean content sections (business_plans only) */}
          <div className="border-t bg-white">
            <div className="p-8 sm:p-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <section className="rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold mb-3">
                    <Target size={18} />
                    Mission
                  </div>
                  <p className="text-gray-800 leading-relaxed">
                    {plan.mission || "—"}
                  </p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <section className="rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center gap-2 text-red-600 font-bold mb-3">
                      <AlertCircle size={18} />
                      The Problem
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {plan.problem || "—"}
                    </p>
                  </section>

                  <section className="rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center gap-2 text-green-700 font-bold mb-3">
                      <Lightbulb size={18} />
                      The Solution
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {plan.solution || "—"}
                    </p>
                  </section>
                </div>
              </div>

              <div className="space-y-6">
                <section className="rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center gap-2 text-gray-900 font-bold mb-3">
                    <Users size={18} />
                    Founder Background
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {plan.entrepreneur_background || "—"}
                  </p>
                </section>

                <section className="rounded-2xl border border-gray-200 p-6">
                  <div className="text-gray-900 font-bold mb-3">Market</div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {plan.market_size || "—"}
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>

        {/* footer spacing */}
        <div className="h-10" />
      </div>
    </div>
  );
}

