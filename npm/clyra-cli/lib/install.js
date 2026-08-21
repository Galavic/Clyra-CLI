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
  const archive = path.join(os.tmpdir(), `clyra-${Date.now()}-${Math.random().toString(16).slice(2)}${item.asset.endsWith(".zip") ? ".zip" : ".tar.gz"}`);
  fs.mkdirSync(destination, { recursive: true });
  await download(`https://github.com/${repo}/releases/download/v${version}/${item.asset}`, archive);
  const result = spawnSync("tar", ["-xf", archive, "-C", destination], { stdio: "inherit", windowsHide: true });
  if (result.status !== 0) throw new Error("Could not extract the Clyra package (tar is required).");
  fs.unlinkSync(archive);
  const executable = path.join(destination, process.platform === "win32" ? "clyra.exe" : "clyra");
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
