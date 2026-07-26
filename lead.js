const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

const REQUIRED_ENV = [
  "FEISHU_APP_ID",
  "FEISHU_APP_SECRET",
  "FEISHU_BITABLE_APP_TOKEN",
  "FEISHU_TABLE_ID",
  "FEISHU_WEBHOOK_URL",
];

const ALLOWED_SCENARIOS = new Set([
  "企业会展",
  "餐饮零售",
  "文旅空间",
  "大健康",
  "其他场景",
]);

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

function clean(value, maxLength) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

function validateLead(input) {
  const lead = {
    company: clean(input.company, 80),
    name: clean(input.name, 40),
    phone: clean(input.phone, 24),
    scenario: clean(input.scenario, 30),
    message: clean(input.message, 800),
    source: clean(input.source, 500),
    requestId: clean(input.requestId, 80),
  };

  if (!lead.company || !lead.name || !lead.phone || !lead.scenario) {
    return { error: "请填写公司、姓名、联系电话和场景类型。" };
  }
  if (!/^[0-9+\-()\s]{6,24}$/.test(lead.phone)) {
    return { error: "请填写有效的联系电话。" };
  }
  if (!ALLOWED_SCENARIOS.has(lead.scenario)) {
    return { error: "请选择有效的场景类型。" };
  }

  return { lead };
}

async function getTenantAccessToken(env) {
  const response = await fetch(
    "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        app_id: env.FEISHU_APP_ID,
        app_secret: env.FEISHU_APP_SECRET,
      }),
    },
  );
  const result = await response.json();
  if (!response.ok || result.code !== 0 || !result.tenant_access_token) {
    throw new Error(`token:${result.code ?? response.status}:${result.msg ?? "unknown"}`);
  }
  return result.tenant_access_token;
}

async function createBitableRecord(env, token, lead) {
  const appToken = encodeURIComponent(env.FEISHU_BITABLE_APP_TOKEN);
  const tableId = encodeURIComponent(env.FEISHU_TABLE_ID);
  const response = await fetch(
    `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        fields: {
          公司名称: lead.company,
          姓名: lead.name,
          联系电话: lead.phone,
          场景类型: lead.scenario,
          需求说明: lead.message || "暂未填写",
        },
      }),
    },
  );
  const result = await response.json();
  if (!response.ok || result.code !== 0) {
    throw new Error(`bitable:${result.code ?? response.status}:${result.msg ?? "unknown"}`);
  }
  return result.data?.record?.record_id ?? "";
}

function chinaTime() {
  const now = new Date(Date.now() + 8 * 60 * 60 * 1000);
  return `${now.toISOString().slice(0, 10)} ${now.toISOString().slice(11, 16)}`;
}

function toBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary);
}

async function createWebhookSignature(secret, timestamp) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(`${timestamp}\n${secret}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new Uint8Array());
  return toBase64(signature);
}

async function notifyGroup(env, lead) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const body = {
    msg_type: "text",
    content: {
      text: [
        "AirTouch官网线索｜新客户提交",
        `公司：${lead.company}`,
        `姓名：${lead.name}`,
        `电话：${lead.phone}`,
        `场景：${lead.scenario}`,
        `需求：${lead.message || "暂未填写"}`,
        `时间：${chinaTime()}`,
      ].join("\n"),
    },
  };

  if (env.FEISHU_WEBHOOK_SECRET) {
    body.timestamp = timestamp;
    body.sign = await createWebhookSignature(env.FEISHU_WEBHOOK_SECRET, timestamp);
  }

  const response = await fetch(env.FEISHU_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  const webhookCode = result.code ?? result.StatusCode;
  if (!response.ok || (webhookCode !== undefined && webhookCode !== 0)) {
    throw new Error(
      `webhook:${webhookCode ?? response.status}:${result.msg ?? result.StatusMessage ?? "unknown"}`,
    );
  }
}

async function handlePost(context) {
  const { request, env } = context;
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();

  try {
    if (REQUIRED_ENV.some((name) => !env[name])) {
      console.error("[lead] missing_environment", { requestId });
      return json({ ok: false, message: "服务暂未配置完成。" }, 503);
    }

    const origin = request.headers.get("Origin");
    if (origin && new URL(origin).host !== new URL(request.url).host) {
      return json({ ok: false, message: "请求来源无效。" }, 403);
    }

    const contentLength = Number(request.headers.get("Content-Length") || 0);
    if (contentLength > 16_384) {
      return json({ ok: false, message: "提交内容过长。" }, 413);
    }

    let input;
    try {
      input = await request.json();
    } catch {
      return json({ ok: false, message: "提交内容格式无效。" }, 400);
    }

    const validation = validateLead(input);
    if (validation.error) return json({ ok: false, message: validation.error }, 400);

    const token = await getTenantAccessToken(env);
    const recordId = await createBitableRecord(env, token, validation.lead);

    let notified = true;
    try {
      await notifyGroup(env, validation.lead);
    } catch (error) {
      notified = false;
      console.error("[lead] notification_failed", {
        requestId,
        recordId,
        error: String(error),
      });
    }

    return json({ ok: true, notified });
  } catch (error) {
    console.error("[lead] submission_failed", {
      requestId,
      error: String(error),
    });
    return json({ ok: false, message: "暂时未能提交，请稍后重试。" }, 502);
  }
}

export default function onRequest(context) {
  if (context.request.method === "POST") return handlePost(context);
  return json({ ok: false, message: "Method Not Allowed" }, 405);
}
