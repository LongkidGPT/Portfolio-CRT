import type { CSSProperties } from "react";
import styles from "./portfolio.module.css";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export default function ReelText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={`${styles.reelText} ${className ?? ""}`} aria-label={text}>
      {Array.from(text).map((character, index) => {
        if (character === " ") {
          return <span className={styles.reelSpace} key={`space-${index}`}> </span>;
        }

        const first = GLYPHS[(character.charCodeAt(0) + index * 7) % GLYPHS.length];
        const second = GLYPHS[(character.charCodeAt(0) + index * 13) % GLYPHS.length];

        return (
          <span
            className={styles.reelCharacter}
            data-testid="reel-character"
            aria-hidden="true"
            key={`${character}-${index}`}
          >
            <span
              className={styles.reelGlyphs}
              style={{ "--reel-delay": `${Math.min(index * 16, 240)}ms` } as CSSProperties}
            >
              <span>{first}</span>
              <span>{second}</span>
              <span>{character}</span>
            </span>
          </span>
        );
      })}
    </span>
  );
}
