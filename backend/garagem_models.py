from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Numeric,
    Boolean,
    DateTime,
    LargeBinary
)
from sqlalchemy.sql import func

from database import Base


class GaragemProduto(Base):
    __tablename__ = "garagem_produtos"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(200), nullable=False)
    descricao = Column(Text, nullable=False)
    preco = Column(Numeric(10, 2), nullable=False)
    pagamento_url = Column(String(1000), nullable=True)

    imagem_dados = Column(LargeBinary, nullable=False)
    imagem_tipo = Column(String(50), nullable=False)

    ativo = Column(Boolean, default=True, nullable=False)

    criado_em = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    atualizado_em = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )