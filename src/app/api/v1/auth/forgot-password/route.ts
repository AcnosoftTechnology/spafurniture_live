import { z } from "zod";
import { requestPasswordReset } from "@/lib/auth/password";
import { jsonOk, jsonError } from "@/lib/api-response";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("VALIDATION_ERROR", "Invalid email", 400);
  await requestPasswordReset(parsed.data.email);
  return jsonOk({ sent: true });
}
