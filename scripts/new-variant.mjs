#!/usr/bin/env node
// Usage: pnpm new-variant <id> [--from <variant>] [--name "Display name"]
// Copies a variant folder under src/navbars/ and gives it its own meta.ts.
// Defaults to copying remix-a, which is wired to the lab's motion sliders.
import { cpSync, existsSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args.splice(i, 2)[1];
};
const from = flag("from") ?? "remix-a";
const name = flag("name");
const id = args[0];

const root = join(import.meta.dirname, "..", "src", "navbars");
const variants = readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);

if (!id || !/^[a-z0-9][a-z0-9-]*$/.test(id)) {
  console.error("Usage: pnpm new-variant <id> [--from <variant>] [--name \"Display name\"]\n  id: lowercase letters, digits and dashes, e.g. remix-b");
  process.exit(1);
}
if (existsSync(join(root, id))) {
  console.error(`Variant "${id}" already exists.`);
  process.exit(1);
}
if (!variants.includes(from)) {
  console.error(`No variant "${from}" to copy. Have: ${variants.join(", ")}`);
  process.exit(1);
}

cpSync(join(root, from), join(root, id), { recursive: true });
const display = name ?? id.replace(/(^|-)(\w)/g, (_, dash, c) => (dash ? " " : "") + c.toUpperCase());
writeFileSync(
  join(root, id, "meta.ts"),
  `import type { VariantMeta } from "../types";

export default {
  name: ${JSON.stringify(display)},
  description: ${JSON.stringify(`Copied from ${from}.`)},
  order: ${variants.length},
} satisfies VariantMeta;
`
);
console.log(`Created src/navbars/${id} (from ${from}). It shows up as tab "${display}" — open #${id}.`);
