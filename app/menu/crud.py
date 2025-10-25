# Imports do sistema
import os
from collections import Counter
from pathlib import Path

# Imports de terceiros
from fastapi import File, HTTPException, UploadFile
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.sql import func

from app.menu.models import ItemModel, PedidoItensModel, PedidoModel
from app.menu.schemas import (DetalhePedido, MenuItem, PedidoClienteInput,
                              PedidoClienteOutput, StatusPedido)
# Imports locais
from core.utils import validate_image_upload

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # Raiz do projeto
IMAGES_DIR = BASE_DIR / "static" / "images"  # Diretório das imagens


def get_menu(
        db: Session,
        categoria: str = None,
        skip: int = 0,
        limit: int = 100
):
    """
    Retorna o cardápio completo ou filtrado por categoria com paginação.

    Args:
        categoria (str): Categoria para filtrar os itens do cardápio.
        db (Session): Sessão do banco de dados.
        skip (int): Número de registros a pular (padrão: 0).
        limit (int): Número máximo de registros a retornar (padrão: 100).
    Returns:
        list: Lista de itens do cardápio.
    """
    # Verifica se a categoria foi fornecida
    query = db.query(ItemModel)
    
    if categoria:
        # Filtra os itens do cardápio pela categoria
        query = query.filter(
            ItemModel.categoria.ilike(f"%{categoria.lower()}%")
        )
    
    # Aplica paginação
    menu = query.offset(skip).limit(limit).all()

    # Converte os itens do cardápio para o formato desejado
    return [MenuItem(**item.__dict__) for item in menu]


def get_item_by_id(
        db: Session,
        item_id: int
):
    """
    Retorna um item do cardápio pelo ID.

    Args:
        item_id (int): ID do item.
        db (Session): Sessão do banco de dados.
    Returns:
        MenuItem: Item do cardápio.
    """
    # Busca o item pelo ID no banco de dados
    item = db.query(ItemModel).filter(ItemModel.id == item_id).first()

    # Verifica se o item foi encontrado
    if not item:
        return None

    # Converte o item para o formato desejado
    return MenuItem(**item.__dict__)


def get_all_orders(db: Session, skip: int = 0, limit: int = 100):
    """
    Retorna todos os pedidos realizados com paginação.

    Args:
        db (Session): Sessão do banco de dados.
        skip (int): Número de registros a pular (padrão: 0).
        limit (int): Número máximo de registros a retornar (padrão: 100).
    Returns:
        list: Lista de pedidos.
    """
    # Busca todos os pedidos no banco de dados com paginação
    pedidos = db.query(PedidoModel).offset(skip).limit(limit).all()

    return [
        PedidoClienteOutput(
            id=pedido.id,
            status=pedido.status,
            preco_total=pedido.preco_total
        ) for pedido in pedidos
    ]


def get_detail_order(
        db: Session,
        order_id: int
):
    """
    Retorna os detalhes de um pedido específico.

    Args:
        order_id (int): ID do pedido.
        db (Session): Sessão do banco de dados.

    Returns:
        DetalhePedido: Detalhes do pedido.
    """
    # Busca o pedido pelo ID no banco de dados com eager loading
    pedido = db.query(PedidoModel).options(
        joinedload(PedidoModel.itens)
    ).filter(PedidoModel.id == order_id).first()

    # Verifica se o pedido foi encontrado
    if not pedido:
        return None

    # Busca os itens associados ao pedido com join para ItemModel
    itens_pedido = (
        db.query(PedidoItensModel, ItemModel)
        .join(ItemModel, PedidoItensModel.item_id == ItemModel.id)
        .filter(PedidoItensModel.pedido_id == order_id)
        .all()
    )

    # Extrai informações dos itens
    itens_nomes = [item.ItemModel.nome for item in itens_pedido]
    quantidades = [item.PedidoItensModel.quantidade for item in itens_pedido]
    precos_unitarios = [item.ItemModel.preco for item in itens_pedido]

    return DetalhePedido(
        id=pedido.id,
        itens=itens_nomes,
        quantidade=quantidades,
        precos_unitario=precos_unitarios,
        preco_total=pedido.preco_total
    )


