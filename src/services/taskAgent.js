const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function parseTasksFromMessage(message, tripContext = {}, onUpdate = null) {
  const url = import.meta.env.VITE_TASK_AGENT_URL;
  if (!url) throw new Error("VITE_TASK_AGENT_URL is not set in .env");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ message, tripContext }),
  });

  if (!res.ok) {
    let errMessage = `Task agent returned ${res.status}`;
    try {
       const body = await res.json();
       if (body.error) errMessage = body.error;
    } catch (e) {}
    throw new Error(errMessage);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let done = false;
  let finalTasks = [];
  let errorMsg = null;

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (value) {
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'log') {
              if (onUpdate) onUpdate(data.message);
            } else if (data.type === 'result') {
              finalTasks = data.tasks;
            } else if (data.type === 'error') {
              errorMsg = data.error;
            }
          } catch (e) {
            // ignore parse errors for partial chunks
          }
        }
      }
    }
  }

  if (errorMsg) throw new Error(errorMsg);

  return finalTasks;
}
