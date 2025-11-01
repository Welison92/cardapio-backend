# Imports do sistema
from typing import List, Optional, TypeVar, Union

# Imports de terceiros
from pydantic import BaseModel

T = TypeVar('T', bound=BaseModel)


class APIException(Exception):
    """
        Execption para tratamento de erros na API
    """
    def __init__(
            self, status: str = "error", message: str = "",
            code: int = 500, description: str = ""
    ):
        self.status: str = status
        self.message: str = message
        self.code: int = code
        self.description: str = description
        self.data: Optional[Union[T, List[T], List[str], None, dict]] = {}
