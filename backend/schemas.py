
from decimal import Decimal
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, ConfigDict, Field


class ProdutoCreate(BaseModel):
    nome: str = Field(min_length=2, max_length=200)
    descricao: str = Field(min_length=2)
    preco: Decimal = Field(gt=0, max_digits=10, decimal_places=2)
    pagamento_url: Optional[str] = Field(default=None, max_length=1000)


class ProdutoUpdate(BaseModel):
    nome: Optional[str] = Field(default=None, min_length=2, max_length=200)
    descricao: Optional[str] = None
    preco: Optional[Decimal] = Field(default=None, gt=0, max_digits=10, decimal_places=2)
    pagamento_url: Optional[str] = Field(default=None, max_length=1000)
    ativo: Optional[bool] = None


class ProdutoImagemResponse(BaseModel):
    id: int
    imagem_url: str

    model_config = ConfigDict(from_attributes=True)


class ProdutoResponse(BaseModel):
    id: int
    nome: str
    descricao: str
    preco: Decimal
    imagem_url: str
    pagamento_url: Optional[str]
    ativo: bool
    criado_em: datetime
    fotos: List[ProdutoImagemResponse] = []

    model_config = ConfigDict(from_attributes=True)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
