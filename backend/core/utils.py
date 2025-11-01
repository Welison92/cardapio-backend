# Imports do sistema
from pathlib import Path
from typing import Tuple

# Imports de terceiros
from fastapi import HTTPException, UploadFile

# Constantes para validação de arquivos
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


async def validate_image_upload(file: UploadFile) -> Tuple[bool, str]:
    """
    Valida o arquivo de imagem enviado.

    Args:
        file (UploadFile): Arquivo a ser validado.

    Returns:
        Tuple[bool, str]: (True, "") se válido,
        (False, mensagem_erro) caso contrário.

    Raises:
        HTTPException: Se o arquivo for inválido.
    """
    if not file:
        raise HTTPException(
            status_code=400,
            detail="Nenhum arquivo foi enviado."
        )

    # Validar extensão do arquivo
    file_extension = Path(file.filename).suffix.lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Extensão de arquivo não permitida. "
                   f"Extensões permitidas: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Validar tipo MIME
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de arquivo não permitido. "
                   f"Tipos permitidos: {', '.join(ALLOWED_IMAGE_TYPES)}"
        )

    # Validar tamanho do arquivo
    file.file.seek(0, 2)  # Move para o final do arquivo
    file_size = file.file.tell()  # Obtém a posição atual (tamanho)
    file.file.seek(0)  # Volta para o início

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Arquivo muito grande. Tamanho máximo: "
                   f"{MAX_FILE_SIZE / (1024 * 1024):.1f}MB"
        )

    return True, ""
