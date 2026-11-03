
import os
from pathlib import Path
from decimal import Decimal
from io import BytesIO

from dotenv import load_dotenv
load_dotenv()

from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import desc
from PIL import Image

from database import Base, engine, get_db
from models import Produto, ProdutoImagem
from schemas import (
    ProdutoResponse,
    ProdutoUpdate,
    LoginResponse
)
from auth import (
    verificar_credenciais,
    criar_token_acesso,
    verificar_token,
    TOKEN_EXPIRE_MINUTES
)


# ==========================================
# CONFIGURAÇÃO
# ==========================================

app = FastAPI(
    title="Garagem dos Fundos API",
    version="1.0.0"
)

origins_env = os.getenv(
    "FRONTEND_ORIGINS",
    "http://127.0.0.1:5500,http://localhost:5500"
)

origins = [
    item.strip().rstrip("/")
    for item in origins_env.split(",")
    if item.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"]
)

Base.metadata.create_all(bind=engine)


# ==========================================
# ARMAZENAMENTO DE FOTOS
# ==========================================

PASTA_IMAGENS = Path(__file__).resolve().parent / "uploads"
PASTA_IMAGENS.mkdir(parents=True, exist_ok=True)

MAX_UPLOAD = 5 * 1024 * 1024
MAX_FOTOS = 12

TIPOS_PERMITIDOS = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp"
}


async def salvar_imagem(foto: UploadFile):

    extensao = TIPOS_PERMITIDOS.get(foto.content_type)

    if not extensao:
        raise HTTPException(
            400,
            "Formato não permitido. Use JPG, PNG ou WEBP."
        )

    conteudo = await foto.read()

    if not conteudo or len(conteudo) > MAX_UPLOAD:
        raise HTTPException(
            400,
            "Cada imagem deve ter até 5 MB."
        )

    try:
        imagem = Image.open(BytesIO(conteudo))
        imagem.verify()
    except Exception:
        raise HTTPException(400, "Arquivo de imagem inválido.")

    nome_arquivo = f"{os.urandom(16).hex()}{extensao}"
    caminho = PASTA_IMAGENS / nome_arquivo

    caminho.write_bytes(conteudo)

    return f"/uploads/{nome_arquivo}"


# ==========================================
# ROTAS PÚBLICAS
# ==========================================

@app.get("/")
def inicio():
    return {
        "status": "online",
        "mensagem": "Garagem dos Fundos API funcionando!"
    }


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/produtos", response_model=list[ProdutoResponse])
def listar_produtos(db: Session = Depends(get_db)):

    return (
        db.query(Produto)
        .filter(Produto.ativo == True)
        .order_by(desc(Produto.criado_em))
        .all()
    )


@app.get("/uploads/{nome_arquivo}")
def obter_imagem(nome_arquivo: str):
    from fastapi.responses import FileResponse

    caminho = (PASTA_IMAGENS / nome_arquivo).resolve()

    if caminho.parent != PASTA_IMAGENS.resolve() or not caminho.is_file():
        raise HTTPException(404, "Imagem não encontrada.")

    return FileResponse(caminho)


# ==========================================
# LOGIN ADMINISTRATIVO
# ==========================================

@app.post("/admin/login", response_model=LoginResponse)
def login(form: OAuth2PasswordRequestForm = Depends()):

    if not verificar_credenciais(form.username, form.password):
        raise HTTPException(
            401,
            "E-mail ou senha incorretos."
        )

    token = criar_token_acesso(form.username)

    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": TOKEN_EXPIRE_MINUTES * 60
    }


# ==========================================
# CADASTRAR PRODUTO COM ATÉ 12 FOTOS
# ==========================================

@app.post("/admin/produtos", response_model=ProdutoResponse)
async def cadastrar_produto(
    nome: str = Form(...),
    descricao: str = Form(...),
    preco: Decimal = Form(...),
    pagamento_url: str = Form(""),
    fotos: list[UploadFile] = File(...),
    admin: str = Depends(verificar_token),
    db: Session = Depends(get_db)
):

    if preco <= 0:
        raise HTTPException(400, "Preço inválido.")

    if not fotos or len(fotos) > MAX_FOTOS:
        raise HTTPException(
            400,
            "Envie entre 1 e 12 fotos por produto."
        )

    urls = []

    for foto in fotos:
        url = await salvar_imagem(foto)
        urls.append(url)

    produto = Produto(
        nome=nome.strip(),
        descricao=descricao.strip(),
        preco=preco,
        imagem_url=urls[0],
        pagamento_url=pagamento_url.strip() or None
    )

    for url in urls:
        produto.fotos.append(
            ProdutoImagem(imagem_url=url)
        )

    db.add(produto)
    db.commit()
    db.refresh(produto)

    return produto


# ==========================================
# EDITAR PRODUTO
# ==========================================

@app.put("/admin/produtos/{produto_id}", response_model=ProdutoResponse)
def editar_produto(
    produto_id: int,
    dados: ProdutoUpdate,
    admin: str = Depends(verificar_token),
    db: Session = Depends(get_db)
):

    produto = db.query(Produto).filter(
        Produto.id == produto_id
    ).first()

    if not produto:
        raise HTTPException(404, "Produto não encontrado.")

    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(produto, campo, valor)

    db.commit()
    db.refresh(produto)

    return produto


# ==========================================
# EXCLUIR PRODUTO
# ==========================================

@app.delete("/admin/produtos/{produto_id}")
def excluir_produto(
    produto_id: int,
    admin: str = Depends(verificar_token),
    db: Session = Depends(get_db)
):

    produto = db.query(Produto).filter(
        Produto.id == produto_id
    ).first()

    if not produto:
        raise HTTPException(404, "Produto não encontrado.")

    db.delete(produto)
    db.commit()

    return {"mensagem": "Produto excluído com sucesso."}
