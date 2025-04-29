# Imports do sistema
from typing import Generic, List, Optional, TypeVar, Union

# Imports de terceiros
from pydantic import BaseModel
from pydantic.generics import GenericModel

T = TypeVar('T', bound=BaseModel)


class Request(GenericModel, Generic[T]):
    """
        Modelo de requisição da API
    """
    data: T


class SuccessResponse(GenericModel, Generic[T]):
    """
        Modelo de resposta de sucesso da API
    """
    status: str = "success"
    data: Optional[Union[T, None, List[T], List[str]]] = None
    message: str = "Requisição bem-sucedida."
