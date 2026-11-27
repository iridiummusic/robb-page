import type { Palette } from "@/lib/palette";

/** Le fond de la page : la pochette, floutée, comme la lumière d'une scène qui déborde. */
export default function Stage({ cover, palette, children }: { cover: string; palette: Palette; children: React.ReactNode }) {
  return (
    <div className="stage" style={palette.vars as React.CSSProperties}>
      <div className="stage-light" aria-hidden style={{ backgroundImage: `url(${cover})` }} />
      <div className="stage-grain" aria-hidden />
      {children}
    </div>
  );
}
