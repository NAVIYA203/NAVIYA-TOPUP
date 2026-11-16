NAVIYA TOPUP — WEBSITE FRONTEND PACKAGE
======================================

Pages
- index.html: Home page
- catalog.html: Product category landing page
- freefire.html: Free Fire memberships and diamond packages (prices entered from user's screenshot)
- checkout.html: Order enquiry form (opens WhatsApp)
- admin.html: Admin implementation checklist
- style.css: Shared responsive styling

Configured contact
- WhatsApp: +94 75 517 3946 (wa.me/94755173946)

IMPORTANT: CURRENT STATUS
This is a polished frontend starter, not a production e-commerce system.
- No live FazerCards API calls are implemented yet.
- No live Visa/Mastercard payment gateway is connected.
- No secure server-side admin panel or database is included.
- The catalog categories are illustrative; actual offers, stock and prices must be loaded from FazerCards.
- The order form sends an enquiry to WhatsApp only. It does not charge a customer or automatically create a supplier order.

NEXT PRODUCTION STEPS
1. Choose a domain and hosting that supports a server-side backend (Node.js or PHP) and a database.
2. Configure environment variables on the server for the FazerCards API key. Never put the key in frontend files or send it in chat.
3. Build backend endpoints to fetch/cache supplier catalog, create orders only after verified customer payment, and receive/verify supplier webhooks.
4. Select a supported customer payment gateway and complete merchant onboarding. Do not mark an order paid based only on a browser redirect.
5. Add secure admin authentication, order audit trail, payment reconciliation, privacy policy, terms and refund policy.
6. Replace the placeholder email address and add the real business contact/legal details before public launch.

FazerCards API documentation:
https://reseller.fazercards.com/en/docs

Readability update: body copy, navigation, cards, labels, forms and product titles have been enlarged.

FREE FIRE PLAYER ID VERIFICATION (BACKEND ADDED)
------------------------------------------------
- freefire.html now requires Player ID verification before enabling package order links.
- server.js discovers the Free Fire category_id and required fields from GET /topups/validate-id.
- POST /api/freefire/validate-id forwards the UID to FazerCards POST /topups/validate-id.
- API key is read only from server environment variable FAZERCARDS_API_KEY.
- The frontend cannot verify IDs until this Node.js backend is deployed and the environment variable is configured.
- Start locally: npm install, set FAZERCARDS_API_KEY in server environment, then npm start.
- Do not put the API key in HTML/JS or send it in chat.
- This implements UID verification only; supplier order creation and customer payment are separate next steps.
Official docs: https://reseller.fazercards.com/en/docs


FREE FIRE INFO BOT (GAMES KINBO)
--------------------------------
- New page: freefire-info.html
- Home and Free Fire pages link to the Info Bot.
- Worker endpoint: GET /api/freefire/info?uid=PLAYER_UID&region=SG
- Configure a Cloudflare Worker Secret named GAMESKINBO_API_KEY before enabling live lookups.
- The API key is only sent from the Worker to api.gameskinbo.com; it is never exposed in browser code.
- Supported regions: BD, IND, BR, US, SAC, NA, TH, ID, SG, PK.
- If the secret is not configured, the page will display a clear setup message.
