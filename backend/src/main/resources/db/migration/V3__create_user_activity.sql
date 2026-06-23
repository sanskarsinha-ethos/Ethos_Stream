-- ============================================================
-- V3: User Activity — Watchlist, Watch History
-- ============================================================

CREATE TABLE IF NOT EXISTS public.watchlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(profile_id, video_id)
);

CREATE TABLE IF NOT EXISTS public.watch_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
    position_seconds INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    watched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for activity queries
CREATE INDEX idx_watchlist_profile_id ON public.watchlist(profile_id);
CREATE INDEX idx_watch_history_profile_id ON public.watch_history(profile_id);
CREATE INDEX idx_watch_history_watched_at ON public.watch_history(watched_at);
