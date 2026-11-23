import type { Metadata } from "next";
import { NashvilleLab } from "@/lessons/nashville-numbers/NashvilleLab";
import { getLesson } from "@/lessons/registry";

const lesson = getLesson("nashville-numbers");

export const metadata: Metadata = {
  title: lesson.title,
  description: lesson.summary,
};

export default function NashvilleNumbersPage() {
  return <NashvilleLab />;
}
