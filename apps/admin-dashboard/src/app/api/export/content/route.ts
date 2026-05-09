import { NextResponse } from "next/server";
import { getContentOutputsByClient } from "@/lib/db";

type ExportFormat = "json" | "md" | "csv";

function resolveFormat(value: string | null): ExportFormat {
  return value === "md" || value === "csv" ? value : "json";
}

function escapeCsv(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function renderMarkdown(rows: Awaited<ReturnType<typeof getContentOutputsByClient>>) {
  return rows
    .map((entry) => [
      `# ${entry.heroTitle}`,
      ``,
      `Client: ${entry.clientId ?? "unassigned"}`,
      `Business type: ${entry.businessType}`,
      `Location: ${entry.location}`,
      `Offer: ${entry.offer}`,
      ``,
      `## Hero subtitle`,
      entry.heroSubtitle,
      ``,
      `## About`,
      entry.about,
      ``,
      `## CTA`,
      entry.cta
    ].join("\n"))
    .join("\n\n---\n\n");
}

function renderCsv(rows: Awaited<ReturnType<typeof getContentOutputsByClient>>) {
  const header = [
    "client_id",
    "business_type",
    "location",
    "offer",
    "hero_title",
    "hero_subtitle",
    "about",
    "cta",
    "created_at"
  ];

  const lines = rows.map((entry) => [
    entry.clientId ?? "",
    entry.businessType,
    entry.location,
    entry.offer,
    entry.heroTitle,
    entry.heroSubtitle,
    entry.about,
    entry.cta,
    entry.createdAt
  ].map(escapeCsv).join(","));

  return [header.join(","), ...lines].join("\n");
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientId = url.searchParams.get("client_id")?.trim();

  if (!clientId) {
    return NextResponse.json({ error: "Missing client_id" }, { status: 400 });
  }

  const format = resolveFormat(url.searchParams.get("format"));
  const content = await getContentOutputsByClient(clientId);

  if (content.length === 0) {
    return NextResponse.json({ error: "No content found for client" }, { status: 404 });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  if (format === "csv") {
    return new NextResponse(renderCsv(content), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="content-export-${clientId}-${timestamp}.csv"`
      }
    });
  }

  if (format === "md") {
    return new NextResponse(renderMarkdown(content), {
      headers: {
        "content-type": "text/markdown; charset=utf-8",
        "content-disposition": `attachment; filename="content-export-${clientId}-${timestamp}.md"`
      }
    });
  }

  return new NextResponse(JSON.stringify(content, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="content-export-${clientId}-${timestamp}.json"`
    }
  });
}