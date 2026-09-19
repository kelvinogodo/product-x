-- Sample catalog: 5 categories, 6 tracks, 14 courses, ~45 lessons with real markdown content.
-- Idempotent: safe to run repeatedly (upserts by slug; lesson ids are derived from course slug + position).
-- Requires migrations 000006-000009 (outcomes/featured, instructors, quizzes).

-- ---------------------------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------------------------
insert into public.categories (slug, name) values
  ('programming', 'Programming'),
  ('design', 'Design'),
  ('data', 'Data'),
  ('marketing', 'Marketing'),
  ('management', 'Management')
on conflict (slug) do update set name = excluded.name;

-- ---------------------------------------------------------------------------------------------
-- Instructors
-- ---------------------------------------------------------------------------------------------
insert into public.instructors (slug, name, bio) values
  ('product-x-academy', 'product x Academy',
   'The in-house team behind product x: practitioners who turn real-world experience into short, practical lessons.')
on conflict (slug) do update set name = excluded.name, bio = excluded.bio;

-- ---------------------------------------------------------------------------------------------
-- Tracks
-- ---------------------------------------------------------------------------------------------
insert into public.tracks (slug, name, description, category_id)
select v.slug, v.name, v.description, c.id
from (values
  ('frontend-development', 'Frontend Development',
   'Go from your first HTML page to building interactive, production-ready React applications.', 'programming'),
  ('backend-engineering', 'Backend Engineering',
   'Learn the typed, database-backed foundations behind every modern web API.', 'programming'),
  ('product-design', 'Product Design',
   'Research users, design interfaces, and prototype ideas in Figma the way product teams do.', 'design'),
  ('data-analytics', 'Data Analytics',
   'Turn raw data into decisions: Python, pandas, and charts people actually understand.', 'data'),
  ('digital-marketing', 'Digital Marketing',
   'Earn attention with search and content, then measure what really moves the needle.', 'marketing')
) as v(slug, name, description, category_slug)
join public.categories c on c.slug = v.category_slug
on conflict (slug) do update
  set name = excluded.name, description = excluded.description, category_id = excluded.category_id;

-- ---------------------------------------------------------------------------------------------
-- Courses (duration_minutes is recomputed from lessons at the bottom)
-- ---------------------------------------------------------------------------------------------
insert into public.courses
  (slug, title, description, category_id, track_id, level, instructor_id, featured, outcomes, published)
select
  v.slug, v.title, v.description, c.id, t.id, v.level, (select id from public.instructors where slug = 'product-x-academy'), v.featured, v.outcomes, true
from (values
  ('html-css-fundamentals', 'HTML & CSS Fundamentals',
   'Build your first web pages with modern, semantic HTML and CSS — from setup to responsive layouts.',
   'programming', 'frontend-development', 'beginner', true,
   array['Structure pages with semantic HTML','Style with the CSS box model and cascade','Lay out pages with Flexbox and Grid','Ship a responsive page that works on any screen']),
  ('javascript-essentials', 'JavaScript Essentials',
   'Master the core language — variables, functions, arrays, and async code — before touching a framework.',
   'programming', 'frontend-development', 'beginner', true,
   array['Reason about types, scope, and closures','Transform data with map, filter, and reduce','Write async code with promises and async/await','Read other people''s JavaScript with confidence']),
  ('react-in-depth', 'React In Depth',
   'Component architecture, hooks, data fetching, and context — the patterns real React teams use.',
   'programming', 'frontend-development', 'intermediate', true,
   array['Design small, reusable components','Manage state with useState and useReducer','Fetch data safely inside effects','Share state with context without prop drilling']),
  ('typescript-fundamentals', 'TypeScript Fundamentals',
   'Add types to JavaScript and catch whole classes of bugs before your code ever runs.',
   'programming', 'backend-engineering', 'intermediate', false,
   array['Explain what the type checker actually does','Model data with types and interfaces','Write reusable code with generics']),
  ('nodejs-rest-apis', 'Building REST APIs with Node.js',
   'Create, validate, and harden a JSON API with Node.js and Express.',
   'programming', 'backend-engineering', 'intermediate', false,
   array['Stand up an HTTP server from scratch','Design clean REST routes','Validate input and return consistent errors']),
  ('sql-and-databases', 'SQL & Relational Databases',
   'Query, join, and summarise data with SQL — the language behind almost every product.',
   'data', 'backend-engineering', 'beginner', true,
   array['Read and write SELECT queries','Filter, sort, and paginate results','Combine tables with joins','Summarise data with GROUP BY']),
  ('figma-for-beginners', 'Figma for Beginners',
   'Design your first interface and turn it into a clickable prototype in Figma.',
   'design', 'product-design', 'beginner', false,
   array['Navigate the Figma interface quickly','Build flexible layouts with auto layout','Prototype flows you can test with real users']),
  ('ux-research-basics', 'UX Research Basics',
   'Learn to talk to users, spot patterns, and turn messy feedback into confident design decisions.',
   'design', 'product-design', 'beginner', false,
   array['Plan research that answers a real question','Run a calm, useful user interview','Synthesise notes into clear insights']),
  ('ui-design-principles', 'UI Design Principles',
   'The visual fundamentals — hierarchy, spacing, type, and colour — that make interfaces feel professional.',
   'design', 'product-design', 'beginner', true,
   array['Direct attention with hierarchy and contrast','Use a spacing and type scale consistently','Build an accessible colour system']),
  ('intro-to-data-science', 'Intro to Data Science',
   'Statistics thinking, Python, and pandas — finish with your first end-to-end data analysis.',
   'data', 'data-analytics', 'beginner', true,
   array['Frame questions a dataset can answer','Use Python for lists, dicts, and loops','Clean and summarise data with pandas']),
  ('data-visualization-basics', 'Data Visualization Basics',
   'Pick the right chart, cut the clutter, and tell a story that changes minds.',
   'data', 'data-analytics', 'beginner', false,
   array['Match chart types to questions','Remove clutter and highlight what matters','Structure a data story for decision makers']),
  ('seo-fundamentals', 'SEO Fundamentals',
   'Understand how search engines work and earn organic traffic without gimmicks.',
   'marketing', 'digital-marketing', 'beginner', false,
   array['Explain crawling, indexing, and ranking','Find keywords people actually search','Optimise a page for people and search engines']),
  ('content-marketing', 'Content Marketing That Works',
   'Plan, write, and measure content that builds an audience and drives real business results.',
   'marketing', 'digital-marketing', 'intermediate', false,
   array['Build a content strategy around audience needs','Write pieces that earn attention and links','Measure content against business goals']),
  ('project-management-basics', 'Project Management Basics',
   'Scope, plan, and deliver projects on time — without burning out your team.',
   'management', null, 'beginner', false,
   array['Run a project through its lifecycle','Break work into a realistic plan','Manage risks and keep stakeholders informed'])
) as v(slug, title, description, category_slug, track_slug, level, featured, outcomes)
join public.categories c on c.slug = v.category_slug
left join public.tracks t on t.slug = v.track_slug
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  category_id = excluded.category_id,
  track_id = excluded.track_id,
  level = excluded.level,
  instructor_id = excluded.instructor_id,
  featured = excluded.featured,
  outcomes = excluded.outcomes,
  published = true;

