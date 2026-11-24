import type { Metadata } from "next";
import { NashvilleLab } from "@/lessons/nashville-numbers/NashvilleLab";
import { getLesson, lessonPath } from "@/lessons/registry";

// Until there's a second lesson, / is the first one (port spec Q5). A static
// export can't redirect, so it renders the lesson and points search engines at
// the lesson's own address.
const lesson = getLesson("nashville-numbers");

export const metadata: Metadata = {
  // The root layout's title template only reaches child routes, so / spells it out.
  title: { absolute: `${lesson.title} · Song Workshop` },
  description: lesson.summary,
};

export default function HomePage() {
  return (
    <>
      {/* Relative until the site has a host (AME-87); React puts it in <head>. */}
      <link rel="canonical" href={lessonPath("nashville-numbers")} />
      <NashvilleLab />
    </>
  );
}
