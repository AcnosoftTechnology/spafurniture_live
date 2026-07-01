import { z } from "zod";
import { resetPassword } from "@/lib/auth/password";
import { jsonOk, jsonError } from "@/lib/api-response";

const schema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return jsonError("VALIDATION_ERROR", "Invalid input", 400);
    await resetPassword(parsed.data.token, parsed.data.email, parsed.data.password);
    return jsonOk({ success: true });
  } catch {
    return jsonError("INVALID_TOKEN", "Invalid or expired reset link", 400);
  }
}
