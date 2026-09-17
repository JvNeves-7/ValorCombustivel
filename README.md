# FuelCalc — Calculadora de Custo de Combustível

Calculadora moderna, rápida e responsiva para estimar o custo de viagens de carro ou moto.

![v2.1](https://img.shields.io/badge/v2.1-PWA-16a34a) ![Sem dependências](https://img.shields.io/badge/dependências-zero-blue) ![Licença MIT](https://img.shields.io/badge/licença-MIT-lightgrey)

## ✨ O que mudou da v1 para v2

Versão antiga: 1 arquivo `index.html` com Bootstrap 4 + jQuery, sem validação, sem mobile-first.

Versão nova:
- ✅ Zero dependências (sem jQuery / Bootstrap) — mais leve e rápido
- ✅ Layout profissional responsivo + modo escuro/claro
- ✅ Validação com mensagens inline + suporte a vírgula (`5,89`)
- ✅ Resultado detalhado: custo total, litros, custo/km
- ✅ Comparador Etanol x Gasolina (regra 70%)
- ✅ Histórico em `localStorage` com reutilizar
- ✅ Compartilhar no WhatsApp + copiar resultado
- ✅ Acessível (labels, aria-live, focos visíveis)
- ✅ PWA instalável: manifest + service worker com cache offline + botão "Instalar app"

## 📁 Estrutura

```
ValorCombustivel-main/
├── index.html          # HTML semântico pt-BR
├── manifest.webmanifest # PWA: nome, cores, ícones
├── sw.js               # Service worker (cache offline)
├── assets/
│   ├── css/style.css   # Design system com variáveis + dark mode
│   ├── js/app.js       # Lógica vanilla JS + registro do SW
│   └── icons/          # icon-192, icon-512, maskable, apple-touch, svg
├── README.md
└── .gitignore
```

## 🚀 Como usar

1. Abra `index.html` no navegador (duplo clique já funciona — não precisa de servidor).
2. Ou sirva localmente:
   ```powershell
   # Python
   python -m http.server 8000
   # depois acesse http://localhost:8000
   ```
3. Preencha distância, consumo e preço → **Calcular custo**.

### Fórmula
```
litros = distância ÷ consumo
custo  = litros × preço
custo/km = custo ÷ distância
```

### Comparador Etanol
```
Se (etanol / gasolina) < 0.70 → etanol compensa
```

## 📲 PWA — instalar no celular

- **Android/Chrome:** abra o site e toque em **📲 Instalar app** (ou menu ⋮ → Instalar).
- **iPhone/Safari:** toque em **Compartilhar → Adicionar à Tela de Início**.
- Depois de instalado, o app abre em tela cheia e **funciona offline**.

> ⚠️ O service worker exige `http(s)://` — não funciona abrindo o arquivo com duplo clique (`file://`).
> Para testar local, sirva a pasta (ex: `npx serve .`) e acesse `http://localhost:3000`.
> No GitHub Pages funciona direto, pois já é HTTPS.

## 🛠️ Tecnologias

- HTML5 semântico
- CSS moderno (variables, flex/grid, dark mode)
- JavaScript vanilla (Intl.NumberFormat para R$)
- Fonte Inter via Google Fonts

## 📱 Compatível

Chrome, Edge, Firefox, Safari — desktop e mobile.

## 📝 Próximas ideias

- [x] PWA + manifest para instalar no celular
- [ ] Múltiplos trechos / viagem ida e volta
- [ ] Preço médio por cidade via API

## 📄 Licença

MIT — use livremente.