def get_all_categories(
        db: Session
):
    """
    Retorna todas as categorias disponíveis.

    Args:
        db (Session): Sessão do banco de dados.
    Returns:
        list: Lista de categorias.
    """
    # Busca todas as categorias no banco de dados
    categorias = db.query(ItemModel.categoria).distinct().all()

    # Extrai os nomes das categorias
    return [categoria[0].upper() for categoria in categorias]


def create_item(
        db: Session,
        nome: str,
        descricao: str,
        preco: float,
        categoria: str,
        arquivo: UploadFile = File(...)
):
    """
    Cadastra um novo item no cardápio.

    Args:
        db (Session): Sessão do banco de dados.
        nome (str): Nome do item.
        descricao (str): Descrição do item.
        preco (float): Preço do item.
        categoria (str): Categoria do item.
        arquivo (UploadFile): Imagem do item.
    Returns:
        MenuItem: Item cadastrado.
    """
    # Valida o arquivo de imagem
    try:
        validate_image_upload(arquivo)
    except HTTPException as e:
        raise e

    # Certifique-se de que o diretório de imagens existe
    try:
        IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao criar diretório de imagens: {str(e)}"
        )

    # Obtém o maior ID existente ou 0 se a tabela estiver vazia
    ultimo_id = db.query(func.max(ItemModel.id)).scalar() or 0

    # Evita sobreposição de arquivos com o mesmo nome
    file_extension = Path(arquivo.filename).suffix
    novo_nome_arquivo = f'{ultimo_id + 1}{file_extension}'

    # Constroi o caminho completo do arquivo
    caminho_completo = IMAGES_DIR / novo_nome_arquivo
    
    # Caminho relativo para armazenar no banco
    caminho_relativo = f'/static/images/{novo_nome_arquivo}'

    # Salva o arquivo no diretório de imagens
    try:
        with open(caminho_completo, "wb+") as objeto_arquivo:
            objeto_arquivo.write(arquivo.file.read())
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao salvar arquivo: {str(e)}"
        )

    # Cria um novo item
    try:
        novo_item = ItemModel(
            nome=nome,
            descricao=descricao,
            preco=preco,
            categoria=categoria,
            url_imagem=caminho_relativo
        )

        # Adiciona o item ao banco de dados
        db.add(novo_item)
        db.commit()
        db.refresh(novo_item)
    except Exception as e:
        db.rollback()
        # Remove o arquivo salvo em caso de erro no banco
        if caminho_completo.exists():
            try:
                caminho_completo.unlink()
            except Exception:
                pass
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao salvar item no banco de dados: {str(e)}"
        )

    return novo_item


def place_order(
        db: Session,
        pedido: PedidoClienteInput,
        status: StatusPedido
):
    """
    Processa um pedido do cliente.

    Args:
        pedido (PedidoClienteInput): Pedido do cliente.
        status (StatusPedido): Status do pedido.
        db (Session): Sessão do banco de dados.

    Returns:
        PedidoModel: Detalhes do pedido.

    Raises:
        HTTPException: Se algum item do pedido não for encontrado.
    """
    # Contar quantidades de cada item
    itens_quantidades = Counter(pedido.itens)
    preco_total = 0.0
    itens_validados = []

    # Validar todos os itens antes de criar o pedido
    for item_id, quantidade in itens_quantidades.items():
        item = get_item_by_id(db, item_id)

        if not item:
            return None

        itens_validados.append((item, quantidade))
        preco_total += item.preco * quantidade

    # Criar novo pedido apenas após validação
    novo_pedido = PedidoModel(
        status=status.value,
        preco_total=preco_total
    )
    db.add(novo_pedido)
    db.commit()  # Salvar o pedido para gerar o ID

    # Associar itens ao pedido
    for item, quantidade in itens_validados:
        pedido_itens = PedidoItensModel(
            pedido_id=novo_pedido.id,
            item_id=item.id,
            quantidade=quantidade
        )
        db.add(pedido_itens)

    db.commit()  # Salvar as associações
    db.refresh(novo_pedido)

    return novo_pedido


