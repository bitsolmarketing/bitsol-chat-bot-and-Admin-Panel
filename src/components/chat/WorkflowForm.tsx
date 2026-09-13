"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, Select, Textarea } from "@/components/ui/field";
import { BRAND } from "@/lib/brands";
import { MARKETING_SERVICES } from "@/data/marketing/services";
import type { ChatAction, ChatActionKind, SubmissionResult } from "@/types";

/**
 * =============================================================================
 *  In-chat workflow forms
 * =============================================================================
 *
 *  Lead capture, quote requests, consultation booking and support tickets all
 *  need 6–10 fields. Collecting those conversationally is slow and
 *  error-prone, so the assistant finishes its sentence and the client opens the
 *  matching form here.
 *
 *  Each form is described declaratively (fields + endpoint) so adding one is a
 *  data change, not a new component.
 * =============================================================================
 */

type FieldType = "text" | "tel" | "email" | "date" | "textarea" | "select";

interface FormField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  options?: Array<{ value: string; label: string }>;
  /** Half-width on wide screens. */
  half?: boolean;
}

interface FormSpec {
  title: string;
  intro: string;
  submitLabel: string;
  fields: FormField[];
  /** POST target. */
  endpoint: string;
}

const BUDGETS = [
  "Under PKR 100,000",
  "PKR 100,000 – 300,000",
  "PKR 300,000 – 700,000",
  "PKR 700,000 – 1,500,000",
  "Above PKR 1,500,000",
  "Not sure yet",
];

const TIMELINES = [
  "As soon as possible",
  "Within 1 month",
  "1–3 months",
  "3–6 months",
  "Just exploring",
];

const MEETING_TIMES = [
  "10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM",
  "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM",
];

const options = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

function specFor(kind: ChatActionKind): FormSpec | null {
  switch (kind) {
    case "LEAD_FORM":
    case "QUOTE_FORM":
      return {
        title: kind === "QUOTE_FORM" ? "Request a quote" : "Tell us about your project",
        intro:
          "Share a few details and our team will come back to you with a written quotation, usually within 2–3 working days.",
        submitLabel: "Send request",
        endpoint: "/api/leads",
        fields: [
          { name: "name", label: "Your name", type: "text", required: true, half: true },
          { name: "company", label: "Company", type: "text", half: true },
          { name: "phone", label: "Phone / WhatsApp", type: "tel", required: true, half: true, placeholder: "03xx xxxxxxx" },
          { name: "email", label: "Email", type: "email", half: true },
          { name: "businessType", label: "Your business / industry", type: "text", half: true, placeholder: "e.g. retail, clinic, real estate" },
          {
            name: "service",
            label: "Service you need",
            type: "select",
            half: true,
            options: MARKETING_SERVICES.map((s) => ({ value: s.slug, label: s.name })),
          },
          { name: "budget", label: "Budget range", type: "select", half: true, options: options(BUDGETS) },
          { name: "timeline", label: "Timeline", type: "select", half: true, options: options(TIMELINES) },
          {
            name: "requirements",
            label: "What do you need?",
            type: "textarea",
            required: true,
            placeholder: "Describe your goal, current setup and anything specific you need.",
          },
        ],
      };

    case "MEETING_FORM":
      return {
        title: "Book a free consultation",
        intro:
          "A free 30-minute call with a senior member of our team to understand your goal and recommend the right approach.",
        submitLabel: "Book meeting",
        endpoint: "/api/meetings",
        fields: [
          { name: "name", label: "Your name", type: "text", required: true, half: true },
          { name: "phone", label: "Phone / WhatsApp", type: "tel", required: true, half: true },
          { name: "email", label: "Email", type: "email", half: true },
          { name: "businessName", label: "Business name", type: "text", half: true },
          { name: "preferredDate", label: "Preferred date", type: "date", required: true, half: true },
          { name: "preferredTime", label: "Preferred time", type: "select", required: true, half: true, options: options(MEETING_TIMES) },
          {
            name: "mode",
            label: "Meeting type",
            type: "select",
            required: true,
            options: [
              { value: "OFFICE", label: "Office visit" },
              { value: "ZOOM", label: "Zoom" },
              { value: "GOOGLE_MEET", label: "Google Meet" },
              { value: "WHATSAPP", label: "WhatsApp call" },
            ],
          },
          { name: "topic", label: "What would you like to discuss?", type: "textarea" },
        ],
      };

    case "SUPPORT_FORM":
      return {
        title: "Raise a support ticket",
        intro: "Tell us what's wrong and we'll route it to the right team with a tracking reference.",
        submitLabel: "Create ticket",
        endpoint: "/api/tickets",
        fields: [
          {
            name: "category",
            label: "Category",
            type: "select",
            required: true,
            options: [
              { value: "TECHNICAL", label: "Technical support" },
              { value: "BILLING", label: "Billing" },
              { value: "SALES", label: "Sales" },
              { value: "COMPLAINT", label: "Complaint" },
              { value: "GENERAL", label: "General inquiry" },
            ],
          },
          { name: "name", label: "Your name", type: "text", required: true, half: true },
          { name: "phone", label: "Phone", type: "tel", half: true },
          { name: "email", label: "Email", type: "email", half: true },
          { name: "subject", label: "Subject", type: "text", required: true, half: true },
          { name: "description", label: "Describe the issue", type: "textarea", required: true },
        ],
      };

    default:
      return null;
  }
}

