import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog";

export const revalidate = 3600;

/** robbmusic.fr/nouveau → toujours la page de la dernière sortie (idéal en bio). */
export async function GET(req: Request) {
  const [latest] = await getCatalog();
  const url = new URL(`/${latest.slug}`, req.url);
  new URL(req.url).searchParams.forEach((v, k) => url.searchParams.set(k, v));
  return NextResponse.redirect(url, 307);
}
