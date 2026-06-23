# ETHOS STREAM — ANTIGRAVITY VIBE CODING CONTEXT
# ⚠️ DATABASE: SUPABASE (PostgreSQL-as-a-service + Auth + Storage + Realtime)

> Paste this entire file as your project context into Antigravity IDE before starting any session.
> Every new chat/session should begin with: "Using the Ethos Stream context, help me build: [your task]"

---

## PROJECT IDENTITY

**Name:** Ethos Stream
**Type:** Full-stack video streaming platform with Watch Party (Ethos Room)
**Stack:** Java 21 + Spring Boot 3.x (backend) · React 18 + Vite (frontend) · Supabase (database + auth + storage)
**Tagline:** "Stream together, feel together."
**Unique feature:** Ethos Room — a real-time watch party for up to 4 people with synced playback, live chat, and emoji reactions.

---

## SUPABASE ARCHITECTURE DECISIONS

> Supabase replaces: local PostgreSQL, AWS RDS, manual auth setup, and AWS S3 for thumbnails/avatars.
> AWS S3 is STILL used for HLS video segments (Supabase Storage has file size limits unsuitable for video).

| Concern | Old approach | Supabase approach |
|---|---|---|
| Primary database | Local PostgreSQL / AWS RDS | Supabase PostgreSQL (cloud) |
| Auth (JWT + OAuth) | Spring Security + custom JWT | Supabase Auth (handles JWT, Google OAuth, sessions) |
| Image/avatar storage | AWS S3 | Supabase Storage (buckets: `avatars`, `thumbnails`, `banners`) |
| Video HLS segments | AWS S3 | AWS S3 + CloudFront (unchanged — video too large for Supabase) |
| DB connection | JDBC via Spring Data JPA | JDBC via Spring Data JPA (Supabase exposes standard PostgreSQL connection string) |
| DB migrations | Flyway | Supabase SQL Editor OR Flyway (both work — use Flyway for version control) |
| Realtime events | Redis Pub/Sub | Supabase Realtime (Postgres changes) + Spring WebSocket for watch party sync |
| Row-level security | Manual Spring Security | Supabase RLS policies (enforce on DB level) + Spring Security for API |
| Session/cache | Redis | Redis (STILL needed for watch party room state + JWT refresh cache) |

### What this means for the codebase
- **Spring Data JPA still works** — Supabase is just PostgreSQL under the hood. All JPA entities, repositories, and JPQL queries remain the same.
- **Flyway still works** — point it at the Supabase connection string.
- **Supabase Auth** issues JWTs. The frontend uses `@supabase/supabase-js` for login/signup. The Spring Boot backend **validates Supabase JWTs** using the Supabase JWT secret (no more issuing our own tokens).
- **Supabase Storage** for avatars/thumbnails — use the Supabase JS client on the frontend for uploads; Spring Boot can use the Supabase REST API or the storage SDK for server-side uploads.
- **Redis is kept** exclusively for watch party room state pub/sub (Supabase Realtime is not suited for low-latency playback sync).

---

## MONOREPO STRUCTURE