-- Drop lessons that pre-date deterministic ids (e.g. from the older seed) so they don't duplicate.
delete from public.lessons l
using public.courses c
where l.course_id = c.id
  and c.slug in (
    'html-css-fundamentals','javascript-essentials','react-in-depth','typescript-fundamentals',
    'nodejs-rest-apis','sql-and-databases','figma-for-beginners','ux-research-basics',
    'ui-design-principles','intro-to-data-science','data-visualization-basics','seo-fundamentals',
    'content-marketing','project-management-basics'
  )
  and l.id <> md5(c.slug || ':' || l."position")::uuid;

-- ---------------------------------------------------------------------------------------------
-- Lessons
-- ---------------------------------------------------------------------------------------------
insert into public.lessons (id, course_id, title, content, "position", duration_minutes)
select md5(c.slug || ':' || v."position")::uuid, c.id, v.title, v.content, v."position", v.duration
from (values

-- HTML & CSS ---------------------------------------------------------------------------------
('html-css-fundamentals', 1, 'Setting up your editor', 15, $md$
Every web developer needs a comfortable place to write code. We'll use **Visual Studio Code** — it's free, fast, and has an ecosystem of extensions.

## Install and configure

1. Download VS Code from the official site and install it.
2. Add two extensions: **Live Server** (auto-reloads the browser) and **Prettier** (formats your code on save).
3. Turn on *Format on Save* in Settings.

## Your first file

Create a folder called `my-first-site`, open it in VS Code, and add an `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>My first site</title>
  </head>
  <body>
    <h1>Hello, world!</h1>
  </body>
</html>
```

Right-click the file and choose **Open with Live Server**. Edit the heading, save, and watch the browser update instantly.

> **Try it:** change the `<title>` and see where it shows up in your browser tab.
$md$),
('html-css-fundamentals', 2, 'Semantic HTML', 30, $md$
HTML describes **meaning**, not appearance. Choosing the right element gives you accessibility, better SEO, and cleaner CSS for free.

## Landmarks over `<div>` soup

```html
<header>…site title and navigation…</header>
<main>
  <article>
    <h1>Page title</h1>
    <section>…</section>
  </article>
  <aside>…related links…</aside>
</main>
<footer>…</footer>
```

Screen readers use these landmarks to let people jump around a page.

## Headings form an outline

Use one `<h1>` per page, then nest `<h2>`, `<h3>` in order. Never pick a heading because of its size — style it with CSS instead.

## Elements worth knowing

| Element | Use it for |
| --- | --- |
| `<nav>` | Major navigation blocks |
| `<button>` | Actions on the page |
| `<a href>` | Navigation to another URL |
| `<figure>` / `<figcaption>` | An image with a caption |
| `<time datetime>` | Dates a machine can read |

Rule of thumb: if it *does* something, it's a `<button>`; if it *goes* somewhere, it's an `<a>`.
$md$),
('html-css-fundamentals', 3, 'The CSS box model', 30, $md$
Every element on a page is a rectangular **box** made of four layers, from the inside out:

1. **Content** — the text or image itself
2. **Padding** — space *inside* the border
3. **Border** — the edge of the box
4. **Margin** — space *outside* the border

```css
.card {
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  margin: 1rem 0;
}
```

## The one line every project needs

By default, `width` only measures the content, so adding padding makes the box bigger than you asked for. Fix it globally:

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

Now `width: 300px` means 300px *including* padding and border.

## The cascade

When two rules target the same element, CSS picks a winner by **specificity**, then by **source order**. Prefer simple class selectors and avoid `!important` — it makes future changes painful.
$md$),
('html-css-fundamentals', 4, 'Flexbox & Grid layout', 45, $md$
Modern CSS gives you two layout systems. Use **Flexbox** for one dimension (a row *or* a column) and **Grid** for two.

## Flexbox: a nav bar in four lines

```css
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
```

`justify-content` works along the main axis, `align-items` along the cross axis, and `gap` spaces the children without margin hacks.

## Grid: a responsive card layout

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}
```

This one declaration gives you as many 240px+ columns as fit — no media queries needed.

## Making it responsive

Design for the smallest screen first, then add complexity with `min-width` media queries:

```css
@media (min-width: 768px) {
  .layout { grid-template-columns: 240px 1fr; }
}
```

> **Challenge:** rebuild a pricing page with three cards that stack on phones and sit side by side on desktops.
$md$),

-- JavaScript ---------------------------------------------------------------------------------
('javascript-essentials', 1, 'Variables & types', 30, $md$
JavaScript has a small set of **primitive types**: `string`, `number`, `boolean`, `null`, `undefined`, `bigint`, and `symbol`. Everything else is an **object**.

## `const` by default

```js
const name = "Ada";     // can't be reassigned
let score = 0;          // can be reassigned
score += 10;
```

Use `const` unless you know the value will change, and skip `var` entirely.

## Truthy and falsy

Conditions coerce values to booleans. These are **falsy**: `false`, `0`, `""`, `null`, `undefined`, `NaN`. Everything else is truthy — including `"0"` and `[]`.

## Prefer strict equality

```js
0 == "0";    // true  (surprise!)
0 === "0";   // false (what you meant)
```

Always reach for `===` and `!==`.

## Template literals

```js
const greeting = `Hello, ${name}! Your score is ${score}.`;
```
$md$),
('javascript-essentials', 2, 'Functions & scope', 40, $md$
Functions are **values**: you can store them in variables, pass them around, and return them.

```js
function add(a, b) {
  return a + b;
}

const multiply = (a, b) => a * b;   // arrow function
```

## Scope

A variable is visible inside the block or function where it's declared, and in any function nested inside it.

## Closures

A function *remembers* the variables around it when it was created:

```js
function makeCounter() {
  let count = 0;
  return () => ++count;
}

const next = makeCounter();
next(); // 1
next(); // 2
```

`count` is private — nothing outside can touch it, yet the returned function keeps it alive. Closures power event handlers, React hooks, and most of the JavaScript you'll read.

## Default and rest parameters

```js
const greet = (name = "friend", ...extras) => `Hi ${name} (+${extras.length})`;
```
$md$),
('javascript-essentials', 3, 'Arrays & objects', 35, $md$
Most real-world code is about transforming collections of data. Three array methods do the heavy lifting.

```js
const products = [
  { name: "Notebook", price: 12, inStock: true },
  { name: "Pen", price: 3, inStock: false },
  { name: "Backpack", price: 45, inStock: true },
];

const available = products.filter((p) => p.inStock);
const names = available.map((p) => p.name);
const total = available.reduce((sum, p) => sum + p.price, 0);
```

- `filter` keeps items that pass a test
- `map` transforms every item
- `reduce` folds a list into a single value

## Destructuring and spread

```js
const { name, price } = products[0];

const updated = { ...products[0], price: 15 };   // copy with a change
const more = [...products, { name: "Eraser", price: 1, inStock: true }];
```

Spreading creates *new* objects instead of mutating the old ones — a habit that pays off enormously in React.
$md$),
('javascript-essentials', 4, 'Async JavaScript', 45, $md$
Network requests and timers take time. JavaScript doesn't wait around — it keeps running and comes back when the result is ready.

## Promises

A promise is a placeholder for a future value. It's either **pending**, **fulfilled**, or **rejected**.

```js
fetch("/api/courses")
  .then((res) => res.json())
  .then((courses) => console.log(courses))
  .catch((err) => console.error(err));
```

## async / await

The same code reads top to bottom:

```js
async function loadCourses() {
  try {
    const res = await fetch("/api/courses");
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}
```

## Run things in parallel

```js
const [user, courses] = await Promise.all([getUser(), getCourses()]);
```

> Awaiting each call one after another when they're independent is one of the most common performance mistakes.
$md$),

-- React --------------------------------------------------------------------------------------
('react-in-depth', 1, 'Components & props', 40, $md$
A React component is a function that returns UI. Data flows **down** through **props**.

```jsx
function CourseCard({ title, level }) {
  return (
    <article className="card">
      <h3>{title}</h3>
      <span>{level}</span>
    </article>
  );
}

function App() {
  return <CourseCard title="React In Depth" level="intermediate" />;
}
```

## Rendering lists

```jsx
{courses.map((course) => (
  <CourseCard key={course.id} {...course} />
))}
```

The `key` must be stable and unique among siblings — it's how React tracks which item is which.

## Guidelines

- Keep components small and focused on one job
- Props are **read-only** — never mutate them
- Name components with a capital letter, always
- Prefer composing components over copying markup
$md$),
('react-in-depth', 2, 'State & hooks', 50, $md$
Props come from the parent; **state** belongs to the component and changes over time. Changing state re-renders the component.

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount((c) => c + 1)}>
      Clicked {count} times
    </button>
  );
}
```

## Rules of hooks

1. Only call hooks at the **top level** — never inside loops or conditions
2. Only call hooks from components or other hooks

## Derive, don't duplicate

If a value can be calculated from existing state or props, calculate it during render instead of storing a copy:

```jsx
const [items, setItems] = useState([]);
const total = items.reduce((sum, i) => sum + i.price, 0); // not more state
```

## Custom hooks

When two components share logic, extract it into a function that starts with `use`:

```jsx
function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  return [on, () => setOn((v) => !v)];
}
```
$md$),
('react-in-depth', 3, 'Effects & data fetching', 45, $md$
Effects let a component **synchronise with something outside React**: the network, a timer, the browser's title.

```jsx
useEffect(() => {
  const controller = new AbortController();

  fetch(`/api/courses/${id}`, { signal: controller.signal })
    .then((res) => res.json())
    .then(setCourse)
    .catch((err) => {
      if (err.name !== "AbortError") setError(err);
    });

  return () => controller.abort();   // cleanup
}, [id]);
```

## The dependency array

- `[]` — run once after the first render
- `[id]` — run again whenever `id` changes
- omitted — run after *every* render (rarely what you want)

## You might not need an effect

If you're computing something from props or state, do it during render. If you're responding to a click, do it in the event handler. Effects are for talking to the outside world.

> For production data fetching, libraries like TanStack Query handle caching, retries, and deduplication for you.
$md$),
('react-in-depth', 4, 'Composition & context', 40, $md$
Passing props through five layers of components just to reach one is called **prop drilling**. Context gives deeply nested components direct access to shared data.

```jsx
const ThemeContext = createContext("light");

function App() {
  const [theme, setTheme] = useState("light");
  return (
    <ThemeContext.Provider value={theme}>
      <Page />
    </ThemeContext.Provider>
  );
}

function Button() {
  const theme = useContext(ThemeContext);
  return <button className={`btn-${theme}`}>Click</button>;
}
```

## Use context sparingly

Every consumer re-renders when the value changes. Good fits: current user, theme, locale. Poor fits: fast-changing values like form input.

## Composition beats configuration

Instead of a component with twenty props, accept `children`:

```jsx
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Anything you like</Card.Body>
</Card>
```

Small pieces that fit together stay flexible as requirements change.
$md$),

-- TypeScript ---------------------------------------------------------------------------------
('typescript-fundamentals', 1, 'Why TypeScript?', 20, $md$
TypeScript is JavaScript plus a **static type checker**. It analyses your code *before* it runs and points out mistakes — then erases the types, leaving plain JavaScript.

```ts
function total(price: number, quantity: number): number {
  return price * quantity;
}

total("12", 3);
//    ~~~~ Argument of type 'string' is not assignable to parameter of type 'number'.
```

## What you gain

- Bugs caught in the editor instead of in production
- Autocomplete that actually knows your data
- Refactors you can trust — rename something and the compiler finds every use
- Types as living documentation

## What it doesn't do

Types disappear at runtime. TypeScript can't stop a server from sending you a surprise shape — that's what **validation** (with a library like Zod) is for.
$md$),
('typescript-fundamentals', 2, 'Types, interfaces & unions', 35, $md$
## Describe an object's shape

```ts
interface Course {
  id: string;
  title: string;
  level: "beginner" | "intermediate" | "advanced";
  description?: string;   // optional
}
```

## Union types

A value that can be one of several things:

```ts
type Status = "idle" | "loading" | "error";

function label(value: string | number) {
  if (typeof value === "string") return value.toUpperCase();  // narrowed to string
  return value.toFixed(2);                                    // narrowed to number
}
```

Checking a value narrows its type inside that branch.

## Type vs interface

For object shapes they're nearly interchangeable. Use `interface` for things that might be extended; use `type` for unions, tuples, and everything else.

## Avoid `any`

`any` switches the checker off. When you truly don't know a type yet, use `unknown` and narrow it before use.
$md$),
('typescript-fundamentals', 3, 'Generics', 40, $md$
Generics let a function or type work with **many types while staying type-safe**.

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const n = first([1, 2, 3]);        // number | undefined
const s = first(["a", "b"]);       // string | undefined
```

`T` is a placeholder the compiler fills in from how you call the function.

## Generic types

```ts
interface ApiResponse<T> {
  data: T;
  error: string | null;
}

type CourseResponse = ApiResponse<Course>;
```

## Constraints

Limit what `T` can be with `extends`:

```ts
function pluck<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

pluck({ id: 1, title: "Intro" }, "title");   // string
```

## Built-in helpers

`Partial<T>`, `Pick<T, K>`, `Omit<T, K>`, and `Record<K, V>` are generics you'll reach for daily.
$md$),

-- Node ---------------------------------------------------------------------------------------
('nodejs-rest-apis', 1, 'Your first HTTP server', 30, $md$
Node.js runs JavaScript outside the browser. Its built-in `http` module is all you need to answer requests:

```js
import { createServer } from "node:http";

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Hello from Node" }));
});

