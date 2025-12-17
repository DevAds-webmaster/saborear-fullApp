# Menú Digital - Frontend

Aplicación React con Vite para mostrar menús digitales de restaurantes.

## Características

- Visualización de menús por slug
- Carrito de compras integrado
- Integración con WhatsApp para envío de pedidos
- Diseño responsive con Tailwind CSS

## Rutas

- `/:slug` - Visualización del menú del restaurante
- `/cart/:slug` - Visualización del menú con carrito habilitado

## Configuración

1. Instalar dependencias:
```bash
npm install
```

2. Crear archivo `.env` con las siguientes variables:
```
VITE_BACKEND_URL=http://localhost:3000
```

3. Ejecutar en desarrollo:
```bash
npm run dev
```

4. Compilar para producción:
```bash
npm run build
```

## Estructura

- `src/services/` - Servicios para comunicación con el backend (resto.ts, media.ts)
- `src/publicPage/` - Componentes de la página pública del menú
- `src/contexts/` - Contextos de React (PublicContext, RestoContext)
- `src/components/` - Componentes reutilizables
- `src/utils/` - Utilidades (carrito, WhatsApp)
- `src/types/` - Definiciones de tipos TypeScript

