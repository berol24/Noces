import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { User } from "./models/User.js";

const ACCESS_SECONDS = 15 * 60;
const REFRESH_MS = 30 * 24 * 60 * 60 * 1000;

type TokenPayload = jwt.JwtPayload & { typ?: string };

function secret() {
  return process.env.JWT_SECRET || "dev-secret";
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function signAccess(userId: string) {
  return jwt.sign({ sub: userId, typ: "access" }, secret(), { expiresIn: ACCESS_SECONDS });
}

export function sessionResponse(userId: string, refreshToken: string) {
  const accessToken = signAccess(userId);
  return {
    token: accessToken,
    accessToken,
    refreshToken,
    expiresIn: ACCESS_SECONDS,
  };
}

export async function issueSession(userId: string) {
  const refreshToken = jwt.sign({ sub: userId, typ: "refresh", jti: crypto.randomBytes(16).toString("hex") }, secret(), { expiresIn: "30d" });
  const expires = new Date(Date.now() + REFRESH_MS);
  await User.updateOne({ _id: userId }, { $pull: { sessions: { expires: { $lte: new Date() } } } });
  await User.updateOne(
    { _id: userId },
    { $push: { sessions: { $each: [{ hash: hashToken(refreshToken), expires }], $slice: -8 } } },
  );
  return sessionResponse(userId, refreshToken);
}

export async function rotateSession(refreshToken: string) {
  const payload = jwt.verify(refreshToken, secret()) as TokenPayload;
  if (!payload.sub || payload.typ !== "refresh") throw new Error("Jeton de renouvellement invalide");
  const hash = hashToken(refreshToken);
  const user = await User.findOne({
    _id: payload.sub,
    sessions: { $elemMatch: { hash, expires: { $gt: new Date() } } },
  }).select("+sessions");
  if (!user) throw new Error("Session expirée");
  await User.updateOne({ _id: user._id }, { $pull: { sessions: { hash } } });
  return issueSession(String(user._id));
}

export async function revokeSession(refreshToken: string) {
  try {
    const payload = jwt.verify(refreshToken, secret()) as TokenPayload;
    if (!payload.sub) return;
    await User.updateOne({ _id: payload.sub }, { $pull: { sessions: { hash: hashToken(refreshToken) } } });
  } catch {
    /* un jeton déjà invalide n'a plus de session à retirer */
  }
}

export async function revokeSessions(userId: string) {
  await User.updateOne({ _id: userId }, { $set: { sessions: [] } });
}
