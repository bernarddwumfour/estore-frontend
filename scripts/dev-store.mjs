import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { parseEnv } from "node:util";

const profiles = { iplug: ".env.iplug", oak: ".env.oakandloom", tyrepapa: ".env.tyrepapa", oliveandaura: ".env.oliveandaura", amammre: ".env.amammre" };
const defaultPorts = { iplug: 3000, oak: 3001, tyrepapa: 3002, oliveandaura: 3003, amammre: 3004 };
const defaultDistDirs = { iplug: ".next-iplug", oak: ".next-oakandloom", tyrepapa: ".next-tyrepapa", oliveandaura: ".next-oliveandaura", amammre: ".next-amammre" };
const profile = process.argv[2];
if (!Object.hasOwn(profiles, profile)) {
  console.error("Usage: node scripts/dev-store.mjs <iplug|oak|tyrepapa|oliveandaura|amammre> [Next.js arguments]");
  process.exit(1);
}

let values;
try {
  values = parseEnv(readFileSync(profiles[profile], "utf8"));
} catch (error) {
  console.error(`Could not load ${profiles[profile]}: ${error.message}`);
  process.exit(1);
}

const childEnv = { ...process.env, ...values };
childEnv.NEXT_DEV_DIST_DIR ||= defaultDistDirs[profile];
childEnv.NEXT_PUBLIC_STORE = profile === "oak" ? "furniture" : profile === "amammre" ? "amammre" : childEnv.NEXT_PUBLIC_STORE;
if (profile === "oliveandaura") childEnv.NEXT_PUBLIC_STORE = "oliveandaura";

const nextArgs = process.argv.slice(3);
const hasExplicitPort = nextArgs.some((arg) => arg === "-p" || arg === "--port" || arg.startsWith("--port=") || /^-p\d+$/.test(arg));
if (!hasExplicitPort && !childEnv.PORT) nextArgs.push("--port", String(defaultPorts[profile]));

const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", ...nextArgs], {
  stdio: "inherit",
  env: childEnv,
});
child.on("error", (error) => {
  console.error("Could not start Next.js:", error.message);
  process.exitCode = 1;
});
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exitCode = code ?? 1;
});
