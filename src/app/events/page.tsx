import { getEvents } from "@/lib/db";
import { EventsJsonLd } from "@/components/seo/JsonLd";
import EventsClient from "./EventsClient";
import { ClubEvent } from "@/types";

export const revalidate = 60;

export default async function EventsPage() {
  let events: ClubEvent[] = [];
  try {
    events = await getEvents();
  } catch (error) {
    console.error("Failed to load events on server:", error);
  }

  return (
    <>
      <EventsJsonLd events={events} />
      <EventsClient initialEvents={events} />
    </>
  );
}