server.listen(3000, () => console.log("Listening on http://localhost:3000"));
```

Run it with `node server.js` and open the URL.

## What's in a request?

- **Method** — `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- **URL** — the path and query string
- **Headers** — metadata such as `Content-Type` and `Authorization`
- **Body** — data sent by the client

## Why use a framework?

Routing, body parsing, and error handling by hand get tedious fast. Express wraps all of that in a tiny, familiar API — which is where we go next.
$md$),
('nodejs-rest-apis', 2, 'REST routes with Express', 40, $md$
REST maps **resources** (nouns) to URLs and **actions** to HTTP methods.

| Method | Path | Action |
| --- | --- | --- |
| GET | `/courses` | List courses |
| GET | `/courses/:id` | Read one |
| POST | `/courses` | Create |
| PATCH | `/courses/:id` | Update |
| DELETE | `/courses/:id` | Remove |

```js
import express from "express";

const app = express();
app.use(express.json());

app.get("/courses/:id", (req, res) => {
  const course = courses.find((c) => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found" });
  res.json(course);
});

app.post("/courses", (req, res) => {
  const course = { id: crypto.randomUUID(), ...req.body };
  courses.push(course);
  res.status(201).json(course);
});
```

## Use the right status codes

`200` OK · `201` Created · `400` Bad request · `401` Unauthenticated · `403` Forbidden · `404` Not found · `500` Server error
$md$),
('nodejs-rest-apis', 3, 'Validation & error handling', 35, $md$
**Never trust input.** Anything that arrives in `req.body`, `req.params`, or `req.query` is attacker-controlled until you've validated it.

```js
import { z } from "zod";

const courseSchema = z.object({
  title: z.string().min(2).max(200),
  level: z.enum(["beginner", "intermediate", "advanced"]),
});

app.post("/courses", (req, res) => {
  const parsed = courseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }
  // parsed.data is now typed and safe to use
});
```

## One place for errors

```js
app.use((err, req, res, next) => {
  console.error(err);                                 // full detail stays on the server
  res.status(500).json({ error: "Something went wrong" });   // generic message to the client
});
```

Never leak stack traces or database errors to the client — they hand attackers a map of your system.
$md$),

