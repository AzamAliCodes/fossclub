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

async function getMongoDb(): Promise<Db | null> {
  if (!MONGODB_URI) {
    return null;
  }

  try {
    if (!global._mongoClientPromise) {
      const c = new MongoClient(MONGODB_URI, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 8000,
      });
      global._mongoClientPromise = c.connect().catch((err) => {
        global._mongoClientPromise = undefined;
        throw err;
      });
    }
    const client = await global._mongoClientPromise;
    return client.db(DB_NAME);
  } catch (err) {
    console.warn("MongoDB connection failed or not available, using local store:", err);
    global._mongoClientPromise = undefined;
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
    return list.map((item) => ({
      ...item,
      _id: item._id.toString(),
    })) as TeamMember[];
  }

  const local = ensureLocalFile();
  return local.team || [];
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
    order: typeof member.order === "number" ? member.order : (typeof member.index === "number" ? member.index : undefined),
    index: typeof member.index === "number" ? member.index : (typeof member.order === "number" ? member.order : undefined),
    regNo: member.regNo ? member.regNo.trim().toUpperCase() : undefined,
    createdAt: member.createdAt || now,
    updatedAt: now,
  };

  const { _id, ...setFields } = record;

  if (db) {
    try {
      await db.collection("team").updateOne(
        { _id: id as any },
        { 
          $set: setFields,
          $setOnInsert: { _id: id as any }
        },
        { upsert: true }
      );

      // Keep local backup store in sync
      const local = ensureLocalFile();
      if (!local.team) local.team = [];
      const index = local.team.findIndex((m) => m._id === id);
      if (index >= 0) {
        local.team[index] = record;
      } else {
        local.team.unshift(record);
      }
      saveLocalFile(local);

      return record;
    } catch (err) {
      console.error("MongoDB Atlas updateOne error in saveTeamMember:", err);
      throw err;
    }
  }

  const local = ensureLocalFile();
  if (!local.team) local.team = [];
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
  let changed = false;
  if (db) {
    const res = await db.collection("team").deleteOne({ _id: id as any });
    changed = res.deletedCount > 0;
  }

  const local = ensureLocalFile();
  const filtered = local.team.filter((m) => m._id !== id);
  if (filtered.length !== local.team.length) {
    local.team = filtered;
    saveLocalFile(local);
    changed = true;
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
    return list.map((item) => {
      const { category, tags, speakers, ...rest } = item as any;
      return {
        ...rest,
        _id: item._id.toString(),
      };
    }) as ClubEvent[];
  }

  const local = ensureLocalFile();
  const sorted = [...(local.events || [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return sorted.map((item: any) => {
    const { category, tags, speakers, ...rest } = item;
    return rest as ClubEvent;
  });
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

  const cleanPosterUrl = event.posterUrl?.trim() || "https://ik.imagekit.io/SRMFOSSKTR/Logo/fossclub-horizontal-logo.png";
  const cleanRegUrl = event.registrationUrl ? event.registrationUrl.trim() : "https://fossunited.org/c/srm-ktr";

  const record: ClubEvent = {
    _id: id,
    title: event.title.trim(),
    slug,
    description: event.description || "",
    posterUrl: cleanPosterUrl,
    date: event.date || new Date().toISOString().split("T")[0],
    time: event.time || "10:00 AM - 4:00 PM",
    venue: event.venue || "TP Ganesan Auditorium, SRMIST",
    registrationUrl: cleanRegUrl,
    active: event.active ?? true,
    createdAt: event.createdAt || now,
    updatedAt: now,
  };

  const { _id, ...setFields } = record;

  if (db) {
    try {
      await db.collection("events").updateOne(
        { _id: id as any },
        { 
          $set: setFields,
          $unset: { category: "", tags: "", speakers: "" } as any,
          $setOnInsert: { _id: id as any }
        },
        { upsert: true }
      );

      // Keep local backup store in sync
      const local = ensureLocalFile();
      if (!local.events) local.events = [];
      const index = local.events.findIndex((e) => e._id === id);
      if (index >= 0) {
        local.events[index] = record;
      } else {
        local.events.unshift(record);
      }
      saveLocalFile(local);

      return record;
    } catch (dbErr) {
      console.error("MongoDB Atlas updateOne error in saveEvent:", dbErr);
      throw dbErr;
    }
  }

  const local = ensureLocalFile();
  if (!local.events) local.events = [];
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
  const cleanPoster = config.posterUrl !== undefined ? config.posterUrl.trim() : current.posterUrl;
  const cleanApply = config.applyUrl !== undefined ? config.applyUrl.trim() : current.applyUrl;

  const updated: RecruitmentConfig = {
    ...current,
    ...config,
    posterUrl: cleanPoster,
    applyUrl: cleanApply,
    _id: "recruitment_config",
    updatedAt: new Date().toISOString(),
  };

  const db = await getMongoDb();
  if (db) {
    try {
      await db.collection("recruitment").updateOne(
        { _id: "recruitment_config" as any },
        { $set: updated },
        { upsert: true }
      );
      const local = ensureLocalFile();
      local.recruitment = updated;
      saveLocalFile(local);
      return updated;
    } catch (dbErr) {
      console.error("MongoDB Atlas updateOne error in updateRecruitmentConfig:", dbErr);
      throw dbErr;
    }
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

  // Applications are handled directly via external Google Form.
  // No collection entry is saved to MongoDB Atlas.
  return record;
}

export async function getRecruitmentSubscribers(): Promise<RecruitmentSubscriber[]> {
  // Applications are managed via Google Forms
  return [];
}

/* =========================================================
   SEED & RESET
========================================================= */

export async function resetDatabaseToInitial() {
  const db = await getMongoDb();
  if (db) {
    await db.collection("team").deleteMany({});
    if (initialTeamMembers.length > 0) {
      await db.collection("team").insertMany(initialTeamMembers as any);
    }

    await db.collection("events").deleteMany({});
    if (initialEvents.length > 0) {
      await db.collection("events").insertMany(initialEvents as any);
    }

    await db.collection("recruitment").deleteMany({});
    await db.collection("recruitment").insertOne(initialRecruitmentConfig as any);
  }

  const resetData: LocalStoreData = {
    team: initialTeamMembers,
    events: initialEvents,
    recruitment: initialRecruitmentConfig,
  };
  saveLocalFile(resetData);
  return resetData;
}
