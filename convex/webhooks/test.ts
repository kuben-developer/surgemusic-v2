import { httpAction } from "../_generated/server";

export const testWebhook = httpAction(async (ctx, request) => {
  const method = request.method;
  const url = request.url;
  const headers: Record<string, string> = {};
  for (const [key, value] of (request.headers as any)) {
    headers[key] = value;
  }
  
  let body = null;
  let bodyType = "none";
  
  try {
    const contentType = request.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      body = await request.json();
      bodyType = "json";
    } else if (contentType.includes("text/")) {
      body = await request.text();
      bodyType = "text";
    } else if (method === "POST" || method === "PUT" || method === "PATCH") {
      body = await request.text();
      bodyType = "raw";
    }
  } catch (error) {
    console.error("Error parsing body:", error);
    body = "Error parsing body";
  }
  
  const timestamp = new Date().toISOString();
  
  const response = {
    success: true,
    message: "Test webhook received successfully!",
    timestamp,
    request: {
      method,
      url,
      headers,
      bodyType,
      body,
    },
    convexInfo: {
      deployment: "prestigious-shepherd-684",
      endpoint: "/webhook/test",
    },
  };
  
  console.log("Test webhook hit:", response);
  
  return new Response(JSON.stringify(response, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
});