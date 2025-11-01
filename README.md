# CardapioVirtual📜

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Perfil-blue?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/welisonsantos92)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.12-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.9+-3776ab?logo=python&logoColor=white)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Latest-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Arquitetura do Projeto](#-arquitetura-do-projeto)
3. [Tecnologias e Dependências](#-tecnologias-e-dependências)
4. [Requisitos do Sistema](#-requisitos-do-sistema)
5. [Instalação e Configuração](#-instalação-e-configuração)
6. [Executando o Projeto](#-executando-o-projeto)
7. [Estrutura do Banco de Dados](#-estrutura-do-banco-de-dados)
8. [Endpoints da API](#-endpoints-da-api)
9. [Variáveis de Ambiente](#-variáveis-de-ambiente)
10. [Padrões de Qualidade de Código](#-padrões-de-qualidade-de-código)
11. [Migrações de Banco de Dados](#-migrações-de-banco-de-dados)
12. [Estrutura de Diretórios](#-estrutura-de-diretórios)
13. [Resolução de Problemas](#-resolução-de-problemas)

---

## 🎯 Visão Geral

**CardapioVirtual** é uma aplicação moderna de gestão de cardápio digital desenvolvida com arquitetura de microsserviços. O projeto oferece uma solução completa para exibição de itens de menu e gerenciamento de pedidos através de uma API RESTful escalável.

### Características Principais

- **API RESTful Robusta**: FastAPI com máxima performance e confiabilidade
- **Segurança**: Middleware CORS e tratamento robusto de exceções
- **Paginação Inteligente**: Suporte a skip/limit para consultas eficientes
- **Banco de Dados**: PostgreSQL com ORM SQLAlchemy
- **Containerização**: Docker e Docker Compose para ambiente consistente
- **Versionamento de API**: Endpoints estruturados com versionamento (`v1/`)
- **Interface Web**: Frontend responsivo integrado

---

## 🏗️ Arquitetura do Projeto

O projeto segue uma arquitetura em camadas bem definida com separação clara de responsabilidades:

```
┌─────────────────────────────────────────────────────────────────────┐
│                       FRONTEND (HTML/CSS/JS)                        │
│                  Interface Web Responsiva (Vanilla JS)              │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ HTTP/REST
┌──────────────────────────▼──────────────────────────────────────────┐
│                    CAMADA DE API (FastAPI)                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Routers (Endpoints) → Schemas (Validação) → CRUD (Lógica)  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────────┐
│                    CAMADA CORE (Configuração)                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Database (SQLAlchemy) | Config (Env Vars) | Utils (Helper) │   │
│  └─────────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ SQL
┌──────────────────────────▼──────────────────────────────────────────┐
│                  BANCO DE DADOS (PostgreSQL)                        │
│           Tabelas: itens | pedidos | pedido_itens                  │
└─────────────────────────────────────────────────────────────────────┘
```

### Padrão de Arquitetura

- **MVC Adaptado**: Models (dados), Views (rotas/endpoints), Controllers (CRUD)
- **Separação de Responsabilidades**: Core, App, e Frontend em camadas distintas
- **Reutilização**: Schemas centralizados, utilitários compartilhados
- **Escalabilidade**: Fácil adicionar novas features na pasta `app/`

---

## 🛠️ Tecnologias e Dependências

### Stack Tecnológico

| Camada | Tecnologia | Versão | Propósito |
|--------|-----------|--------|----------|
| **Backend** | Python | 3.9+ | Linguagem principal |
| | FastAPI | 0.115.12 | Framework assíncrono de alto desempenho |
| | Uvicorn | 0.34.2 | Servidor ASGI |
| **Banco de Dados** | PostgreSQL | 17-alpine | BD relacional |
| | SQLAlchemy | 2.0.40 | ORM Python |
| | Alembic | 1.15.2 | Versionamento de migrações |
| **Validação** | Pydantic | 2.11.3 | Validação com type hints |
| **Utilitários** | python-dotenv | 1.1.0 | Variáveis de ambiente |
| | psycopg2-binary | 2.9.10 | Adaptador PostgreSQL |
| | python-multipart | 0.0.20 | Upload de arquivos |
| **Qualidade** | Flake8 | 7.2.0 | Linting PEP 8 |
| | isort | 6.0.1 | Organização de imports |
| **Frontend** | HTML5/CSS3 | - | Estrutura e estilos |
| | JavaScript | - | Lógica client-side (Vanilla) |
| **Infraestrutura** | Docker | Latest | Containerização |
| | Docker Compose | Latest | Orquestração |
| | Git | 2.25+ | Versionamento |

---

## 📋 Requisitos do Sistema

### Pré-requisitos

- **Python**: 3.9 ou superior
- **Docker**: Versão 20.10+
- **Docker Compose**: Versão 1.29+
- **Git**: Versão 2.25+
- **PostgreSQL**: 17+ (apenas para desenvolvimento local)

### Portas Utilizadas

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| **Aplicação Web** | 8080 | Acesso principal |
| **API Interna** | 8000 | FastAPI (dentro do Docker) |
| **PostgreSQL** | 3587 | Banco de dados (acesso externo) |
| **PostgreSQL Interno** | 5432 | Banco de dados (Docker interno) |

---

## 💾 Instalação e Configuração

### Passo 1: Clonar o Repositório

```bash
git clone https://github.com/Welison92/cardapio-backend.git
cd cardapio-backend
```

### Passo 2: Configurar Variáveis de Ambiente

O projeto utiliza um arquivo `.env` para armazenar configurações sensíveis. Siga os passos abaixo:

#### 2.1 Criar a Estrutura de Pastas

```bash
# Windows (PowerShell)
New-Item -Type Directory -Path env -Force

# Linux/Mac
mkdir -p env
```

#### 2.2 Criar o Arquivo `.env`

```bash
# Windows
New-Item -Path "env\.env" -Type File

# Linux/Mac
touch env/.env
```

#### 2.3 Configurar as Variáveis de Ambiente

Adicione as seguintes variáveis ao arquivo `env/.env`:

```env
# === CONFIGURAÇÕES DO POSTGRESQL ===
POSTGRES_USER=seu_usuario_postgres
POSTGRES_PASSWORD=sua_senha_segura_123
POSTGRES_DB=cardapio_db

# === CONFIGURAÇÕES DE BANCO DE DADOS ===
DATABASE_HOST=db
DATABASE_PORT=5432

# === CONFIGURAÇÕES DA APLICAÇÃO ===
DEBUG=False
ENVIRONMENT=production
```

**Notas Importantes:**
- A senha deve ter pelo menos 8 caracteres
- Use caracteres especiais para maior segurança
- `DATABASE_HOST=db` é o nome do serviço Docker Compose
- Para desenvolvimento local, você pode usar `DATABASE_HOST=localhost`

### Passo 3: Estrutura de Pastas Necessárias

O projeto espera as seguintes pastas:

```bash
# Criar diretório para imagens estáticas
New-Item -Type Directory -Path static/images -Force  # Windows
mkdir -p static/images                                # Linux/Mac
```

---

## 🚀 Executando o Projeto

### Opção 1: Com Docker Compose (Recomendado)

**Iniciar os serviços:**
```bash
docker-compose up -d --build
```

**Gerenciar serviços:**
```bash
docker-compose ps              # Ver status
docker-compose logs -f         # Ver logs em tempo real
docker-compose logs -f api     # Logs apenas da API
docker-compose stop            # Parar
docker-compose start           # Iniciar novamente
docker-compose restart         # Reiniciar
docker-compose down            # Parar e remover
docker-compose down -v         # Parar e remover tudo (incluindo volumes)
```

### Opção 2: Desenvolvimento Local (Python Direto)

**1. Criar e ativar ambiente virtual:**
```bash
# Windows
python -m venv venv
.\venv\Scripts\Activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

**2. Instalar dependências:**
```bash
pip install -r requirements.txt
```

**3. Aplicar migrações:**
```bash
alembic upgrade head
```

**4. Iniciar servidor:**
```bash
# Com reload automático (desenvolvimento)
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# Sem reload (produção)
uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

### Validar a Instalação

Após iniciar, acesse:
- **Swagger UI**: http://localhost:8080/docs
- **ReDoc**: http://localhost:8080/redoc
- **Frontend**: http://localhost:8080/frontend/
- **Testar API**: `curl -X GET "http://localhost:8080/v1/cardapio/obter_cardapio" -H "accept: application/json"`

---

## 📊 Estrutura do Banco de Dados

### Diagrama Entidade-Relacionamento

```
┌─────────────────────┐         ┌────────────────────────┐
│     ITENS           │         │    PEDIDOS             │
├─────────────────────┤         ├────────────────────────┤
│ id (PK)             │◀────┬───│ id (PK)                │
│ nome                │     │   │ status                 │
│ descricao           │     │   │ preco_total            │
│ preco               │     │   └────────────────────────┘
│ categoria           │     │
│ url_imagem          │     │
└─────────────────────┘     │   ┌────────────────────────┐
                            └───│ PEDIDO_ITENS           │
                                ├────────────────────────┤
                                │ id (PK)                │
                                │ pedido_id (FK)         │
                                │ item_id (FK)           │
                                │ quantidade             │
                                └────────────────────────┘
```

### Definição das Tabelas

#### Tabela: `itens`

```sql
CREATE TABLE itens (
    id INTEGER PRIMARY KEY,
    nome VARCHAR NOT NULL,
    descricao VARCHAR NOT NULL,
    preco FLOAT NOT NULL,
    categoria VARCHAR NOT NULL,
    url_imagem VARCHAR NOT NULL
);
```

**Campos:**
- `id`: Identificador único do item
- `nome`: Nome do produto/item
- `descricao`: Descrição detalhada
- `preco`: Valor unitário
- `categoria`: Categorização do item (ex: "Bebidas", "Pratos Quentes")
- `url_imagem`: URL para imagem do produto

#### Tabela: `pedidos`

```sql
CREATE TABLE pedidos (
    id INTEGER PRIMARY KEY,
    status VARCHAR NOT NULL DEFAULT 'PENDENTE',
    preco_total FLOAT NOT NULL DEFAULT 0.0
);
```

**Campos:**
- `id`: Identificador único do pedido
- `status`: Estado do pedido (PENDENTE, PREPARANDO, ENTREGUE, CANCELADO)
- `preco_total`: Valor total do pedido

#### Tabela: `pedido_itens` (Associativa)

```sql
CREATE TABLE pedido_itens (
    id INTEGER PRIMARY KEY,
    pedido_id INTEGER NOT NULL FOREIGN KEY REFERENCES pedidos(id),
    item_id INTEGER NOT NULL FOREIGN KEY REFERENCES itens(id),
    quantidade INTEGER NOT NULL DEFAULT 1
);
```

**Campos:**
- `id`: Identificador único do registro
- `pedido_id`: Referência ao pedido
- `item_id`: Referência ao item
- `quantidade`: Quantidade do item no pedido

---

## 📡 Endpoints da API

A API está versionada sob `/v1/cardapio` e oferece os seguintes endpoints:

### 1. Obter Cardápio

**GET** `/v1/cardapio/obter_cardapio`

Retorna o cardápio completo ou filtrado por categoria com suporte a paginação.

**Parâmetros:**
- `categoria` (string, opcional): Filtrar por categoria
- `skip` (integer, padrão: 0): Registros a pular
- `limit` (integer, padrão: 100): Número máximo de registros

**Resposta (200):**
```json
{
  "status": "success",
  "message": "Cardápio obtido com sucesso.",
  "data": [
    {
      "id": 1,
      "nome": "Hamburger Clássico",
      "descricao": "Hambúrguer com queijo e alface",
      "preco": 35.50,
      "categoria": "Lanches",
      "url_imagem": "/static/images/hamburger.jpg"
    }
  ],
  "code": 200
}
```

---

### 2. Obter Item por ID

**GET** `/v1/cardapio/obter_item/{item_id}`

Retorna um item específico do cardápio.

**Parâmetros:**
- `item_id` (integer, obrigatório): ID do item

**Resposta (200):**
```json
{
  "status": "success",
  "message": "Item obtido com sucesso.",
  "data": {
    "id": 1,
    "nome": "Hamburger Clássico",
    "descricao": "Hambúrguer com queijo e alface",
    "preco": 35.50,
    "categoria": "Lanches",
    "url_imagem": "/static/images/hamburger.jpg"
  },
  "code": 200
}
```

---

### 3. Obter Todos os Pedidos

**GET** `/v1/cardapio/obter_pedidos`

Retorna lista de todos os pedidos com paginação.

**Parâmetros:**
- `skip` (integer, padrão: 0): Registros a pular
- `limit` (integer, padrão: 100): Número máximo de registros

**Resposta (200):**
```json
{
  "status": "success",
  "message": "Pedidos obtidos com sucesso.",
  "data": [
    {
      "id": 1,
      "status": "PENDENTE",
      "preco_total": 105.50
    }
  ],
  "code": 200
}
```

---

### 4. Obter Detalhes de um Pedido

**GET** `/v1/cardapio/obter_detalhes_pedido/{pedido_id}`

Retorna informações detalhadas de um pedido específico.

**Parâmetros:**
- `pedido_id` (integer, obrigatório): ID do pedido

**Resposta (200):**
```json
{
  "status": "success",
  "message": "Pedido obtido com sucesso.",
  "data": {
    "id": 1,
    "itens": ["Hamburger Clássico", "Refrigerante"],
    "quantidade": [2, 3],
    "precos_unitario": [35.50, 7.50],
    "preco_total": 93.50
  },
  "code": 200
}
```

**Padrão de Resposta de Erro (404):**
```json
{
  "status": "error",
  "message": "Recurso não encontrado.",
  "code": 404,
  "description": "O recurso solicitado não foi encontrado no banco de dados."
}
```

---

## 🔧 Variáveis de Ambiente

O projeto utiliza um arquivo `.env` para armazenar configurações sensíveis. Todas as variáveis estão centralizadas em `backend/core/config.py`.

### Variáveis Obrigatórias

```env
POSTGRES_USER=seu_usuario              # Usuário do PostgreSQL
POSTGRES_PASSWORD=sua_senha_segura    # Senha (mín. 8 caracteres)
POSTGRES_DB=cardapio_db               # Nome do banco de dados
DATABASE_HOST=db                      # Host (db para Docker, localhost para local)
DATABASE_PORT=5432                    # Porta do banco de dados
```

### Variáveis Opcionais

```env
DEBUG=False                            # Modo debug (development apenas)
ENVIRONMENT=production                 # Ambiente da aplicação
DATABASE_URL=postgresql://...         # URL gerada automaticamente se não fornecida
```

### Carregamento das Variáveis

A ordem de prioridade é:
1. Arquivo `.env` (em `env/.env`)
2. Variáveis de ambiente do sistema
3. Valores padrão definidos no código

```python
# Exemplo de acesso no código
from core.config import settings

print(settings.POSTGRES_USER)
print(settings.DATABASE_URL)
```

---

## 🎨 Padrões de Qualidade de Código

O projeto segue rigorosamente padrões de qualidade para manutenibilidade e profissionalismo.

### 1. Linting com Flake8

Verifica conformidade com PEP 8 e detecta erros de código.

```bash
# Verificar todo o projeto
flake8 .

# Verificar arquivo específico
flake8 backend/main.py

# Ignorar linhas longas
flake8 . --max-line-length=120
```

### 2. Organização de Imports com isort

Organiza automaticamente os imports no código Python.

```bash
# Organizar todo o projeto
isort .

# Organizar arquivo específico
isort backend/main.py

# Verificar sem modificar
isort . --check-only --diff
```

### 3. Convenções de Código

O projeto segue PEP 8 e as seguintes convenções:

**Estrutura de Imports:**
```python
# 1. Sistema padrão
import os
from pathlib import Path

# 2. Terceiros
from fastapi import FastAPI
from sqlalchemy.orm import Session

# 3. Locais
from core.config import settings
from app.menu.routers import router
```

**Nomenclatura:**
- `snake_case`: variáveis, funções e módulos
- `PascalCase`: classes
- `UPPER_SNAKE_CASE`: constantes

**Docstrings:** Usar format padrão com descrição, Args e Returns

---

## 🗂️ Migrações de Banco de Dados

O projeto usa Alembic para gerenciamento de versões do banco de dados.

### Criando Migrações

```bash
# Migração automática (recomendado)
alembic revision --autogenerate -m "Descrição da mudança"

# Migração manual (para casos complexos)
alembic revision -m "Descrição da mudança"
```

### Aplicando Migrações

```bash
# Aplicar todas as migrações pendentes
alembic upgrade head

# Aplicar migração específica
alembic upgrade 00a6d57c417a

# Aplicar próxima migração
alembic upgrade +1
```

### Revertendo Migrações

```bash
# Reverter última migração
alembic downgrade -1

# Reverter para migração específica
alembic downgrade 00a6d57c417a

# Reverter tudo
alembic downgrade base
```

### Verificando Status

```bash
# Ver histórico de migrações
alembic history

# Ver status atual
alembic current

# Ver SQL antes de executar
alembic upgrade head --sql
```

---

## 📂 Estrutura de Diretórios Detalhada

```
cardapio-backend/
│
├── backend/                          # Código-fonte principal do backend
│   ├── __init__.py
│   ├── main.py                       # Inicialização FastAPI, middlewares, rotas
│   │
│   ├── app/                          # Aplicações e features
│   │   ├── __init__.py
│   │   └── menu/                     # Feature: Gerenciamento de Menu
│   │       ├── __init__.py
│   │       ├── models.py             # Modelos SQLAlchemy (ItemModel, PedidoModel)
│   │       ├── schemas.py            # Schemas Pydantic (validação)
│   │       ├── routers.py            # Definição de rotas HTTP
│   │       ├── crud.py               # Lógica de CRUD (operações BD)
│   │       └── __pycache__/
│   │
│   ├── core/                         # Funcionalidades core
│   │   ├── __init__.py
│   │   ├── config.py                 # Configurações e env vars
│   │   ├── database.py               # Inicialização SQLAlchemy
│   │   ├── exceptions.py             # Exceções customizadas
│   │   ├── schemas.py                # Schemas compartilhados
│   │   ├── utils.py                  # Funções utilitárias
│   │   └── __pycache__/
│   │
│   ├── alembic/                      # Migrações de BD
│   │   ├── env.py                    # Configuração Alembic
│   │   ├── script.py.mako            # Template de migrações
│   │   ├── versions/                 # Histórico de migrações
│   │   │   ├── 00a6d57c417a_geração_das_tabelas_iniciais.py
│   │   │   └── __pycache__/
│   │   └── README.md
│   │
│   └── __pycache__/
│
├── frontend/                         # Aplicação web cliente
│   ├── index.html                    # Página principal
│   ├── css/
│   │   └── styles.css                # Estilos CSS
│   └── js/                           # Scripts JavaScript
│       ├── api.js                    # Cliente HTTP para API
│       ├── app.js                    # Lógica principal
│       ├── menu.js                   # Gerenciamento de menu
│       ├── cart.js                   # Carrinho de compras
│       ├── orders.js                 # Gerenciamento de pedidos
│       ├── admin.js                  # Painel administrativo
│       ├── config.js                 # Configurações
│       └── utils.js                  # Utilitários
│
├── static/                           # Arquivos estáticos
│   └── images/                       # Imagens de produtos
│
├── env/                              # Variáveis de ambiente (gitignored)
│   └── .env                          # Configurações sensíveis
│
├── alembic.ini                       # Configuração global Alembic
├── requirements.txt                  # Dependências Python
├── Dockerfile                        # Build Docker (multi-stage)
├── docker-compose.yaml               # Orquestração serviços
├── .gitignore                        # Arquivos ignorados
├── README.md                         # Esta documentação
└── .env.example                      # Exemplo de variáveis (opcional)
```

---

## 🔍 Resolução de Problemas

### Problema: "Connection refused" ao conectar no banco

**Solução:**
```bash
# Verificar se os serviços estão rodando
docker-compose ps

# Reiniciar o serviço de banco de dados
docker-compose restart db

# Ver logs do banco
docker-compose logs db
```

### Problema: Porta 8080 já está em uso

**Solução:**
```bash
# Encontrar processo usando a porta (Windows)
netstat -ano | findstr :8080

# Matar o processo
taskkill /PID <PID> /F

# Ou mudar a porta no docker-compose.yaml
# Altere "8080:8000" para "8081:8000"
```

### Problema: Migrações não funcionam

**Solução:**
```bash
# Dentro do container
docker-compose exec api bash

# Ou rodando localmente
alembic upgrade head --sql  # Ver SQL antes de executar
alembic upgrade head        # Executar
```

### Problema: Imagens não aparecem no frontend

**Verificar:**
1. As imagens estão em `static/images/`?
2. Os URLs na BD estão corretos (`/static/images/nome.jpg`)?
3. O container tem permissões de leitura?

```bash
# Verificar dentro do container
docker-compose exec api ls -la /app/static/images/
```

### Problema: Variáveis de ambiente não carregam

**Solução:**
```bash
# Verificar se arquivo .env existe
ls -la env/.env

# Verificar conteúdo
cat env/.env

# Testar acesso dentro do container
docker-compose exec api python -c "from core.config import settings; print(settings.POSTGRES_USER)"
```

---