```
ethos-stream/
├── backend/                          # Spring Boot Maven project
│   ├── src/main/java/com/ethosstream/
│   │   ├── EthosStreamApplication.java
│   │   ├── config/
│   │   │   ├── SecurityConfig.java       # Validates Supabase JWT
│   │   │   ├── SupabaseJwtFilter.java    # NEW — replaces JwtAuthFilter
│   │   │   ├── WebSocketConfig.java
│   │   │   ├── RedisConfig.java
│   │   │   └── CorsConfig.java
│   │   ├── auth/
│   │   │   ├── AuthController.java       # Thin — delegates to Supabase
│   │   │   ├── AuthService.java
│   │   │   ├── SupabaseAuthClient.java   # HTTP client to Supabase Auth REST
│   │   │   └── dto/ (LoginRequest, RegisterRequest, AuthResponse)
│   │   ├── user/
│   │   │   ├── UserController.java
│   │   │   ├── UserService.java
│   │   │   ├── UserRepository.java
│   │   │   ├── User.java                 # JPA Entity (mirrors auth.users)
│   │   │   └── Profile.java             # JPA Entity (multi-profile)
│   │   ├── content/
│   │   │   ├── ContentController.java
│   │   │   ├── ContentService.java
│   │   │   ├── ContentRepository.java
│   │   │   ├── Video.java               # JPA Entity
│   │   │   ├── Genre.java               # JPA Entity
│   │   │   └── dto/ (VideoDTO, UploadRequest)
│   │   ├── streaming/
│   │   │   ├── StreamingController.java
│   │   │   ├── HlsService.java          # FFmpeg transcoding → AWS S3
│   │   │   ├── S3Service.java           # AWS S3 (HLS video only)
│   │   │   └── SupabaseStorageService.java  # NEW — thumbnails/banners/avatars
│   │   ├── watchparty/
│   │   │   ├── RoomController.java
│   │   │   ├── RoomService.java
│   │   │   ├── RoomRepository.java
│   │   │   ├── WatchPartyWebSocketHandler.java
│   │   │   ├── Room.java               # JPA Entity
│   │   │   ├── RoomParticipant.java    # JPA Entity
│   │   │   └── dto/ (RoomEvent, SyncPayload, ChatMessage)
│   │   └── recommendation/
│   │       ├── RecommendationService.java
│   │       └── WatchHistoryRepository.java
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── application-dev.yml
│   │   ├── application-prod.yml
│   │   └── db/migration/               # Flyway SQL files
│   └── pom.xml
│
├── frontend/                           # React + Vite project
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── lib/
│   │   │   └── supabaseClient.js       # NEW — single Supabase client instance
│   │   ├── api/
│   │   │   ├── axiosInstance.js        # Attaches Supabase session token to requests
│   │   │   ├── contentApi.js
│   │   │   ├── userApi.js
│   │   │   └── watchPartyApi.js
│   │   ├── store/
│   │   │   ├── authStore.js            # Zustand — wraps Supabase Auth session
│   │   │   ├── playerStore.js
│   │   │   └── roomStore.js
│   │   ├── hooks/
│   │   │   ├── useAuth.js              # Uses Supabase Auth (supabase.auth.*)
│   │   │   ├── useWebSocket.js
│   │   │   ├── usePlayer.js
│   │   │   └── useRoom.js
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Avatar.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Skeleton.jsx
│   │   │   │   └── Toast.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── PageWrapper.jsx
│   │   │   ├── content/
│   │   │   │   ├── HeroBanner.jsx
│   │   │   │   ├── ContentRow.jsx
│   │   │   │   ├── VideoCard.jsx
│   │   │   │   └── GenreFilter.jsx
│   │   │   ├── player/
│   │   │   │   ├── EthosPlayer.jsx
│   │   │   │   ├── PlayerControls.jsx
│   │   │   │   ├── QualitySelector.jsx
│   │   │   │   └── SubtitleOverlay.jsx
│   │   │   └── watchparty/
│   │   │       ├── EthosRoom.jsx
│   │   │       ├── RoomHeader.jsx
│   │   │       ├── ParticipantBar.jsx
│   │   │       ├── ChatPanel.jsx
│   │   │       ├── ReactionOverlay.jsx
│   │   │       └── InviteModal.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── BrowsePage.jsx
│   │   │   ├── SearchPage.jsx
│   │   │   ├── VideoDetailPage.jsx
│   │   │   ├── PlayerPage.jsx
│   │   │   ├── WatchPartyPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── MyListPage.jsx
│   │   └── utils/
│   │       ├── formatTime.js
│   │       ├── roomCodeGen.js
│   │       └── syncEngine.js
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── supabase/                           # NEW — Supabase local config
│   ├── config.toml                     # supabase CLI config
│   ├── migrations/                     # Supabase SQL migrations (alternative to Flyway)
│   │   ├── 20240101_create_profiles.sql
│   │   ├── 20240102_create_content.sql
│   │   ├── 20240103_create_watchparty.sql
│   │   └── 20240104_rls_policies.sql
│   └── seed.sql                        # Optional test data
│
├── docker/
│   ├── docker-compose.yml              # Redis only (no Postgres — using Supabase)
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
└── README.md
```

---

## TECH STACK (EXACT VERSIONS)

