// Demo data + royalty-free audio streams from SoundHelix.
import coverMafeelings from "@/assets/cover-mafeelings.jpg";
import artistTakura from "@/assets/artist-takura.jpg";
import heroArtist from "@/assets/hero-artist.jpg";

export type Track = {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album?: string;
  cover: string;
  audio: string;
  duration: number;
  plays?: string;
};

const sh = (n: number) =>
  `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;

export const demoTracks: Track[] = [
  { id: "t1", title: "MaFeelings", artist: "Freeman HKD", artistId: "a1", cover: coverMafeelings, audio: sh(1), duration: 227, plays: "2.1M" },
  { id: "t2", title: "Pakati", artist: "Voltz JT", artistId: "a2", cover: artistTakura, audio: sh(2), duration: 214, plays: "1.7M" },
  { id: "t3", title: "Ndakakunda", artist: "Takura", artistId: "a3", cover: heroArtist, audio: sh(3), duration: 246, plays: "1.1M" },
  { id: "t4", title: "MaStreets", artist: "Saint Floew", artistId: "a4", cover: coverMafeelings, audio: sh(4), duration: 227, plays: "1.3M" },
  { id: "t5", title: "Zvese", artist: "Mbeu", artistId: "a5", cover: artistTakura, audio: sh(5), duration: 179, plays: "962K" },
  { id: "t6", title: "Haina Kurema", artist: "Asaph", artistId: "a6", cover: heroArtist, audio: sh(6), duration: 192, plays: "1.7M" },
  { id: "t7", title: "Rudo Rwako", artist: "Mbeu", artistId: "a5", cover: coverMafeelings, audio: sh(7), duration: 205, plays: "512K" },
  { id: "t8", title: "Tingaziva", artist: "Saint Floew", artistId: "a4", cover: artistTakura, audio: sh(8), duration: 233, plays: "823K" },
  { id: "t9", title: "Energy", artist: "Takura", artistId: "a3", cover: heroArtist, audio: sh(9), duration: 198, plays: "1.4M" },
  { id: "t10", title: "Kubatana", artist: "Various Artists", artistId: "a7", cover: coverMafeelings, audio: sh(10), duration: 221, plays: "678K" },
];

export const genres = [
  { name: "Afro-Pop", color: "from-rose-500 to-red-700" },
  { name: "Dancehall", color: "from-amber-500 to-orange-700" },
  { name: "Hip-Hop", color: "from-fuchsia-500 to-purple-700" },
  { name: "Gospel", color: "from-indigo-500 to-blue-700" },
  { name: "Amapiano", color: "from-emerald-500 to-teal-700" },
  { name: "Zimdancehall", color: "from-red-500 to-rose-800" },
];

export const moods = ["Chill", "Feel Good", "Workout", "Love", "Party", "Focus"];

export const trendingSearches = ["Takura", "Freeman HKD", "Asaph", "Voltz JT", "Saint Floew", "Mbeu"];

export const madeForYou = [
  { name: "Daily Mix", subtitle: "Your daily favorites", color: "from-blue-600 to-indigo-800" },
  { name: "Recommended", subtitle: "Curated for you", color: "from-rose-500 to-red-700" },
  { name: "Discovery", subtitle: "New sounds", color: "from-amber-500 to-orange-700" },
];

export function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
