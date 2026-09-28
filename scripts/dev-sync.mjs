#!/usr/bin/env node
// Usage: pnpm dev:sync [--latest] [--interval <seconds>] [--port <port>]
//
// Runs the dev server and keeps the checkout in step with GitHub, so commits
// pushed from a cloud session show up in the browser without a manual pull.
// Every few seconds it fetches the current branch and fast-forwards if the
// remote moved; Vite hot-reloads the changed files. If package.json or the
// lockfile changed it reinstalls and restarts the server.
//
// --latest  also follow new branches: switch to whichever claude/* branch on
//           origin was pushed most recently (each cloud session gets its own).
//
// It never merges, rebases or discards anything. If you have local edits that
// a pull would touch, or your branch has commits the remote doesn't, it says
// so and waits.
import { execFileSync, spawn } from "node:child_process";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? undefined : args[i + 1];
};
const followLatest = args.includes("--latest");
const intervalMs = Number(flag("interval") ?? 4) * 1000;
const port = flag("port");
const isWindows = process.platform === "win32";

const git = (...a) => execFileSync("git", a, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const tryGit = (...a) => {
  try {
    return git(...a);
  } catch {
    return null;
  }
};
const log = (msg) => console.log(`\x1b[36m[sync]\x1b[0m ${msg}`);
const short = (sha) => sha.slice(0, 7);

// ---- dev server ----
// pnpm exec doesn't pass signals on to Vite, so on macOS/Linux the server runs
// in its own process group and gets stopped as a group. Its stdin is not the
// terminal: a background group reading the TTY would be suspended.
let server = null;
let restarting = false;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function startServer() {
  server = spawn("pnpm", ["exec", "vite", ...(port ? ["--port", port] : [])], {
    stdio: ["ignore", "inherit", "inherit"],
    shell: isWindows,
    detached: !isWindows,
  });
}

async function stopServer() {
  const child = server;
  if (!child) return;
  server = null;
  if (isWindows) {
    try {
      execFileSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
    } catch {
      /* already gone */
    }
    return;
  }
  const signalGroup = (sig) => {
    try {
      process.kill(-child.pid, sig);
      return true;
    } catch {
      return false; // group is empty
    }
  };
  signalGroup("SIGTERM");
  // Wait for the whole group (Vite included) to exit so the port is free.
  for (let i = 0; i < 60 && signalGroup(0); i++) await wait(50);
  signalGroup("SIGKILL");
}

async function reinstallAndRestart() {
  restarting = true;
  log("dependencies changed: reinstalling and restarting the dev server");
  await stopServer();
  try {
    execFileSync("pnpm", ["install"], { stdio: "inherit", shell: isWindows });
  } catch {
    log("pnpm install failed; starting the server anyway");
  }
  startServer();
  restarting = false;
}

// ---- git ----
const currentBranch = () => git("rev-parse", "--abbrev-ref", "HEAD");
const isClean = () => git("status", "--porcelain", "--untracked-files=no") === "";

function latestClaudeBranch() {
  const out = tryGit(
    "for-each-ref",
    "--sort=-committerdate",
    "--count=1",
    "--format=%(refname:strip=3)",
    "refs/remotes/origin/claude/"
  );
  return out ? `claude/${out.replace(/^claude\//, "")}` : null;
}

let warned = "";
const warnOnce = (key, msg) => {
  if (warned === key) return;
  warned = key;
  log(msg);
};

function poll() {
  if (followLatest) {
    if (tryGit("fetch", "--quiet", "--prune", "origin") === null) return warnOnce("fetch", "fetch failed; retrying");
    const latest = latestClaudeBranch();
    const branch = currentBranch();
    if (latest && latest !== branch) {
      if (!isClean()) return warnOnce(`dirty-switch:${latest}`, `newer branch ${latest} found, but you have local edits; commit or stash them to switch`);
      const hasLocal = tryGit("rev-parse", "--verify", "--quiet", `refs/heads/${latest}`) !== null;
      const before = git("rev-parse", "HEAD");
      if (hasLocal) git("checkout", "--quiet", latest);
      else git("checkout", "--quiet", "--track", `origin/${latest}`);
      log(`switched to ${latest}`);
      afterMove(before);
    }
  }

  const branch = currentBranch();
  if (branch === "HEAD") return warnOnce("detached", "detached HEAD; check out a branch to sync");
  if (!followLatest && tryGit("fetch", "--quiet", "origin", branch) === null) {
    return warnOnce(`nofetch:${branch}`, `can't fetch origin/${branch} (not pushed yet?); waiting`);
  }
  const local = git("rev-parse", "HEAD");
  const remote = tryGit("rev-parse", `origin/${branch}`);
  if (!remote || remote === local) return;
  if (tryGit("merge-base", "--is-ancestor", local, remote) === null) {
    return warnOnce(`diverged:${remote}`, `${branch} has local commits that aren't on origin; not pulling`);
  }
  if (tryGit("merge", "--ff-only", "--quiet", remote) === null) {
    return warnOnce(`blocked:${remote}`, `can't fast-forward: local edits touch the incoming files; commit or stash them`);
  }
  warned = "";
  const subjects = git("log", "--format=%h %s", `${local}..${remote}`).split("\n").reverse();
  log(`pulled ${short(local)} → ${short(remote)}`);
  for (const s of subjects) log(`  ${s}`);
  afterMove(local);
}

function afterMove(before) {
  const changed = git("diff", "--name-only", before, "HEAD").split("\n");
  if (changed.some((f) => f === "package.json" || f === "pnpm-lock.yaml")) reinstallAndRestart();
}

// ---- main ----
if (tryGit("rev-parse", "--is-inside-work-tree") !== "true") {
  console.error("dev:sync must run inside the repo");
  process.exit(1);
}
log(
  `following ${followLatest ? "the newest claude/* branch" : currentBranch()} on origin, every ${intervalMs / 1000}s (Ctrl+C to stop)`
);
startServer();
poll();
const timer = setInterval(() => {
  if (restarting) return;
  try {
    poll();
  } catch (e) {
    log(`error: ${e.message.split("\n")[0]}`);
  }
}, intervalMs);

const shutdown = async () => {
  clearInterval(timer);
  await stopServer();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