### Backend
```xml
<!-- pom.xml key dependencies -->
<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>3.2.4</version>
</parent>

<!-- Core -->
spring-boot-starter-web
spring-boot-starter-data-jpa
spring-boot-starter-security
spring-boot-starter-websocket
spring-boot-starter-data-redis
spring-boot-starter-validation

<!-- JWT — for validating Supabase-issued JWTs -->
io.jsonwebtoken:jjwt-api:0.12.5
io.jsonwebtoken:jjwt-impl:0.12.5
io.jsonwebtoken:jjwt-jackson:0.12.5

<!-- PostgreSQL driver (connects to Supabase PostgreSQL) -->
org.postgresql:postgresql

<!-- Flyway (runs migrations against Supabase PostgreSQL) -->
org.flywaydb:flyway-core

<!-- AWS (S3 for HLS video only) -->
software.amazon.awssdk:s3:2.25.0
software.amazon.awssdk:cloudfront:2.25.0

<!-- HTTP client for Supabase Auth REST API -->
org.springframework.boot:spring-boot-starter-webflux   <!-- WebClient -->

<!-- Utils -->
org.mapstruct:mapstruct:1.5.5.Final
org.projectlombok:lombok
```

### Frontend
```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.23.0",
    "axios": "^1.7.0",
    "zustand": "^4.5.0",
    "hls.js": "^1.5.7",
    "@stomp/stompjs": "^7.0.0",
    "sockjs-client": "^1.6.1",
    "framer-motion": "^11.1.0",
    "simple-peer": "^9.11.1",
    "react-hot-toast": "^2.4.1",
    "date-fns": "^3.6.0",
    "clsx": "^2.1.0",
    "@supabase/supabase-js": "^2.43.0"
  },
  "devDependencies": {
    "vite": "^5.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

---

## SUPABASE SETUP GUIDE

### Step 1 — Create Supabase Project
1. Go to https://supabase.com → New Project
2. Name: `ethos-stream` · Region: closest to your users
3. Save the generated **database password**
4. From Project Settings → API, copy:
   - `Project URL` → `SUPABASE_URL`
   - `anon/public key` → `SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (backend only, never expose)
   - `JWT Secret` → `SUPABASE_JWT_SECRET` (Spring Boot uses this to verify tokens)

### Step 2 — Database Connection (Spring Boot)
Go to Project Settings → Database → Connection String → URI mode:
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
```
Use the **pooler (port 6543)** connection string for production (connection pooling via PgBouncer).
Use the **direct (port 5432)** connection string for Flyway migrations only.

### Step 3 — Enable Google OAuth in Supabase
Dashboard → Authentication → Providers → Google → Enable → paste Google Client ID + Secret

### Step 4 — Supabase Storage Buckets
Create these buckets in Dashboard → Storage:
- `avatars` — public bucket (profile pictures)
- `thumbnails` — public bucket (video thumbnails)
- `banners` — public bucket (hero banners)

### Step 5 — Row Level Security (RLS)
Enable RLS on all tables. Base policies in `supabase/migrations/20240104_rls_policies.sql`.

---

## DATABASE SCHEMA

> Run these in Supabase SQL Editor OR via Flyway pointing at Supabase PostgreSQL.
> Supabase automatically creates `auth.users` table — our `public.users` table mirrors/extends it.

```sql
-- ============================================================
-- NOTE: auth.users is managed by Supabase Auth automatically.
-- We create a public.users table that mirrors it via a trigger.
-- ============================================================

-- Public user profile (mirrors Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: auto-create public.users row when Supabase Auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Multi-profile support per user account
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(500),              -- Supabase Storage URL
  is_kids BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Content
-- ============================================================
CREATE TABLE public.genres (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail_url VARCHAR(500),           -- Supabase Storage URL
  banner_url VARCHAR(500),              -- Supabase Storage URL
  hls_master_url VARCHAR(500),          -- AWS S3/CloudFront URL (m3u8)
  duration_seconds INTEGER,
  release_year INTEGER,
  rating VARCHAR(10),
  type VARCHAR(20) DEFAULT 'movie',
  is_featured BOOLEAN DEFAULT FALSE,
  view_count BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.video_genres (
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
  genre_id INTEGER REFERENCES public.genres(id) ON DELETE CASCADE,
  PRIMARY KEY (video_id, genre_id)
);

-- ============================================================
-- User Activity
-- ============================================================
CREATE TABLE public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, video_id)
);

CREATE TABLE public.watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
  position_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  watched_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Watch Party (Ethos Room)
-- ============================================================
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL,
  host_profile_id UUID REFERENCES public.profiles(id),
  video_id UUID REFERENCES public.videos(id),
  status VARCHAR(20) DEFAULT 'waiting',
  current_position_seconds FLOAT DEFAULT 0,
  max_participants INTEGER DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE TABLE public.room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  UNIQUE(room_id, profile_id)
);

