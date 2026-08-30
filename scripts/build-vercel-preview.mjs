import { spawn } from "node:child_process";
import { cp, mkdir, rm } from "node:fs/promises";
import process from "node:process";

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      ...options,
    });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

const root = process.cwd();
const output = `${root}/dist-vercel`;

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const app of ["api", "student-web", "admin-web"]) {
  await run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"], {
    cwd: `${root}/apps/${app}`,
  });
}

await run("npm", ["run", "build"], { cwd: `${root}/apps/api` });
await run("npm", ["run", "build"], {
  cwd: `${root}/apps/student-web`,
  env: { ...process.env, VITE_API_BASE_URL: "/api" },
});
await run("npx", ["vite", "build", "--mode", "preview-single"], {
  cwd: `${root}/apps/admin-web`,
});

await cp(`${root}/apps/student-web/dist`, output, { recursive: true });
await mkdir(`${output}/admin`, { recursive: true });
await cp(`${root}/apps/admin-web/dist`, `${output}/admin`, { recursive: true });

console.log("Single-project Vercel preview built:");
console.log("  /       -> Student Web");
console.log("  /admin  -> Admin Web");
console.log("  /api/*  -> Fastify serverless API");
