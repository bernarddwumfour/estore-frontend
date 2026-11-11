import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { parseEnv } from "node:util";

const profiles = { iplug: ".env.iplug", oak: ".env.oakandloom", beauty: ".env.beauty" };
const profile = process.argv[2];
if (!Object.hasOwn(profiles, profile)) {
  console.error("Usage: node scripts/dev-store.mjs <iplug|oak|beauty> [Next.js arguments]");
  process.exit(1);
}

let values;
try {
  values = parseEnv(readFileSync(profiles[profile], "utf8"));
} catch (error) {
  console.error(`Could not load ${profiles[profile]}: ${error.message}`);
  process.exit(1);
}

const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", ...process.argv.slice(3)], {
  stdio: "inherit",
  env: { ...process.env, ...values },
});
child.on("error", (error) => {
  console.error("Could not start Next.js:", error.message);
  process.exitCode = 1;
});
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exitCode = code ?? 1;
});