export function WorkflowForm({
  action,
  conversationRef,
  onCancel,
  onResult,
}: {
  action: ChatAction;
  conversationRef: string;
  onCancel: () => void;
  /** Confirmation message to append to the transcript as the assistant. */
  onResult: (message: string) => void;
}) {
  const spec = useMemo(() => specFor(action.kind), [action.kind]);
  const [values, setValues] = useState<Record<string, string>>(() =>
    action.subject ? seedSubject(action.kind, action.subject) : {}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!spec) return null;

  function set(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: "" } : e));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    for (const field of spec!.fields) {
      const value = values[field.name]?.trim();
      if (field.required && !value) {
        next[field.name] = "This field is required.";
        continue;
      }
      if (field.type === "email" && value && !/^\S+@\S+\.\S+$/.test(value)) {
        next[field.name] = "Enter a valid email address.";
      }
      if (field.type === "tel" && value && value.replace(/\D/g, "").length < 7) {
        next[field.name] = "Enter a valid phone number.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch(spec!.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, conversationRef }),
      });
      const result = (await res.json().catch(() => null)) as SubmissionResult | null;

      if (!res.ok || !result?.ok) {
        setFormError(
          result?.message ??
            "We couldn't submit that. Please try again, or contact us directly."
        );
        return;
      }
      onResult(result.message);
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={submit}
      className="ring-gradient rounded-2xl bg-brand-slate/70 p-5 shadow-glow backdrop-blur"
    >
      <div className="mb-4 flex items-start gap-3">
        <div className="flex-1">
          <p className="eyebrow">{BRAND.name}</p>
          <h3 className="mt-2 text-lg font-bold tracking-tight text-white">{spec.title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-white/55">{spec.intro}</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close form"
          className="grid size-8 shrink-0 place-items-center rounded-lg text-white/50 hover:bg-white/5 hover:text-white"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {spec.fields.map((field) => {
          const id = `wf-${field.name}`;
          return (
            <Field
              key={field.name}
              label={field.label}
              htmlFor={id}
              required={field.required}
              hint={field.hint}
              error={errors[field.name]}
              className={field.half ? "sm:col-span-1" : "sm:col-span-2"}
            >
              {field.type === "textarea" ? (
                <Textarea
                  id={id}
                  value={values[field.name] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(e) => set(field.name, e.target.value)}
                />
              ) : field.type === "select" ? (
                <Select
                  id={id}
                  value={values[field.name] ?? ""}
                  onChange={(e) => set(field.name, e.target.value)}
                >
                  <option value="">Select…</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  id={id}
                  type={field.type}
                  value={values[field.name] ?? ""}
                  placeholder={field.placeholder}
                  min={field.type === "date" ? today() : undefined}
                  onChange={(e) => set(field.name, e.target.value)}
                />
              )}
            </Field>
          );
        })}
      </div>

      {formError && (
        <p className="mt-3 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {formError}
        </p>
      )}

      <div className="mt-4 flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="brand" size="sm" disabled={submitting} className="gap-1.5">
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {spec.submitLabel}
        </Button>
      </div>

      <p className="mt-4 border-t border-white/[0.06] pt-3 text-[11px] text-white/40">
        We use these details only to respond to your request. Never share passwords, OTPs or card
        numbers here.
      </p>
    </motion.form>
  );
}

/** Pre-fill the service when the user already named one in chat. */
function seedSubject(kind: ChatActionKind, subject: string): Record<string, string> {
  if (kind === "LEAD_FORM" || kind === "QUOTE_FORM") return { service: subject };
  return {};
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
