const contactForm = document.getElementById('contactForm');

contactForm?.addEventListener('submit', async function (event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    const form = event.target;
    const formData = new FormData(form);

    // Verificação extra de e-mail no lado do cliente
    const emailField = document.getElementById('Email');
    if (!validarEmail(emailField.value)) {
        document.getElementById('status').innerHTML = 'Por favor, insira um e-mail válido.';
        return;
    }

    try {
        const response = await fetch('https://formspree.io/f/mnnakoyq', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            document.getElementById('status').innerHTML = 'Mensagem enviada com sucesso!';
            form.reset(); // Reseta o formulário após o envio
        } else {
            document.getElementById('status').innerHTML = 'Falha no envio. Por favor, tente novamente.';
        }
    } catch (error) {
        document.getElementById('status').innerHTML = 'Ocorreu um erro. Por favor, tente novamente.';
    }
});

// Função para bloquear números no campo "Nome"
function bloquearNumeros(input) {
    input.value = input.value.replace(/\d/g, ''); // Remove todos os números
}

// Função para formatar o telefone no padrão (00) 123456789
function formatarTelefone(input) {
    let value = input.value.replace(/\D/g, ''); // Remove caracteres não numéricos
    if (value.length > 0) {
        value = '(' + value.substring(0, 2) + ') ' + value.substring(2, 11);
    }
    input.value = value;
}

// Função para validar o e-mail
function validarEmail(email) {
    const regex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    return regex.test(email);
}

// Adicionar evento de tecla "Enter" para o campo de mensagem
document.getElementById('Mensagem').addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && this.value.trim() !== '') {
        event.preventDefault(); // Impede a quebra de linha
        document.getElementById('contactForm').requestSubmit(); // Submete o formulário
    }
});

// ============================================================
// PROJETOS DO PORTFOLIO - edite esta lista para adicionar/remover
//   nome      : titulo do card
//   descricao : texto curto do card
//   url       : endereco do site publicado (obrigatorio)
//   imagem    : print do site. Pode ser um arquivo local (ex.: 'img/projects/meusite.png')
//               ou uma URL. Se deixar vazio (''), um print da tela principal do site
//               e gerado automaticamente a partir da url.
//   tags      : lista de chips exibidos no card
// ============================================================
const projetosManuais = [
    // Exemplo (remova as barras // para ativar):
    // {
    //     nome: 'Facebook',
    //     descricao: 'Exemplo de projeto publicado — troque pelos dados do seu projeto real.',
    //     url: 'https://facebook.com',
    //     imagem: '',
    //     tags: ['Exemplo', 'Web']
    // }
];

// Gera a URL de um print dinamico da pagina (servico gratuito mShots do WordPress.com)
function printDinamico(url) {
    return `https://s0.wp.com/mshots/v1/${encodeURIComponent(url)}?w=1200&h=600`;
}

// Monta o card de um projeto manual (fora do GitHub)
function montarCardManual(p) {
    // Com imagem definida mostra o print local; sem imagem captura dinamicamente do site
    const imagem = p.imagem || printDinamico(p.url);
    const tags = (p.tags || []).slice(0, 4).map(t => `<span>${t}</span>`).join('');
    return `
        <div class="proj-card">
            <a class="proj-shot" href="${p.url}" target="_blank" rel="noopener">
                <img src="${imagem}" alt="${p.nome}" loading="lazy">
            </a>
            <div class="proj-body">
                <h3>${p.nome}</h3>
                <span class="proj-badge pub"><i class="bi bi-circle-fill"></i> Projeto publicado</span>
                <p>${p.descricao || ''}</p>
                <div class="proj-tags">${tags}</div>
            </div>
            <div class="proj-actions">
                <a class="proj-btn live" href="${p.url}" target="_blank" rel="noopener"><i class="bi bi-globe2"></i> Ver site <i class="bi bi-arrow-right"></i></a>
            </div>
        </div>`;
}

