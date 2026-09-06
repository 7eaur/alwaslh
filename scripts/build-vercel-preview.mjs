import { spawn } from "node:child_process";
import { access, cp, mkdir, rm } from "node:fs/promises";
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

async function requireBuildOutput(path, label) {
  try {
    await access(path);
  } catch {
    throw new Error(`Missing ${label} build output at ${path}`);
  }
}

const root = process.cwd();
const output = `${root}/dist-vercel`;
const buildEnv = {
  ...process.env,
  NODE_ENV: "development",
  npm_config_production: "false",
};

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const app of ["api", "student-web", "admin-web"]) {
  await run("npm", ["install", "--include=dev", "--ignore-scripts", "--no-audit", "--no-fund"], {
    cwd: `${root}/apps/${app}`,
    env: buildEnv,
  });
}

await run("npm", ["run", "build"], {
  cwd: `${root}/apps/api`,
  env: buildEnv,
});
await run("npx", ["tsc", "-b"], {
  cwd: `${root}/apps/student-web`,
  env: buildEnv,
});
await run("npx", ["vite", "build"], {
  cwd: `${root}/apps/student-web`,
  env: { ...buildEnv, VITE_API_BASE_URL: "/api" },
});
await run("npx", ["tsc", "-b"], {
  cwd: `${root}/apps/admin-web`,
  env: buildEnv,
});
await run("npx", ["vite", "build", "--mode", "preview-single"], {
  cwd: `${root}/apps/admin-web`,
  env: buildEnv,
});

await Promise.all([
  requireBuildOutput(`${root}/apps/api/dist/app.js`, "API"),
  requireBuildOutput(`${root}/apps/student-web/dist/index.html`, "Student"),
  requireBuildOutput(`${root}/apps/admin-web/dist/index.html`, "Admin"),
]);

await cp(`${root}/apps/student-web/dist`, output, { recursive: true });
await mkdir(`${output}/admin`, { recursive: true });
await cp(`${root}/apps/admin-web/dist`, `${output}/admin`, { recursive: true });

await Promise.all([
  requireBuildOutput(`${output}/index.html`, "combined Student"),
  requireBuildOutput(`${output}/admin/index.html`, "combined Admin"),
]);

console.log("Single-project Vercel preview built:");
console.log("  /       -> Student Web");
console.log("  /admin  -> Admin Web");
console.log("  /api/*  -> Fastify serverless API");
