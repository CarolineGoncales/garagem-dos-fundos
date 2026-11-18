
/* =====================================
   GARAGEM DOS FUNDOS
   CATÁLOGO ESTÁTICO + GALERIA
===================================== */

const WHATSAPP = "5513996692839";
const LIMITE_FOTOS = 6;

let fotosGaleria = [];
let indiceFotoAtual = 0;

/* =====================================
   ESTILOS DA GALERIA
===================================== */

function adicionarEstilosGaleria() {
    if (document.getElementById("estilo-galeria")) return;

    const estilo = document.createElement("style");
    estilo.id = "estilo-galeria";

    estilo.textContent = `
        .produto-imagem-container {
            position: relative;
            cursor: pointer;
        }

        .produto-imagem-container img {
            cursor: pointer;
        }

        .produto-ver-fotos {
            display: inline-block;
            margin-top: 8px;
            font-size: 13px;
            color: #b5121b;
            font-weight: bold;
            cursor: pointer;
        }

        #galeria-modal {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.94);
            z-index: 99999;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        #galeria-modal.ativo {
            display: flex;
        }

        .galeria-conteudo {
            position: relative;
            width: 100%;
            max-width: 1000px;
            text-align: center;
        }

        #galeria-imagem {
            max-width: 100%;
            max-height: 78vh;
            object-fit: contain;
            border-radius: 8px;
        }

        .galeria-fechar,
        .galeria-anterior,
        .galeria-proxima {
            position: absolute;
            border: none;
            color: white;
            background: rgba(181,18,27,0.9);
            cursor: pointer;
            border-radius: 50%;
            width: 44px;
            height: 44px;
            font-size: 25px;
        }

        .galeria-fechar {
            top: -15px;
            right: 0;
            font-size: 28px;
        }

        .galeria-anterior {
            left: 10px;
            top: 50%;
            transform: translateY(-50%);
        }

        .galeria-proxima {
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
        }

        #galeria-contador {
            color: white;
            margin-top: 12px;
            font-size: 15px;
        }

        @media (max-width: 600px) {
            #galeria-imagem {
                max-height: 70vh;
            }

            .galeria-anterior {
                left: 0;
            }

            .galeria-proxima {
                right: 0;
            }
        }
    `;

    document.head.appendChild(estilo);
}

/* =====================================
   CRIAR GALERIA
===================================== */

function criarGaleria() {
    if (document.getElementById("galeria-modal")) return;

    const modal = document.createElement("div");
    modal.id = "galeria-modal";

    modal.innerHTML = `
        <div class="galeria-conteudo">
            <button class="galeria-fechar" aria-label="Fechar">&times;</button>
            <button class="galeria-anterior" aria-label="Foto anterior">&#10094;</button>
            <img id="galeria-imagem" src="" alt="Foto do produto">
            <button class="galeria-proxima" aria-label="Próxima foto">&#10095;</button>
            <div id="galeria-contador"></div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector(".galeria-fechar").onclick = fecharGaleria;
    modal.querySelector(".galeria-anterior").onclick = fotoAnterior;
    modal.querySelector(".galeria-proxima").onclick = proximaFoto;

    modal.addEventListener("click", evento => {
        if (evento.target === modal) fecharGaleria();
    });

    document.addEventListener("keydown", evento => {
        if (!modal.classList.contains("ativo")) return;

        if (evento.key === "Escape") fecharGaleria();
        if (evento.key === "ArrowRight") proximaFoto();
        if (evento.key === "ArrowLeft") fotoAnterior();
    });
}

/* =====================================
   CONTROLE DA GALERIA
===================================== */

function abrirGaleria(fotos, indice = 0) {
    fotosGaleria = fotos;
    indiceFotoAtual = indice;

    atualizarFotoGaleria();

    document.getElementById("galeria-modal").classList.add("ativo");
    document.body.style.overflow = "hidden";
}

function fecharGaleria() {
    document.getElementById("galeria-modal").classList.remove("ativo");
    document.body.style.overflow = "";
}

function atualizarFotoGaleria() {
    const imagem = document.getElementById("galeria-imagem");
    const contador = document.getElementById("galeria-contador");

    imagem.src = fotosGaleria[indiceFotoAtual];

    contador.textContent =
        `${indiceFotoAtual + 1} de ${fotosGaleria.length} fotos`;

    document.querySelector(".galeria-anterior").style.display =
        fotosGaleria.length > 1 ? "block" : "none";

    document.querySelector(".galeria-proxima").style.display =
        fotosGaleria.length > 1 ? "block" : "none";
}

function proximaFoto() {
    indiceFotoAtual = (indiceFotoAtual + 1) % fotosGaleria.length;
    atualizarFotoGaleria();
}

function fotoAnterior() {
    indiceFotoAtual =
        (indiceFotoAtual - 1 + fotosGaleria.length) % fotosGaleria.length;

    atualizarFotoGaleria();
}

/* =====================================
   NORMALIZAR FOTOS
===================================== */

function obterFotos(produto) {
    let fotos = [];

    if (Array.isArray(produto.fotos)) {
        fotos = produto.fotos.map(foto => {
            return typeof foto === "string"
                ? foto
                : foto.imagem_url;
        });
    } else if (produto.imagem_url) {
        fotos = [produto.imagem_url];
    }

    return fotos
        .filter(foto => typeof foto === "string" && foto.trim() !== "")
        .slice(0, LIMITE_FOTOS);
}

/* =====================================
   BOTÃO COMPRAR AGORA
===================================== */

function criarBotaoCompra(produto) {
    const botao = document.createElement("a");

    botao.className = "botao-comprar";
    botao.textContent = "COMPRAR AGORA";
    botao.target = "_blank";
    botao.rel = "noopener noreferrer";

    if (produto.pagamento_url) {
        botao.href = produto.pagamento_url;
    } else {
        const mensagem = encodeURIComponent(
            `Olá! Tenho interesse no produto: ${produto.nome}. Gostaria de mais informações.`
        );

        botao.href = `https://wa.me/${WHATSAPP}?text=${mensagem}`;
    }

    return botao;
}

