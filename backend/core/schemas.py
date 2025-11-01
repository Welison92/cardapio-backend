# Imports do sistema
from typing import Generic, List, Optional, TypeVar, Union

# Imports de terceiros
from pydantic import BaseModel

T = TypeVar('T', bound=BaseModel)


class Request(BaseModel, Generic[T]):
    """
        Modelo de requisição da API
    """
    data: T


class SuccessResponse(BaseModel, Generic[T]):
    """
        Modelo de resposta de sucesso da API
    """
    status: str = "success"
    data: Optional[Union[T, None, List[T], List[str]]] = None
    message: str = "Requisição bem-sucedida."

    class Config:
        from_attributes = True