// Monta os cards da seção "Projetos" (lista manual + repositórios do GitHub + card "Novo projeto")
async function carregarProjetos() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    const usuario = 'HenriquePolzella';
    const cardsManuais = projetosManuais.map(montarCardManual).join('');

    // Card fixo de "Novo projeto" exibido no final da lista
    const cardNovoProjeto = `
        <div class="proj-card">
            <div class="proj-hex"><i class="bi bi-rocket-takeoff"></i></div>
            <div class="proj-body">
                <h3>Novo projeto</h3>
                <span class="proj-badge dev"><i class="bi bi-circle-fill"></i> Em construção</span>
                <p>Um novo projeto está em desenvolvimento e será adicionado em breve ao portfólio com mais detalhes e demonstrações.</p>
                <div class="proj-tags"><span>Em breve</span><span>Novo</span><span>Portfólio</span></div>
            </div>
            <div class="proj-actions">
                <span class="proj-btn disabled"><i class="bi bi-clock"></i> Em desenvolvimento <i class="bi bi-arrow-right"></i></span>
            </div>
        </div>`;

    try {
        const resposta = await fetch(`https://api.github.com/users/${usuario}/repos?sort=updated&per_page=12`, {
            headers: { 'Accept': 'application/vnd.github+json' }
        });
        if (!resposta.ok) throw new Error('Falha ao consultar o GitHub');

        const repositoriosIgnorados = [usuario, 'HenriqueP', 'PortfolioHenrique'];
        const nomesIgnorados = repositoriosIgnorados.map(nome => nome.toLowerCase());

        const repositorios = (await resposta.json())
            .filter(repo => !repo.fork && !nomesIgnorados.includes(repo.name.toLowerCase()))
            .slice(0, 5);

        const cards = repositorios.map(repo => {
            const nome = repo.name.replace(/[-_]/g, ' ');
            const descricao = repo.description || 'Projeto disponível no GitHub — confira o código e a documentação.';
            // Site publicado: campo "Website" do repositorio ou, se o GitHub Pages
            // estiver ativo, a URL padrao usuario.github.io/repositorio
            const siteAoVivo = (repo.homepage || '').trim()
                || (repo.has_pages ? `https://${usuario.toLowerCase()}.github.io/${repo.name}/` : '');

            // Capa: print dinamico do site publicado; sem site, cartao do GitHub
            const capa = siteAoVivo
                ? printDinamico(siteAoVivo)
                : `https://opengraph.githubassets.com/1/${usuario}/${repo.name}`;

            // Chips: linguagem principal + tópicos do repositório
            const tags = [repo.language, ...(repo.topics || [])]
                .filter(Boolean)
                .slice(0, 4)
                .map(t => `<span>${t}</span>`)
                .join('');

            const botaoSite = siteAoVivo
                ? `<a class="proj-btn live" href="${siteAoVivo}" target="_blank" rel="noopener"><i class="bi bi-globe2"></i> Ver site <i class="bi bi-arrow-right"></i></a>`
                : '';

            return `
                <div class="proj-card">
                    <a class="proj-shot" href="${siteAoVivo || repo.html_url}" target="_blank" rel="noopener">
                        <img src="${capa}" alt="${nome}" loading="lazy">
                    </a>
                    <div class="proj-body">
                        <h3>${nome}</h3>
                        <span class="proj-badge pub"><i class="bi bi-circle-fill"></i> Projeto publicado</span>
                        <p>${descricao}</p>
                        <div class="proj-tags">${tags}</div>
                    </div>
                    <div class="proj-actions">
                        ${botaoSite}
                        <a class="proj-btn" href="${repo.html_url}" target="_blank" rel="noopener"><i class="bi bi-github"></i> Ver no GitHub <i class="bi bi-arrow-right"></i></a>
                    </div>
                </div>`;
        });

        grid.innerHTML = cardsManuais + cards.join('') + cardNovoProjeto;
    } catch (erro) {
        grid.innerHTML = cardsManuais + cardNovoProjeto;
    }
}

carregarProjetos();

// Conteúdo que antes era calculado pelo Razor no servidor.
const birthDate = new Date(2002, 0, 1);
const today = new Date();
let age = today.getFullYear() - birthDate.getFullYear();
const birthdayPassed = today.getMonth() > birthDate.getMonth()
    || (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
if (!birthdayPassed) age--;

const ageElement = document.getElementById('age');
const yearElement = document.getElementById('currentYear');
if (ageElement) ageElement.textContent = age;
if (yearElement) yearElement.textContent = today.getFullYear();

// ============================================================
// Menu ativo: destaca o item do menu conforme a seção visível
// ============================================================
const menuLinks = document.querySelectorAll('.topbar-menu a');
const menuSections = Array.from(menuLinks)
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

function atualizarMenuAtivo() {
    if (menuSections.length === 0) return;

    // Referência: um terço da altura da tela abaixo do topo
    const ref = window.scrollY + window.innerHeight / 3;
    let atual = menuSections[0];

    for (const secao of menuSections) {
        if (secao.offsetTop <= ref) atual = secao;
    }

    menuLinks.forEach(link =>
        link.classList.toggle('active', link.getAttribute('href') === '#' + atual.id)
    );
}

window.addEventListener('scroll', atualizarMenuAtivo, { passive: true });
window.addEventListener('resize', atualizarMenuAtivo);
atualizarMenuAtivo();
