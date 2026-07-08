# StreamFlix — Architecture

A Netflix-style video streaming platform. Next.js frontend, Express + MongoDB backend,
and Amazon S3 for media, with direct-to-S3 chunked uploads and a backend streaming proxy.

> All diagrams below are [Mermaid](https://mermaid.js.org/) and render inline on GitHub.

---

## 1. System Overview

```mermaid
flowchart TB
    subgraph Client["Browser (Next.js 16 · React 19)"]
        UI["Pages & Components<br/>home · movies · watch · admin"]
        RQ["React Query hooks"]
        AX["axios instance<br/>(JWT + FormData interceptor)"]
        IDB[("IndexedDB<br/>thumbnail blob cache")]
        UI --> RQ --> AX
        UI --> IDB
    end

    subgraph Server["Express 5 API (backend)"]
        MW["Middleware<br/>cors · cookieParser · auth · validate · error"]
        R["Routers<br/>/api/auth · /api/users · /api/movies"]
        C["Controllers"]
        S["Services"]
        SIGN["signMovie util<br/>(presigned GET URLs)"]
        MW --> R --> C --> S
        C --> SIGN
    end

    DB[("MongoDB (Atlas)<br/>Mongoose 9<br/>users · movies · watchHistory")]
    S3[("Amazon S3<br/>streamflix-media<br/>eu-north-1")]

    AX -- "HTTPS · Bearer JWT" --> MW
    S -- "Mongoose ODM" --> DB
    C -- "presign / multipart" --> S3
    AX -- "PUT chunks (presigned)" --> S3
    AX -- "stream video (proxy)" --> R
    C -- "range proxy" --> S3
    IDB -. "miss → fetch presigned GET" .-> S3

    classDef store fill:#1f2937,stroke:#4b5563,color:#e5e7eb;
    class DB,S3,IDB store;
```

**Layering (backend):** `routes → controllers → services → models`. Cross-cutting helpers
live in `utils/` (`s3.js`, `signMovie.js`, token generators) and `middleware/`.

---

## 2. Direct-to-S3 Chunked Upload (admin)

Large video files never pass through the API server. The browser requests presigned URLs,
uploads parts straight to S3 in parallel, then tells the backend to finalize.

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser (admin)
    participant API as Express API
    participant S3 as Amazon S3
    participant DB as MongoDB

    Note over B,S3: Thumbnail (single presigned PUT)
    B->>API: POST /movies/:id/thumbnail/presign
    API->>S3: getPresignedPutUrl(key)
    S3-->>API: presigned PUT URL
    API-->>B: { url, key }
    B->>S3: PUT image bytes (direct)
    S3-->>B: 200 OK
    B->>API: POST /movies/:id/thumbnail/confirm { key }
    API->>DB: save thumbnail.key
    API-->>B: updated movie

    Note over B,S3: Video (S3 Multipart Upload)
    B->>API: POST /movies/:id/video/initiate { parts }
    API->>S3: CreateMultipartUpload
    API->>S3: presign UploadPart × N
    S3-->>API: uploadId + part URLs
    API-->>B: { uploadId, key, urls[] }
    par up to 3 concurrent parts
        B->>S3: PUT part 1 (10 MB chunk)
        S3-->>B: 200 + ETag
    and
        B->>S3: PUT part 2 (10 MB chunk)
        S3-->>B: 200 + ETag
    end
    B->>API: POST /movies/:id/video/complete { uploadId, parts[ETag] }
    API->>S3: CompleteMultipartUpload
    API->>DB: setMovieVideo(key) + delete old key
    API-->>B: updated movie
    Note over B,API: on failure → POST /video/abort → AbortMultipartUpload
```

**Client details** (`lib/upload.ts`): `CHUNK_SIZE = 10 MB`, `CONCURRENCY = 3`, worker-pool
collects ETags, aborts the whole upload on any part failure. Progress is throttled to
whole-percent changes (`throttleProgress`) to avoid a React setState storm that crashed the tab.
S3 bucket CORS exposes the `ETag` header so the browser can read it back.

---

## 3. Video Streaming (proxy, not presigned)

Playback goes through the API so a long movie can't die mid-stream when a presigned URL expires.

```mermaid
sequenceDiagram
    autonumber
    participant V as "&lt;video&gt; element"
    participant API as Express API
    participant S3 as Amazon S3

    V->>API: GET /api/movies/:id/video<br/>Range: bytes=0-
    API->>S3: GetObject (Range forwarded)
    S3-->>API: 206 Partial Content + bytes
    API-->>V: 206 + Content-Range / Accept-Ranges
    Note over V,API: browser seeks → new Range request → same path
```

`streamMovie` defaults a missing `Range` header to `bytes=0-` (never 400s) and pipes S3's
partial-content response straight back to the `<video>` element.

---

## 4. Media Read Path & Thumbnail Caching

The S3 bucket is **private** — every read URL is a short-lived (1h) presigned GET, signed on
the fly for every list/detail endpoint. Thumbnails are then cached client-side by their stable
S3 key, because the presigned URL signature changes on every response and defeats the HTTP cache.

```mermaid
flowchart LR
    subgraph API["API read endpoints"]
        EP["getPublicMovies · getFeaturedMovie<br/>getLatestMovies · getMovieById · ..."]
        SM["signMovieMedia()<br/>thumbnail.url / video.url ← presigned GET"]
        EP --> SM
    end

    subgraph FE["Frontend"]
        CI["&lt;CachedImage cacheKey=thumbnail.key&gt;"]
        IDB[("IndexedDB<br/>streamflix-media / thumbnails")]
    end

    SM -- "movie JSON + presigned URLs" --> CI
    CI -- "1 lookup by key" --> IDB
    IDB -- "hit → objectURL" --> CI
    CI -- "miss → fetch(presigned) → store blob" --> IDB

    classDef store fill:#1f2937,stroke:#4b5563,color:#e5e7eb;
    class IDB store;
```

Key idea: **presigned URL = transport, S3 key = cache identity.** `CachedImage` looks up the
blob by `cacheKey` first, fetches the presigned URL only on a miss, then stores the blob for reuse.

---

## 5. Authentication (JWT access + refresh)

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser
    participant API as Express API
    participant DB as MongoDB

    B->>API: POST /api/auth/login { email, password }
    API->>DB: find user · bcrypt compare
    API-->>B: access token (JWT) + refresh token (httpOnly cookie)
    Note over B,API: access token attached as Bearer on every request
    B->>API: request with expired access token
    API-->>B: 401
    B->>API: POST /api/auth/refresh-token (cookie)
    API-->>B: new access token
    Note over API: authorize("admin") gates all write / upload routes
```

`authenticate` verifies the Bearer JWT; `authorize("admin")` guards every create/publish/upload
route. Public browse endpoints (`/featured`, `/latest`, `/public`, `/public/:id`, `/:id/similar`,
`/:id/video`) need no token.

---

## 6. Request Surface (routes)

| Prefix | Access | Examples |
|---|---|---|
| `/api/auth` | public | `register`, `login`, `refresh-token`, `logout` |
| `/api/users` | authenticated | `profile`, `change-password`, `avatar` |
| `/api/movies` (public) | none | `featured`, `latest`, `genres`, `public`, `public/:id`, `:id/similar`, `:id/video` |
| `/api/movies` (user) | authenticated | `continue`, `progress` |
| `/api/movies` (admin) | `authorize("admin")` | CRUD, `publish`, `feature`, `thumbnail/presign`, `thumbnail/confirm`, `video/initiate`, `video/complete`, `video/abort` |

---

## 7. Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 (Turbopack) · React 19 · TypeScript · TailwindCSS 4 · React Query · axios · react-hook-form + zod · sonner |
| Backend | Node.js (ESM) · Express 5 · Mongoose 9 · JWT · bcrypt · multer |
| Data | MongoDB Atlas |
| Media | Amazon S3 (`eu-north-1`) · presigned URLs · S3 Multipart Upload · `@aws-sdk/s3-request-presigner` |
| Client cache | IndexedDB (thumbnail blobs) |
