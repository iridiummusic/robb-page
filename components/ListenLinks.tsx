import type { PlatformLink } from "@/lib/platforms";
import { PlatformIcon } from "./icons";

export default function ListenLinks({ links, source }: { links: PlatformLink[]; source: string }) {
  return (
    <ul className="listen">
      {links.map((l, i) => (
        <li key={l.key}>
          <a
            href={l.url}
            target="_blank"
            rel="noopener"
            className={i === 0 ? "listen-row is-first" : "listen-row"}
            data-platform={l.key}
            data-source={source}
          >
            <PlatformIcon name={l.key} />
            <span className="listen-name">{l.label}</span>
            <span className="listen-cta">{l.key === "youtube" ? "Regarder" : "Écouter"}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
