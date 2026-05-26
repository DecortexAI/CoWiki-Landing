// Cloudflare Pages Function: POST /api/waitlist
// Submits email to Google Form

export async function onRequestPost(context) {
  const { request, env } = context;

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const { email } = await request.json();

    if (!email || !/.+@.+\..+/.test(email)) {
      return new Response(JSON.stringify({ error: "invalid email" }), { status: 400, headers });
    }

    const formUrl = env.GOOGLE_FORM_URL;
    const body = new URLSearchParams();
    body.append("entry.529172914", email);

    await fetch(formUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