def update_item(
        db: Session,
        item_id: int,
        nome: str = None,
        descricao: str = None,
        preco: float = None,
        categoria: str = None,
        arquivo: UploadFile = File(None)
):
    """
    Atualiza um item do cardápio.

    Args:
        db (Session): Sessão do banco de dados.
        item_id (int): ID do item a ser atualizado.
        nome (str): Novo nome do item.
        descricao (str): Nova descrição do item.
        preco (float): Novo preço do item.
        categoria (str): Nova categoria do item.
        arquivo (UploadFile): Nova imagem do item.
    Returns:
        MenuItem: Item atualizado.
    """
    # Busca o item pelo ID no banco de dados
    item = db.query(ItemModel).filter(ItemModel.id == item_id).first()

    # Verifica se o item foi encontrado
    if not item:
        return None

    # Atualiza os campos do item
    if nome:
        item.nome = nome
    if descricao:
        item.descricao = descricao
    if preco:
        item.preco = preco
    if categoria:
        item.categoria = categoria

    # Se um novo arquivo for fornecido, atualiza a imagem
    if arquivo and arquivo.filename:
        # Valida o arquivo de imagem
        try:
            validate_image_upload(arquivo)
        except HTTPException as e:
            raise e

        # Evita sobreposição de arquivos com o mesmo nome
        file_extension = Path(arquivo.filename).suffix
        novo_nome_arquivo = f'{item_id}{file_extension}'

        # Constroi o caminho completo do arquivo
        caminho_completo = IMAGES_DIR / novo_nome_arquivo
        
        # Caminho relativo para armazenar no banco
        caminho_relativo = f'/static/images/{novo_nome_arquivo}'

        try:
            # Salva o novo arquivo
            with open(caminho_completo, "wb+") as objeto_arquivo:
                objeto_arquivo.write(arquivo.file.read())

            # Deleta o arquivo antigo se existir e for diferente do novo
            if item.url_imagem:
                # Converte caminho relativo para absoluto se necessário
                if item.url_imagem.startswith('/static/'):
                    caminho_antigo = BASE_DIR / item.url_imagem.lstrip('/')
                else:
                    caminho_antigo = Path(item.url_imagem)
                
                if caminho_antigo.exists() and caminho_antigo != caminho_completo:
                    try:
                        caminho_antigo.unlink()
                    except Exception as e:
                        # Log error but don't fail the operation
                        print(f"Aviso: Não foi possível deletar arquivo antigo: {str(e)}")

            # Atualiza a URL da imagem no banco de dados
            item.url_imagem = caminho_relativo
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao atualizar imagem: {str(e)}"
            )

    # Salva as alterações no banco de dados
    try:
        db.commit()
        db.refresh(item)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao atualizar item no banco de dados: {str(e)}"
        )

    return MenuItem(**item.__dict__)


def update_order_status(
        db: Session,
        order_id: int,
        status: StatusPedido
):
    """
    Atualiza o status de um pedido.

    Args:
        db (Session): Sessão do banco de dados.
        order_id (int): ID do pedido a ser atualizado.
        status (StatusPedido): Novo status do pedido.
    Returns:
        PedidoCliente: Pedido atualizado.
    """
    # Busca o pedido pelo ID no banco de dados
    pedido = db.query(PedidoModel).filter(PedidoModel.id == order_id).first()

    # Verifica se o pedido foi encontrado
    if not pedido:
        return None

    # Atualiza o status do pedido
    pedido.status = status.value

    # Salva as alterações no banco de dados
    db.commit()
    db.refresh(pedido)

    return pedido


