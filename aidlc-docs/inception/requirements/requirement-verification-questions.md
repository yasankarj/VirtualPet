# Virtual Pet (Tamagotchi) — Requirements Clarification Questions

Please answer each question by filling in the letter choice after the `[Answer]:` tag.
If none of the options match your needs, choose the last option (Other) and describe your preference.
Let me know when you're done.

## Question 1: Platform
What platform should the Virtual Pet run on?

A) Web application (runs in browser)

B) Command-line / terminal application

C) Desktop application (native window)

D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2: Technology Stack
Do you have a preferred technology stack, or should I choose one appropriate for the platform?

A) Let the AI choose a simple, modern default stack

B) JavaScript/TypeScript (e.g., React for web, Node for CLI)

C) Python

D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 3: Pet Stats to Track
Which stats should the pet have, decaying over time?

A) Hunger, Happiness, Energy (3 core stats)

B) Hunger, Happiness, Energy, Health (adds a derived Health stat affected by the others)

C) Just a single overall "well-being" stat

D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 4: Decay Rate / Timing
How should stat decay over time work?

A) Decay ticks in real time (e.g., stats drop gradually every real-world minute/hour), including while the app is closed (catch-up calculated on reopen)

B) Decay ticks only while the app is open (simulated time, e.g., every few seconds for demo purposes), pausing when closed

C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 5: Actions — Feed, Play, Rest
What should each action do?

A) Feed increases Hunger stat, Play increases Happiness (but decreases Energy), Rest increases Energy (but pet is unavailable for other actions while resting)

B) Same as A, but with cooldowns between uses of each action

C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 6: Neglect Consequences
What happens if stats are neglected and hit zero?

A) Pet's Health declines and it can eventually "die" (game over), requiring a restart/new pet

B) Pet becomes visibly unhappy/sick but never dies — stats just stay at low/critical levels

C) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 7: Persistence
Should the pet's state persist between sessions (closing and reopening the app)?

A) Yes — save state locally (e.g., browser localStorage or a local file) and restore on reopen, including decay that happened while closed

B) No — state resets each time the app starts (in-memory only, for a simple demo)

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 8: Number of Pets
How many pets can a user have?

A) One pet per user/session

B) Multiple pets, user can switch between or manage several

C) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 9: Visual Representation
How should the pet be represented visually?

A) Simple text/emoji-based representation showing mood and stats (e.g., "😊 Happy | Hunger: 80%")

B) Simple 2D sprite/image that changes based on mood and life stage (baby/child/adult)

C) No visuals needed — stats displayed as numbers/bars only

D) Other (please describe after [Answer]: tag below)

[Answer]: D: Use scooby doo images from online which matches to each mood

## Question 10: Scope
Is this intended as a learning/portfolio project, or something with production-grade expectations (multi-user accounts, cloud hosting, etc.)?

A) Learning/personal project — keep it simple, single-user, runs locally

B) Small production-grade app — should support real users, proper hosting/deployment considerations

C) Other (please describe after [Answer]: tag below)

[Answer]: A

---

## Extension Opt-In Questions

The following extensions are available for this project. Please indicate whether each should be enforced.

## Question: Security Extensions
Should security extension rules be enforced for this project?

A) Yes — enforce all SECURITY rules as blocking constraints (recommended for production-grade applications)

B) No — skip all SECURITY rules (suitable for PoCs, prototypes, and experimental projects)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question: Resiliency Extensions
Should the resiliency baseline be applied to this project?

**What this extension is.** Enabling it applies a set of directional, design-time best practices for building resilient systems (fault tolerance, availability, observability, recoverability).

**What this extension is NOT.** It does not make your workload production-ready or certify any availability/RTO/RPO target — it's a starting point, not a substitute for a formal review.

A) Yes — apply the resiliency baseline as directional best practices (recommended for business-critical workloads)

B) No — skip the resiliency baseline (suitable for PoCs, prototypes, and experimental projects where rapid iteration matters more than reliability)

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question: Property-Based Testing Extension
Should property-based testing (PBT) rules be enforced for this project?

A) Yes — enforce all PBT rules as blocking constraints (recommended for projects with business logic, data transformations, serialization, or stateful components)

B) Partial — enforce PBT rules only for pure functions and serialization round-trips (suitable for projects with limited algorithmic complexity)

C) No — skip all PBT rules (suitable for simple CRUD applications, UI-only projects, or thin integration layers with no significant business logic)

X) Other (please describe after [Answer]: tag below)

[Answer]: B