-- SQL ----------------------------------------------------------------------------------------
('sql-and-databases', 1, 'Tables & SELECT', 30, $md$
A relational database stores data in **tables**: columns define the fields, and each row is one record.

```sql
select title, level
from courses;
```

`select` chooses the columns, `from` chooses the table. Use `*` for every column while exploring — but list columns explicitly in real code.

## Aliases

```sql
select title as course_title, duration_minutes / 60.0 as hours
from courses;
```

## Distinct values

```sql
select distinct level from courses;
```

## Keys

- A **primary key** uniquely identifies each row
- A **foreign key** points at a row in another table, creating a relationship

Good schemas store each fact **once** and connect tables with keys instead of copying data around.
$md$),
('sql-and-databases', 2, 'Filtering & sorting', 30, $md$
Narrow results with `where`, order them with `order by`, and page through them with `limit`.

```sql
select title, level, duration_minutes
from courses
where level = 'beginner'
  and duration_minutes <= 180
order by duration_minutes desc
limit 10 offset 0;
```

## Handy operators

| Operator | Example |
| --- | --- |
| `in` | `level in ('beginner', 'intermediate')` |
| `between` | `duration_minutes between 60 and 120` |
| `like` / `ilike` | `title ilike '%react%'` |
| `is null` | `track_id is null` |

## NULL is special

`null` means *unknown*, so `track_id = null` is never true. Always use `is null` or `is not null`.

## Order of writing vs. running

You write `select … from … where … order by`, but the database filters with `where` **before** it picks columns — which is why you can't use a `select` alias inside `where`.
$md$),
('sql-and-databases', 3, 'Joins', 45, $md$
Joins combine rows from tables that share a key.

```sql
select c.title, cat.name as category
from courses c
join categories cat on cat.id = c.category_id;
```

## Which join?

- **`inner join`** (the default `join`) — only rows that match on both sides
- **`left join`** — every row from the left table, plus matches from the right (or `null`)

```sql
-- Every category, even those with no courses yet
select cat.name, count(c.id) as course_count
from categories cat
left join courses c on c.category_id = cat.id
group by cat.name;
```

## Debugging joins

If row counts explode, you've probably joined on a column that isn't unique on one side. Check with `count(*)` before and after each join.

> Tip: give tables short aliases (`c`, `cat`) and always prefix columns with them. Future you will be grateful.
$md$),
('sql-and-databases', 4, 'Aggregation with GROUP BY', 40, $md$
Aggregate functions collapse many rows into one value: `count`, `sum`, `avg`, `min`, `max`.

```sql
select level,
       count(*)                 as courses,
       round(avg(duration_minutes)) as avg_minutes
from courses
where published
group by level
order by courses desc;
```

## WHERE vs HAVING

- `where` filters **rows** before grouping
- `having` filters **groups** after aggregating

```sql
select track_id, count(*) as courses
from courses
group by track_id
having count(*) >= 3;
```

## Window functions (a taste)

Need a running total without collapsing rows?

```sql
select title,
       duration_minutes,
       sum(duration_minutes) over (order by created_at) as running_total
from courses;
```

Once GROUP BY feels natural, window functions are the next big step up.
$md$),

