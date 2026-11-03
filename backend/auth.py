
import os
import hmac

from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone

from jose import jwt, JWTError
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer


# ==========================================
# CONFIGURAÇÕES DE SEGURANÇA
# ==========================================

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")

if not JWT_SECRET:
    raise RuntimeError(
        "Configure JWT_SECRET no arquivo .env."
    )

JWT_ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/admin/login"
)


# ==========================================
# VALIDAR ADMINISTRADOR
# ==========================================

def verificar_credenciais(email: str, senha: str):

    if not ADMIN_EMAIL or not ADMIN_PASSWORD:
        raise HTTPException(
            status_code=500,
            detail="Administrador não configurado."
        )

    email_valido = hmac.compare_digest(
        email.strip().lower(),
        ADMIN_EMAIL.strip().lower()
    )

    senha_valida = hmac.compare_digest(
        senha,
        ADMIN_PASSWORD
    )

    return email_valido and senha_valida


# ==========================================
# GERAR TOKEN DE ACESSO
# ==========================================

def criar_token_acesso(email: str):

    expiracao = datetime.now(timezone.utc) + timedelta(
        minutes=TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": email,
        "exp": expiracao
    }

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=JWT_ALGORITHM
    )


# ==========================================
# VALIDAR TOKEN
# ==========================================

def verificar_token(token: str = Depends(oauth2_scheme)):

    erro = HTTPException(
        status_code=401,
        detail="Acesso não autorizado.",
        headers={"WWW-Authenticate": "Bearer"}
    )

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )

        email = payload.get("sub")

        if not email or not ADMIN_EMAIL:
            raise erro

        if not hmac.compare_digest(
            email.lower(),
            ADMIN_EMAIL.strip().lower()
        ):
            raise erro

        return email

    except JWTError:
        raise erro
