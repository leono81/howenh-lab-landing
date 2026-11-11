import { defineConfig } from 'astro/config';

// site: el dominio, de donde salen la URL canónica, la imagen para compartir y la ficha para buscadores.
// inlineStylesheets: el CSS (7 KB comprimido) va dentro del HTML: una vuelta menos antes del primer cuadro.
export default defineConfig({
  site: 'https://howenh-labs.com',
  build: { inlineStylesheets: 'always' },
});
