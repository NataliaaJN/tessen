# apps/shared

Look and feel shared by the docs, the playground and the theme studio. Not a workspace package.

- `surfaces.css`: the five surfaces (Grafito, Pizarra, Medianoche, Porcelana, Bruma). Each app imports it with a relative path.
- `appearance-boot.js`: restores the chosen surface and accent before first paint. It must be served as a classic script, so a copy lives in `apps/{docs,playground,theme-studio}/public/`. Edit this file and copy it to the three folders.
