import { Prisma } from "@prisma/client";

const DB_SCHEMA_HINT =
  "Database schema is out of date. Admin → Database → Apply pending migrations.";

export function isPrismaMissingColumnError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P2022";
  }
  if (error instanceof Error) {
    return /column .+ does not exist/i.test(error.message);
  }
  return false;
}

export function prismaSchemaErrorMessage(error: unknown): string | null {
  if (!isPrismaMissingColumnError(error)) return null;
  return DB_SCHEMA_HINT;
}