-- Figma --------------------------------------------------------------------------------------
('figma-for-beginners', 1, 'The Figma interface', 20, $md$
Figma is a browser-based design tool built around **frames** — containers that represent screens.

## Your workspace

- **Left panel** — layers and pages
- **Canvas** — the infinite design surface
- **Right panel** — design properties and prototyping
- **Toolbar** — move, frame, shapes, text, and pen tools

## Essential shortcuts

| Shortcut | Action |
| --- | --- |
| `F` | Frame tool |
| `R` / `O` / `T` | Rectangle / Ellipse / Text |
| `Ctrl/⌘ + D` | Duplicate |
| `Ctrl/⌘ + G` | Group |
| `Shift + A` | Add auto layout |

## Start with a frame

Press `F` and pick a preset such as *iPhone 15* or *Desktop*. Everything you design for that screen lives inside its frame, so it can be exported and prototyped as a unit.
$md$),
('figma-for-beginners', 2, 'Auto layout', 35, $md$
**Auto layout** makes designs behave like real UI: spacing stays consistent and frames grow or shrink with their content.

## Try it

1. Draw a rectangle and add a text layer on top.
2. Select both and press `Shift + A`.
3. Change the text — the button resizes itself.

## The controls that matter

- **Direction** — horizontal or vertical stack
- **Gap** — space between children
- **Padding** — space inside the frame
- **Resizing** — *Hug contents* (shrink to fit) or *Fill container* (stretch)

## Nest it

A card is an auto layout frame containing an image, a text stack (also auto layout), and a button row. Nesting auto layout frames is how you build entire screens that adapt when copy changes.

> Designers who use auto layout hand off files developers can implement almost one-to-one — it mirrors Flexbox.
$md$),
('figma-for-beginners', 3, 'Prototyping', 35, $md$
Prototypes turn static screens into a **clickable flow** you can put in front of real users before any code is written.

## Connect screens

1. Switch to the **Prototype** tab in the right panel.
2. Drag from a button's connection handle to another frame.
3. Choose a trigger (*On click*) and an animation (*Smart animate* is great for polish).

## Smart animate

Give two frames layers with the **same names**, change a property (position, size, colour), and Figma animates the difference automatically.

## Test it

Press the **Play** button, click through the flow, then watch someone else try it *without helping them*. Where they hesitate is where your design needs work.

## Keep prototypes honest

Prototype the paths that answer a question, not every possible screen. A rough flow that tests an idea beats a polished one built too late.
$md$),

