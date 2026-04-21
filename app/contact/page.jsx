// app/contact/page.jsx
// UPDATE 200426: Contact form — saves submission to crm table and sends email notification to admin.

"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Send, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setIsSending(true);
    setError(null);

    try {
      // [CRM] Save submission to crm table
      const { error: dbError } = await supabase.from("crm").insert({
        name: form.name,
        email: form.email,
        message: form.message,
        status: "new",
      });

      if (dbError) throw dbError;

      // [EMAIL] Send notification email to admin
      const res = await fetch("/api/send-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, message: form.message }),
      });

      if (!res.ok) throw new Error("Failed to send email");

      setIsSent(true);
      setForm({ name: "", email: "", message: "" });

    } catch (err) {
      console.error("Contact form error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Get in Touch</h1>
          <p className="text-gray-500 text-lg">We'd love to hear from you.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-indigo-600" /> Send us a message
            </CardTitle>
            <CardDescription>We'll get back to you as soon as possible.</CardDescription>
          </CardHeader>
          <CardContent>
            {isSent ? (
              // [SUCCESS] Show confirmation after submission
              <div className="text-center py-8 space-y-3">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <p className="text-xl font-bold text-gray-900">Message sent!</p>
                <p className="text-gray-500">Thank you for reaching out. We'll be in touch soon.</p>
                <Button variant="outline" onClick={() => setIsSent(false)} className="mt-4">
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={e => handleChange("name", e.target.value)}
                    placeholder="John Smith"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={e => handleChange("email", e.target.value)}
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={form.message}
                    onChange={e => handleChange("message", e.target.value)}
                    placeholder="Tell us how we can help..."
                    className="h-32"
                    required
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={isSending || !form.name || !form.email || !form.message}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {isSending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" /> Send Message</>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
