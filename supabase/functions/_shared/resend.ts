const DEFAULT_NOTIFY_TO = "contact@beforensic.be";
// Domaine vérifié chez Resend : beforensic.be (pas updates.beforensic.be)
const DEFAULT_FROM = "CyberKit <noreply@beforensic.be>";

export interface ContactNotifyPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  quiz_score?: number | null;
  theme_interest?: string | null;
}

export async function sendContactNotification(
  payload: ContactNotifyPayload,
): Promise<{ sent: boolean; error?: string }> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — email notification skipped");
    return { sent: false, error: "RESEND_API_KEY missing" };
  }

  const to = Deno.env.get("CONTACT_NOTIFY_EMAIL")?.trim() || DEFAULT_NOTIFY_TO;
  const from = Deno.env.get("CONTACT_FROM_EMAIL")?.trim() || DEFAULT_FROM;

  const extras: string[] = [];
  if (typeof payload.quiz_score === "number") {
    extras.push(`Score diagnostic : ${payload.quiz_score}%`);
  }
  if (payload.theme_interest?.trim()) {
    extras.push(`Thème d'intérêt : ${payload.theme_interest.trim()}`);
  }

  const emailBody = [
    `Nom : ${payload.name}`,
    `Email : ${payload.email}`,
    `Sujet : ${payload.subject}`,
    ...extras,
    "",
    "Message :",
    payload.message,
    "",
    "---",
    "Envoyé depuis le formulaire de contact de CyberKit",
  ].join("\n");

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: payload.email,
      subject: `[CyberKit] ${payload.subject} — ${payload.name}`,
      text: emailBody,
    }),
  });

  if (!resendResponse.ok) {
    const errorData = await resendResponse.text();
    console.error(
      `Resend error (${resendResponse.status}) from=${from} to=${to}:`,
      errorData,
    );
    return { sent: false, error: `Resend ${resendResponse.status}: ${errorData}` };
  }

  const resendData = await resendResponse.json();
  console.log("Resend sent:", resendData.id, "to:", to);

  return { sent: true };
}
