import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const expectedHashes: Record<string, string> = {
  "public/kv/buttons/about-default.png": "37a6c30d266bd519e4acf7e1124b56dd35a30b82d7683b8496a75e97a2e1773a",
  "public/kv/buttons/about-active.png": "6a99a4d54d234b8c2dfaeb7e1e10146d0718b1fbd6c932d0f19675640b1ca3a9",
  "public/kv/buttons/design-logic-default.png": "61847c52913807cbab3c94c750e45699e54899ae59d12e6f6f980ce35cecf01d",
  "public/kv/buttons/design-logic-active.png": "6fab3757acbcd7b3353968f81322968ec088480fc16b60d370f7a1d97e7ce7a3",
  "public/kv/buttons/brand-system-default.png": "378c82f043a97961747801bd4f19983606f36c2c32ca837235bb3434cafd01d4",
  "public/kv/buttons/brand-system-active.png": "869633240d25c8b0f242df6f27b600ebd608fcaa7bd07c0c511c27ac9e6b7cf1",
  "public/kv/buttons/product-launch-default.png": "d9437922cdb8cdce2c2cb6dec6dc8e6b33b279613e8f95cf1c5f93ea5fc0ef54",
  "public/kv/buttons/product-launch-active.png": "1b66dd7801d486f40f5a286c7103abeb3b09b0db22a22e704df2c347f9bc9dd7",
  "public/kv/buttons/launch-event-default.png": "d0b04cb97836a2350a80c41a0cc69d709072aea80baa629e28d99a41c829d892",
  "public/kv/buttons/launch-event-active.png": "efac914ada0971f57ce0a5053b8a3b29fd80ed44ac1f46fe359ee16d69981f14",
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

test("uses the latest supplied desktop and mobile project card artwork", () => {
  for (const [file, expected] of Object.entries(expectedHashes)) {
    const actual = createHash("sha256")
      .update(readFileSync(join(process.cwd(), file)))
      .digest("hex");
    expect(actual, file).toBe(expected);
  }
});
