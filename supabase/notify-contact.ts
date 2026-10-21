// Código de la función "notify-contact" de Supabase (Edge Functions). Versión con motivo.
// El remitente debe pertenecer al dominio verificado en Resend (avisos.miguelgarcia.me).
Deno.serve(async (req) => {
  if (req.headers.get("x-webhook-secret") !== Deno.env.get("WEBHOOK_SECRET")) {
    return new Response("forbidden", { status: 403 });
  }
  const { record: m } = await req.json();
  if (!m) return new Response("sin datos", { status: 400 });

  const esc = (s: string) =>
    s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
  const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").slice(0, 80);
  const topic = m.topic || "Nuevo mensaje";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Los relojes de Miguel <web@avisos.miguelgarcia.me>",
      to: [Deno.env.get("NOTIFY_EMAIL")],
      reply_to: m.email,
      subject: `${oneLine(topic)} · ${oneLine(m.name)}`,
      html: `<p><b>${esc(topic)}</b></p><p><b>${esc(m.name)}</b> (${esc(m.email)}) ha escrito:</p><p style="white-space:pre-wrap">${esc(m.message)}</p>`,
    }),
  });
  return new Response(await res.text(), { status: res.ok ? 200 : 502 });
});