-- UX research --------------------------------------------------------------------------------
('ux-research-basics', 1, 'Why user research matters', 20, $md$
Teams don't usually fail because they can't build — they fail because they built the **wrong thing**. Research is the cheapest way to find out early.

## Two big questions

- **Generative research** asks *what should we build?* (interviews, field studies)
- **Evaluative research** asks *did we build it well?* (usability tests)

## Start with a decision

Good research starts from a decision the team must make:

> "Should onboarding ask for a company name up front, or later?"

A vague goal like "learn about users" produces vague answers.

## Behaviour beats opinion

What people **do** is more reliable than what they **say** they'd do. Ask about the last time something happened, not what they'd hypothetically want.

## Small samples still work

Five participants surface most major usability problems in a single round. Run small rounds often instead of one enormous study.
$md$),
('ux-research-basics', 2, 'Running a user interview', 35, $md$
A great interview feels like a conversation, and the interviewer mostly listens.

## Prepare

- Write 5–7 open-ended questions tied to your decision
- Ask permission to record and explain how notes will be used
- Bring a note-taker if you can

## Ask about the past

| Weak | Strong |
| --- | --- |
| "Would you use a budgeting app?" | "Tell me about the last time you tracked your spending." |
| "Do you like this design?" | "Walk me through what you'd do first here." |

## Techniques

1. **Follow up** with *"Can you tell me more about that?"*
2. **Embrace silence** — people fill it with their best insights
3. **Avoid leading questions** — never suggest the answer
4. **Ask "why" gently** — *"What made that frustrating?"*

## After the session

Write down the top three things you learned **within an hour**, while the details are fresh.
$md$),
('ux-research-basics', 3, 'Turning notes into insights', 30, $md$
Raw notes aren't findings. **Synthesis** turns observations into patterns the team can act on.

## Affinity mapping

1. Write each observation on its own sticky note (physical or digital).
2. Group notes that feel related.
3. Name each group with a short *insight*, not a topic.

A topic is *"Onboarding."* An insight is *"New users abandon setup when asked for a credit card before seeing value."*

## Strong insight formula

**Who** + **what they do or feel** + **why it matters**

## Prioritise

Rate each insight by **frequency** (how many people) and **severity** (how badly it hurts). Fix what's frequent and severe first.

## Share so it gets used

Reports nobody reads change nothing. Lead with the three most important insights, include a short clip or quote for each, and end with a clear recommendation.
$md$),

-- UI design principles -----------------------------------------------------------------------
('ui-design-principles', 1, 'Hierarchy & contrast', 30, $md$
Users scan before they read. **Visual hierarchy** tells them what matters most.

## Tools of hierarchy

- **Size** — bigger feels more important
- **Weight** — bold draws the eye
- **Colour & contrast** — high contrast pops; low contrast recedes
- **Position** — top-left is seen first in left-to-right languages
- **Space** — isolated elements get attention

## The squint test

Blur your eyes at a screen. Can you still tell what the primary action is? If everything blends together, nothing has priority.

## One primary action per view

A screen with three equally loud buttons has no primary action. Use **primary**, **secondary**, and **tertiary** button styles deliberately:

| Level | Style |
| --- | --- |
| Primary | Filled with brand colour |
| Secondary | Outlined |
| Tertiary | Text only |

## Accessibility check

Text needs a contrast ratio of at least **4.5:1** against its background (3:1 for large text). Never rely on colour alone to convey meaning.
$md$),
('ui-design-principles', 2, 'Spacing & typography', 35, $md$
Consistency is what makes interfaces look professional — and consistency comes from **scales**.

## A spacing scale

Pick a base unit and multiply it: `4, 8, 12, 16, 24, 32, 48, 64`. Only use values from the scale. Related items get less space; unrelated groups get more (the **proximity** principle).

## A type scale

```text
Caption   12px
Body      16px
Subhead   20px
Heading   28px
Display   40px
```

## Typography rules of thumb

- Body text: 16px minimum, line-height **1.5**
- Line length: **45–75 characters** for comfortable reading
- Limit yourself to **one or two typefaces**
- Use weight and size for hierarchy before reaching for colour

## Align relentlessly

Left-align text and snap elements to a grid. Misalignments of even a few pixels make a layout feel sloppy.
$md$),
('ui-design-principles', 3, 'Building a colour system', 35, $md$
Random colours make a UI feel chaotic. A **system** makes it feel intentional.

## The parts of a palette

1. **Neutrals** — 8–10 greys for text, borders, and backgrounds
2. **Brand / primary** — your main accent, in several shades
3. **Semantic colours** — success (green), warning (amber), danger (red), info (blue)

## Build shades, not one-offs

Generate a scale from 50 (lightest) to 900 (darkest) for each hue, and use lighter shades for backgrounds and darker for text on them.

## Use colour with purpose

- 60% neutrals, 30% secondary surfaces, 10% accent is a great starting ratio
- Reserve the accent for what's interactive
- Keep red for errors and destructive actions

## Design for dark mode from the start

Define colours as **roles** (`background`, `foreground`, `muted`, `border`) rather than raw values. Swapping a theme then means changing the role definitions, not every component.
$md$),

-- Intro to data science ----------------------------------------------------------------------
('intro-to-data-science', 1, 'What is data science?', 20, $md$
Data science is the practice of **asking useful questions and answering them with data**. It blends statistics, programming, and domain knowledge.

## The workflow

1. **Ask** a question that matters
2. **Collect** the data that could answer it
3. **Clean** it — this is usually most of the work
4. **Explore** and analyse
5. **Communicate** what you found

## Good questions are specific

| Vague | Specific |
| --- | --- |
| "How is our app doing?" | "Did weekly active users grow after the redesign?" |
| "Why do customers leave?" | "Which plan has the highest 90-day churn?" |

## Correlation is not causation

Ice cream sales and sunburns rise together — hot weather drives both. Before claiming one thing *causes* another, look for confounding factors and, where possible, run an experiment.

## Skills you'll build here

Python for data handling, **pandas** for tables, and clear thinking about what numbers really tell you.
$md$),
('intro-to-data-science', 2, 'Python basics for data', 40, $md$
Python reads almost like English, which makes it the favourite language of data people.

```python
courses = ["HTML", "JavaScript", "React"]
hours = {"HTML": 3, "JavaScript": 4, "React": 5}

total = 0
for name in courses:
    total += hours[name]

print(f"Total: {total} hours")
```

## Core structures

- **List** — ordered, changeable: `[1, 2, 3]`
- **Dict** — key → value: `{"name": "Ada"}`
- **Tuple** — ordered, fixed: `(1, 2)`
- **Set** — unique items: `{1, 2, 3}`

## Comprehensions

A compact way to build lists:

```python
long_courses = [name for name, h in hours.items() if h >= 4]
```

## Functions

```python
def average(values):
    return sum(values) / len(values)

average(hours.values())   # 4.0
```

Indentation is part of Python's syntax — use four spaces consistently.
$md$),
('intro-to-data-science', 3, 'Your first analysis with pandas', 50, $md$
**pandas** gives Python a spreadsheet-like superpower: the `DataFrame`.

```python
import pandas as pd

df = pd.read_csv("courses.csv")

df.head()          # first five rows
df.info()          # columns, types, missing values
df.describe()      # summary statistics
```

## Clean

```python
df = df.drop_duplicates()
df["duration_minutes"] = df["duration_minutes"].fillna(df["duration_minutes"].median())
df["level"] = df["level"].str.lower().str.strip()
```

## Ask questions

```python
# Average duration by level
df.groupby("level")["duration_minutes"].mean().round()

# The five longest courses
df.sort_values("duration_minutes", ascending=False).head(5)
```

## Your mini-project

Pick any CSV (open data portals are full of them), then write down **three questions** and answer each with pandas. Finish with a two-sentence summary of what you learned — that's data science.
$md$),

