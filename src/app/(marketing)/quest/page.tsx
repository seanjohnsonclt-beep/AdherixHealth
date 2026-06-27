import type { Metadata } from "next";
import { QuestHero } from "../_components/sections/QuestHero";

export const metadata: Metadata = {
  title: "Adherix Quest - Pediatric Weight Management for Teens 13-18",
  description:
    "Quest turns clinical behavioral protocols into a game world teens actually inhabit. " +
    "XP, squads, boss challenges, weekly missions. Book a demo for your pediatric program.",
};

export default function QuestPage() {
  return <QuestHero />;
}
