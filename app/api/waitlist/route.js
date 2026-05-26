import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "waitlist.json");

async function readData() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { entries: [], count: 0 };
  }
}

async function writeData(data) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function POST(request) {
  const { email } = await request.json();

  if (!email || !/.+@.+\..+/.test(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }

  const data = await readData();

  // Check if already registered
  const existing = data.entries.find((e) => e.email === email);
  if (existing) {
    return NextResponse.json({
      position: existing.position,
      count: data.count,
      duplicate: true,
    });
  }

  data.count += 1;
  const position = data.count;
  data.entries.push({
    email,
    position,
    createdAt: new Date().toISOString(),
  });

  await writeData(data);

  return NextResponse.json({ position, count: data.count });
}

export async function GET() {
  const data = await readData();
  return NextResponse.json({ count: data.count });
}
