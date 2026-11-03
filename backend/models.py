
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Numeric,
    Boolean,
    DateTime,
    ForeignKey
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from database import Base


class Produto(Base):
    __tablename__ = "produtos"

    id = Column(Integer, primary_key=True, index=True)

    nome = Column(String(200), nullable=False)

    descricao = Column(Text, nullable=False)

    preco = Column(Numeric(10, 2), nullable=False)

    imagem_url = Column(String(500), nullable=False)

    pagamento_url = Column(String(1000), nullable=True)

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

    fotos = relationship(
        "ProdutoImagem",
        back_populates="produto",
        cascade="all, delete-orphan",
        order_by="ProdutoImagem.id"
    )

    def __repr__(self):
        return f"<Produto {self.id} - {self.nome}>"


class ProdutoImagem(Base):
    __tablename__ = "produto_imagens"

    id = Column(Integer, primary_key=True, index=True)

    produto_id = Column(
        Integer,
        ForeignKey("produtos.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    imagem_url = Column(String(500), nullable=False)

    criado_em = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    produto = relationship(
        "Produto",
        back_populates="fotos"
    )
