---
trigger: always_on
---

# Design Rules

> Diretrizes estritas de UX/UI para aplicativos de alto nível (Foco em clareza, beleza nativa e legibilidade).

---

## Princípio Central

Beleza na maioria dos apps móveis é alcançada com claridade, tipografia consistente, contraste correto de ícones e hierarquia limpa, que transmita confiança. É essencial focar no **padrão de interface nativa confortável** de ler e lidar. 
**Interfaces devem sentir-se acolhedoras e vivas**. Use animações delicadas e feedbacks construtivos!

---

## Cores Semânticas

Nunca declare valores hexadecimais em styles. Extraia-os para seu token system em `constants/colors.ts`:

```typescript
// Exemplo Semântico Genérico
export const Colors = {
  // Brand
  primary:       { light: '#0A84FF', dark: '#5E5CE6' }, // Cores da marca do projeto
  primarySubtle: { light: '#E5F1FF', dark: '#1A2133' },

  // Status (Universal)
  success:  { light: '#1AA053', dark: '#34D979' },
  warning:  { light: '#C97B0C', dark: '#FFBF3C' },
  danger:   { light: '#D93025', dark: '#FF5A50' },
  focus:    { light: '#A25AF5', dark: '#B77DF0' },

  // Backgrounds e Neutros
  systemBg:        { light: '#FFFFFF', dark: '#000000' },
  secondaryBg:     { light: '#F2F2F7', dark: '#1C1C1E' },
  label:           { light: '#000000', dark: '#FFFFFF' },
  secondaryLabel:  { light: 'rgba(60,60,67,0.6)', dark: 'rgba(235,235,245,0.6)' },
  separator:       { light: 'rgba(60,60,67,0.29)', dark: 'rgba(84,84,88,0.65)' }
} as const;
```

---

## Tipografia Baseada em Hierarquia

A padronização previne discrepância:

```typescript
export const Typography = {
  title1:     { fontSize: 28, fontWeight: '700', letterSpacing: 0.36 },
  title2:     { fontSize: 22, fontWeight: '700', letterSpacing: 0.35 },
  headline:   { fontSize: 17, fontWeight: '600', letterSpacing: -0.41 },
  body:       { fontSize: 17, fontWeight: '400', letterSpacing: -0.41 },
  callout:    { fontSize: 16, fontWeight: '400', letterSpacing: -0.32 },
  subheadline:{ fontSize: 15, fontWeight: '400', letterSpacing: -0.24 },
  caption1:   { fontSize: 12, fontWeight: '400', letterSpacing: 0    },
} as const;
```

---

## Grade Múltipla de 4px

Use a técnica `4x multiplier` para consistência em padding:

- `4`: entre ícone e texto do botão adjacente
- `8`: gap geral de stacks
- `12` – `16`: gutters ou padding de cards
- `20` – `24`: separações de modais ou seções de headers master
- `48`: hit point nativo recomendado para a altura de botões

---

## Sombras Suaves (New Architecture Ready)

Utilize Box Shadows de CSS modernos em React Native, se adequando da melhor forma (Substitutos de Elevation):

```typescript
boxShadow: '0 1px 3px rgba(0,0,0,0.08)'   // Sombra natural baixa
boxShadow: '0 4px 16px rgba(0,0,0,0.16)'  // Modais de alto nível
```

Use `borderCurve: 'continuous'` para os radiuses aparentarem o padrão premium nativo em plataformas compatíveis.

---

## Interações e Feedbacks Constantes

- Use o `react-native-reanimated` (v4+) nativamente sem medo.
- Adicione tempos suaves `duration: 200` em transições.
- Inclua **Feedback Háptico** onde necessário (se o SO aguentar). Impactos de Sucessos requerem `Medium`, remoções ou perigos requerem `Heavy` no `expo-haptics`.

---

## Componentização Abstrata

No diretório genérico `components/ui/` agrupe sua força central, baseada em comportamentos gerais, não no negócio:

| Primitivo Recomendado | Comportamento |
|---|---|
| `Button` | Variações claras (Primary, Ghost, Destructive) |
| `Card` | Layout e boxShadow para container |
| `TextInput` | Entradas em text/uncontrolled logic e visual feedback (erro de cor) |
| `EmptyState` | Informa a ausência de registros (Não confunda com loading skeleton) |
| `StatusBadge` | Sinalização de pílula arredondada vermelha/amarela/verde |

## Ícones e SF Symbols

Recomenda-se no ecossistema iOS carregar o `expo-image` usando SF symbols diretamente:
`<Image source="sf:star.fill" />`.
Isso quebra burocracias de bibliotecas web pesadas para apps de alta voltagem. No Android crie um fallback gracioso.
