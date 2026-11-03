
/* =====================================
   GARAGEM DOS FUNDOS
   CATÁLOGO DINÂMICO + GALERIA
===================================== */

const API_URL = "http://127.0.0.1:8000";

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
   CRIAR MODAL
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

    modal.addEventListener("click", (evento) => {
        if (evento.target === modal) fecharGaleria();
    });

    document.addEventListener("keydown", (evento) => {
        if (!modal.classList.contains("ativo")) return;

        if (evento.key === "Escape") fecharGaleria();
        if (evento.key === "ArrowRight") proximaFoto();
        if (evento.key === "ArrowLeft") fotoAnterior();
    });
}

/* =====================================
   ABRIR E NAVEGAR NA GALERIA
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
    const anterior = document.querySelector(".galeria-anterior");
    const proxima = document.querySelector(".galeria-proxima");

    imagem.src = `${API_URL}${fotosGaleria[indiceFotoAtual]}`;

    contador.textContent =
        `${indiceFotoAtual + 1} de ${fotosGaleria.length} fotos`;

    anterior.style.display = fotosGaleria.length > 1 ? "block" : "none";
    proxima.style.display = fotosGaleria.length > 1 ? "block" : "none";
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
   CARREGAR PRODUTOS DA API
===================================== */

async function carregarProdutos() {
    const lista = document.getElementById("lista-produtos");
    if (!lista) return;

    adicionarEstilosGaleria();
    criarGaleria();

    lista.innerHTML = "<p>Carregando produtos...</p>";

    try {
        const resposta = await fetch(`${API_URL}/produtos`);

        if (!resposta.ok) {
            throw new Error("Não foi possível carregar os produtos.");
        }

        const produtos = await resposta.json();

        lista.innerHTML = "";

        if (produtos.length === 0) {
            lista.innerHTML = "<p>Nenhum produto disponível no momento.</p>";
            return;
        }

        produtos.forEach((produto) => {
            const cartao = document.createElement("article");
            cartao.className = "produto";

            // FOTOS DO PRODUTO
            let fotos = [];

            if (produto.fotos && produto.fotos.length > 0) {
                fotos = produto.fotos.map(foto => foto.imagem_url);
            } else if (produto.imagem_url) {
                fotos = [produto.imagem_url];
            }

            // IMAGEM PRINCIPAL
            const imagemContainer = document.createElement("div");
            imagemContainer.className = "produto-imagem-container";

            const imagem = document.createElement("img");
            imagem.src = `${API_URL}${fotos[0]}`;
            imagem.alt = produto.nome;
            imagem.loading = "lazy";

            imagem.onerror = function () {
                this.style.display = "none";
            };

            imagemContainer.appendChild(imagem);

            // ABRIR GALERIA AO CLICAR
            imagemContainer.addEventListener("click", () => {
                if (fotos.length > 0) {
                    abrirGaleria(fotos);
                }
            });

            // INFORMAÇÕES
            const informacoes = document.createElement("div");
            informacoes.className = "produto-info";

            const nome = document.createElement("h3");
            nome.textContent = produto.nome;

            const descricao = document.createElement("p");
            descricao.textContent = produto.descricao;

            // PREÇO
            const preco = document.createElement("div");
            preco.className = "preco";

            preco.textContent = Number(produto.preco).toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );

            informacoes.appendChild(nome);
            informacoes.appendChild(descricao);
            informacoes.appendChild(preco);

            // INDICADOR DE FOTOS
            if (fotos.length > 1) {
                const verFotos = document.createElement("span");
                verFotos.className = "produto-ver-fotos";
                verFotos.textContent = `📷 Clique na imagem para ver ${fotos.length} fotos`;

                verFotos.addEventListener("click", () => {
                    abrirGaleria(fotos);
                });

                informacoes.appendChild(verFotos);
            }

            // BOTÃO DE COMPRA
            if (produto.pagamento_url) {
                const comprar = document.createElement("a");

                comprar.className = "botao-comprar";
                comprar.textContent = "COMPRAR";
                comprar.href = produto.pagamento_url;
                comprar.target = "_blank";
                comprar.rel = "noopener noreferrer";

                informacoes.appendChild(comprar);
            }

            cartao.appendChild(imagemContainer);
            cartao.appendChild(informacoes);

            lista.appendChild(cartao);
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

document.addEventListener("DOMContentLoaded", () => {
    carregarProdutos();
});
