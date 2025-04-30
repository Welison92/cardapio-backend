# Imports de terceiros
from fastapi import APIRouter, File, UploadFile
from fastapi.params import Depends
from sqlalchemy.orm import Session

# Imports locais
from core.database import get_db
from core.exceptions import APIException
from core.schemas import SuccessResponse
from src.menu.crud import (create_item, delete_item, delete_order,
                           get_all_categories, get_all_orders,
                           get_detail_order, get_item_by_id, get_menu,
                           place_order, update_item, update_order,
                           update_order_status)
from src.menu.schemas import PedidoClienteInput, StatusPedido

router = APIRouter(
    prefix="/cardapio",
    tags=["cardapio"],
    responses={404: {"description": "Not found"}},
)


@router.get("/obter_cardapio")
async def obter_cardapio(
        categoria: str = None,
        db: Session = Depends(get_db)
):
    """
    Retorna o cardápio completo ou filtrado por categoria do banco de dados.

    Args:
        categoria (str): Categoria para filtrar os itens do cardápio.
        db (Session): Sessão do banco de dados.
    Returns:
        list: Lista de itens do cardápio.
    """

    cardapio = get_menu(db, categoria)

    if len(cardapio) != 0:
        return SuccessResponse(
            data=cardapio,
            message="Cardápio obtido com sucesso.",
        )

    raise APIException(
        code=404,
        description="Nenhum item encontrado.",
        message="Nenhum item encontrado."
    )


