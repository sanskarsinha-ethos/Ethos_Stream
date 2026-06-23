-- ============================================================
-- V4: Watch Party (Ethos Room) — Rooms, Participants, Chat
-- ============================================================

CREATE TABLE IF NOT EXISTS public.rooms (
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

CREATE TABLE IF NOT EXISTS public.room_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    left_at TIMESTAMPTZ,
    UNIQUE(room_id, profile_id)
);

CREATE TABLE IF NOT EXISTS public.room_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id),
    content VARCHAR(500) NOT NULL,
    type VARCHAR(20) DEFAULT 'text',
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for watch party queries
CREATE INDEX idx_rooms_code ON public.rooms(code);
CREATE INDEX idx_rooms_status ON public.rooms(status);
CREATE INDEX idx_room_participants_room_id ON public.room_participants(room_id);
CREATE INDEX idx_room_chat_messages_room_id ON public.room_chat_messages(room_id);
CREATE INDEX idx_room_chat_messages_sent_at ON public.room_chat_messages(sent_at);
