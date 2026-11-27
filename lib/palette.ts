import sharp from "sharp";
import { site } from "@/site.config";

export type Palette = {
  hue: number;
  sat: number;
  vars: Record<string, string>;
};

/** Construit toute la palette de la page à partir d'une seule teinte. */
export function paletteFromHue(hue: number, sat = 78): Palette {
  const h = Math.round(hue);
  const s = Math.max(0, Math.min(100, sat));
  const neutral = s < 12; // pochette en noir & blanc
  const ts = neutral ? 4 : Math.round(s * 0.55);
  return {
    hue: h,
    sat: s,
    vars: {
      "--bg": `hsl(${h} ${neutral ? 3 : Math.min(70, s)}% 4.5%)`,
      "--bg-2": `hsl(${h} ${neutral ? 3 : Math.min(55, s)}% 8%)`,
      "--line": `hsl(${h} ${ts}% 22% / .55)`,
      "--ink": `hsl(${h} ${neutral ? 0 : 35}% 95%)`,
      "--ink-2": `hsl(${h} ${neutral ? 0 : 18}% 72%)`,
      "--ink-3": `hsl(${h} ${neutral ? 0 : 12}% 52%)`,
      "--accent": neutral ? "hsl(0 0% 88%)" : `hsl(${h} ${Math.max(70, s)}% 52%)`,
      "--accent-ink": neutral ? "hsl(0 0% 6%)" : `hsl(${h} 30% 98%)`,
      "--glow": neutral ? "hsl(0 0% 100% / .10)" : `hsl(${h} ${Math.max(70, s)}% 50% / .38)`,
    },
  };
}

/**
 * Lit la pochette et trouve sa teinte dominante (pondérée par la saturation),
 * pour que la page prenne la DA de la dernière sortie.
 */
export async function paletteFromCover(coverUrl: string): Promise<Palette> {
  if (site.palette !== "auto") return paletteFromHue(site.palette.hue, site.palette.saturation);
  try {
    const res = await fetch(coverUrl, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(6000) });
    const buf = Buffer.from(await res.arrayBuffer());
    const { data } = await sharp(buf).resize(48, 48, { fit: "cover" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });

    const bins = new Array(36).fill(0);
    let satSum = 0;
    let weightSum = 0;
    for (let i = 0; i < data.length; i += 3) {
      const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const l = (max + min) / 2;
      const d = max - min;
      if (d < 0.06 || l < 0.06) continue;
      const s = d / (1 - Math.abs(2 * l - 1));
      let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h = (h * 60 + 360) % 360;
      const w = s * (1 - Math.abs(l - 0.5));
      bins[Math.floor(h / 10)] += w;
      satSum += s * w;
      weightSum += w;
    }
    const pixels = data.length / 3;
    if (weightSum / pixels < 0.04) return paletteFromHue(site.fallbackHue, 5); // quasi monochrome
    // lissage sur 3 cases pour éviter les pics isolés
    let best = 0, bestScore = -1;
    for (let i = 0; i < 36; i++) {
      const score = bins[(i + 35) % 36] * 0.5 + bins[i] + bins[(i + 1) % 36] * 0.5;
      if (score > bestScore) { bestScore = score; best = i; }
    }
    // moyenne pondérée dans la case gagnante et ses voisines
    let x = 0, y = 0;
    for (const j of [best - 1, best, best + 1]) {
      const k = (j + 36) % 36;
      const a = ((k * 10 + 5) * Math.PI) / 180;
      x += Math.cos(a) * bins[k];
      y += Math.sin(a) * bins[k];
    }
    const hue = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
    return paletteFromHue(hue, Math.round((satSum / weightSum) * 100));
  } catch {
    return paletteFromHue(site.fallbackHue);
  }
}