@router.get("/obter_item/{item_id}")
async def obter_item_id(
        item_id: int,
        db: Session = Depends(get_db)
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
    item = get_item_by_id(db, item_id)

    # Verifica se o item foi encontrado
    if item:
        return SuccessResponse(
            data=item,
            message="Item obtido com sucesso.",
        )

    raise APIException(
        code=404,
        description="Item não encontrado.",
        message="Item não encontrado."
    )


@router.get("/obter_pedidos")
async def obter_pedidos(
        db: Session = Depends(get_db)
):
    """
    Retorna todos os pedidos realizados.

    Returns:
        list: Lista de pedidos realizados.
    """
    pedidos = get_all_orders(db)

    if len(pedidos) != 0:
        return SuccessResponse(
            data=pedidos,
            message="Pedidos obtidos com sucesso.",
        )

    raise APIException(
        code=404,
        description="Nenhum pedido encontrado.",
        message="Nenhum pedido encontrado."
    )


@router.get("/obter_detalhes_pedido/{pedido_id}")
async def obter_detalhes_pedido(
        pedido_id: int,
        db: Session = Depends(get_db)
):
    """
    Retorna os detalhes de um pedido específico.

    Args:
        pedido_id (int): ID do pedido.
        db (Session): Sessão do banco de dados.

    Returns:
        PedidoCliente: Detalhes do pedido.
    """
    # Busca os detalhes do pedido no banco de dados
    pedido_detalahdo = get_detail_order(db, pedido_id)

    if pedido_detalahdo is not None:
        return SuccessResponse(
            data=pedido_detalahdo,
            message="Pedido obtido com sucesso.",
        )

    raise APIException(
        code=404,
        description="Pedido não encontrado.",
        message="Pedido não encontrado."
    )


@router.get("/obter_categorias")
async def obter_categorias(
        db: Session = Depends(get_db)
):
    """
    Retorna todas as categorias do cardápio.

    Args:
        db (Session): Sessão do banco de dados.
    Returns:
        list: Lista de categorias.
    """
    # Busca as categorias no banco de dados
    categorias = get_all_categories(db)

    if len(categorias) != 0:
        return SuccessResponse(
            data=categorias,
            message="Categorias obtidas com sucesso.",
        )

    raise APIException(
        code=404,
        description="Nenhuma categoria encontrada.",
        message="Nenhuma categoria encontrada."
    )


@router.post("/cadastrar_item")
async def cadastrar_item(
        nome: str,
        descricao: str,
        preco: float,
        categoria: str,
        arquivo: UploadFile = File(...),
        db: Session = Depends(get_db)
):
    """
    Cadastra um novo item no cardápio.

    Args:
        nome (str): Nome do item.
        descricao (str): Descrição do item.
        preco (float): Preço do item.
        categoria (str): Categoria do item.
        arquivo (UploadFile): Imagem do item.
        db (Session): Sessão do banco de dados.
    Returns:
        SuccessResponse: Mensagem de sucesso.
    """
    # Cria o item no banco de dados
    item = create_item(db, nome, descricao, preco, categoria, arquivo)

    if item:
        return SuccessResponse(
            data=None,
            message="Item cadastrado com sucesso.",
        )

    raise APIException(
        code=400,
        description="Erro ao cadastrar o item.",
        message="Erro ao cadastrar o item."
    )


@router.post("/fazer_pedido")
async def fazer_pedido(
        pedido: PedidoClienteInput,
        status: StatusPedido,
        db: Session = Depends(get_db)
):
    """
    Realiza um pedido com os itens e quantidades especificadas.

    Args:
        pedido (PedidoRequest): Detalhes do pedido, incluindo
        itens e quantidades.
        status (str): Status do pedido.
        db (Session): Sessão do banco de dados.

    Returns:
        SuccessResponse: Confirmação do pedido.
    """

    pedido_cliente = place_order(db, pedido, status)

    if pedido_cliente:
        return SuccessResponse(
            data=None,
            message="Pedido realizado com sucesso."
        )

    raise APIException(
        code=400,
        description="O pedido não pode ser realizado.",
        message="O pedido não pode ser realizado."
    )


@router.put("/atualizar_item/{item_id}")
async def atualizar_item(
        item_id: int,
        nome: str = None,
        descricao: str = None,
        preco: float = None,
        categoria: str = None,
        arquivo: UploadFile = File(None),
        db: Session = Depends(get_db)
):
    """
    Atualiza um item do cardápio.

    Args:
        item_id (int): ID do item a ser atualizado.
        nome (str): Novo nome do item.
        descricao (str): Nova descrição do item.
        preco (float): Novo preço do item.
        categoria (str): Nova categoria do item.
        arquivo (UploadFile): Nova imagem do item.
        db (Session): Sessão do banco de dados.
    Returns:
        SuccessResponse: Mensagem de sucesso.
    """
    # Atualiza o item no banco de dados
    item = update_item(db, item_id, nome, descricao, preco, categoria, arquivo)

    if item:
        return SuccessResponse(
            data=None,
            message="Item atualizado com sucesso.",
        )

    raise APIException(
        code=404,
        description="Item não encontrado.",
        message="Item não encontrado."
    )


@router.put("/atualizar_status_pedido/{pedido_id}")
async def atualizar_status_pedido(
        pedido_id: int,
        status: StatusPedido,
        db: Session = Depends(get_db)
):
    """
    Atualiza o status de um pedido.

    Args:
        pedido_id (int): ID do pedido a ser atualizado.
        status (str): Novo status do pedido.
        db (Session): Sessão do banco de dados.
    Returns:
        SuccessResponse: Mensagem de sucesso.
    """
    # Atualiza o status do pedido no banco de dados
    pedido = update_order_status(db, pedido_id, status)

    if pedido:
        return SuccessResponse(
            data=None,
            message="Status do pedido atualizado com sucesso.",
        )

    raise APIException(
        code=404,
        description="Pedido não encontrado.",
        message="Pedido não encontrado."
    )


@router.put("/atualizar_pedido/{pedido_id}")
async def atualizar_pedido(
        pedido_id: int,
        pedido: PedidoClienteInput,
        db: Session = Depends(get_db)
):
    """
    Atualiza um pedido existente.

    Args:
        pedido_id (int): ID do pedido a ser atualizado.
        pedido (PedidoRequest): Detalhes do pedido, incluindo
        itens e quantidades.
        db (Session): Sessão do banco de dados.
    Returns:
        SuccessResponse: Mensagem de sucesso.
    """
    # Atualiza o pedido no banco de dados
    pedido_cliente = update_order(db, pedido_id, pedido)

    try:
        if pedido_cliente:
            return SuccessResponse(
                data=None,
                message="Pedido atualizado com sucesso."
            )
        elif len(pedido_cliente) == 0:
            return SuccessResponse(
                data=None,
                message="Pedido deletado com sucesso devido está vazio."
            )
    except TypeError:
        raise APIException(
            code=404,
            description="O pedido não foi encontrado.",
            message="O pedido não foi encontrado."
        )


@router.delete("/deletar_item/{item_id}")
async def deletar_item(item_id: int, db: Session = Depends(get_db)):
    """
    Deleta um item do cardápio.

    Args:
        item_id (int): ID do item a ser deletado.
        db (Session): Sessão do banco de dados.
    Returns:
        SuccessResponse: Mensagem de sucesso.
    """
    # Verifica se o item existe no banco de dados
    item = delete_item(db, item_id)

    # Se o item existir, deleta-o
    if item:
        return SuccessResponse(
            data=None,
            message="Item deletado com sucesso.",
        )

    raise APIException(
        code=404,
        description="Item não encontrado.",
        message="Item não encontrado."
    )


@router.delete("/deletar_pedido/{pedido_id}")
async def deletar_pedido(
        pedido_id: int,
        db: Session = Depends(get_db)
):
    """
    Deleta um pedido.

    Args:
        pedido_id (int): ID do pedido a ser deletado.
        db (Session): Sessão do banco de dados.
    Returns:
        SuccessResponse: Mensagem de sucesso.
    """
    # Verifica se o pedido existe no banco de dados
    pedido = delete_order(db, pedido_id)

    # Se o pedido existir, deleta-o
    if pedido:
        return SuccessResponse(
            data=None,
            message="Pedido deletado com sucesso.",
        )

    raise APIException(
        code=404,
        description="Pedido não encontrado ou não pode ser deletado.",
        message="Pedido não encontrado ou não pode ser deletado."
    )
