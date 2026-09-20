# Cuaderno migratorio

Herramienta web para el trabajo social en el ámbito migratorio: seguimiento de casos, documentos, plazos (con cálculo de días hábiles), derivaciones, informe social y estadísticas para memorias.

Es una sola página (`index.html`) sin dependencias ni servidor: HTML, CSS y JavaScript en el mismo archivo.

## Funciones

- **Casos:** ficha de la persona, situación administrativa, trámite, vivienda, empleo y factores de vulnerabilidad.
- **Seguimiento:** historial cronológico de entrevistas, llamadas y gestiones.
- **Documentos:** listas orientativas por trámite (arraigos, protección internacional, renovación, reagrupación, nacionalidad, etc.), editables.
- **Plazos:** calculadora de subsanaciones (10 días hábiles) y recursos, con días hábiles restantes y aviso en el caso.
- **Derivaciones y recursos:** agenda propia de entidades y servicios.
- **Informe social:** borrador generado automáticamente, editable y listo para copiar.
- **Memoria:** estadísticas agregadas por periodo (género, edad, país, situación, trámites, intervenciones).
- **Copias:** copia de seguridad y restauración como texto.

## Ejecutarlo en tu ordenador

Opción rápida: haz doble clic en `index.html`.

Opción recomendada (el almacenamiento del navegador funciona mejor con un servidor local):

```bash
python3 -m http.server 8000
```

y abre <http://localhost:8000>.

## Subirlo a GitHub y publicarlo

1. Crea un repositorio nuevo en GitHub (por ejemplo `cuaderno-migratorio`).
2. Sube los archivos de esta carpeta, con la web de GitHub («Add file» → «Upload files») o con git:

```bash
git init
git add .
git commit -m "Primera versión del Cuaderno migratorio"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/cuaderno-migratorio.git
git push -u origin main
```

3. Para tenerlo en línea con GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / `(root)` → Save**.
   Al cabo de un minuto estará en `https://TU_USUARIO.github.io/cuaderno-migratorio/`.
   Si el repositorio es privado, Pages puede requerir un plan de pago.

## Datos personales y privacidad

- Los datos **se guardan solo en el navegador** de quien usa la app (`localStorage`). No se envían a ningún servidor y **no se guardan en el repositorio**.
- Cada navegador y cada dispositivo tiene sus propios datos. Si se borran los datos del navegador, se pierden: usa la sección **Copias** con regularidad.
- Una copia de seguridad contiene datos personales: guárdala de forma segura y **nunca la subas a GitHub**.
- Trata los datos según el RGPD y las normas de tu entidad.

## Limitaciones

- Las listas de documentos son orientativas y pueden quedar desactualizadas: confirma siempre los requisitos vigentes con la normativa o la Oficina de Extranjería.
- El cálculo de plazos no descuenta festivos.
- No hay cuentas de usuario ni sincronización entre dispositivos.
- Las fuentes (Atkinson Hyperlegible y Source Serif 4) se cargan desde Google Fonts; sin conexión se usan fuentes del sistema.

## Licencia

Elige la que prefieras antes de hacer público el repositorio (por ejemplo MIT). Sin licencia, el código queda con todos los derechos reservados.
