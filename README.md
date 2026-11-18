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
- En x64 hace falta una CPU con SSE4.2 (2008 o posterior). El paquete de
  Windows no necesita AVX2, así que funciona en Sandy/Ivy Bridge y en VMs sin
  passthrough de AVX2. Si tu CPU es Haswell o más nueva y quieres la variante
  AVX2, usa `clyra-windows-x64-avx2.zip`.
- Inicia sesión con la misma cuenta de Clyra ADE. Usa `clyra login`,
  `clyra logout` y `clyra whoami`, o los comandos `/login`, `/logout` y
  `/whoami` dentro del CLI.
- Los modelos se ejecutan directamente mediante Zen. Worm requiere una sesión
  válida y descarga sus instrucciones del servicio de Clyra.

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
