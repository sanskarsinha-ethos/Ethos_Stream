-- ============================================================
-- V2: Content — Genres, Videos, Video-Genre join table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url VARCHAR(500),
    banner_url VARCHAR(500),
    hls_master_url VARCHAR(500),
    duration_seconds INTEGER,
    release_year INTEGER,
    rating VARCHAR(10),
    type VARCHAR(20) DEFAULT 'movie',
    is_featured BOOLEAN DEFAULT FALSE,
    view_count BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.video_genres (
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
    genre_id INTEGER REFERENCES public.genres(id) ON DELETE CASCADE,
    PRIMARY KEY (video_id, genre_id)
);

-- Indexes for content queries
CREATE INDEX idx_videos_type ON public.videos(type);
CREATE INDEX idx_videos_is_featured ON public.videos(is_featured);
CREATE INDEX idx_videos_release_year ON public.videos(release_year);
CREATE INDEX idx_videos_title_trgm ON public.videos(title);
