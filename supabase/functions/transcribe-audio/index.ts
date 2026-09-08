import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('ASSEMBLYAI_API_KEY');
    if (!apiKey) {
      throw new Error("Missing AssemblyAI API key in Edge Function environment.");
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    if (!audioFile) {
      throw new Error("No audio file provided");
    }

    const arrayBuffer = await audioFile.arrayBuffer();

    // 1. Upload audio to AssemblyAI
    const uploadRes = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Transfer-Encoding': 'chunked'
      },
      body: arrayBuffer,
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      throw new Error(`Upload failed: ${errorText}`);
    }

    const uploadData = await uploadRes.json();
    const uploadUrl = uploadData.upload_url;

    // 2. Submit transcription job (implicitly uses Universal 2 via best model)
    const transcriptRes = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        audio_url: uploadUrl,
      })
    });

    if (!transcriptRes.ok) {
      const errorText = await transcriptRes.text();
      throw new Error(`Transcription request failed: ${errorText}`);
    }

    const transcriptData = await transcriptRes.json();
    const transcriptId = transcriptData.id;

    // 3. Poll for completion
    let status = transcriptData.status;
    let finalTranscript = null;

    while (status !== 'completed' && status !== 'error') {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Poll every 1.5s
      
      const pollRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: { 'Authorization': apiKey }
      });
      const pollData = await pollRes.json();
      status = pollData.status;

      if (status === 'completed') {
        finalTranscript = pollData.text;
      } else if (status === 'error') {
        throw new Error(`Transcription error: ${pollData.error}`);
      }
    }

    return new Response(JSON.stringify({ text: finalTranscript }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