/* =====================================
   MONTAR PRODUTO
===================================== */

function montarProduto(produto) {
    const cartao = document.createElement("article");
    cartao.className = "produto";

    const fotos = obterFotos(produto);

    const imagemContainer = document.createElement("div");
    imagemContainer.className = "produto-imagem-container";

    if (fotos.length > 0) {
        const imagem = document.createElement("img");

        imagem.src = fotos[0];
        imagem.alt = produto.nome || "Produto automotivo";
        imagem.loading = "lazy";

        imagem.onerror = function () {
            this.style.display = "none";
        };

        imagemContainer.appendChild(imagem);

        imagemContainer.addEventListener("click", () => {
            abrirGaleria(fotos);
        });
    }

    const informacoes = document.createElement("div");
    informacoes.className = "produto-info";

    const nome = document.createElement("h3");
    nome.textContent = produto.nome || "Produto sem nome";

    const descricao = document.createElement("p");
    descricao.textContent = produto.descricao || "";

    const preco = document.createElement("div");
    preco.className = "preco";

    preco.textContent = Number(produto.preco || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

    informacoes.appendChild(nome);
    informacoes.appendChild(descricao);
    informacoes.appendChild(preco);

    if (fotos.length > 1) {
        const verFotos = document.createElement("span");

        verFotos.className = "produto-ver-fotos";
        verFotos.textContent =
            `📷 Clique para ver as ${fotos.length} fotos`;

        verFotos.addEventListener("click", () => {
            abrirGaleria(fotos);
        });

        informacoes.appendChild(verFotos);
    }

    informacoes.appendChild(criarBotaoCompra(produto));

    cartao.appendChild(imagemContainer);
    cartao.appendChild(informacoes);

    return cartao;
}

/* =====================================
   CARREGAR PRODUTOS DO JSON
===================================== */

async function carregarProdutos() {
    const lista = document.getElementById("lista-produtos");

    if (!lista) return;

    adicionarEstilosGaleria();
    criarGaleria();

    lista.innerHTML = "<p>Carregando produtos...</p>";

    try {
        const resposta = await fetch("./produtos.json");

        if (!resposta.ok) {
            throw new Error("Erro ao acessar produtos.json");
        }

        const produtos = await resposta.json();

        lista.innerHTML = "";

        if (!Array.isArray(produtos) || produtos.length === 0) {
            lista.innerHTML =
                "<p>Nenhum produto disponível no momento.</p>";
            return;
        }

        produtos.forEach(produto => {
            lista.appendChild(montarProduto(produto));
        });

    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);

        lista.innerHTML = `
            <p>Não foi possível carregar os produtos.
            Tente novamente mais tarde.</p>
        `;
    }
}

/* =====================================
   INICIALIZAÇÃO
===================================== */

document.addEventListener("DOMContentLoaded", carregarProdutos);
