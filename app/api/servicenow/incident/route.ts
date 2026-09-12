import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { movieId, movieTitle, category, urgency = "2", description, userEmail } = body;

    if (!category || !description) {
      return NextResponse.json(
        { error: "Category and description are required." },
        { status: 400 }
      );
    }

    const defaultInstance = "https://dev375082.service-now.com";
    const instanceUrl = (process.env.SERVICENOW_INSTANCE_URL || defaultInstance).replace(/\/$/, "");
    const username = process.env.SERVICENOW_USERNAME || "admin";
    const password = process.env.SERVICENOW_PASSWORD || "!csSx7-DuOX9";

    const shortDescription = `[CineWatch OTT] ${category}: ${movieTitle || "General Issue"}`;
    const fullDescription = [
      "=== CineWatch AI Incident Report ===",
      `Movie: ${movieTitle || "N/A"} (TMDB ID: ${movieId || "N/A"})`,
      `Category: ${category}`,
      `Urgency Level: ${urgency === "1" ? "High (1)" : urgency === "3" ? "Low (3)" : "Medium (2)"}`,
      `Reported By: ${userEmail || "Anonymous CineWatch Viewer"}`,
      `Timestamp: ${new Date().toISOString()}`,
      "",
      "User Feedback / Details:",
      description,
      "",
      "--- Automated Ticket Generated via CineWatch OTT Engagement Agent ---",
    ].join("\n");

    // Check if ServiceNow credentials are fully configured
    if (instanceUrl && username && password) {
      try {
        const auth = Buffer.from(`${username}:${password}`).toString("base64");
        const response = await fetch(`${instanceUrl}/api/now/table/incident`, {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            short_description: shortDescription,
            description: fullDescription,
            urgency: urgency,
            impact: urgency,
            category: category.toLowerCase().includes("recommendation") ? "inquiry" : "software",
            comments: "Auto-created from CineWatch OTT Discovery Platform.",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const result = data.result;

          return NextResponse.json({
            success: true,
            source: "servicenow",
            incident: {
              number: result.number,
              sys_id: result.sys_id,
              state: "New",
              urgency: result.urgency || urgency,
              short_description: result.short_description || shortDescription,
              created_on: result.sys_created_on || new Date().toISOString(),
              instance_url: `${instanceUrl}/now/nav/ui/classic/params/target/incident.do%3Fsys_id%3D${result.sys_id}`,
            },
          });
        } else {
          console.warn("ServiceNow API returned status:", response.status);
        }
      } catch (snErr) {
        console.error("ServiceNow live API error, falling back to mock:", snErr);
      }
    }

    // Graceful offline / mock fallback if instance is unreachable or sleeping
    const mockNumber = "INC" + Math.floor(1000000 + Math.random() * 9000000);
    return NextResponse.json({
      success: true,
      source: "mock-fallback",
      incident: {
        number: mockNumber,
        sys_id: "mock_" + Math.random().toString(36).substring(2, 10),
        state: "New",
        urgency: urgency,
        short_description: shortDescription,
        created_on: new Date().toISOString(),
        instance_url: `${instanceUrl}/now/nav/ui/classic/params/target/incident_list.do`,
      },
    });
  } catch (error: any) {
    console.error("Incident route error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process incident ticket." },
      { status: 500 }
    );
  }
}
