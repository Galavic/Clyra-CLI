const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const repo = "Galavic/Clyra-CLI";
const root = process.platform === "win32"
  ? path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local"), "Clyra", "npm")
  : path.join(os.homedir(), ".local", "share", "clyra-npm");

async function json(url) {
  const response = await fetch(url, { headers: { "User-Agent": "clyra-npm" } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function download(url, destination) {
  const response = await fetch(url, { headers: { "User-Agent": "clyra-npm" } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  fs.writeFileSync(destination, Buffer.from(await response.arrayBuffer()));
}

function target() {
  const platform = process.platform === "win32" ? "windows" : process.platform;
  const arch = process.arch === "arm64" ? "arm64" : "x64";
  if (!["win32", "linux", "darwin"].includes(process.platform)) throw new Error(`Unsupported system: ${process.platform}`);
  return { platform, arch, asset: platform === "windows" ? `clyra-windows-${arch}.zip` : `clyra-${platform}-${arch}.tar.gz` };
}

async function install() {
  const version = (process.env.CLYRA_VERSION || (await json(`https://api.github.com/repos/${repo}/releases/latest`)).tag_name).replace(/^v/, "");
  const item = target();
  const destination = path.join(root, version, `${item.platform}-${item.arch}`);
  const executable = path.join(destination, process.platform === "win32" ? "clyra.exe" : "clyra");
  // A clyra launched from this directory holds a lock on its own executable, so
  // extracting over it fails on Windows with "Can't unlink already-existing
  // object: Permission denied". If it is already there, reuse it: re-extracting
  // an identical copy cannot improve anything and only risks the lock.
  if (fs.existsSync(executable)) {
    fs.mkdirSync(root, { recursive: true });
    fs.writeFileSync(path.join(root, "current.json"), JSON.stringify({ version, executable }, null, 2));
    return executable;
  }
  const archive = path.join(os.tmpdir(), `clyra-${Date.now()}-${Math.random().toString(16).slice(2)}${item.asset.endsWith(".zip") ? ".zip" : ".tar.gz"}`);
  // Extract into a staging directory and copy in, so a failed run never leaves a
  // half-written destination behind.
  const staging = fs.mkdtempSync(path.join(os.tmpdir(), "clyra-stage-"));
  try {
    fs.mkdirSync(destination, { recursive: true });
    await download(`https://github.com/${repo}/releases/download/v${version}/${item.asset}`, archive);
    const result = spawnSync("tar", ["-xf", archive, "-C", staging], { stdio: "inherit", windowsHide: true });
    if (result.status !== 0) throw new Error("Could not extract the Clyra package (tar is required).");
    for (const name of fs.readdirSync(staging)) {
      fs.copyFileSync(path.join(staging, name), path.join(destination, name));
    }
  } finally {
    fs.rmSync(archive, { force: true });
    fs.rmSync(staging, { recursive: true, force: true });
  }
  if (!fs.existsSync(executable)) throw new Error(`The Clyra package did not contain ${path.basename(executable)}.`);
  fs.writeFileSync(path.join(root, "current.json"), JSON.stringify({ version, executable }, null, 2));
  return executable;
}

module.exports = { install, root };

if (require.main === module) {
  install().catch((error) => {
    console.error(`Could not install Clyra: ${error.message}`);
    process.exitCode = 1;
  });
}
