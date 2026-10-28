import { NextResponse } from "next/server";
import { decideApproval } from "@/lib/approval-policy";

type SendBody = {
  to?: string;
  text?: string;
  approvedBy?: string;
};

/**
 * The only server-side path that may send a WhatsApp message. It explicitly
 * refuses sensitive drafts unless an authenticated production user has approved
 * the message. Authentication/audit persistence are the next production layer.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as SendBody;
  const to = body.to?.replace(/\D/g, "") ?? "";
  const text = body.text?.trim() ?? "";

  if (to.length < 10 || to.length > 15 || !text) {
    return NextResponse.json({ error: "A destination number and message text are required." }, { status: 400 });
  }

  const approval = decideApproval({ message: text, confidence: 1, isKnownContact: true });
  if (approval.requiresApproval && !body.approvedBy?.trim()) {
    return NextResponse.json(
      { error: "Human approval is required before sending this message.", reasons: approval.reasons },
      { status: 409 },
    );
  }

  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    return NextResponse.json({ error: "WhatsApp Cloud API has not been configured." }, { status: 503 });
  }

  const graphApiVersion = process.env.WHATSAPP_GRAPH_API_VERSION || "v24.0";
  const response = await fetch(`https://graph.facebook.com/${graphApiVersion}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: text } }),
  });
  const payload = await response.json();

  if (!response.ok) {
    return NextResponse.json({ error: "WhatsApp rejected the message.", provider: payload }, { status: response.status });
  }
  return NextResponse.json({ sent: true, provider: payload });
}
