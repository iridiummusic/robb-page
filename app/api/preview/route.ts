import { NextResponse } from "next/server";

/**
 * Extrait de 30 s d'une sortie, servi depuis le site (même origine)
 * pour que la page puisse « entendre » le son et faire pulser la lumière.
 * /api/preview?album=1149398221
 */
export async function GET(req: Request) {
  const album = new URL(req.url).searchParams.get("album");
  if (!album || !/^\d+$/.test(album)) return NextResponse.json({ error: "album manquant" }, { status: 400 });
  try {
    const tracks = await fetch(`https://api.deezer.com/album/${album}/tracks?limit=50`, { cache: "no-store" }).then((r) => r.json());
    const track = (tracks?.data ?? []).find((t: { preview?: string }) => t.preview);
    if (!track) return NextResponse.json({ error: "pas d'extrait" }, { status: 404 });
    const audio = await fetch(track.preview, { cache: "no-store" });
    if (!audio.ok || !audio.body) return NextResponse.json({ error: "extrait indisponible" }, { status: 502 });
    return new Response(audio.body, {
      headers: {
        "content-type": "audio/mpeg",
        // gardé 6 h par le CDN : la plupart des écoutes ne réveillent pas le serveur
        "cache-control": "public, max-age=3600, s-maxage=21600",
        "netlify-cdn-cache-control": "public, s-maxage=21600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "extrait indisponible" }, { status: 502 });
  }
}
