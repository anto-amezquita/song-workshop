import type { Metadata } from "next";
import { NashvilleLab } from "@/lessons/nashville-numbers/NashvilleLab";
import { getLesson, lessonPath } from "@/lessons/registry";

const lesson = getLesson("nashville-numbers");

export const metadata: Metadata = {
  title: lesson.title,
  description: lesson.summary,
  // Points at itself, so a copy on another address (song-workshop.vercel.app) defers
  // to this one. The root layout's metadataBase makes it the full address.
  alternates: { canonical: lessonPath("nashville-numbers") },
};

export default function NashvilleNumbersPage() {
  return <NashvilleLab />;
}
