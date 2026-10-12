# 🗓️ Tracker

Aplicación web (PWA) para registrar hábitos, ver estadísticas y competir en duelos con otros usuarios.

## Funciones

- **Hábitos diarios** con calendario y rachas
- **Estadísticas**: análisis mensual, patrones por día de la semana y predicciones
- **Duelos** entre usuarios
- **Panel de administración** y control de cuentas
- **Notificaciones** y temas de color (neutral, rojo, rosa)
- **Copia de seguridad** de los datos
- Instalable en móvil como app (PWA con *service worker*)

## Tecnología

HTML, CSS y JavaScript (módulos ES) sin *framework* · [Supabase](https://supabase.com) para cuentas y datos · Netlify para el despliegue.

## Estructura

```
├── index.html            # Punto de entrada
├── app.js                # Arranque y configuración
├── style.css
├── sw.js                 # Service worker (modo offline)
├── manifest.webmanifest
├── admin/                # Panel de estadísticas y control
├── analytics/            # Análisis mensual, patrones y predicciones
├── data/                 # Usuarios, hábitos, estadísticas y backups
└── ui/                   # Dashboard, duelos, ajustes y notificaciones
```

## Ejecutar en local

```bash
python3 -m http.server 8080
# abre http://localhost:8080
```

## Despliegue

Netlify publica la raíz del repositorio (ver `netlify.toml`).

---

Desarrollado por **[CrazyEstudio](https://crazyestudio.es)**.
