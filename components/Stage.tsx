import type { Palette } from "@/lib/palette";

/**
 * Le décor : la pochette floutée devient la lumière de la salle.
 * Deux faisceaux balaient la scène ; tout pulse avec --level quand un extrait joue.
 */
export default function Stage({ cover, palette, children }: { cover: string; palette: Palette; children: React.ReactNode }) {
  return (
    <div className="stage" style={palette.vars as React.CSSProperties}>
      <div className="stage-light" aria-hidden style={{ backgroundImage: `url(${cover})` }} />
      <div className="stage-beams" aria-hidden>
        <span />
        <span />
      </div>
      <div className="stage-grain" aria-hidden />
      {children}
    </div>
  );
}