CREATE TABLE public.room_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id),
  content VARCHAR(500) NOT NULL,
  type VARCHAR(20) DEFAULT 'text',
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS Policies (Row Level Security)
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own row
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Profiles belong to authenticated users
CREATE POLICY "Users manage own profiles" ON public.profiles
  FOR ALL USING (user_id = auth.uid());

-- Videos and genres are public read
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Videos are public" ON public.videos FOR SELECT USING (TRUE);
CREATE POLICY "Genres are public" ON public.genres FOR SELECT USING (TRUE);
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;

-- Watchlist: profile owner only
CREATE POLICY "Watchlist owner access" ON public.watchlist
  FOR ALL USING (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Rooms: any authenticated user can read; only host can update
CREATE POLICY "Rooms public read" ON public.rooms FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Host manages room" ON public.rooms FOR UPDATE
  USING (host_profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Room chat: participants can read and insert
CREATE POLICY "Chat read by participants" ON public.room_chat_messages
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Chat insert by participants" ON public.room_chat_messages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

---

## SUPABASE AUTH INTEGRATION

### Frontend — supabaseClient.js
```js
// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Frontend — useAuth.js (Supabase-powered)
```js
// src/hooks/useAuth.js
import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuthStore } from '../store/authStore'

export function useAuth() {
  const { setSession, clearSession } = useAuthStore()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setSession(session)
    )
    return () => subscription.unsubscribe()
  }, [])

  const signUp = (email, password) =>
    supabase.auth.signUp({ email, password })

  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

  const signInWithGoogle = () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/browse` }
    })

  const signOut = () => supabase.auth.signOut()

  return { signUp, signIn, signInWithGoogle, signOut }
}
```

### Frontend — axiosInstance.js (attaches Supabase token)
```js
// src/api/axiosInstance.js
import axios from 'axios'
import { supabase } from '../lib/supabaseClient'

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL })

// Attach Supabase JWT to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

// On 401 — Supabase handles token refresh automatically
api.interceptors.response.use(
  res => res,
  async (error) => {
    if (error.response?.status === 401) {
      await supabase.auth.refreshSession()
      // Retry once
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        error.config.headers.Authorization = `Bearer ${session.access_token}`
        return api(error.config)
      }
    }
    return Promise.reject(error)
  }
)

export default api
```

### Backend — SupabaseJwtFilter.java
```java
// Validates Supabase-issued JWTs instead of issuing our own
// Supabase signs JWTs with SUPABASE_JWT_SECRET (HS256)
// Extract userId (sub claim) → look up User entity → set SecurityContext

@Component
@RequiredArgsConstructor
public class SupabaseJwtFilter extends OncePerRequestFilter {

    @Value("${ethos.supabase.jwt-secret}")
    private String supabaseJwtSecret;

    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        try {
            Claims claims = Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(supabaseJwtSecret.getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseSignedClaims(token)
                .getPayload();

            String userId = claims.getSubject(); // Supabase user UUID

            // Auto-provision user if first login (Supabase trigger handles public.users,
            // but we may need to fetch it)
            User user = userRepository.findById(UUID.fromString(userId))
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userId));

            UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (JwtException e) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
            return;
        }

        chain.doFilter(request, response);
    }
}
```

### Backend — SupabaseStorageService.java
```java
// Use Supabase Storage REST API for avatar/thumbnail uploads
// Base URL: {SUPABASE_URL}/storage/v1/object/{bucket}/{path}

@Service
@RequiredArgsConstructor
public class SupabaseStorageService {

    @Value("${ethos.supabase.url}")
    private String supabaseUrl;

    @Value("${ethos.supabase.service-role-key}")
    private String serviceRoleKey;

    private final WebClient webClient = WebClient.create();

    public String uploadFile(String bucket, String path, byte[] fileBytes, String contentType) {
        String uploadUrl = supabaseUrl + "/storage/v1/object/" + bucket + "/" + path;

        webClient.post()
            .uri(uploadUrl)
            .header("Authorization", "Bearer " + serviceRoleKey)
            .header("Content-Type", contentType)
            .bodyValue(fileBytes)
            .retrieve()
            .bodyToMono(String.class)
            .block();

        // Return the public URL
        return supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + path;
    }
}
```

---

## API CONTRACTS

### Auth API
```
# Frontend handles auth directly via Supabase JS client.
# Spring Boot backend has a thin auth endpoint only for profile sync.

POST   /api/auth/sync-profile    → called after Supabase signup to create first Profile
                                   Body: { userId, name } → ProfileDTO

# All other auth (login, register, OAuth, logout, token refresh) handled
# ENTIRELY on frontend via supabase.auth.* methods
```

