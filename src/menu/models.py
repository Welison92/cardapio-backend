# Imports de terceiros
from sqlalchemy import Column, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

# Imports locais
from core.database import Base
from src.menu.schemas import StatusPedido


class ItemModel(Base):
    """
    Modelo de Item para o banco de dados.
    """
    __tablename__ = "itens"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    descricao = Column(String, nullable=False)
    preco = Column(Float, nullable=False)
    categoria = Column(String, nullable=False)
    url_imagem = Column(String, nullable=False)

    pedidos = relationship(
        "PedidoModel", secondary="pedido_itens", back_populates="itens"
    )


class PedidoModel(Base):
    """
    Modelo de Pedido para o banco de dados.
    """
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, index=True)
    itens = relationship(
        "ItemModel", secondary="pedido_itens", back_populates="pedidos"
    )
    status = Column(
        String, nullable=False, default=StatusPedido.PENDENTE.value
    )
    preco_total = Column(Float, nullable=False, default=0.0)


class PedidoItensModel(Base):
    """
    Modelo de Itens do Pedido para o banco de dados.
    """
    __tablename__ = "pedido_itens"

    id = Column(Integer, primary_key=True, index=True)
    pedido_id = Column(Integer, ForeignKey("pedidos.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("itens.id"), nullable=False)
    quantidade = Column(Integer, nullable=False, default=1)
