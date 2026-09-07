import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS });
  }

  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  if (!GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "GEMINI_API_KEY is not configured on this server" }),
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendLog = (msg: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'log', message: msg })}\n\n`));
      };
      const sendResult = (tasks: any[]) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'result', tasks })}\n\n`));
      };
      const sendError = (err: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: err })}\n\n`));
      };

      try {
        sendLog("Initializing task parsing...");
        const message: string = body?.message ?? "";
        const tripContext: Record<string, string> = body?.tripContext ?? {};
        const debug: boolean = body?.debug === true;

        sendLog("Validating input message...");
        if (!message || typeof message !== "string" || message.trim().length === 0) {
          sendError("message is required and must be a non-empty string");
          controller.close();
          return;
        }

        const destination = tripContext?.destination || "their destination";
        sendLog(`Using destination context: ${destination}`);
        sendLog("Constructing prompt for Gemini API...");

        const systemInstruction = `You are a travel task extractor for a group trip planning app.
Your ONLY job: read a message from a trip group member and return a JSON array of tasks.
You MUST always return a JSON array. Never return empty if the message clearly mentions something unbooked or unresolved.
Output format: [{"title":"Short action phrase","description":"One sentence of context"}]
Rules: max 5 tasks, no prose, no markdown, no code fences — just the raw JSON array.`;

        const userPrompt = `Trip destination: ${destination}

Member's message: "${message.trim()}"

The message above mentions things that haven't been done yet. Extract each one as a task.
Examples of tasks to extract:
- "hotel/accommodation not booked" → {"title":"Book accommodation","description":"Research and book a hotel for the group."}
- "flights not booked" → {"title":"Book flights","description":"Find and book return flights for all members."}  
- "sort out food spots" → {"title":"Research food spots","description":"Find recommended restaurants and food spots to visit."}

Return the JSON array now:`;

        sendLog("Calling Gemini API streamGenerateContent...");

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemInstruction }] },
              contents: [{ role: "user", parts: [{ text: userPrompt }] }],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 4096,
              },
            }),
          }
        );

        if (!geminiRes.ok) {
          const errBody = await geminiRes.text();
          sendError(`Gemini API error ${geminiRes.status}: ${errBody}`);
          controller.close();
          return;
        }

        sendLog("Receiving chunks from AI...");
        let rawText = "";

        const reader = geminiRes.body!.getReader();
        const decoder = new TextDecoder();
        let done = false;
        
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6).trim();
                if (dataStr === '[DONE]') continue;
                if (!dataStr) continue;
                try {
                  const data = JSON.parse(dataStr);
                  const textChunk = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
                  if (textChunk) {
                    rawText += textChunk;
                    sendLog(`Received AI chunk: ${textChunk.replace(/\n/g, '\\n')}`);
                  }
                } catch (e) {
                  // ignore parse error for incomplete SSE chunk
                }
              }
            }
          }
        }

        sendLog("Finished receiving AI response.");
        sendLog("Parsing JSON tasks from response...");

        if (!rawText) {
          sendError("Gemini returned no text.");
          controller.close();
          return;
        }

        const sanitize = (arr: unknown[]) =>
          arr
            .filter((t): t is Record<string, unknown> => typeof t === "object" && t !== null && typeof t.title === "string" && t.title.trim().length > 0)
            .map((t) => ({
              title: String(t.title).trim(),
              description: typeof t.description === "string" ? t.description.trim() : "",
            }))
            .slice(0, 5);

        let tasks: { title: string; description: string }[] = [];
        let cleaned = rawText.trim()
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();

        try {
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed)) {
            tasks = sanitize(parsed);
          }
        } catch {
          const lastCloseBrace = cleaned.lastIndexOf("}");
          if (lastCloseBrace !== -1) {
            try {
              const repaired = cleaned.slice(0, lastCloseBrace + 1) + "]";
              const parsed = JSON.parse(repaired);
              if (Array.isArray(parsed)) {
                tasks = sanitize(parsed);
              }
            } catch {
              // strategy 3
            }
          }
          if (tasks.length === 0) {
            const itemRegex = /"title"\s*:\s*"([^"]+)"(?:\s*,\s*"description"\s*:\s*"([^"]*)")?/g;
            const matchedTasks: { title: string; description: string }[] = [];
            let match;
            while ((match = itemRegex.exec(cleaned)) !== null) {
              matchedTasks.push({
                title: match[1].trim(),
                description: (match[2] || "").trim(),
              });
            }
            tasks = matchedTasks.slice(0, 5);
          }
        }

        sendLog(`Parsed ${tasks.length} tasks successfully.`);
        sendResult(tasks);
        controller.close();

      } catch (err) {
        sendError(String(err));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      ...CORS,
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  });
});
