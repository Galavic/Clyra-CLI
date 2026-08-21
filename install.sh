#!/usr/bin/env sh
set -eu

REPO="Galavic/Clyra-CLI"
VERSION="${CLYRA_VERSION:-}"
if [ -z "$VERSION" ]; then
  VERSION="$(curl -fsSL -H 'User-Agent: clyra-installer' "https://api.github.com/repos/$REPO/releases/latest" \
    | sed -n 's/.*"tag_name"[[:space:]]*:[[:space:]]*"v\([^"]*\)".*/\1/p' | head -n 1)"
fi
[ -n "$VERSION" ] || { echo "No se pudo determinar la versión de Clyra." >&2; exit 1; }

case "$(uname -s)" in
  Linux) OS="linux" ;;
  Darwin) OS="darwin" ;;
  *) echo "Sistema no compatible. Usa install.ps1 en Windows." >&2; exit 1 ;;
esac
case "$(uname -m)" in
  x86_64|amd64) ARCH="x64" ;;
  arm64|aarch64) ARCH="arm64" ;;
  *) echo "Arquitectura no compatible: $(uname -m)" >&2; exit 1 ;;
esac

ASSET="clyra-${OS}-${ARCH}.tar.gz"
URL="https://github.com/${REPO}/releases/download/v${VERSION}/${ASSET}"
ROOT="${HOME}/.local/share/clyra/${VERSION}/${OS}-${ARCH}"
BIN="${HOME}/.local/bin"
TMP="$(mktemp -d 2>/dev/null || mktemp -d -t clyra)"
trap 'rm -rf "$TMP"' EXIT INT TERM

mkdir -p "$ROOT" "$BIN"
echo "Descargando Clyra ${VERSION} (${OS}/${ARCH})..."
curl -fL --retry 3 -A clyra-installer "$URL" -o "$TMP/clyra.tar.gz"
tar -xzf "$TMP/clyra.tar.gz" -C "$ROOT"
ln -sfn "$ROOT/clyra" "$BIN/clyra"

echo "Clyra ${VERSION} se instaló en ${ROOT}"
if ! printf '%s' "${PATH:-}" | tr ':' '\n' | grep -Fxq "$BIN"; then
  echo "Añade ${BIN} a tu PATH (por ejemplo: export PATH=\"\$HOME/.local/bin:\$PATH\")."
fi
echo "Ejecuta: clyra"
