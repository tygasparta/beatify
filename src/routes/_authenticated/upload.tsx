import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { UploadCloud, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/upload")({
  component: UploadPage,
});

function UploadPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [genre, setGenre] = useState("");
  const [album, setAlbum] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).single();
      if (data && !artistName) setArtistName(data.display_name ?? "");
      return data;
    },
  });

  const upload = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Select an audio file");
      if (!title) throw new Error("Add a song title");
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");

      const uid = u.user.id;
      const audioPath = `${uid}/${crypto.randomUUID()}-${file.name}`;
      const { error: aErr } = await supabase.storage.from("audio").upload(audioPath, file);
      if (aErr) throw aErr;
      const { data: audioSigned } = await supabase.storage.from("audio").createSignedUrl(audioPath, 60 * 60 * 24 * 365);

      let coverUrl: string | null = null;
      if (cover) {
        const cp = `${uid}/${crypto.randomUUID()}-${cover.name}`;
        const { error: cErr } = await supabase.storage.from("covers").upload(cp, cover);
        if (cErr) throw cErr;
        const { data: cs } = await supabase.storage.from("covers").createSignedUrl(cp, 60 * 60 * 24 * 365);
        coverUrl = cs?.signedUrl ?? null;
      }

      // Get duration via HTMLAudio
      const duration = await new Promise<number>((resolve) => {
        const a = document.createElement("audio");
        a.preload = "metadata";
        a.src = URL.createObjectURL(file);
        a.onloadedmetadata = () => resolve(Math.floor(a.duration || 0));
        a.onerror = () => resolve(0);
      });

      const { error: dbErr } = await supabase.from("tracks").insert({
        artist_id: uid,
        title,
        artist_name: artistName || profile?.display_name || "Unknown",
        album: album || null,
        genre: genre || null,
        cover_url: coverUrl,
        audio_url: audioSigned?.signedUrl ?? "",
        duration_seconds: duration,
        is_published: true,
      });
      if (dbErr) throw dbErr;
    },
    onSuccess: () => {
      toast.success("Track uploaded — you're live!");
      qc.invalidateQueries({ queryKey: ["my-tracks"] });
      navigate({ to: "/library" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="px-5 pt-14">
      <h1 className="mb-2 text-2xl font-bold">Upload Your Music</h1>
      <p className="mb-6 text-sm text-muted-foreground">Distribute your track worldwide from Beatify.</p>

      <div className="mb-4 flex gap-2 text-xs font-semibold">
        <Step n={1} label="Details" active />
        <Step n={2} label="Distribution" />
        <Step n={3} label="Publish" />
      </div>

      <button
        onClick={() => fileRef.current?.click()}
        className="mb-4 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-surface/60 px-6 py-10 text-center hover:border-primary/60"
      >
        <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-primary shadow-glow">
          <UploadCloud className="h-6 w-6 text-primary-foreground" />
        </div>
        <div className="text-sm font-medium">
          {file ? file.name : "Drag & drop your audio file here"}
        </div>
        <div className="text-xs text-muted-foreground">or</div>
        <span className="rounded-full bg-white text-black px-4 py-1.5 text-xs font-semibold">Choose File</span>
        <input
          ref={fileRef}
          type="file"
          accept="audio/*"
          hidden
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </button>

      <Field label="Song Title">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter song title"
          className="w-full rounded-xl bg-surface px-4 py-3.5 text-sm outline-none ring-1 ring-border focus:ring-primary"
        />
      </Field>
      <Field label="Artist Name">
        <input
          value={artistName}
          onChange={(e) => setArtistName(e.target.value)}
          placeholder="Enter artist name"
          className="w-full rounded-xl bg-surface px-4 py-3.5 text-sm outline-none ring-1 ring-border focus:ring-primary"
        />
      </Field>
      <Field label="Featured Artists">
        <input
          placeholder="Add featured artists"
          className="w-full rounded-xl bg-surface px-4 py-3.5 text-sm outline-none ring-1 ring-border focus:ring-primary"
        />
      </Field>
      <Field label="Genre">
        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          className="w-full rounded-xl bg-surface px-4 py-3.5 text-sm outline-none ring-1 ring-border focus:ring-primary"
        >
          <option value="">Select genre</option>
          <option>Afro-Pop</option>
          <option>Zimdancehall</option>
          <option>Hip-Hop</option>
          <option>Gospel</option>
          <option>Amapiano</option>
          <option>R&B</option>
        </select>
      </Field>
      <Field label="Album (optional)">
        <input
          value={album}
          onChange={(e) => setAlbum(e.target.value)}
          placeholder="Enter album name"
          className="w-full rounded-xl bg-surface px-4 py-3.5 text-sm outline-none ring-1 ring-border focus:ring-primary"
        />
      </Field>
      <Field label="Cover Art">
        <button
          onClick={() => coverRef.current?.click()}
          className="w-full rounded-xl bg-surface px-4 py-3.5 text-left text-sm ring-1 ring-border hover:bg-surface-2"
        >
          {cover ? cover.name : "Upload cover image"}
        </button>
        <input
          ref={coverRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => setCover(e.target.files?.[0] ?? null)}
        />
      </Field>

      <div className="mt-6 flex gap-2">
        <button className="flex-1 rounded-xl bg-surface py-3.5 text-sm font-semibold ring-1 ring-border">
          Save Draft
        </button>
        <button
          onClick={() => upload.mutate()}
          disabled={upload.isPending}
          className="flex-1 rounded-xl bg-gradient-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-glow disabled:opacity-60"
        >
          {upload.isPending ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : "Publish"}
        </button>
      </div>
    </div>
  );
}

function Step({ n, label, active }: { n: number; label: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 ${active ? "bg-primary/15 text-primary" : "bg-surface text-muted-foreground"}`}>
      <span className={`grid h-4 w-4 place-items-center rounded-full text-[10px] ${active ? "bg-primary text-primary-foreground" : "bg-white/10"}`}>{n}</span>
      {label}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
