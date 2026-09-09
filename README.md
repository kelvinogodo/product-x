# product x

An interactive e-learning platform built with Next.js and MongoDB. Learners can browse course tracks by category, view course details, and sign up to get resources, while course data is served through a Mongoose-backed REST API.

> **Status:** work in progress — most course content is placeholder text/images and a few linked pages (e.g. `/faq`) aren't built yet.

## Features

- **Landing page** — autoplaying image carousel (Swiper), search bar, and a course listing grid.
- **Course catalog** (`/course`) — filter courses by category (data, management, programming, design) and toggle between grid and column layouts, animated with Framer Motion.
- **Course detail page** — email capture modal for requesting course resources.
- **Tracks API** — REST endpoints backed by MongoDB/Mongoose for creating, reading, updating, and deleting course tracks.

## Tech stack

- [Next.js](https://nextjs.org/) 12 (Pages Router) + React 18
- [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- [Framer Motion](https://www.framer.com/motion/) for layout animations
- [Swiper](https://swiperjs.com/) for the hero carousel
- [react-icons](https://react-icons.github.io/react-icons/) for iconography

## Getting started

1. Install dependencies:

   ```bash
   pnpm install
   # or npm install / yarn install
   ```

2. Create a `.env` file in the project root with a MongoDB connection string:

   ```bash
   MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
   ```

3. Run the development server:

   ```bash
   pnpm dev
   # or npm run dev / yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project structure

```
components/   Shared UI — Header, Footer, Layout, Landpage
pages/        Routes (index, course, id) and API routes under pages/api
models/       Mongoose schemas (Track, User)
utils/db.js   MongoDB connection setup
styles/       Global and module CSS
public/       Static assets (images, favicon)
```

## API

All track endpoints live under `/api/tracks` and are backed by the `Track` model (`slug`, `name`, `link`).

| Method | Route                | Description                    |
| ------ | --------------------- | ------------------------------- |
| GET    | `/api/tracks`         | List all tracks                 |
| PUT    | `/api/tracks`         | Create a new track              |
| GET    | `/api/tracks/[slug]`  | Get a track by slug             |
| PATCH  | `/api/tracks/[slug]`  | Update a track by slug          |
| DELETE | `/api/tracks/[slug]`  | Delete a track by slug          |

## Available scripts

- `dev` — start the Next.js development server
- `build` — build the app for production
- `start` — start the production server
- `lint` — run ESLint

## Deployment

The easiest way to deploy is via the [Vercel Platform](https://vercel.com/new). See the [Next.js deployment docs](https://nextjs.org/docs/deployment) for other options.
