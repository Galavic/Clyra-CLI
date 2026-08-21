# Clyra CLI

Distribución oficial de Clyra para Windows, Linux y macOS.

## Descargar

### Windows (PowerShell)

```powershell
powershell -ExecutionPolicy Bypass -c "irm https://clyra-cli.xyz/install.ps1 | iex"
```

### Linux y macOS

```sh
curl -fsSL https://clyra-cli.xyz/install.sh | sh
```

### npm

```sh
npm install -g clyra-cli
```

También puedes descargar los paquetes específicos desde
[Descargas de Clyra](https://clyra-cli.xyz/download/latest).

El script de Windows coloca Clyra en `%LOCALAPPDATA%\Clyra`; Linux y macOS usan
`~/.local/share/clyra` y `~/.local/bin`.

## Requisitos

- Windows 10/11, Linux o macOS (x64 o arm64).
- No requiere Python: el backend G4F está integrado en `clyra.exe`.
- Configura `G4F_API_KEY` o `%USERPROFILE%\\.config\\clyra\\credentials.json` si el proveedor lo solicita.

## Actualizaciones

Desde una instalación existente puedes ejecutar:

```text
clyra update
```

Cada release conserva la configuración y las sesiones del usuario. Las
instalaciones por script y npm descargan la versión adecuada para el sistema.

## Licencia

El código propio de Clyra se distribuye bajo MIT. Consulta
[`THIRD-PARTY-NOTICES.txt`](THIRD-PARTY-NOTICES.txt) para las licencias de componentes incluidos.
