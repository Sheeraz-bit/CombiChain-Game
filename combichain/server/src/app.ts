import express from "express";
import cors from "cors";
import { gameRouter } from "./routes/game.routes.js";

export const app = express();

app.use(cors());
app.use(express.json({ limit: "100kb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "COMBICHAIN API is running.",
    version: "1.0.0"
  });
});

app.use("/api/game", gameRouter);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found." });
});
