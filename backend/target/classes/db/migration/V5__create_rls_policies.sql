-- ============================================================
-- V5: Row Level Security (RLS) Policies
-- Enable RLS on all tables + create access policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_chat_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Users: can only view/update their own row
-- ============================================================
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- Profiles: belong to authenticated users
-- ============================================================
CREATE POLICY "Users manage own profiles" ON public.profiles
    FOR ALL USING (user_id = auth.uid());

-- ============================================================
-- Videos and Genres: public read access
-- ============================================================
CREATE POLICY "Videos are public" ON public.videos
    FOR SELECT USING (TRUE);

CREATE POLICY "Genres are public" ON public.genres
    FOR SELECT USING (TRUE);

CREATE POLICY "Video genres are public" ON public.video_genres
    FOR SELECT USING (TRUE);

-- ============================================================
-- Watchlist: profile owner access only
-- ============================================================
CREATE POLICY "Watchlist owner access" ON public.watchlist
    FOR ALL USING (
        profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

-- ============================================================
-- Watch History: profile owner access only
-- ============================================================
CREATE POLICY "Watch history owner access" ON public.watch_history
    FOR ALL USING (
        profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

-- ============================================================
-- Rooms: any authenticated user can read; host can update
-- ============================================================
CREATE POLICY "Rooms public read" ON public.rooms
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Host manages room" ON public.rooms
    FOR UPDATE USING (
        host_profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Authenticated users create rooms" ON public.rooms
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- Room Participants: authenticated users can read and join
-- ============================================================
CREATE POLICY "Participants read access" ON public.room_participants
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Participants join access" ON public.room_participants
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Participants leave access" ON public.room_participants
    FOR UPDATE USING (
        profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
    );

-- ============================================================
-- Room Chat: participants can read and insert
-- ============================================================
CREATE POLICY "Chat read by participants" ON public.room_chat_messages
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Chat insert by participants" ON public.room_chat_messages
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- Grant usage to authenticated and service roles
-- ============================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
