import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const expectedHashes: Record<string, string> = {
  "public/kv/buttons/about-default.png": "fc10d852d995ea7699ecc230be148759cfc4722a890134d1d2724f665f687107",
  "public/kv/buttons/about-active.png": "13ba03980854744d23931e1fd91472e410a0aa668d91058841601816210eb245",
  "public/kv/buttons/design-logic-default.png": "75899a918c70ba81500e5315164c5642e819cb398e60f298d305f8e8906ece41",
  "public/kv/buttons/design-logic-active.png": "dd9eaedd0407b00ceb675a0f2b507997d35bf6e8b256f6843faff06dd745d284",
  "public/kv/buttons/brand-system-default.png": "c92e6f61c2aacc531ee0d8203e67c5532173cd3f1dbbe9e67117100c9c50abdc",
  "public/kv/buttons/brand-system-active.png": "25e135d55f374e882d6b7288e57485985696d8df0b545729f96f97e21030dd45",
  "public/kv/buttons/product-launch-default.png": "7d4fa107ee2e7cdb6c6e6ead3f9fc545cf82fc9015078c11eb7c96afedc74d44",
  "public/kv/buttons/product-launch-active.png": "95946f90d86bf3f7598e5323821acb09282a21604ce456a6712c4d3d8d69633a",
  "public/kv/buttons/launch-event-default.png": "28ecd78ce1c4437d1bdf925c6f55263e71c4dae213ae94ea8163d87b675a2709",
  "public/kv/buttons/launch-event-active.png": "da2d1c9a63a070a658ed754c30787ffd9e7bf99b23174f072ddca0f00a057855",
  "public/kv-mobile/cards/about-default.png": "4e86eb6a47f5c5347abdbd4734bd2ac79c6424b954f62c82373680ecf12c1c3a",
  "public/kv-mobile/cards/about-active.png": "61db92b73b078625009702e011e080fa448f05c2cf55dc8df3aa27d9271fbc6a",
  "public/kv-mobile/cards/design-logic-default.png": "865b2fd7ac73db1e3fec80ad27f33f5060d524fa2ec4562dff9028a2d6a6782e",
  "public/kv-mobile/cards/design-logic-active.png": "e3db0ceef077f154f02c39f79926e8de66241debcc361ec6f89b8dc638ff859f",
  "public/kv-mobile/cards/brand-system-default.png": "ce9e1cec776007d32c5c6d1a40fdfe01c441114bc9882f6736464d447c619c82",
  "public/kv-mobile/cards/brand-system-active.png": "1ba36f80c608d290a792cb2d5956be549b7613232c4147386fbfc871e7d3380c",
  "public/kv-mobile/cards/product-launch-default.png": "0cba37683ad769dd5bf58c63be6823b489c0c35f1cebf036fa1686a7814f4c82",
  "public/kv-mobile/cards/product-launch-active.png": "3d04a9491ccec343076e776413e65d53191142d1167f3e27b3d87df3b92bd253",
  "public/kv-mobile/cards/launch-event-default.png": "194c9936ed131de1bd47a54580e0ac7cc07c6f899b2d4898045d5a301cf66e54",
  "public/kv-mobile/cards/launch-event-active.png": "2ce759e267dc231f1f8d12c04535b26f801dccfdeb003582476dae997ac1d1fa",
};

test("uses the latest supplied desktop and mobile project card artwork", () => {
  for (const [file, expected] of Object.entries(expectedHashes)) {
    const actual = createHash("sha256")
      .update(readFileSync(join(process.cwd(), file)))
      .digest("hex");
    expect(actual, file).toBe(expected);
  }
});
