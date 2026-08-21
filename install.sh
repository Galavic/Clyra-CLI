#!/usr/bin/env sh
set -eu

REPO="Galavic/Clyra-CLI"
VERSION="${CLYRA_VERSION:-}"
if [ -z "$VERSION" ]; then
  VERSION="$(curl -fsSL -H 'User-Agent: clyra-installer' "https://api.github.com/repos/$REPO/releases/latest" \
    | sed -n 's/.*"tag_name"[[:space:]]*:[[:space:]]*"v\([^"]*\)".*/\1/p' | head -n 1)"
fi
[ -n "$VERSION" ] || { echo "Could not determine the Clyra version." >&2; exit 1; }

case "$(uname -s)" in
  Linux) OS="linux" ;;
  Darwin) OS="darwin" ;;
  *) echo "Unsupported system. Use install.ps1 on Windows." >&2; exit 1 ;;
esac
case "$(uname -m)" in
  x86_64|amd64) ARCH="x64" ;;
  arm64|aarch64) ARCH="arm64" ;;
  *) echo "Unsupported architecture: $(uname -m)" >&2; exit 1 ;;
esac

ASSET="clyra-${OS}-${ARCH}.tar.gz"
URL="https://github.com/${REPO}/releases/download/v${VERSION}/${ASSET}"
ROOT="${HOME}/.local/share/clyra/${VERSION}/${OS}-${ARCH}"
BIN="${HOME}/.local/bin"
TMP="$(mktemp -d 2>/dev/null || mktemp -d -t clyra)"
trap 'rm -rf "$TMP"' EXIT INT TERM

mkdir -p "$ROOT" "$BIN"
echo "Downloading Clyra ${VERSION} (${OS}/${ARCH})..."
curl -fL --retry 3 -A clyra-installer "$URL" -o "$TMP/clyra.tar.gz"
tar -xzf "$TMP/clyra.tar.gz" -C "$ROOT"
ln -sfn "$ROOT/clyra" "$BIN/clyra"

echo "Clyra ${VERSION} was installed in ${ROOT}"
if ! printf '%s' "${PATH:-}" | tr ':' '\n' | grep -Fxq "$BIN"; then
  echo "Add ${BIN} to your PATH (for example: export PATH=\"\$HOME/.local/bin:\$PATH\")."
fi
echo "Run: clyra"
