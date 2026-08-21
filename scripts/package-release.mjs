#!/usr/bin/env node
import fs from "node:fs"
import path from "node:path"
import { execFileSync } from "node:child_process"

const version = process.env.CLYRA_VERSION || process.argv[2]
if (!version) throw new Error("Uso: CLYRA_VERSION=0.1.0-beta.3 node scripts/package-release.mjs")

const root = path.resolve(import.meta.dirname, "..", "..")
const source = path.join(root, "opencode-src", "packages", "opencode", "dist")
const output = path.join(root, "release", `Clyra-${version}`, "artifacts")
fs.rmSync(output, { recursive: true, force: true })
fs.mkdirSync(output, { recursive: true })

const targets = [
  ["windows", "x64", "zip"], ["windows", "arm64", "zip"],
  ["linux", "x64", "tar.gz"], ["linux", "arm64", "tar.gz"],
  ["darwin", "x64", "tar.gz"], ["darwin", "arm64", "tar.gz"],
]

for (const [platform, arch, format] of targets) {
  const distName = `opencode-${platform}-${arch}`
  const bin = path.join(source, distName, "bin")
  if (!fs.existsSync(bin)) {
    console.warn(`Omitido ${distName}: no existe ${bin}`)
    continue
  }
  const stage = path.join(output, distName)
  fs.cpSync(bin, stage, { recursive: true })
  const asset = path.join(output, `clyra-${platform}-${arch}.${format}`)
  if (format === "zip") {
    execFileSync("tar", ["-a", "-c", "-f", asset, "-C", stage, "."], { stdio: "inherit" })
  } else {
    execFileSync("tar", ["-czf", asset, "-C", stage, "."], { stdio: "inherit" })
  }
  fs.rmSync(stage, { recursive: true, force: true })
  console.log(asset)
}