### Content API
```
GET    /api/videos               → ?genre=&search=&page=&size= → Page<VideoDTO>
GET    /api/videos/featured      → VideoDTO[]
GET    /api/videos/{id}          → VideoDTO
GET    /api/videos/{id}/stream   → presigned HLS master URL (AWS CloudFront)

GET    /api/genres               → Genre[]

POST   /api/admin/videos/upload  → multipart (file, title, description, genres[])
                                   → triggers FFmpeg → S3 pipeline → VideoDTO
```

### User/Profile API
```
GET    /api/profiles             → Profile[] (for current authenticated user)
POST   /api/profiles             → { name, isKids } → Profile
PUT    /api/profiles/{id}        → { name, avatarUrl } → Profile
DELETE /api/profiles/{id}        → 204

GET    /api/profiles/{id}/watchlist          → VideoDTO[]
POST   /api/profiles/{id}/watchlist/{vid}    → 201
DELETE /api/profiles/{id}/watchlist/{vid}    → 204

GET    /api/profiles/{id}/history            → WatchHistoryDTO[]
PUT    /api/profiles/{id}/history/{vid}      → { positionSeconds, completed }
```

### Watch Party (Ethos Room) API
```
POST   /api/rooms                → { videoId, profileId } → RoomDTO
GET    /api/rooms/{code}         → RoomDTO
POST   /api/rooms/{code}/join    → { profileId } → RoomDTO
POST   /api/rooms/{code}/leave   → 204
DELETE /api/rooms/{code}         → 204 (host only)

RoomDTO: {
  id, code, videoId, videoTitle, videoThumbnail,
  hostProfileId, status, currentPositionSeconds,
  participants: [{ profileId, name, avatarUrl, isHost }],
  maxParticipants: 4
}
```

### WebSocket Topics (STOMP) — unchanged
```
CONNECT  → ws://api/ws?token={supabase_access_token}

# Client SENDS to:
/app/room/{code}/sync            → SyncPayload
/app/room/{code}/chat            → ChatMessage
/app/room/{code}/reaction        → ReactionPayload

# Client SUBSCRIBES to:
/topic/room/{code}/sync
/topic/room/{code}/chat
/topic/room/{code}/reactions
/topic/room/{code}/participants
/user/queue/room/error

SyncPayload:  { type: 'PLAY'|'PAUSE'|'SEEK', position: float, timestamp: long, senderProfileId }
ChatMessage:  { roomCode, profileId, profileName, avatarUrl, content, type, sentAt }
ReactionPayload: { emoji, profileId, x: float, y: float }
```

---

## ENVIRONMENT VARIABLES

### Backend (application-dev.yml)
```yaml
spring:
  datasource:
    # Use Supabase POOLER connection for app runtime (port 6543)
    url: ${SUPABASE_DB_URL}
    # Format: jdbc:postgresql://aws-0-[region].pooler.supabase.com:6543/postgres
    username: postgres
    password: ${SUPABASE_DB_PASSWORD}
    hikari:
      maximum-pool-size: 10
      connection-timeout: 30000
  jpa:
    hibernate:
      ddl-auto: validate       # NEVER create/update — Supabase manages schema
    properties:
      hibernate.dialect: org.hibernate.dialect.PostgreSQLDialect
  flyway:
    # Use DIRECT connection for migrations (port 5432, not pooler)
    url: ${SUPABASE_DB_DIRECT_URL}
    user: postgres
    password: ${SUPABASE_DB_PASSWORD}
    locations: classpath:db/migration
    enabled: true
  redis:
    host: ${REDIS_HOST:localhost}
    port: 6379

ethos:
  supabase:
    url: ${SUPABASE_URL}                        # https://xxxx.supabase.co
    anon-key: ${SUPABASE_ANON_KEY}
    service-role-key: ${SUPABASE_SERVICE_ROLE_KEY}
    jwt-secret: ${SUPABASE_JWT_SECRET}          # From Supabase → Settings → API → JWT Secret
  aws:
    region: ${AWS_REGION:us-east-1}
    bucket: ${S3_BUCKET:ethos-stream-videos}    # Video HLS only
    cloudfront-domain: ${CF_DOMAIN}
  ffmpeg:
    path: ${FFMPEG_PATH:/usr/bin/ffmpeg}

server:
  port: 8080
```

