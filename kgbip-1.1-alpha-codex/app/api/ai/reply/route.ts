import OpenAI from "openai";
import { NextResponse } from "next/server";
import { decideApproval } from "@/lib/approval-policy";

type RequestBody = {
  message?: string;
  contactName?: string;
  knownContact?: boolean;
  examples?: string[];
};

const fallbackReply = (name: string) =>
  `Olá, ${name.split(" ")[0]}! Recebemos sua mensagem. Nossa equipe fará a conferência e retornará em breve com os próximos passos.`;

/**
 * This endpoint generates a draft only. It never sends a WhatsApp message. The
 * approval decision is deterministic and happens before a staff member can send.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody;
  const message = body.message?.trim() ?? "";
  const examples = (body.examples ?? []).filter(Boolean).slice(0, 5);
  const initialDecision = decideApproval({ message, confidence: 0.9, isKnownContact: body.knownContact ?? true });
  let suggestion = fallbackReply(body.contactName || "");
  let confidence = 0.9;

  if (process.env.OPENAI_API_KEY && message) {
    try {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await client.responses.create({
        model: process.env.OPENAI_MODEL || "gpt-5-mini",
        input: [
          {
            role: "system",
            content:
              "Você é o copiloto de uma central cirúrgica brasileira. Gere somente um rascunho curto, cordial e operacional. Nunca dê diagnóstico, interprete exames, prometa agenda, informe valores, nem oriente sobre medicamentos. Quando o assunto for clínico, cirurgia, materiais, autorização, convênio ou mudança de agenda, deixe explícito que a equipe irá conferir. Responda somente com o texto do rascunho.",
          },
          {
            role: "user",
            content: `Mensagem recebida: ${message}\nContato: ${body.contactName || "Paciente"}\nExemplos aprovados do tom da equipe:\n${examples.join("\n---\n")}`,
          },
        ],
      });
      if (response.output_text.trim()) suggestion = response.output_text.trim();
      confidence = 0.9;
    } catch {
      // Production logging belongs in the application's observability layer. We
      // intentionally return a safe local draft instead of exposing provider errors.
    }
  }

  const finalDecision = decideApproval({ message: `${message} ${suggestion}`, confidence, isKnownContact: body.knownContact ?? true });
  return NextResponse.json({
    suggestion,
    confidence,
    requiresApproval: initialDecision.requiresApproval || finalDecision.requiresApproval,
    reasons: [...new Set([...initialDecision.reasons, ...finalDecision.reasons])],
    mode: process.env.OPENAI_API_KEY ? "provider" : "safe-demo",
  });
}
