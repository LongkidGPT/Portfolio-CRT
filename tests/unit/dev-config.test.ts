import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

test("uses webpack for the local Next dev server", () => {
  const packageJson = JSON.parse(
    readFileSync(join(process.cwd(), "package.json"), "utf8"),
  );

  expect(packageJson.scripts.dev).toBe("next dev --webpack");
});