### Frontend (.env.local)
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=http://localhost:8080/ws
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### .env (root — for Docker Compose)
```
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_JWT_SECRET=your_jwt_secret
SUPABASE_DB_URL=jdbc:postgresql://aws-0-region.pooler.supabase.com:6543/postgres
SUPABASE_DB_DIRECT_URL=jdbc:postgresql://db.xxxx.supabase.co:5432/postgres
SUPABASE_DB_PASSWORD=your_db_password
REDIS_HOST=redis
JWT_SECRET=${SUPABASE_JWT_SECRET}
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET=ethos-stream-videos
CF_DOMAIN=https://xxxx.cloudfront.net
```

---

## DOCKER COMPOSE (LOCAL DEV)

```yaml
# docker/docker-compose.yml
# NOTE: No Postgres service — using Supabase cloud. Redis only.
version: '3.9'
services:

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    command: redis-server --appendonly yes
    volumes: [redis_data:/data]

  backend:
    build:
      context: ..
      dockerfile: docker/Dockerfile.backend
    ports: ["8080:8080"]
    env_file: ../.env
    environment:
      REDIS_HOST: redis
    depends_on: [redis]

  frontend:
    build:
      context: ..
      dockerfile: docker/Dockerfile.frontend
    ports: ["5173:5173"]
    environment:
      VITE_API_BASE_URL: http://localhost:8080/api
      VITE_WS_URL: http://localhost:8080/ws
      VITE_SUPABASE_URL: ${SUPABASE_URL}
      VITE_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY}
    depends_on: [backend]

volumes:
  redis_data:
```

---

## DESIGN SYSTEM — ETHOS BRAND

### Color Tokens (tailwind.config.js)
```js
colors: {
  ethos: {
    bg:          '#0A0F1E',
    surface:     '#111827',
    elevated:    '#1A2235',
    border:      '#1E2D45',
    teal:        '#00E5CC',
    'teal-dim':  '#00B5A3',
    amber:       '#F59E0B',
    'amber-dim': '#D97706',
    white:       '#F0F4FF',
    muted:       '#8B95B0',
    danger:      '#EF4444',
    success:     '#10B981',
  }
}
```

### Typography
- **Headings:** Space Grotesk (Google Fonts)
- **Body:** Inter
- **Monospace:** JetBrains Mono (room codes, timestamps)

### Component Style Rules
- Cards: `bg-ethos-surface border border-ethos-border rounded-2xl`
- Primary button: `bg-ethos-teal text-ethos-bg font-semibold hover:bg-ethos-teal-dim transition-all`
- Ghost button: `border border-ethos-border text-ethos-white hover:bg-ethos-elevated`
- Inputs: `bg-ethos-elevated border border-ethos-border text-ethos-white placeholder:text-ethos-muted rounded-xl focus:ring-2 focus:ring-ethos-teal`
- Watch Party accent: `ethos-amber` instead of `ethos-teal`
- Skeleton loaders: `bg-ethos-elevated animate-pulse rounded-xl`
- All transitions via Framer Motion — no raw CSS transitions on layout elements

---

## SUPABASE STORAGE USAGE

```
Supabase Storage buckets:
  avatars/
    └── {profileId}.webp          → profile pictures (public)
  thumbnails/
    └── {videoId}.jpg             → video thumbnail cards (public)
  banners/
    └── {videoId}.jpg             → hero banner images (public)

AWS S3 (video only):
  ethos-stream-videos/
    └── videos/{videoId}/
        ├── master.m3u8
        ├── stream_0.m3u8         (360p)
        ├── stream_1.m3u8         (720p)
        ├── stream_2.m3u8         (1080p)
        └── *.ts                  (HLS segments)

# Frontend: upload avatars/thumbnails directly to Supabase Storage
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${profileId}.webp`, file, { upsert: true })

# Get public URL:
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${profileId}.webp`)
```

---

## REDIS USAGE (watch party only)

```
Key patterns:
  "room:state:{roomCode}"          → JSON room state (TTL: 24h)
  "room:participants:{roomCode}"   → Set of profileIds (TTL: 24h)
  "video:views:{videoId}"          → view counter (flush to Supabase every 5 min)

Redis Pub/Sub:
  "room-events:{roomCode}"         → for horizontal scaling

# NOT in Redis (moved to Supabase):
# - user sessions (Supabase Auth handles)
# - refresh tokens (Supabase Auth handles)
```

