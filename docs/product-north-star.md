# product-north-star.md

## Purpose

This file defines what the product is, who it serves, why it exists, and the principles that should guide product decisions over time.

It is the stable reference point for the product. When features, designs, or technical choices compete, this document should help decide what deserves to exist and what does not.

> **Status (2026-11-22):** Only sections 1, 9 and 11 are filled in so far, as a draft written from the first lesson. The rest is still the template. Lines marked *Assumption* need confirming. Who the lessons are for, the principles and the goals are still open (section 11); they shouldn't be guessed.

---

## 1. Product summary

### Product name

Song Workshop

### One-line description

Short music lessons you play with in the browser. *(Draft)*

### Longer description

Song Workshop is a small site of music lessons. Each lesson is one interactive page: you change something, see and usually hear the result straight away, and notice what stays the same. The first lesson, Nashville Number Lab, teaches the seven chords of a key as numbers, so a progression can move to any key. *(Draft, written from the first lesson.)*

---

## 2. Problem

### The problem we solve

[What problem exists today?]

### Who experiences it

[Who feels this problem most strongly?]

### Why it matters

[What is costly, frustrating, slow, confusing, or impossible without this product?]

---

## 3. Audience

### Primary users

- [User type]
- [User type]

### Secondary users

- [User type]
- [User type]

### Users are trying to

- [Job to be done]
- [Job to be done]
- [Job to be done]

### Users should feel

- [Feeling]
- [Feeling]
- [Feeling]

---

## 4. Value proposition

### We help users

[Describe the transformation the product enables.]

### Compared with alternatives

[What makes this approach better, simpler, faster, clearer, or more trustworthy?]

---

## 5. Product principles

Choose 3–7 principles that should guide decisions.

### Example format

#### 1. Clarity before cleverness

We prefer choices that make the product easier to understand over choices that only make it feel more novel.

#### 2. [Principle name]

[What this means in practice.]

#### 3. [Principle name]

[What this means in practice.]

---

## 6. What this product should become

Describe the product at its best.

- [Desired future state]
- [Desired future state]
- [Desired future state]

---

## 7. What this product should not become

Define the boundaries that protect the product from drift.

- [Anti-goal]
- [Anti-goal]
- [Anti-goal]

---

## 8. Business and product goals

### Business goals

- [Goal]
- [Goal]

### Product goals

- [Goal]
- [Goal]

### Success signals

- [Observable signal]
- [Observable signal]
- [Observable signal]

---

## 9. Strategic scope

### In scope

- Interactive lessons, one per page, each at its own address
- Lessons, in the order they're planned:
  - Nashville Number Lab: built as one HTML file, then ported into the app (AME-78, 2026-11-23)
  - Blues, rhythm, melody, lyric writing: planned, each needs a spec (see `docs/backlog.md`)
- Sound made in the browser, so a lesson works without downloads or a plugin. *Assumption:* most lessons make sound, but not necessarily all of them (see section 11).

### Out of scope

- Accounts, logins and saved progress. *Assumption: the first lesson has none, and nothing so far asks for them.*
- A server or backend. *Assumption, for the same reason.*

---

## 10. Decision filter

When making product decisions, ask:

- Does this solve a real user problem?
- Does it support the primary audience?
- Does it move the product toward its intended future?
- Does it fit the product principles?
- Does it create unnecessary complexity?
- Would we still want this if we had to maintain it for years?

---

## 11. Open questions

- Who are the lessons for: complete beginners, people who play a little and want to write songs, or both? The first lesson expects you to know what a chord is.
- English only, or Danish and Spanish too?
- Do the lessons form a course with an order, or does each one stand alone?
- Should a lesson remember where you got to, or always start fresh?
- Does every lesson make sound? The lyric-writing lesson might not.
- Is Song Workshop presented as Antonio's own project? The first lesson's footer says "A music-teaching experiment by Antonio Amézquita".
