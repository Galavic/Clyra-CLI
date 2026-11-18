#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import { execFileSync } from "node:child_process"

const version = process.env.CLYRA_VERSION || process.argv[2]
if (!version) throw new Error("Uso: CLYRA_VERSION=0.1.0-beta.3 node scripts/package-release.mjs")
if (!/^\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?$/.test(version)) throw new Error("Invalid release version")

const root = path.resolve(import.meta.dirname, "..", "..")
const source = path.join(root, "opencode-src", "packages", "opencode", "dist")
const output = path.join(root, "release", `Clyra-${version}`, "artifacts")
fs.rmSync(output, { recursive: true, force: true })
fs.mkdirSync(output, { recursive: true })

// x64 se compila en dos variantes:
//   baseline -> sin AVX2. En Windows es el asset principal porque arranca en
//               cualquier x64 (Sandy/Ivy Bridge, VMs sin passthrough); el
//               build AVX2 aborta con "Illegal instruction" antes de ejecutar
//               JS. En Linux se publica como asset extra.
//   avx2     -> mas rapido, solo CPUs Haswell+.
// Darwin x64 no tiene baseline real en Bun 1.3.14, asi que solo va el normal.
const targets = [
  { platform: "windows", arch: "x64", format: "zip", dist: "opencode-windows-x64-baseline", asset: "clyra-windows-x64" },
  { platform: "windows", arch: "x64", format: "zip", dist: "opencode-windows-x64", asset: "clyra-windows-x64-avx2" },
  { platform: "windows", arch: "arm64", format: "zip" },
  { platform: "linux", arch: "x64", format: "tar.gz" },
  { platform: "linux", arch: "x64", format: "tar.gz", dist: "opencode-linux-x64-baseline", asset: "clyra-linux-x64-baseline" },
  { platform: "linux", arch: "arm64", format: "tar.gz" },
  { platform: "darwin", arch: "x64", format: "tar.gz" },
  { platform: "darwin", arch: "arm64", format: "tar.gz" },
]

for (const target of targets) {
  const { platform, arch, format } = target
  const distName = target.dist ?? `opencode-${platform}-${arch}`
  const bin = path.join(source, distName, "bin")
  if (!fs.existsSync(bin)) {
    console.warn(`Omitido ${distName}: no existe ${bin}`)
    continue
  }
  const stage = path.join(output, distName)
  fs.cpSync(bin, stage, { recursive: true })
  const executable = platform === "windows" ? "clyra.exe" : "clyra"
  fs.renameSync(path.join(stage, platform === "windows" ? "opencode.exe" : "opencode"), path.join(stage, executable))
  const assetName = target.asset ?? `clyra-${platform}-${arch}`
  const asset = path.join(output, `${assetName}.${format}`)
  if (format === "zip") {
    execFileSync("tar", ["-a", "-c", "-f", asset, "-C", stage, "."], { stdio: "inherit" })
  } else {
    // Windows tar stores Unix binaries without executable permissions.
    execFileSync(process.platform === "win32" ? "python" : "python3", ["-c", `
import pathlib, sys, tarfile
stage, asset = sys.argv[1:]
def permissions(entry):
    entry.mode = 0o755 if entry.isdir() or pathlib.PurePosixPath(entry.name).name == "clyra" else 0o644
    entry.uid = entry.gid = 0
    entry.uname = entry.gname = ""
    return entry
with tarfile.open(asset, "w:gz") as archive:
    archive.add(stage, arcname=".", filter=permissions)
`, stage, asset], { stdio: "inherit" })
  }
  fs.rmSync(stage, { recursive: true, force: true })
  console.log(asset)
}
