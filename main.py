# Imports de terceiros
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

# Imports locais
from core.exceptions import APIException
from src.menu.routers import router as cardapio_router

# Inicialização do FastAPI
app = FastAPI(
    title="CardapioVirtual_API",
    version="0.0.1"
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # Raiz do projeto
IMAGES_DIR = BASE_DIR / "static" / "images"  # Diretório das imagens

# Certifique-se de que o diretório de imagens existe
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

# Monta a pasta 'static' para servir arquivos estáticos
app.mount("/static", StaticFiles(directory="static"), name="static")

# Middlewares
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas/Controles
app.include_router(cardapio_router)


# Manipulador de exceções para APIException
@app.exception_handler(APIException)
async def api_exception_handler(request: Request, exc: APIException):
    return JSONResponse(
        status_code=exc.code,
        content={
            "status": exc.status,
            "message": exc.message,
            "code": exc.code,
            "description": exc.description,
            "data": exc.data
        }
    )
