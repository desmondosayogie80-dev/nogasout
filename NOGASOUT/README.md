# NOGASOUT — refreshed design

Open this folder in VS Code. Run `npm install` and `npm start` (or `node server.js`), then open http://localhost:3000.

This is a visual refresh of the existing website and admin dashboard, preserving their existing JavaScript and backend behavior.

IMPORTANT BEFORE DEPLOYING: The original backend has a hard-coded manager PIN and admin routes that are not protected by authentication. Do NOT deploy to production until those are secured. The existing JSON-file storage is also unsuitable for reliable concurrent production orders. The `data/orders.json` file is intentionally empty in this download to avoid including existing customer information; back up production data before any deployment.
