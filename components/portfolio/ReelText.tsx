import type { CSSProperties } from "react";
import styles from "./portfolio.module.css";

export default function ReelText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={`${styles.reelText} ${className ?? ""}`} role="img" aria-label={text}>
      {text.split(" ").map((word, wordIndex) => (
        <span aria-hidden="true" className={styles.reelWord} data-testid="reel-word" key={`${word}-${wordIndex}`}>
          {Array.from(word).map((character, characterIndex) => {
            const index = text.split(" ").slice(0, wordIndex).join(" ").length
              + (wordIndex > 0 ? 1 : 0)
              + characterIndex;

            return (
              <span
                className={styles.reelCharacter}
                data-testid="reel-character"
                aria-hidden="true"
                key={`${character}-${characterIndex}`}
              >
                <span
                  className={styles.reelGlyphs}
                  style={{ "--reel-delay": `${Math.min(index * 16, 240)}ms` } as CSSProperties}
                >
                  <span>{character}</span>
                  <span>{character}</span>
                  <span>{character}</span>
                </span>
              </span>
            );
          })}
          {wordIndex < text.split(" ").length - 1 && (
            <span className={styles.reelSpace}> </span>
          )}
        </span>
      ))}
    </span>
  );
}
