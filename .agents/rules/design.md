---
trigger: always_on
---

# Design Rules (VigiDoc DNA)

> Diretrizes estritas de UX/UI para o ecossistema VigiDoc. Foco em estética **Dark Space**, elementos **Futuristas** e interfaces **Vivas**.

---

## 🚀 Princípio Central: VigiDoc DNA

O VigiDoc não é apenas um app médico, é uma ferramenta de alta tecnologia. A interface deve parecer um **painel de controle avançado (HUD)**, transmitindo precisão, inovação e confiança.
**Regra de Ouro**: Se a tela parecer um app comum de sistema, ela falhou. Use brilhos, gradientes sutis e animações que deem vida aos dados.

---

## 🌌 Estética Dark Space & Cores

Nunca use cinza puro. Use tons de azul profundo e preto absoluto para criar profundidade espacial.

```typescript
// constants/nav-theme.ts (Base de Referência)
export const NavColors = {
  bg0: '#02040E',        // Preto absoluto (Fundo principal)
  bg1: '#060B1A',        // Navy profundo (Surface secundária)
  bg2: '#0C1526',        // Azul escuro (Cards e Modais)
  
  // Neon Accents (Obrigatório o uso de glow)
  cyan:   '#00D4FF',     // Primária / Tecnologia
  violet: '#7B2FFF',     // Secundária / Inteligência
  green:  '#00FF88',     // Saúde / Sucesso
  danger: '#FF4466',     // Alerta / Crítico
} as const;
```

---

## ✨ Elementos de Design Premium

### 1. Efeito Glow (Brilhos)
Sempre que usar uma cor neon (Cyan, Violet, Green), adicione um brilho sutil ao redor.
-   **Shadows**: `shadowColor: NavColors.cyan, shadowOpacity: 0.3, shadowRadius: 10`.
-   **Bordas**: Use opacidades baixas (ex: `rgba(0, 212, 255, 0.1)`) para bordas que "vibram".

### 2. Acentos Cybernéticos
Adicione detalhes que remetam a tecnologia de ponta:
-   **Grid Patterns**: Use padrões de grade sutis no fundo (opacidade 0.02 - 0.05).
-   **Corner Borders**: Em vez de bordas completas, use acentos apenas nos cantos (L-shaped borders).
-   **Scan-lines**: Linhas horizontais ultra-finas no topo das divisões ou tab bars.

### 3. Glassmorphism
Para modais e overlays, use fundos translúcidos com blur (se disponível) ou opacidades de `0.85`.

---

## 🧬 Tipografia Futurista
Use pesos extremos para contraste: **800 (ExtraBold)** para títulos e saudações, e **500 (Medium)** para labels técnicos com espaçamento entre letras (`letterSpacing: 1.5`).

---

## ⚡ Micro-interações e Animações (Reanimated V4)

Interfaces VigiDoc nunca são estáticas.
-   **Pulse Stats**: Ícones de batimentos ou sinais vitais devem ter um pulse scale de `1.05` contínuo.
-   **Entry Effects**: Use `FadeInDown` com delays escalonados (`delay: index * 50`) para dar sensação de "boot up" do dashboard.
-   **Glow Breathing**: Brilhos de fundo devem oscilar opacidade (`withRepeat` + `withSequence`).

---

## 🛠️ Componentização VigiDoc Standard

| Primitivo | Estética Esperada |
|---|---|
| `Card` | Borda fina (`1px`), fundo `bg2`, glow sutil e cantos `NavRadius.lg`. |
| `StatusBadge` | Pílula com ponto pulsante à esquerda (Live Indicator). |
| `HUDButton` | Efeito press-scale `0.95` e retorno com spring de alta fidelidade. |

## 📐 Grade Múltipla de 4px (Consistência)
Mantenha gutters de `16` ou `20` para respiro, mas use `4` ou `8` para elementos tecnicamente agrupados (ícone + texto).