---

## CODING CONVENTIONS

### Java / Spring Boot
- Lombok (`@Data`, `@Builder`, `@RequiredArgsConstructor`) — no manual getters/setters
- MapStruct for Entity ↔ DTO mapping
- Custom exceptions: `RoomNotFoundException`, `RoomFullException`, `UnauthorizedException`, `SupabaseException`
- All controllers return `ResponseEntity<ApiResponse<T>>`
  ```java
  record ApiResponse<T>(boolean success, T data, String message) {}
  ```
- `@Transactional` on all service write methods
- `ddl-auto: validate` — NEVER let Hibernate touch Supabase schema
- Flyway manages schema — always write migrations, never rely on Hibernate DDL

### React / Frontend
- Functional components only
- Zustand for global state — no Redux
- All Supabase calls go through `src/lib/supabaseClient.js` (never import createClient elsewhere)
- All Spring Boot API calls go through `src/api/axiosInstance.js`
- Never mix Supabase direct DB calls with Spring Boot API calls — use Spring Boot for business logic, Supabase for auth/storage only
- `clsx()` for conditional classnames
- Framer Motion for all page-level animations
- Error boundaries on `WatchPartyPage` and `PlayerPage`

### File Naming
- Java: PascalCase classes, camelCase methods/fields
- React: PascalCase components, camelCase hooks, kebab-case utilities
- CSS: Tailwind only — no custom CSS except `index.css`

---

## WATCH PARTY — DETAILED FLOW

```
1. User clicks "Start Ethos Room" on VideoDetailPage
   → POST /api/rooms with Supabase JWT in Authorization header
   → Spring Boot validates JWT via SupabaseJwtFilter
   → Room created → { code: 'ETHOS-X7K2' }
   → Navigate to /watch-party/ETHOS-X7K2

2. WatchPartyPage mounts:
   → GET /api/rooms/ETHOS-X7K2
   → WS CONNECT to /ws?token={supabase_access_token}
   → Spring validates token on WS handshake
   → SUBSCRIBE to all /topic/room/ETHOS-X7K2/* topics
   → EthosPlayer mounts, HLS.js loads master.m3u8 from CloudFront

3. Friend joins via /join/ETHOS-X7K2:
   → POST /api/rooms/ETHOS-X7K2/join (authenticated)
   → Server checks room capacity (max 4)
   → Broadcasts ParticipantUpdate → all clients update ParticipantBar
   → New joiner receives position snapshot → seeks to sync

4. Host presses PAUSE:
   → roomStore.sendSync('PAUSE', currentTime)
   → STOMP SEND to /app/room/ETHOS-X7K2/sync
   → Server broadcasts SyncPayload to /topic/room/ETHOS-X7K2/sync
   → All clients call video.pause()
   → Redis room state updated

5. Drift correction (syncEngine.js):
   → Every 5s: compare local currentTime vs Redis state
   → If delta > 1.5s → video.currentTime = serverPosition

6. Emoji reaction:
   → STOMP SEND { emoji: '❤️', x: 0.45, y: 0.7 }
   → ReactionOverlay animates emoji floating up from (x, y) position
```

---

## ANTIGRAVITY TASK PROMPTS

