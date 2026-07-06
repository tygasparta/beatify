
-- Roles enum + user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'artist', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT NOT NULL DEFAULT 'Music Lover',
  bio TEXT,
  avatar_url TEXT,
  location TEXT DEFAULT 'Harare, Zimbabwe',
  is_artist BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  monthly_listeners INT NOT NULL DEFAULT 0,
  genres TEXT[] DEFAULT '{}',
  socials JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tracks
CREATE TABLE public.tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  album TEXT,
  cover_url TEXT,
  audio_url TEXT NOT NULL,
  duration_seconds INT NOT NULL DEFAULT 0,
  genre TEXT,
  play_count BIGINT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  is_trending BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tracks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tracks TO authenticated;
GRANT ALL ON public.tracks TO service_role;
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published tracks are viewable by everyone" ON public.tracks FOR SELECT USING (is_published OR artist_id = auth.uid());
CREATE POLICY "Artists manage own tracks" ON public.tracks FOR ALL TO authenticated USING (artist_id = auth.uid()) WITH CHECK (artist_id = auth.uid());
CREATE INDEX idx_tracks_artist ON public.tracks(artist_id);
CREATE INDEX idx_tracks_trending ON public.tracks(is_trending) WHERE is_trending;

-- Likes
CREATE TABLE public.likes (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, track_id)
);
GRANT SELECT, INSERT, DELETE ON public.likes TO authenticated;
GRANT ALL ON public.likes TO service_role;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read all likes" ON public.likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users manage own likes" ON public.likes FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Playlists
CREATE TABLE public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.playlists TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playlists TO authenticated;
GRANT ALL ON public.playlists TO service_role;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public playlists viewable" ON public.playlists FOR SELECT USING (is_public OR owner_id = auth.uid());
CREATE POLICY "Users manage own playlists" ON public.playlists FOR ALL TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE TABLE public.playlist_tracks (
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  position INT NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (playlist_id, track_id)
);
GRANT SELECT ON public.playlist_tracks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playlist_tracks TO authenticated;
GRANT ALL ON public.playlist_tracks TO service_role;
ALTER TABLE public.playlist_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Playlist tracks follow playlist visibility" ON public.playlist_tracks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_id AND (p.is_public OR p.owner_id = auth.uid()))
);
CREATE POLICY "Owners manage playlist tracks" ON public.playlist_tracks FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_id AND p.owner_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_id AND p.owner_id = auth.uid())
);

-- Follows
CREATE TABLE public.follows (
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, artist_id)
);
GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;
GRANT ALL ON public.follows TO service_role;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Follows are viewable" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users manage own follows" ON public.follows FOR ALL TO authenticated USING (follower_id = auth.uid()) WITH CHECK (follower_id = auth.uid());

-- Plays (analytics)
CREATE TABLE public.plays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  played_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.plays TO authenticated;
GRANT SELECT ON public.plays TO anon;
GRANT ALL ON public.plays TO service_role;
ALTER TABLE public.plays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can log a play" ON public.plays FOR INSERT WITH CHECK (true);
CREATE POLICY "Artists read plays on own tracks" ON public.plays FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.tracks t WHERE t.id = track_id AND t.artist_id = auth.uid())
);
CREATE INDEX idx_plays_track ON public.plays(track_id, played_at DESC);