-- Data visualisation -------------------------------------------------------------------------
('data-visualization-basics', 1, 'Choosing the right chart', 25, $md$
The best chart depends on the **question** you're answering.

| You want to show… | Use a… |
| --- | --- |
| Change over time | Line chart |
| Comparison between categories | Bar chart |
| Part of a whole (few parts) | Stacked bar or donut |
| Relationship between two numbers | Scatter plot |
| Distribution | Histogram |

## Charts to avoid

- **3D charts** distort proportions
- **Pie charts with many slices** are impossible to compare — a sorted bar chart is almost always clearer
- **Dual axes** invite misleading comparisons

## Start bars at zero

Bar length encodes value, so truncating the axis exaggerates differences. Lines are more forgiving because position, not length, carries the message.

## Ask first

Before opening any tool, finish this sentence: *"I want the reader to see that ______."* Then pick the chart that makes that obvious.
$md$),
('data-visualization-basics', 2, 'Design for clarity', 30, $md$
Every element in a chart should earn its place. Edward Tufte called the useless bits **chartjunk**.

## Declutter

- Remove heavy gridlines and borders
- Label lines directly instead of using a distant legend
- Drop redundant decimals and units
- Use light grey for context, colour for the focus

## Use colour to guide the eye

Grey out everything except the series that carries your message, then highlight that one in a strong colour. The reader knows where to look in a second.

## Write titles that say something

| Descriptive | Insightful |
| --- | --- |
| "Signups by month" | "Signups doubled after the June launch" |

## Accessibility

- Don't rely on red vs green alone — about 1 in 12 men are colour-blind
- Ensure text contrast is high
- Add alt text or a data table for screen readers
$md$),
('data-visualization-basics', 3, 'Telling a story with data', 30, $md$
Numbers persuade when they're wrapped in a **narrative**.

## A simple structure

1. **Context** — where are we, and why does it matter?
2. **Conflict** — what changed or what's the problem?
3. **Resolution** — what should we do about it?

## One message per slide

Each chart supports one point. If you need a paragraph to explain a chart, split it into two.

## Know your audience

- **Executives** want the conclusion first and the evidence second
- **Analysts** want methodology and the ability to dig deeper
- **The public** wants simplicity and human context

## End with an action

Great data stories finish with *"so what?"* — a recommendation, a decision, or a next experiment. If nobody does anything differently afterwards, the analysis hasn't done its job.
$md$),

