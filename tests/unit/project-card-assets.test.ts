import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const expectedHashes: Record<string, string> = {
  "public/kv/buttons/about-default.png": "0ad6dcfd5bcd3bb7bab76c9e5c6e5e2987ed845b8a22e9e715a37ee272ca43bc",
  "public/kv/buttons/about-active.png": "9e7925d7ccc43c09ed529d31e481ef40c7c7f8d48da649f144b4a7fb50ffe556",
  "public/kv/buttons/design-logic-default.png": "d2228b29e79f4e2fd3b1cc616ca234efab3bf2fe3a388da201da80cc1ce34c6b",
  "public/kv/buttons/design-logic-active.png": "08fee1a8b9bf9e7eaf7bc78b40c1f6368e7501202cf621a949fac52f60948bc3",
  "public/kv/buttons/brand-system-default.png": "46209a0e27a42a02afd484af791c7bad6865969a1cef45cc1a3a76b02dce408f",
  "public/kv/buttons/brand-system-active.png": "ec36f4ddfeeea759f38607e900de0f34505bfc86da1151effead87ccafe0a67a",
  "public/kv/buttons/product-launch-default.png": "c9237e91bd27294e7c86022c57c68c482ad0488e2e768f00b3b1c99c82899702",
  "public/kv/buttons/product-launch-active.png": "f578b792206eec73f57a2d5d34fc6b1bfed9b091e115e93e316d4785d49afd37",
  "public/kv/buttons/launch-event-default.png": "e76445cbd0dea11564e4464592fba1947c546df04e53a3e8973387517546ca13",
  "public/kv/buttons/launch-event-active.png": "25b20051ff531cbb5f0176547cd0d25c8c84924e91b40b25c5fa012c38fba543",
  "public/kv-mobile/cards/about-default.png": "6f032f7e3663ea0b943690983cf0bcb5eb89b3cd5531d06d5cfe15a14fee9781",
  "public/kv-mobile/cards/about-active.png": "de361c9fd2e4391711181a85f1f3d159cc37f36ba8f040551d68c17a5eed5cf1",
  "public/kv-mobile/cards/design-logic-default.png": "4f689e5534ce44ebfef0d4a975298ae961e5ceff8115c1eae02bf0c45b7f8b7e",
  "public/kv-mobile/cards/design-logic-active.png": "4f324dd39a108addb712db0e8f9e56c30023ae6de48f8e86f4d7a15e1b0800d2",
  "public/kv-mobile/cards/brand-system-default.png": "25065d0c26880761f88e71e1ce752bff95005cf29bedd9c2ec0a8bc0510707f0",
  "public/kv-mobile/cards/brand-system-active.png": "07544dc2c3a61c82293d9339ec3e0717667400cc1449199b8875b5aa3f80f78c",
  "public/kv-mobile/cards/product-launch-default.png": "98c7575fb7639d81559181e87764cd60bbff377c4f32aeff5b4710bf23d25cbe",
  "public/kv-mobile/cards/product-launch-active.png": "5ef342ef4d88dd1675c8a6f0b6a9d6cd999ca6635ed9d9d5bf6a209e27d85cdf",
  "public/kv-mobile/cards/launch-event-default.png": "9bfdac014df201a6c41293609de966da3dbfed0d4de1ab80e8afeb8e088dd4eb",
  "public/kv-mobile/cards/launch-event-active.png": "e3a18e364d385a6eda45454952d957e584c45e628d17858366a2457bb3489986",
};

test("uses the formal-master desktop and mobile project card artwork", () => {
  for (const [file, expected] of Object.entries(expectedHashes)) {
    const actual = createHash("sha256")
      .update(readFileSync(join(process.cwd(), file)))
      .digest("hex");
    expect(actual, file).toBe(expected);
  }
});
