#!/usr/bin/env node
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const { install, root } = require("../lib/install");

async function main() {
  const version = (process.env.CLYRA_VERSION || "latest").replace(/^v/, "");
  const platform = process.platform === "win32" ? "windows" : process.platform;
  const arch = process.arch === "arm64" ? "arm64" : "x64";
  const home = require("os").homedir();
  const cacheRoot = process.platform === "win32"
    ? path.join(process.env.LOCALAPPDATA || path.join(home, "AppData", "Local"), "Clyra", "npm")
    : path.join(home, ".local", "share", "clyra-npm");
  const candidate = version === "latest" ? null : path.join(root, version, `${platform}-${arch}`, process.platform === "win32" ? "clyra.exe" : "clyra");
  let executable = candidate && fs.existsSync(candidate) ? candidate : null;
  if (!executable) {
    try {
      const current = JSON.parse(fs.readFileSync(path.join(cacheRoot, "current.json"), "utf8"));
      // The npm package version and the extracted binary version move on
      // independent tracks: the published clyra-cli is 0.1.0-beta.20 while the
      // extracted binary is whatever the last release was. Requiring them to be
      // equal meant the cache was never reused, so every launch re-extracted.
      // Re-extracting over a clyra that is already running fails on Windows,
      // because its own clyra.exe is locked.
      if (current.executable && fs.existsSync(current.executable)) {
        executable = current.executable;
      }
    } catch {}
  }
  if (!executable) executable = await install();
  const child = spawn(executable, process.argv.slice(2), { stdio: "inherit", windowsHide: false });
  child.on("exit", (code, signal) => process.exitCode = signal ? 1 : (code ?? 1));
}

main().catch((error) => { console.error(`Could not start Clyra: ${error.message}`); process.exitCode = 1; });
