# Imports do sistema
from collections import Counter
from pathlib import Path

# Imports de terceiros
from fastapi import File, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

# Imports locais
from src.menu.models import ItemModel, PedidoItensModel, PedidoModel
from src.menu.schemas import (DetalhePedido, MenuItem, PedidoClienteInput,
                              PedidoClienteOutput, StatusPedido)

BASE_DIR = Path(__file__).resolve().parent.parent.parent  # Raiz do projeto
IMAGES_DIR = BASE_DIR / "static" / "images"  # Diretório das imagens


def get_menu(
        db: Session,
        categoria: str = None
):
    """
    Retorna o cardápio completo ou filtrado por categoria.

    Args:
        categoria (str): Categoria para filtrar os itens do cardápio.
        db (Session): Sessão do banco de dados.
    Returns:
        list: Lista de itens do cardápio.
    """
    # Verifica se a categoria foi fornecida
    if categoria:
        # Filtra os itens do cardápio pela categoria
        menu = db.query(ItemModel).filter(
            ItemModel.categoria.ilike(f"%{categoria.lower()}%")
        ).all()
    else:
        # Retorna todos os itens do cardápio
        menu = db.query(ItemModel).all()

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


def get_all_orders(db: Session):
    """
    Retorna todos os pedidos realizados.

    Returns:
        list: Lista de pedidos.
    """
    # Busca todos os pedidos no banco de dados
    pedidos = db.query(PedidoModel).all()

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
    # Busca o pedido pelo ID no banco de dados
    pedido = db.query(PedidoModel).filter(PedidoModel.id == order_id).first()

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
    # Certifique-se de que o diretório de imagens existe
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    # Obtém o maior ID existente ou 0 se a tabela estiver vazia
    ultimo_id = db.query(func.max(ItemModel.id)).scalar() or 0

    # Evita sobreposição de arquivos com o mesmo nome
    arquivo.filename = f'{ultimo_id + 1}_{arquivo.filename}'

    # Constroi o caminho completo do arquivo
    caminho_arquivo = f'{IMAGES_DIR / arquivo.filename}'

    # Salva o arquivo no diretório de imagens
    with open(caminho_arquivo, "wb+") as objeto_arquivo:
        objeto_arquivo.write(arquivo.file.read())

    # Cria um novo item
    novo_item = ItemModel(
        nome=nome,
        descricao=descricao,
        preco=preco,
        categoria=categoria,
        url_imagem=caminho_arquivo
    )

    # Adiciona o item ao banco de dados
    db.add(novo_item)
    db.commit()
    db.refresh(novo_item)

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
    if arquivo:
        # Evita sobreposição de arquivos com o mesmo nome
        arquivo.filename = f'{item_id}_{arquivo.filename}'

        # Constroi o caminho completo do arquivo
        caminho_arquivo = f'{IMAGES_DIR / arquivo.filename}'

        with open(caminho_arquivo, "wb+") as objeto_arquivo:
            objeto_arquivo.write(arquivo.file.read())

        # Deleta o arquivo antigo se existir
        if Path(item.url_imagem).exists():
            Path(item.url_imagem).unlink()

        # Atualiza a URL da imagem no banco de dados
        item.url_imagem = caminho_arquivo

    # Salva as alterações no banco de dados
    db.commit()
    db.refresh(item)

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
    if item.url_imagem and Path(item.url_imagem).exists():
        Path(item.url_imagem).unlink()

    # Deleta o item do banco de dados
    db.delete(item)
    db.commit()

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
