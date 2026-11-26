import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { authRouter } from "./routes/auth.js";
import { driveRouter } from "./routes/drive.js";
import { weddingRouter } from "./routes/weddings.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);
const origin = process.env.CLIENT_ORIGIN || "http://localhost:3000";

app.use(cors({ origin, credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

app.use("/api", (_req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next();
    return;
  }
  res.status(503).json({
    error: "MongoDB n'est pas connecté. Indiquez MONGODB_URI dans backend/.env",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/weddings", weddingRouter);
app.use("/api/drive", driveRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ error: "Erreur interne" });
});

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/noces";

mongoose
  .connect(uri)
  .then(() => {
    console.log("MongoDB connecté");
  })
  .catch((error) => {
    console.error("MongoDB injoignable. Indiquez MONGODB_URI dans backend/.env");
    console.error(error);
  });

app.listen(port, () => {
  console.log(`API Noces sur http://localhost:${port}`);
});
