// db/index.ts — reads DATABASE_URL. In DEMO_MODE, reads/writes an in-memory store seeded
// from fixtures/ instead, so the vertical slice works with the Wi-Fi off.
import fs from "node:fs";
import path from "node:path";
import { desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { isDemoMode } from "@/lib/demo-mode";
import { requireDatabaseUrl } from "@/lib/env";
import { records, type Record } from "./schema";

type Store = { records: Record[]; nextId: number };

let memoryStore: Store | null = null;

function loadFixtureStore(): Store {
  const fixturePath = path.join(process.cwd(), "fixtures", "records.json");
  const seed: Array<{ title: string; createdAt: string }> = JSON.parse(
    fs.readFileSync(fixturePath, "utf-8"),
  );
  const seeded = seed.map((row, i) => ({ id: i + 1, title: row.title, createdAt: new Date(row.createdAt) }));
  return { records: seeded, nextId: seeded.length + 1 };
}

function getMemoryStore(): Store {
  if (!memoryStore) memoryStore = loadFixtureStore();
  return memoryStore;
}

let sqlClient: ReturnType<typeof postgres> | null = null;
function getDrizzle() {
  if (!sqlClient) {
    sqlClient = postgres(requireDatabaseUrl(), { max: 5 });
  }
  return drizzle(sqlClient);
}

export async function listRecords(): Promise<Record[]> {
  if (isDemoMode()) {
    return [...getMemoryStore().records].sort((a, b) => +b.createdAt - +a.createdAt);
  }
  const db = getDrizzle();
  return db.select().from(records).orderBy(desc(records.createdAt));
}

export async function createRecord(title: string): Promise<Record> {
  if (isDemoMode()) {
    const store = getMemoryStore();
    const row: Record = { id: store.nextId++, title, createdAt: new Date() };
    store.records.push(row);
    return row;
  }
  const db = getDrizzle();
  const [row] = await db.insert(records).values({ title }).returning();
  return row;
}
