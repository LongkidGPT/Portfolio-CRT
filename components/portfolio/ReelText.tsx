import type { CSSProperties } from "react";
import styles from "./portfolio.module.css";

const UPPERCASE_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE_GLYPHS = "abcdefghijklmnopqrstuvwxyz";
const NUMBER_GLYPHS = "0123456789";

function glyphPool(character: string): string {
  if (/[A-Z]/.test(character)) return UPPERCASE_GLYPHS;
  if (/[a-z]/.test(character)) return LOWERCASE_GLYPHS;
  if (/[0-9]/.test(character)) return NUMBER_GLYPHS;
  return character;
}

export default function ReelText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={`${styles.reelText} ${className ?? ""}`} aria-label={text}>
      {text.split(" ").map((word, wordIndex) => (
        <span className={styles.reelWord} data-testid="reel-word" key={`${word}-${wordIndex}`}>
          {Array.from(word).map((character, characterIndex) => {
            const index = text.split(" ").slice(0, wordIndex).join(" ").length
              + (wordIndex > 0 ? 1 : 0)
              + characterIndex;
            const pool = glyphPool(character);
            const first = pool[(character.charCodeAt(0) + index * 7) % pool.length];
            const second = pool[(character.charCodeAt(0) + index * 13) % pool.length];

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
                  <span>{first}</span>
                  <span>{second}</span>
                  <span>{character}</span>
                </span>
              </span>
            );
          })}
          {wordIndex < text.split(" ").length - 1 && (
            <span className={styles.reelSpace} aria-hidden="true"> </span>
          )}
        </span>
      ))}
    </span>
  );
}
