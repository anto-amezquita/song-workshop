import type { Metadata } from "next";
import Link from "next/link";
import { getLesson, lessonPath } from "@/lessons/registry";
import "./not-found.css";

// Our own 404, because Next's built-in one paints body white with an inline style (port spec R5).
const lesson = getLesson("nashville-numbers");

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <main className="not-found">
      <h1 className="not-found__title">This page doesn&rsquo;t exist</h1>
      <p className="not-found__text">
        The address might be mistyped, or the page has moved.{" "}
        <Link href={lessonPath("nashville-numbers")}>Go to {lesson.title}</Link>
      </p>
    </main>
  );
}
