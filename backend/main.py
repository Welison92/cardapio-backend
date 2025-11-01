# Imports do sistema
import sys
from pathlib import Path

# Adicionar o diretório atual ao path ANTES de fazer outras importações
sys.path.insert(0, str(Path(__file__).parent))

# Imports de terceiros
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse, RedirectResponse

from app.menu.routers import router as cardapio_router
# Imports locais
from core.exceptions import APIException

# Obter o diretório raiz do projeto (pai de 'backend')
PROJECT_ROOT = Path(__file__).parent.parent
STATIC_DIR = PROJECT_ROOT / "static"
FRONTEND_DIR = PROJECT_ROOT / "frontend"

# Criar os diretórios se não existirem
STATIC_DIR.mkdir(exist_ok=True)
FRONTEND_DIR.mkdir(exist_ok=True)

# Inicialização do FastAPI
app = FastAPI(
    title="CardapioVirtual_API",
    version="0.0.1"
)


# Configurar o charset para UTF-8
@app.middleware("http")
async def add_charset_to_content_type(request: Request, call_next):
    response = await call_next(request)
    if "application/json" in response.headers.get("content-type", ""):
        response.headers["content-type"] = "application/json; charset=utf-8"
    return response


# Monta a pasta 'static' para servir arquivos estáticos
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Monta a pasta 'frontend' para servir a aplicação frontend
app.mount("/frontend", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")

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


# Redirecionar raiz para o frontend
@app.get("/")
async def root():
    return RedirectResponse(url='/frontend/index.html')


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
