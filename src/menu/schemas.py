# Imports do sistema
from enum import Enum

# Imports de terceiros
from pydantic import BaseModel


class MenuItem(BaseModel):
    """
    Modelo de item do cardápio.
    """
    id: int
    nome: str
    descricao: str
    preco: float
    categoria: str
    url_imagem: str = None

    class Config:
        """
        Configurações do modelo.
        """
        from_attributes = True


class PedidoClienteInput(BaseModel):
    """
    Modelo de pedido do cliente.
    """
    itens: list[int]

    class Config:
        """
        Configurações do modelo.
        """
        from_attributes = True


class PedidoClienteOutput(BaseModel):
    """
    Modelo de pedido do cliente.
    """
    id: int
    status: str
    preco_total: float

    class Config:
        """
        Configurações do modelo.
        """
        from_attributes = True


class StatusPedido(str, Enum):
    """
    Enumeração de status do pedido.
    """
    PENDENTE = "PRE-PEDIDO"
    PREPARANDO = "PENDENTE"
    ENTREGUE = "ENTREGUE"
    CANCELADO = "CANCELADO"

    @classmethod
    def list(cls):
        return [member.value for name, member in cls.__members__.items()]


class DetalhePedido(BaseModel):
    """
    Modelo de detalhe do pedido.
    """
    id: int
    itens: list[str]
    quantidade: list[int]
    precos_unitario: list[float]
    preco_total: float

    class Config:
        """
        Configurações do modelo.
        """
        from_attributes = True
