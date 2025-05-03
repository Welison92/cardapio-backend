# Cardápio 📜

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Perfil-blue?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/welisonsantos92)

## 🏗️ Estrutura do README

-   [Descrição](#-descrição)
-   [Requisitos](#-requisitos)
-   [Tecnologias e Ferramentas Utilizadas](#-tecnologias-e-ferramentas-utilizadas)
-   [Ferramentas de Qualidade de Código](#-ferramentas-de-qualidade-de-código)
-   [Requisitos](#-requisitos)
-   [Executando o projeto](#-executando-o-projeto)

## 📝 Descrição

Este projeto é uma aplicação de um cardápio digital, onde foi construído com **Python** e **FastAPI** no backend.

## 🛠️ Tecnologias e Ferramentas Utilizadas

-   **Python**: Linguagem de programação utilizada para o desenvolvimento do backend.
-   **FastAPI**: Framework web para construir APIs com Python de forma rápida e eficiente.
-   **Uvicorn**: Servidor ASGI para rodar a aplicação FastAPI.
-   **SQLAlchemy**: ORM para interação com bancos de dados relacionais.
-   **PostgreSQL**: Banco de dados relacional (usando o adaptador psycopg2).
-   **Alembic**: Ferramenta para gerenciamento de migrações de banco de dados.
-   **Pydantic**: Validação de dados e gerenciamento de configurações com tipagem.
-   **python-dotenv**: Carregamento de variáveis de ambiente a partir de arquivos `.env`.
-   **Git**: Sistema de controle de versão utilizado para gerenciar o código-fonte.

## 🧰️ Ferramentas de Qualidade de Código

-   **Flake8**: Ferramenta de linting para verificar o estilo do código Python.

    -   Para verificar a conformidade do código com as diretrizes do PEP 8, execute o seguinte comando:

        ```bash
        flake8 .
        ```

        -   O comando acima verifica todos os arquivos Python no diretório atual e em subdiretórios.

    -   Você pode usar o seguinte comando para verificar apenas um arquivo específico:
        ```bash
        flake8 nome_do_arquivo.py
        ```

-   **Isort**: Ferramenta para organizar automaticamente as importações no código Python.

    -   Para organizar as importações, execute o seguinte comando:

        ```bash
        isort .
        ```

        -   O comando acima organiza as importações em todos os arquivos Python no diretório atual e em subdiretórios.

    -   Você pode usar o seguinte comando para organizar as importações em um arquivo específico:
        ```bash
        isort nome_do_arquivo.py
        ```

## 📋 Requisitos

Certifique-se de ter os seguintes requisitos instalados:

<div style="display: flex; align-items: center; gap: 10px;">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg" alt="Python" width="40" height="40"/>
  <div style="display: flex; flex-direction: column;">
    <a href="https://www.python.org/" style="text-decoration: none;">Python</a>
  </div>
</div>

<div style="display: flex; align-items: center; gap: 10px;">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/postgresql/postgresql-original.svg" alt="PostgreSQL" width="40" height="40"/>
  <div style="display: flex; flex-direction: column;">
    <a href="https://www.postgresql.org/" style="text-decoration: none;">PostgreSQL</a>
    <a href="https://www.pgadmin.org/download/" style="text-decoration: none;">PgAdmin</a>
  </div>
</div>

<div style="display: flex; align-items: center; gap: 10px;">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/git/git-original.svg" alt="Git" width="40" height="40"/>
  <div style="display: flex; flex-direction: column;">
    <a href="https://git-scm.com/" style="text-decoration: none;">Git</a>
  </div>
</div>

<div style="display: flex; align-items: center; gap: 10px;">
  <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/docker/docker-original.svg" alt="Docker" width="40" height="40"/>
  <div style="display: flex; flex-direction: column;">
    <a href="https://www.docker.com/get-started" style="text-decoration: none;">Docker</a>
    <a href="https://docs.docker.com/compose/" style="text-decoration: none;">Docker Compose</a>
  </div>
</div>

## 🚀 Executando o projeto

-   Verifique se o **Docker** e o **Docker Compose** foram instalados em sua máquina. Você pode verificar isso executando os seguintes comandos:
    ```bash
    docker --version
    ```
    ```bash
    docker-compose --version
    ```

*   Clone o repositório:

    ```bash
    git clone https://github.com/Welison92/cardapio-backend.git
    ```

*   Configure as variáveis de ambiente:

    1 . Crie a pasta `env`:

    ```bash
    mkdir env
    ```

    2 . Navegue até a pasta `env`:

    ```bash
    cd env
    ```

    3 . Crie o arquivo `.env`:

    ```bash
    touch .env
    ```

    Esses comandos criam uma pasta chamada `env` e um arquivo chamado `.env` dentro dela.<br>

    Após clonar o repositório e configurar as variáveis de ambiente, acesse a pasta raiz do projeto onde está o arquivo `docker-compose.yml` e execute o seguinte comando para iniciar os serviços:

    ```bash
    docker-compose up --build
    ```

    ou

    ```bash
    docker compose up -d --build
    ```

    Aguarde até que a configuração do contêiner seja concluída. Se tudo estiver correto, o servidor estará rodando na porta `8080`. Você pode acessar a documentação da API em http://localhost:8080/docs ou http://localhost:8080/redoc.

*   Para parar a aplicação, execute o seguinte comando:

    ```bash
    docker-compose stop
    ```

    ou

    ```bash
    docker compose stop
    ```

*   Para executar a aplicação novamente, execute o seguinte comando:

    ```bash
    docker-compose start
    ```

    ou

    ```bash
    docker compose start
    ```

*   Para parar e remover os contêineres, redes e volumes criados pelo `docker-compose up`, execute o seguinte comando:

    ```bash
    docker-compose down
    ```

    ou

    ```bash
    docker compose down
    ```

*   Para iniciar os serviços novamente, execute o seguinte comando:

    ```bash
    docker-compose up -d
    ```

    ou

    ```bash
    docker compose up -d
    ```

*   Para aplicar as migrações do banco de dados, execute o seguinte comando:

    ```bash
    alembic revision --autogenerate -m "Criação das tabelas"
    ```

    -   Esse comando cria um novo arquivo de migração com base nas alterações feitas no modelo de dados.

    ```bash
    alembic upgrade head
    ```

    -   Esse comando aplica as migrações pendentes ao banco de dados.
