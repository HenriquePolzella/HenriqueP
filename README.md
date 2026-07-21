# Portfólio Henrique — versão estática

Versão convertida de ASP.NET Core MVC para HTML, CSS e JavaScript, pronta para hospedagem estática, inclusive GitHub Pages.

## Estrutura

- `index.html`: página completa do portfólio
- `css/style.css`: estilos do site
- `js/script.js`: formulário, projetos do GitHub e navegação
- `img/`: imagens e ícones

## Executar localmente

Abra `index.html` diretamente no navegador ou execute um servidor local, por exemplo:

```bash
npx serve .
```

## GitHub Pages

Envie o conteúdo desta pasta para a raiz do repositório. No GitHub, abra **Settings → Pages**, selecione **Deploy from a branch**, escolha a branch `main` e a pasta `/ (root)`.

O formulário usa o endpoint Formspree que já estava configurado no projeto original. A seção de projetos consulta repositórios públicos pela API do GitHub.
