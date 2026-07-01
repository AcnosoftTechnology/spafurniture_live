import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "Esthetica Spa Furniture";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1c1917",
          color: "#fafaf9",
          padding: 48,
        }}
      >
        <div style={{ fontSize: 48, fontWeight: 600, textAlign: "center" }}>{title}</div>
        <div style={{ fontSize: 24, marginTop: 16, opacity: 0.8 }}>spafurniture.in</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
