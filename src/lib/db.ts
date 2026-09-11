import fs from "fs";
import path from "path";
import os from "os";
import { MongoClient, Db } from "mongodb";
import { TeamMember, ClubEvent, RecruitmentConfig, RecruitmentSubscriber } from "@/types";
import { initialTeamMembers, initialEvents, initialRecruitmentConfig } from "./initialData";

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "foss_club_srm";

// In-memory cache fallback for resilient serverless execution
let inMemoryData: LocalStoreData | null = null;

// Safe storage directory:
// On Vercel / serverless functions, the root filesystem is read-only.
// /tmp is the only writable directory on AWS Lambda / Vercel Serverless.
const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NOW_REGION
);

const DATA_DIR = isServerless
  ? path.join(os.tmpdir(), "foss_club_data")
  : path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "foss_db.json");

interface LocalStoreData {
  team: TeamMember[];
  events: ClubEvent[];
  recruitment: RecruitmentConfig;
  subscribers: RecruitmentSubscriber[];
}

function ensureLocalFile(): LocalStoreData {
  if (inMemoryData) {
    return inMemoryData;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initial: LocalStoreData = {
        team: initialTeamMembers,
        events: initialEvents,
        recruitment: initialRecruitmentConfig,
        subscribers: [],
      };
      try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), "utf-8");
      } catch (writeErr) {
        console.warn("Could not write initial file (read-only filesystem fallback to memory):", writeErr);
      }
      inMemoryData = initial;
      return initial;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    inMemoryData = parsed;
    return parsed;
  } catch (error) {
    console.warn("Local store read error, falling back to memory/initial:", error);
    const initial: LocalStoreData = {
      team: initialTeamMembers,
      events: initialEvents,
      recruitment: initialRecruitmentConfig,
      subscribers: [],
    };
    inMemoryData = initial;
    return initial;
  }
}

function saveLocalFile(data: LocalStoreData) {
  // Always update in-memory state
  inMemoryData = data;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.warn("Could not persist to disk, kept in memory (safe on serverless):", error);
  }
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let mongoConnectionFailed = false;

async function getMongoDb(): Promise<Db | null> {
  if (mongoConnectionFailed || !MONGODB_URI) {
    return null;
  }

  try {
    let client: MongoClient;
    if (process.env.NODE_ENV === "development") {
      if (!global._mongoClientPromise) {
        const c = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 2000 });
        global._mongoClientPromise = c.connect();
      }
      client = await global._mongoClientPromise;
    } else {
      if (!global._mongoClientPromise) {
        const c = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
        global._mongoClientPromise = c.connect();
      }
      client = await global._mongoClientPromise;
    }

    return client.db(DB_NAME);
  } catch (err) {
    console.warn("MongoDB connection failed or not available, using local store:", err);
    mongoConnectionFailed = true;
    return null;
  }
}

/* =========================================================
   TEAM MEMBERS
========================================================= */

export async function getTeamMembers(): Promise<TeamMember[]> {
  const db = await getMongoDb();
  if (db) {
    const list = await db.collection("team").find({}).toArray();
    if (list.length > 0) {
      return list.map((item) => ({
        ...item,
        _id: item._id.toString(),
      })) as TeamMember[];
    }
    // If mongo is empty, seed it
    await db.collection("team").insertMany(initialTeamMembers as any);
    return initialTeamMembers;
  }

  const local = ensureLocalFile();
  return local.team;
}

export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  const members = await getTeamMembers();
  return members.find((m) => m._id === id) || null;
}

export async function saveTeamMember(member: Partial<TeamMember> & { name: string }): Promise<TeamMember> {
  const db = await getMongoDb();
  const id = member._id || "mem_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
  const now = new Date().toISOString();

  const record: TeamMember = {
    _id: id,
    name: member.name,
    imageUrl: member.imageUrl || "",
    domain: member.domain || "Technical",
    caption: member.caption || "FOSS Contributor",
    github: member.github || "",
    linkedin: member.linkedin || "",
    instagram: member.instagram || "",
    statusHistory: member.statusHistory && member.statusHistory.length > 0 
      ? member.statusHistory 
      : [{ position: "Volunteer", year: "2024-25" }],
    featured: member.featured ?? false,
    createdAt: member.createdAt || now,
    updatedAt: now,
  };

  if (db) {
    await db.collection("team").updateOne(
      { _id: id as any },
      { $set: record },
      { upsert: true }
    );
    return record;
  }

  const local = ensureLocalFile();
  const index = local.team.findIndex((m) => m._id === id);
  if (index >= 0) {
    local.team[index] = record;
  } else {
    local.team.unshift(record);
  }
  saveLocalFile(local);
  return record;
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  const db = await getMongoDb();
  if (db) {
    const res = await db.collection("team").deleteOne({ _id: id as any });
    return res.deletedCount > 0;
  }

  const local = ensureLocalFile();
  const filtered = local.team.filter((m) => m._id !== id);
  const changed = filtered.length !== local.team.length;
  if (changed) {
    local.team = filtered;
    saveLocalFile(local);
  }
  return changed;
}

/* =========================================================
   EVENTS
========================================================= */

export async function getEvents(): Promise<ClubEvent[]> {
  const db = await getMongoDb();
  if (db) {
    const list = await db.collection("events").find({}).sort({ date: -1 }).toArray();
    if (list.length > 0) {
      return list.map((item) => ({
        ...item,
        _id: item._id.toString(),
      })) as ClubEvent[];
    }
    await db.collection("events").insertMany(initialEvents as any);
    return initialEvents;
  }

  const local = ensureLocalFile();
  return local.events;
}

