# Proyecto Integrador - Fullstack FastAPI + React

Aplicación Fullstack para gestión de productos con categorías e ingredientes.

## Tecnologías

**Backend:**
- FastAPI
- SQLModel
- PostgreSQL
- Pydantic (validaciones)

**Frontend:**
- React + TypeScript
- Vite
- Tailwind CSS 4
- TanStack Query
- React Router DOM

## Estructura del Proyecto

```
fullstack-parcial/
├── backend/
│   ├── app/
│   │   ├── main.py           # App FastAPI
│   │   ├── database.py       # Conexión PostgreSQL
│   │   ├── models/           # Modelos SQLModel
│   │   ├── routers/          # Endpoints API
│   │   └── schemas/         # Modelos Pydantic
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api.ts           # Axios API
│   │   ├── types.ts         # Tipos TypeScript
│   │   ├── pages/           # Páginas React
│   │   ├── App.tsx         # Router principal
│   │   └── main.tsx        # Entry point
│   └── package.json
├── CHECKLIST.md
└── README.md
```

## Instrucciones de Ejecución

### Prerrequisitos
- Python 3.11+
- Node.js 18+
- PostgreSQL

### Backend

```bash
cd backend
.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

El backend corre en: http://localhost:8000

### Frontend

```bash
cd frontend
npm install
npm run dev
```

El frontend corre en: http://localhost:5173

## Endpoints API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /categorias | Listar categorías |
| POST | /categorias | Crear categoría |
| GET | /categorias/{id} | Obtener categoría |
| PUT | /categorias/{id} | Actualizar categoría |
| DELETE | /categorias/{id} | Eliminar categoría |
| GET | /ingredientes | Listar ingredientes |
| POST | /ingredientes | Crear ingrediente |
| GET | /ingredientes/{id} | Obtener ingrediente |
| PUT | /ingredientes/{id} | Actualizar ingrediente |
| DELETE | /ingredientes/{id} | Eliminar ingrediente |
| GET | /productos | Listar productos |
| POST | /productos | Crear producto |
| GET | /productos/{id} | Obtener producto |
| PUT | /productos/{id} | Actualizar producto |
| DELETE | /productos/{id} | Eliminar producto |

## Base de Datos

Configuración en `backend/app/database.py`:
- Host: localhost
- Puerto: 5432
- Usuario: postgres
- Password: lichi123
- Base de datos: parcialProg4

## Validaciones

- Nombre de categoría/ingrediente/producto: mínimo 2 caracteres, máximo 100
- ID de categoría debe ser mayor a 0

## Autor

Parcial - Programación IV - UTN
