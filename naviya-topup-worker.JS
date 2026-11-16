const VOLSEVER_URL = "https://gate.volsever.com/proxy/api/game/free-fire-get-session-key-sg";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Free Fire Info Bot — Games Kinbo API proxy. Keep API key server-side.
    if (url.pathname === "/api/freefire/info") {
      if (request.method !== "GET") return json({ error: "Method not allowed." }, 405);
      const uid = String(url.searchParams.get("uid") || "").trim();
      const region = String(url.searchParams.get("region") || "SG").trim().toUpperCase();
      const allowedRegions = new Set(["BD", "IND", "BR", "US", "SAC", "NA", "TH", "ID", "SG", "PK"]);
      if (!/^[0-9]{5,20}$/.test(uid)) return json({ error: "Enter a valid numeric Free Fire UID." }, 400);
      if (!allowedRegions.has(region)) return json({ error: "Unsupported region." }, 400);
      if (!env.GAMESKINBO_API_KEY) return json({ error: "Info Bot API key is not configured yet. Please try again later." }, 503);
      try {
        const apiUrl = new URL("https://api.gameskinbo.com/ff-info/get");
        apiUrl.searchParams.set("uid", uid);
        apiUrl.searchParams.set("region", region);
        const upstream = await fetch(apiUrl.toString(), {
          headers: { "x-api-key": env.GAMESKINBO_API_KEY, "Accept": "application/json" }
        });
        let data;
        try { data = await upstream.json(); }
        catch { return json({ error: "Info provider returned an unreadable response." }, 502); }
        if (!upstream.ok) {
          const status = upstream.status === 401 ? 502 : upstream.status === 429 ? 429 : upstream.status === 402 ? 404 : 502;
          return json({ error: data?.error || (upstream.status === 429 ? "API limit reached. Please wait and try again." : "Could not retrieve player information.") }, status);
        }
        if (!data || typeof data !== "object" || !data.AccountInfo) {
          return json({ error: data?.error || "Player information was not found for this UID." }, 404);
        }
        return json(data);
      } catch (_error) {
        return json({ error: "Could not reach the player info service. Please try again." }, 502);
      }
    }

    // Free Fire Player ID verification endpoint
    if (url.pathname === "/api/freefire/validate-id") {
      if (request.method !== "POST") {
        return json({ valid: false, message: "Method not allowed." }, 405);
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return json({ valid: false, message: "Invalid JSON request." }, 400);
      }

      const playerId = String(body?.playerId || "").trim();

      if (!/^[0-9]{5,20}$/.test(playerId)) {
        return json({
          valid: false,
          message: "Enter a valid numeric Free Fire Player UID."
        }, 400);
      }

      if (!env.VOLSEVER_API_KEY) {
        return json({
          valid: false,
          message: "Verification service is not configured. Please contact the store."
        }, 503);
      }

      try {
        const upstreamUrl = new URL(VOLSEVER_URL);
        upstreamUrl.searchParams.set("id", playerId);

        const upstream = await fetch(upstreamUrl.toString(), {
          method: "GET",
          headers: {
            "X-API-Key": env.VOLSEVER_API_KEY,
            "Accept": "application/json"
          }
        });

        let result;
        try {
          result = await upstream.json();
        } catch {
          return json({
            valid: false,
            message: "Verification provider returned an unreadable response."
          }, 502);
        }

        if (upstream.status === 404 || result?.status === false) {
          return json({
            valid: false,
            message: "Player ID not found. Please check your UID."
          }, 404);
        }

        if (!upstream.ok) {
          const status = upstream.status === 401 ? 502 :
                         upstream.status === 429 ? 429 : 502;
          return json({
            valid: false,
            message: upstream.status === 401
              ? "Verification service authentication failed. Please contact the store."
              : upstream.status === 429
                ? "Too many verification attempts. Please wait and try again."
                : "Verification service is temporarily unavailable."
          }, status);
        }

        const playerName = result?.data?.username;
        if (result?.status !== true || typeof playerName !== "string" || !playerName.trim()) {
          return json({
            valid: false,
            message: "Player ID could not be verified. Please check your UID."
          }, 404);
        }

        // Never send session_key or other private upstream fields to the browser.
        return json({
          valid: true,
          playerName: playerName.trim(),
          region: result?.data?.region || null,
          playerId
        });
      } catch (_error) {
        return json({
          valid: false,
          message: "Could not reach the verification service. Please try again."
        }, 502);
      }
    }

    // Serve the existing static website through the Workers Static Assets binding.
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response(
      "Static assets binding ASSETS is missing. Configure Workers Static Assets in wrangler.toml.",
      { status: 500 }
    );
  }
};
