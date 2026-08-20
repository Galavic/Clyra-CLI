# Clyra CLI

Distribución oficial del instalador de Clyra para Windows.

## Descargar

Descarga la versión más reciente desde [Releases](https://github.com/Galavic/Clyra-CLI/releases/latest).

El instalador coloca Clyra en `%LOCALAPPDATA%\Clyra` y agrega el comando `clyra` al `PATH` del usuario.

## Requisitos

- Windows 10/11 de 64 bits.
- No requiere Python: el backend G4F está integrado en `clyra.exe`.
- Configura `G4F_API_KEY` o `%USERPROFILE%\\.config\\clyra\\credentials.json` si el proveedor lo solicita.

## Actualizaciones

Desde una instalación existente puedes ejecutar:

```text
clyra update
```

Cada release conserva la configuración y las sesiones del usuario.

## Licencia

El código propio de Clyra se distribuye bajo MIT. Consulta
[`THIRD-PARTY-NOTICES.txt`](THIRD-PARTY-NOTICES.txt) para las licencias de componentes incluidos.
