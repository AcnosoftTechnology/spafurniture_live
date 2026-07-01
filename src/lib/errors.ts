export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 400,
  ) {
    super(message);
    this.name = "AppError";
  }
}

function smtpErrorMessage(error: Error): string | null {
  const code = "code" in error ? String((error as { code?: string }).code) : "";
  if (code === "EAUTH") {
    return "SMTP authentication failed. Check username and password, then save settings and try again.";
  }
  if (code === "ESOCKET" || code === "ETIMEDOUT" || code === "ECONNECTION") {
    return "Could not connect to the SMTP server. Check host, port, and SSL/TLS settings.";
  }
  if (error.message.includes("SMTP is not configured")) {
    return "SMTP is not configured. Enable email in Settings and fill host + from email.";
  }
  return null;
}

export function toErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }
  if (error instanceof Error && error.message) {
    const smtpMessage = smtpErrorMessage(error);
    return Response.json(
      {
        error: {
          code: smtpMessage ? "SMTP_ERROR" : "VALIDATION_ERROR",
          message: smtpMessage ?? error.message,
        },
      },
      { status: smtpMessage ? 502 : 400 },
    );
  }
  console.error(error);
  return Response.json(
    { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred" } },
    { status: 500 },
  );
}
