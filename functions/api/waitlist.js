// Cloudflare Pages Function: POST /api/waitlist
// Stores email to Feishu Bitable

async function getAccessToken(env) {
  const res = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      app_id: env.FEISHU_APP_ID,
      app_secret: env.FEISHU_APP_SECRET,
    }),
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(`Feishu auth failed: ${data.msg}`);
  return data.tenant_access_token;
}

async function addRecord(env, token, email) {
  const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${env.FEISHU_APP_TOKEN}/tables/${env.FEISHU_TABLE_ID}/records`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      fields: {
        email: email,
        created_at: new Date().toISOString(),
        source: "landing-page",
      },
    }),
  });
  const data = await res.json();
  if (data.code !== 0) throw new Error(`Feishu write failed: ${data.msg}`);
  return data;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const { email } = await request.json();

    if (!email || !/.+@.+\..+/.test(email)) {
      return new Response(JSON.stringify({ error: "invalid email" }), { status: 400, headers });
    }

    const token = await getAccessToken(env);
    await addRecord(env, token, email);

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