export async function getEventById(id: string): Promise<ClubEvent | null> {
  const events = await getEvents();
  return events.find((e) => e._id === id) || null;
}

export async function saveEvent(event: Partial<ClubEvent> & { title: string }): Promise<ClubEvent> {
  const db = await getMongoDb();
  const id = event._id || "evt_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
  const now = new Date().toISOString();

  const slug = event.slug || event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const record: ClubEvent = {
    _id: id,
    title: event.title,
    slug,
    description: event.description || "",
    posterUrl: event.posterUrl || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1000&auto=format&fit=crop&q=80",
    date: event.date || new Date().toISOString().split("T")[0],
    time: event.time || "10:00 AM - 4:00 PM",
    venue: event.venue || "TP Ganesan Auditorium, SRMIST",
    registrationUrl: event.registrationUrl || "https://fossunited.org/c/srm-ktr",
    active: event.active ?? true,
    category: event.category || "Workshop",
    tags: event.tags || ["FOSS", "SRMIST"],
    speakers: event.speakers || [],
    createdAt: event.createdAt || now,
    updatedAt: now,
  };

  if (db) {
    await db.collection("events").updateOne(
      { _id: id as any },
      { $set: record },
      { upsert: true }
    );
    return record;
  }

  const local = ensureLocalFile();
  const index = local.events.findIndex((e) => e._id === id);
  if (index >= 0) {
    local.events[index] = record;
  } else {
    local.events.unshift(record);
  }
  saveLocalFile(local);
  return record;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const db = await getMongoDb();
  if (db) {
    const res = await db.collection("events").deleteOne({ _id: id as any });
    return res.deletedCount > 0;
  }

  const local = ensureLocalFile();
  const filtered = local.events.filter((e) => e._id !== id);
  const changed = filtered.length !== local.events.length;
  if (changed) {
    local.events = filtered;
    saveLocalFile(local);
  }
  return changed;
}

/* =========================================================
   RECRUITMENT CONFIG
========================================================= */

export async function getRecruitmentConfig(): Promise<RecruitmentConfig> {
  const db = await getMongoDb();
  if (db) {
    const doc = await db.collection("recruitment").findOne({ _id: "recruitment_config" as any });
    if (doc) {
      return {
        ...doc,
        _id: doc._id.toString(),
      } as RecruitmentConfig;
    }
    await db.collection("recruitment").insertOne(initialRecruitmentConfig as any);
    return initialRecruitmentConfig;
  }

  const local = ensureLocalFile();
  return local.recruitment || initialRecruitmentConfig;
}

export async function updateRecruitmentConfig(config: Partial<RecruitmentConfig>): Promise<RecruitmentConfig> {
  const current = await getRecruitmentConfig();
  const updated: RecruitmentConfig = {
    ...current,
    ...config,
    _id: "recruitment_config",
    updatedAt: new Date().toISOString(),
  };

  const db = await getMongoDb();
  if (db) {
    await db.collection("recruitment").updateOne(
      { _id: "recruitment_config" as any },
      { $set: updated },
      { upsert: true }
    );
    return updated;
  }

  const local = ensureLocalFile();
  local.recruitment = updated;
  saveLocalFile(local);
  return updated;
}

/* =========================================================
   RECRUITMENT NOTIFICATIONS / WAITLIST
========================================================= */

export async function addRecruitmentSubscriber(sub: {
  name: string;
  email: string;
  regNo?: string;
  domainOfInterest: string;
}): Promise<RecruitmentSubscriber> {
  const record: RecruitmentSubscriber = {
    _id: "sub_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
    name: sub.name,
    email: sub.email,
    regNo: sub.regNo,
    domainOfInterest: sub.domainOfInterest,
    createdAt: new Date().toISOString(),
  };

  const db = await getMongoDb();
  if (db) {
    await db.collection("subscribers").insertOne(record as any);
    return record;
  }

  const local = ensureLocalFile();
  if (!local.subscribers) local.subscribers = [];
  local.subscribers.unshift(record);
  saveLocalFile(local);
  return record;
}

export async function getRecruitmentSubscribers(): Promise<RecruitmentSubscriber[]> {
  const db = await getMongoDb();
  if (db) {
    const list = await db.collection("subscribers").find({}).sort({ createdAt: -1 }).toArray();
    return list.map((item) => ({
      ...item,
      _id: item._id.toString(),
    })) as RecruitmentSubscriber[];
  }

  const local = ensureLocalFile();
  return local.subscribers || [];
}

/* =========================================================
   SEED & RESET
========================================================= */

export async function resetDatabaseToInitial() {
  const db = await getMongoDb();
  if (db) {
    await db.collection("team").deleteMany({});
    await db.collection("team").insertMany(initialTeamMembers as any);

    await db.collection("events").deleteMany({});
    await db.collection("events").insertMany(initialEvents as any);

    await db.collection("recruitment").deleteMany({});
    await db.collection("recruitment").insertOne(initialRecruitmentConfig as any);
  }

  const resetData: LocalStoreData = {
    team: initialTeamMembers,
    events: initialEvents,
    recruitment: initialRecruitmentConfig,
    subscribers: [],
  };
  saveLocalFile(resetData);
  return resetData;
}