```
# SESSION 1 — Backend scaffolding + Supabase connection
"Using the Ethos Stream context, initialize the Spring Boot Maven project
with pom.xml as specified. Configure application.yml to connect to Supabase
PostgreSQL using the connection strings in the context. Set up Flyway with
the DIRECT connection URL and write all migration SQL files matching the
DB schema section. Set ddl-auto to validate."

# SESSION 2 — Supabase JWT auth in Spring Boot
"Using the Ethos Stream context, build the auth module: SupabaseJwtFilter
that validates Supabase-issued JWTs using SUPABASE_JWT_SECRET, SecurityConfig,
User.java JPA entity, UserRepository, and the thin AuthController with only
the /api/auth/sync-profile endpoint. Include the Supabase trigger SQL for
auto-creating public.users rows."

# SESSION 3 — Content module
"Using the Ethos Stream context, build the complete content module:
Video.java, Genre.java entities, ContentController, ContentService,
ContentRepository, VideoDTO with MapStruct mapper, and the streaming
endpoint that returns a presigned CloudFront URL for HLS playback."

# SESSION 4 — HLS pipeline + Supabase Storage
"Using the Ethos Stream context, implement HlsService.java (FFmpeg
ProcessBuilder transcoding to 360p/720p/1080p HLS), S3Service.java
(upload segments to AWS S3), and SupabaseStorageService.java (upload
thumbnails/banners to Supabase Storage using WebClient REST calls)."

# SESSION 5 — Watch Party backend
"Using the Ethos Stream context, build the full watchparty package:
Room.java, RoomParticipant.java, RoomChatMessage.java entities,
RoomController, RoomService with 4-participant cap enforcement,
WebSocketConfig with Supabase token validation on CONNECT handshake,
and WatchPartyWebSocketHandler with PLAY/PAUSE/SEEK/CHAT/REACTION
handling and Redis state persistence."

# SESSION 6 — React scaffold + Supabase client
"Using the Ethos Stream context, scaffold the React frontend: Vite + Tailwind
config with all Ethos brand tokens, folder structure, supabaseClient.js,
axiosInstance.js with Supabase JWT interceptor, all three Zustand stores,
and Google Fonts (Space Grotesk + Inter + JetBrains Mono) in index.html."

# SESSION 7 — Auth UI (Supabase-powered)
"Using the Ethos Stream context, build LoginPage.jsx, RegisterPage.jsx,
and LandingPage.jsx. Auth uses supabase.auth.signInWithPassword and
signUp. Include Google OAuth button using supabase.auth.signInWithOAuth.
Protect routes with an AuthGuard component that checks Zustand authStore."

# SESSION 8 — Browse + Video UI
"Using the Ethos Stream context, build BrowsePage.jsx with HeroBanner,
ContentRow, VideoCard, GenreFilter. VideoCard shows thumbnail from
Supabase Storage public URL. Use Skeleton loaders while fetching."

# SESSION 9 — EthosPlayer
"Using the Ethos Stream context, build EthosPlayer.jsx using HLS.js,
PlayerControls.jsx, QualitySelector.jsx, usePlayer hook. Fetch HLS URL
from /api/videos/{id}/stream. Style with Ethos teal accent."

# SESSION 10 — Ethos Room UI
"Using the Ethos Stream context, build the complete Watch Party UI:
EthosRoom.jsx, RoomHeader, ParticipantBar, ChatPanel, ReactionOverlay
(Framer Motion floating emojis), InviteModal, useWebSocket hook (STOMP),
useRoom hook, syncEngine.js drift correction. Use amber accent color."

# SESSION 11 — Docker + CI/CD
"Using the Ethos Stream context, create docker-compose.yml (Redis only —
no Postgres, using Supabase), Dockerfile.backend (multi-stage Maven build),
Dockerfile.frontend, and GitHub Actions workflow for test + build + deploy."
```

---

## CURRENT BUILD STATUS

> Update this after each session to keep Antigravity in sync.

```
[ ] Phase 1 — Backend scaffolding
    [ ] Spring Boot project init + pom.xml
    [ ] Supabase DB connection + Flyway migrations (all tables + RLS)
    [ ] Supabase JWT filter + SecurityConfig
    [ ] User/Profile module

[ ] Phase 2 — Content & Streaming
    [ ] Video/Genre CRUD
    [ ] HLS transcoding pipeline (FFmpeg → AWS S3)
    [ ] Supabase Storage service (thumbnails, banners, avatars)
    [ ] Streaming controller (CloudFront presigned URLs)

[ ] Phase 3 — Frontend
    [ ] Vite + Tailwind + Ethos design system
    [ ] supabaseClient.js + axiosInstance.js
    [ ] Zustand stores (auth, player, room)
    [ ] Auth pages (Supabase Auth — login, register, Google OAuth)
    [ ] Browse page + VideoCard + HeroBanner
    [ ] Custom EthosPlayer (HLS.js)

[ ] Phase 4 — Watch Party (Ethos Room)
    [ ] Room REST API
    [ ] WebSocket server (Spring STOMP + Supabase token on handshake)
    [ ] EthosRoom React UI
    [ ] Sync engine + drift correction
    [ ] Chat + Floating emoji reactions

[ ] Phase 5 — Polish & Deploy
    [ ] Profile management + avatar upload to Supabase Storage
    [ ] Watch history + Recommendations
    [ ] Docker Compose (Redis only)
    [ ] GitHub Actions CI/CD
    [ ] AWS EC2 + Vercel deployment
    [ ] Supabase production hardening (RLS audit, rate limits)
```

---

*Ethos Stream — Java · Spring Boot · React · Supabase. Always streaming, always together.*
