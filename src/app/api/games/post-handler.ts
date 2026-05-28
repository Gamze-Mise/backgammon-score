import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { getDb } from "@/lib/db";
import { games, players } from "@/lib/db/schema";
import { isValidPlayerId } from "@/lib/players";
import { eq } from "drizzle-orm";

const DEFAULT_PASSWORD = "12345";

export function gamesErrorResponse() {
  return NextResponse.json(
    { error: "Failed to create game" },
    { status: 500 }
  );
}

export async function postGameHandler(req: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Request body must be a JSON object" },
      { status: 400 }
    );
  }
  const {
    winnerId,
    loserId,
    resultType,
    approverId,
    password,
  } = body as Record<string, unknown>;

  const db = getDb();

  if (
    !winnerId ||
    !loserId ||
    typeof winnerId !== "string" ||
    typeof loserId !== "string" ||
    !isValidPlayerId(winnerId) ||
    !isValidPlayerId(loserId)
  ) {
    return NextResponse.json(
      { error: "winnerId and loserId are required" },
      { status: 400 }
    );
  }

  if (
    !approverId ||
    !password ||
    typeof approverId !== "string" ||
    typeof password !== "string" ||
    !isValidPlayerId(approverId)
  ) {
    return NextResponse.json(
      { error: "approverId and password are required" },
      { status: 400 }
    );
  }

  const [approver] = await db
    .select()
    .from(players)
    .where(eq(players.id, approverId))
    .limit(1);

  if (!approver) {
    return NextResponse.json(
      { error: "Approver not found" },
      { status: 400 }
    );
  }

  if (!approver.passwordHash) {
    if (password !== DEFAULT_PASSWORD) {
      return NextResponse.json(
        { error: "First-time password is 12345. Enter 12345 to continue, then you will be asked to set a new password." },
        { status: 401 }
      );
    }
    const passwordHash = await hash(DEFAULT_PASSWORD, 10);
    await db
      .update(players)
      .set({ passwordHash, mustChangePassword: true })
      .where(eq(players.id, approverId));
  } else {
    const valid = await compare(password, approver.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }
  }

  if (resultType != null && typeof resultType !== "string") {
    return NextResponse.json({ error: "Invalid resultType" }, { status: 400 });
  }
  if (resultType === "backgammon") {
    return NextResponse.json(
      { error: "backgammon is not supported" },
      { status: 400 },
    );
  }
  const normalizedResult: "normal" | "gammon" =
    resultType === "gammon" ? "gammon" : "normal";

  const [inserted] = await db
    .insert(games)
    .values({
      winnerId: String(winnerId),
      loserId: String(loserId),
      isMars: normalizedResult !== "normal",
      resultType: normalizedResult,
    })
    .returning();

  const [approverAfter] = await db
    .select({ mustChangePassword: players.mustChangePassword })
    .from(players)
    .where(eq(players.id, approverId))
    .limit(1);

  const mustChangePassword = approverAfter?.mustChangePassword ?? true;
  if (mustChangePassword) {
    return NextResponse.json({
      ...inserted,
      mustChangePassword: true,
      approverId,
    });
  }
  return NextResponse.json(inserted);
}
