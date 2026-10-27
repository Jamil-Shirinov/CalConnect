import "dotenv/config";
import express from "express";
import cors from "cors";

import { usingEmulators } from "./firebase.js";
import { requireUser, errorHandler } from "./http.js";
import matches from "./routes/matches.js";
import sessions from "./routes/sessions.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true, emulators: usingEmulators }));

app.use(requireUser);
app.use(matches);
app.use(sessions);

app.use(errorHandler);

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`CalConnect API on http://localhost:${port} (${usingEmulators ? "emulators" : "real Firebase project"})`);
});
