import { isValidBranchId } from "@/lib/analytics/identity";
import { queryBranchEvents } from "@/lib/analytics/posthog-query";
import { buildBranchSummary } from "@/lib/analytics/summary";

const JSON_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

export async function GET(request: Request) {
  const branchId = new URL(request.url).searchParams.get("branch") ?? "";
  if (!isValidBranchId(branchId)) return json({ error: "Invalid branch" }, 400);

  const personalApiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!personalApiKey || !projectId || !host) {
    return json({ error: "Analytics is not configured" }, 503);
  }

  try {
    const rows = await queryBranchEvents({ personalApiKey, projectId, host }, branchId);
    return json(buildBranchSummary(rows, branchId));
  } catch {
    return json({ error: "Analytics is temporarily unavailable" }, 502);
  }
}