def update_order(
        db: Session,
        order_id: int,
        pedido: PedidoClienteInput
) -> PedidoClienteOutput:
    """
    Atualiza um pedido existente.

    Args:
        db (Session): Sessão do banco de dados.
        order_id (int): ID do pedido a ser atualizado.
        pedido (PedidoClienteInput): Novo pedido do cliente.

    Returns:
        PedidoClienteOutput: Detalhes do pedido atualizado.
    """
    # Busca o pedido pelo ID no banco de dados
    pedido_db = db.query(PedidoModel).filter(
        PedidoModel.id == order_id
    ).first()

    # Verifica se o pedido foi encontrado
    if not pedido_db:
        return None

    # Busca todos os itens atuais associados ao pedido
    itens_atuais = db.query(PedidoItensModel).filter(
        PedidoItensModel.pedido_id == order_id
    ).all()

    # Lista de IDs de itens novos fornecidos na requisição
    novos_itens_ids = [item for item in pedido.itens]

    # Remove os itens que não estão mais na nova lista
    for item_atual in itens_atuais:
        if item_atual.item_id not in novos_itens_ids:
            db.delete(item_atual)

    # Verifica se o pedido está vazio (sem itens)
    if not novos_itens_ids:
        db.delete(pedido_db)  # Deleta o pedido do banco
        db.commit()
        return []  # Retorna [], pois o pedido foi removido

    # Calcula o preço total e atualiza os itens
    preco_total = 0.0
    itens_contagem = {}  # Dicionário para contar a quantidade de cada item

    # Conta a quantidade de cada item na lista de entrada
    for item_id in pedido.itens:
        itens_contagem[item_id] = itens_contagem.get(item_id, 0) + 1

    # Atualiza ou adiciona os itens no pedido
    for item_id, quantidade in itens_contagem.items():
        item_db = db.query(ItemModel).filter(ItemModel.id == item_id).first()

        if item_db:
            # Verifica se o item já está no pedido
            item_pedido_db = db.query(PedidoItensModel).filter(
                PedidoItensModel.pedido_id == pedido_db.id,
                PedidoItensModel.item_id == item_db.id
            ).first()

            if item_pedido_db:
                # Atualiza a quantidade do item existente
                item_pedido_db.quantidade = quantidade
            else:
                # Adiciona um novo item ao pedido
                novo_item = PedidoItensModel(
                    pedido_id=pedido_db.id,
                    item_id=item_db.id,
                    quantidade=quantidade
                )
                db.add(novo_item)

            # Adiciona o preço do item ao preço total
            preco_total += item_db.preco * quantidade

    # Atualiza o preço total do pedido
    pedido_db.preco_total = preco_total

    # Salva as alterações no banco de dados
    db.commit()
    db.refresh(pedido_db)

    return pedido_db


def delete_item(
        db: Session,
        item_id: int
):
    """
    Deleta um item do cardápio pelo ID.

    Args:
        item_id (int): ID do item.
        db (Session): Sessão do banco de dados.
    """
    # Busca o item pelo ID no banco de dados
    item = db.query(ItemModel).filter(ItemModel.id == item_id).first()

    if not item:
        return None

    # Deleta o arquivo de imagem associado ao item
    if item.url_imagem:
        try:
            # Converte caminho relativo para absoluto se necessário
            if item.url_imagem.startswith('/static/'):
                caminho_arquivo = BASE_DIR / item.url_imagem.lstrip('/')
            else:
                caminho_arquivo = Path(item.url_imagem)
            
            if caminho_arquivo.exists():
                caminho_arquivo.unlink()
        except Exception as e:
            # Log error but don't fail the operation
            print(f"Aviso: Não foi possível deletar arquivo: {str(e)}")

    # Deleta o item do banco de dados
    try:
        db.delete(item)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao deletar item do banco de dados: {str(e)}"
        )

    return db


def delete_order(
        db: Session,
        order_id: int
):
    """
    Deleta um pedido pelo ID.

    Args:
        order_id (int): ID do pedido.
        db (Session): Sessão do banco de dados.
    """
    # Busca o pedido pelo ID no banco de dados
    pedido = db.query(PedidoModel).filter(PedidoModel.id == order_id).first()

    # Verifica se o pedido foi encontrado
    if not pedido or (
            pedido.status != StatusPedido.CANCELADO.value and
            pedido.status != StatusPedido.ENTREGUE.value
    ):
        return None

    # Deleta o pedido do banco de dados
    db.delete(pedido)
    db.commit()

    return db