-- SEO ----------------------------------------------------------------------------------------
('seo-fundamentals', 1, 'How search engines work', 20, $md$
Search engines do three things: **crawl**, **index**, and **rank**.

1. **Crawling** — bots follow links to discover pages
2. **Indexing** — the engine analyses and stores what it found
3. **Ranking** — when someone searches, it orders the most helpful results

## What helps crawlers

- A clear internal linking structure
- An XML **sitemap**
- Fast, mobile-friendly pages
- A sensible `robots.txt` (don't accidentally block your whole site!)

## What ranking rewards

Search engines try to surface the most **helpful, trustworthy** result. That usually means content that matches the searcher's *intent*, is written by someone credible, loads quickly, and is linked to by other reputable sites.

## Search intent

| Intent | Example query |
| --- | --- |
| Informational | "how to learn SQL" |
| Navigational | "product x login" |
| Commercial | "best SQL courses" |
| Transactional | "enrol SQL course" |

Match your page type to the intent behind the keyword.
$md$),
('seo-fundamentals', 2, 'Keyword research', 35, $md$
Keyword research reveals **what your audience is actually searching for**, in their words.

## Find ideas

- Start with your own expertise and customer questions
- Use a keyword tool to see volume and related searches
- Look at Google's *People also ask* and autocomplete
- See what already ranks for your topic

## Evaluate each keyword

1. **Relevance** — does it match what you offer?
2. **Intent** — what does the searcher want?
3. **Volume** — how often is it searched?
4. **Difficulty** — can you realistically compete?

## Go long-tail

"SQL course" is fiercely competitive. "SQL joins tutorial for beginners" is specific, easier to rank for, and attracts people closer to a decision.

## Group into topics

Cluster related keywords around one **pillar page** with supporting articles that link back to it. Search engines reward depth on a topic more than scattered one-off posts.
$md$),
('seo-fundamentals', 3, 'On-page SEO', 35, $md$
On-page SEO is everything you control on the page itself.

## The essentials

- **Title tag** — include the main keyword, keep it under ~60 characters
- **Meta description** — a compelling summary that earns the click
- **One `<h1>`** that matches the page's purpose
- **Descriptive URLs** — `/sql-joins-tutorial`, not `/p?id=4821`
- **Alt text** on meaningful images
- **Internal links** with descriptive anchor text

```html
<title>SQL Joins Explained for Beginners | product x</title>
<meta name="description" content="Learn inner and left joins with clear examples and practice queries." />
```

## Write for people first

Answer the question completely, use clear headings, and keep paragraphs short. Don't stuff keywords — it reads badly and can hurt rankings.

## Page experience

Fast loading, mobile-friendly layout, and stable visuals (no content jumping around) all contribute. Measure with Core Web Vitals and fix the biggest issue first.
$md$),

-- Content marketing --------------------------------------------------------------------------
('content-marketing', 1, 'Building a content strategy', 25, $md$
Content marketing attracts and retains an audience by being **genuinely useful**, not by shouting about your product.

## Start with the audience

Define who you're helping and the problems they're trying to solve. Interview a few customers — their exact wording becomes your best headlines.

## Set a goal you can measure

| Goal | Metric |
| --- | --- |
| Awareness | Organic traffic, reach |
| Engagement | Time on page, return visits |
| Leads | Signups, downloads |
| Revenue | Conversions from content |

## Choose pillars

Pick 3–4 topics you can be the best resource on, and map content to each stage of the journey: **awareness → consideration → decision**.

## Build a calendar

Consistency beats bursts. Decide a cadence you can *sustain* — one excellent post a week beats ten mediocre ones followed by silence.
$md$),
('content-marketing', 2, 'Writing content that earns attention', 35, $md$
Most content fails because it's generic. Great content is **specific, useful, and easy to read**.

## Craft the headline

Promise a clear benefit and be honest about it. *"7 SQL Mistakes That Slow Down Your Queries"* beats *"Some Thoughts on Databases."*

## Structure for scanners

- Lead with the most important point
- Short paragraphs, descriptive subheadings
- Bullets and examples, not walls of text
- One idea per section

## Add something original

Anyone can summarise the top results. Stand out with **original data, real examples, a strong opinion, or first-hand experience**.

## End with a next step

Tell readers what to do next — read a related guide, download a template, or start a free trial. Every piece should have one clear call to action.

## Edit ruthlessly

Cut every sentence that doesn't help the reader. Then read it aloud; if you stumble, rewrite it.
$md$),
('content-marketing', 3, 'Measuring what matters', 25, $md$
It's easy to drown in metrics. Track the few that connect content to **business outcomes**.

## Vanity vs. useful

- **Vanity:** total pageviews, follower counts
- **Useful:** conversion rate, qualified leads, assisted revenue, return visitors

## A simple reporting loop

1. Pick one goal per piece of content
2. Track it with a clear event (signup, download, click)
3. Review monthly: what worked, what didn't?
4. Double down on winners, refresh or retire losers

## Refresh before you create

Updating a post that already ranks — with new examples, fixed facts, and better structure — often beats writing a brand-new one.

## Test, don't guess

Try two headlines or two calls to action and measure which converts better. Small, steady improvements compound into a big advantage over a year.
$md$),

-- Project management -------------------------------------------------------------------------
('project-management-basics', 1, 'The project lifecycle', 25, $md$
A project is a **temporary effort with a defined outcome**. Most follow five phases:

1. **Initiate** — define the goal, sponsor, and success criteria
2. **Plan** — scope, schedule, budget, and resources
3. **Execute** — do the work and coordinate the team
4. **Monitor** — track progress and manage change
5. **Close** — deliver, review, and capture lessons learned

## The triple constraint

Scope, time, and cost are linked. Increase scope without more time or money and quality suffers. Part of your job is making these trade-offs **visible**.

## Waterfall vs. agile

| Waterfall | Agile |
| --- | --- |
| Plan everything up front | Plan in short iterations |
| Best when requirements are stable | Best when learning as you go |
| Change is costly | Change is expected |

Many teams blend both: firm goals and deadlines, flexible delivery.

## Define "done"

Write down what success looks like before you start. Ambiguity about the finish line is the most common cause of endless projects.
$md$),
('project-management-basics', 2, 'Scoping & planning', 35, $md$
A plan turns a goal into **work someone can start tomorrow**.

## Break it down

Use a **work breakdown structure**: split the project into deliverables, then split each into tasks small enough to finish in a few days.

```text
Launch new website
├── Design
│   ├── Wireframes
│   └── Visual design
├── Build
│   ├── Homepage
│   └── Course pages
└── Launch
    ├── QA
    └── Announce
```

## Estimate honestly

- Ask the people who will do the work
- Use ranges (*3–5 days*), not single numbers
- Add a buffer for the unexpected

## Map dependencies

Some tasks can't start until others finish. The longest chain of dependent tasks is the **critical path** — a delay there delays the whole project.

## Write the scope down

List what's **in** and what's **out**. When someone asks for something new, you'll have a calm, shared reference for the conversation.
$md$),
('project-management-basics', 3, 'Risks & stakeholder communication', 30, $md$
Things go wrong on every project. Good managers see problems **early**.

## A lightweight risk register

| Risk | Likelihood | Impact | Response |
| --- | --- | --- | --- |
| Key developer unavailable | Medium | High | Document work, cross-train |
| Requirements change late | High | Medium | Weekly scope review |

Review it regularly — risks change as the project does.

## Know your stakeholders

Map people by **influence** and **interest**. Keep high-influence stakeholders closely informed; keep others updated proportionally.

## Communicate on a rhythm

- **Weekly status:** progress, next steps, blockers, risks
- **Milestone reviews:** demos and decisions
- **Immediate escalation:** anything threatening the deadline or budget

## No surprises

Bad news doesn't improve with age. Share it early, with a proposed solution, and stakeholders will trust you far more than if they hear it last.
$md$)

) as v(course_slug, "position", title, duration, content)
join public.courses c on c.slug = v.course_slug
on conflict (id) do update set
  title = excluded.title,
  content = excluded.content,
  "position" = excluded."position",
  duration_minutes = excluded.duration_minutes;

-- Keep course duration in sync with its lessons.
update public.courses c
set duration_minutes = coalesce((select sum(l.duration_minutes) from public.lessons l where l.course_id = c.id), 0)
where c.slug in (
  'html-css-fundamentals','javascript-essentials','react-in-depth','typescript-fundamentals',
  'nodejs-rest-apis','sql-and-databases','figma-for-beginners','ux-research-basics',
  'ui-design-principles','intro-to-data-science','data-visualization-basics','seo-fundamentals',
  'content-marketing','project-management-basics'
);
