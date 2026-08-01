# Twilio Number Routing (GoFieldWise)

This routing is implemented in `frontend/pages/api/webhooks/twilio.js`.

## Behavior

- `+16029320967` (default) routes to the front office agent (Adrian).
- `+18552476985` (default) routes to the sales/support agent.
- Unknown `To` numbers fall back to front office, then sales/support if front office is unset.

## Required environment variables

Set these in the deployed frontend service environment:

- `RETELL_FRONT_OFFICE_AGENT_ID`
- `RETELL_SALES_SUPPORT_AGENT_ID`

Optional overrides:

- `TWILIO_FRONT_OFFICE_NUMBER` (default `+16029320967`)
- `TWILIO_SALES_SUPPORT_NUMBER` (default `+18552476985`)

Backward-compatible fallback:

- `RETELL_AGENT_ID` can still serve as front office agent if `RETELL_FRONT_OFFICE_AGENT_ID` is not set.

## Twilio webhook setting

For each Twilio voice number, set:

- Voice webhook URL: `https://gofieldwise.com/api/webhooks/twilio`
- HTTP method: `POST`

## Rank & Rent whisper routes

The Render deployment also supports dedicated whisper-forwarding routes for rank-and-rent numbers:

- `https://auto-gpt-2ig0.onrender.com/api/twilio/voice/fort-worth`
- `https://auto-gpt-2ig0.onrender.com/api/twilio/voice/el-paso`
- `https://auto-gpt-2ig0.onrender.com/api/twilio/voice/arlington`

Each route returns TwiML that:

1. Answers the call.
2. Dials `+14053782099`.
3. Plays a short whisper announcement naming the market before connecting the forwarded call.

## Go-live checklist

1. Set environment variables in Render frontend service.
2. Deploy frontend service.
3. Verify Twilio number webhooks are set to `/api/webhooks/twilio`.
4. Place test calls to both numbers and confirm each reaches the correct Retell agent.
