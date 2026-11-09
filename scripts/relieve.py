"""Muestrea el DEM Copernicus GLO-30 en el marco girado del mapa.

Lee la proyección de src/data/mapa.json y escribe docs/lugar/dem-marco.bin:
cabecera de 3 int32 (columnas, filas, paso en unidades) + alturas en decímetros (int16), por filas.
Uso: python3 scripts/relieve.py RUTA/AL/Copernicus_DSM_COG_10_S54_00_W068_00_DEM.tif
Con --vista escribe docs/lugar/dem-vista.bin, un recorte más amplio alrededor del cabo para la vista de costa
(cabecera con x0, y0 extra: el origen del recorte en unidades del marco).
Tile: https://copernicus-dem-30m.s3.amazonaws.com/Copernicus_DSM_COG_10_S54_00_W068_00_DEM/Copernicus_DSM_COG_10_S54_00_W068_00_DEM.tif
"""
import json, math, sys, pathlib
import numpy as np
from PIL import Image

RAIZ = pathlib.Path(__file__).resolve().parent.parent
mapa = json.loads((RAIZ / 'src/data/mapa.json').read_text())
p, marco = mapa['proy'], mapa['marco']
PASO = 3  # unidades del mapa (30 m), igual a la resolución del DEM

dem = np.array(Image.open(sys.argv[1]), dtype=np.float32)  # 3600 filas (lat -53..-54) x 2400 col (lon -68..-67)
filas, cols = dem.shape

vista = '--vista' in sys.argv
# recorte en unidades del marco: todo el marco, o la zona del cabo con 15 km de meseta detrás
OX, OY, W, H = (-1500, mapa['costaY'] - 400, 2700, 2000) if vista else (0, 0, marco['w'], marco['h'])
nx, ny = W // PASO + 1, H // PASO + 1
gx, gy = np.meshgrid(OX + np.arange(nx) * PASO, OY + np.arange(ny) * PASO)
# deshacer: marco -> girado -> plano (km) -> lon/lat
xr, yr = (gx + p['X0']) / p['U'], (gy + p['Y0']) / p['U']
c, s = math.cos(p['ANG']), math.sin(p['ANG'])
x = xr * c + yr * s
y = -xr * s + yr * c
lon = x / p['KX'] + p['LON0']
lat = -y / p['KY'] + p['LAT0']
# índice fraccional en el tile (centros de píxel)
fi = (-53 - lat) * filas - 0.5
fj = (lon + 68) * cols - 0.5
i0, j0 = np.floor(fi).astype(int), np.floor(fj).astype(int)
ti, tj = fi - i0, fj - j0
i0, j0 = np.clip(i0, 0, filas - 2), np.clip(j0, 0, cols - 2)
z = (dem[i0, j0] * (1 - ti) * (1 - tj) + dem[i0 + 1, j0] * ti * (1 - tj)
     + dem[i0, j0 + 1] * (1 - ti) * tj + dem[i0 + 1, j0 + 1] * ti * tj)

out = RAIZ / ('docs/lugar/dem-vista.bin' if vista else 'docs/lugar/dem-marco.bin')
with open(out, 'wb') as f:
    f.write(np.array([nx, ny, PASO] + ([OX, OY] if vista else []), dtype='<i4').tobytes())
    f.write(np.round(z * 10).astype('<i2').tobytes())
print(out, nx, ny, 'z', float(z.min()), float(z.max()))
