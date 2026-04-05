---
trigger: always_on
---

# Performance Rules

> Boas práticas massivas da Callstack aplicadas nativamente visando Otimização e Prevenção de FPS-drops.
> **Regra de ouro**: Nunca jogue um "memo" no escuro sem medir os gargalos (Profile React via DevTools).

---

## Uso Crítico do FlashList

Para garantir dezenas de items (que superam o Viewport nativo do Device), erradique `ScrollView` / `FlatList` e implemente `@shopify/flash-list`.

```tsx
import { FlashList } from '@shopify/flash-list';

// Estimou altura da fileira unificada como 92px reais? Declare:
<FlashList
  data={heavyDataArray}
  renderItem={({ item }) => <FastItemView data={item} />}
  estimatedItemSize={92}          
  keyExtractor={(item) => item.id}
  contentInsetAdjustmentBehavior="automatic"
  ListEmptyComponent={<EmptyState />}
/>
```

- Nunca passe funções Inline sem checar prop-drilling no `renderItem`. Confie no React Compiler (se habilitado), ou use boas e velhas Arrow extraídas globalmente no pior caso.
- Extenda ScrollViews adicionais via `ListHeaderComponent` — Nunca trave listas em views de scroll concorrentes verticais.

---

## Animação Worklet via Reanimated V4

Qualquer Animação ligada a Gestos contínuos deve processar seu estresse fora da Treads do JavaScript, usando **Reanimated 4**:

```tsx
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

// Animação de reordenamento automática de Lista (Adições e Remoções):
<FlashList itemLayoutAnimation={LinearTransition} />

// Animação de entrada fluída na renderização:
<Animated.View entering={FadeInDown.duration(200).delay(index * 25)}> 
```
Todas as `useAnimatedStyle` rodam como um _worklet_. Variáveis de fora da closure que forem alteradas no estado React ali dentro vazarão e invalidarão frames. Use estritamente `useSharedValue()`.

---

## React TTI e Suspensões de Bundles

Seu Time To Interactive define se ele é robusto ou uma poça:
1. Lazy Load: Telas muito densas e em fluxos não-principais devem usar `React.lazy` no seu roteamento (ex: Configurações, Admin).
2. `useDeferredValue` é seu melhor amigo nas TextInputs de "Search offline" longas para evitar travamento da master thread.

---

## Barreiras Críticas Arquiteturais

| Alerta | Motivo e Solução |
|---|---|
| **Barrel Imports Pesados** | Importar de um `index.ts` aglutinador puxa o código da árvore inteira no Metro bundler. Importe direto: `/components/UI/button`. |
| **Jank em Inputs Controlados** | Em Form views imensas, Inputs controladas param o loop por milisegundos. Prefira "Uncontrolled component pattern" guardando no Blur/Ref submit. |
| **Lixo da Memória em Arrays** | Closures vazando com maps ou subscriptions (ex: NetInfo/Sockets) não contendo `cleanup() return` no useEffect sujam o Runtime Nativo. |

---

## Entendendo o Pesadelo

Seu Bundle e dependências controlam quem manda na Performance Geral. Verificadores:

```bash
# Audite os vilões do Bundle JS gerado verificando quem drena sua rede e app
npx react-native bundle --entry-file node_modules/expo-router/entry.js \
  --bundle-output /tmp/output.js --platform ios --dev false --minify true
npx source-map-explorer /tmp/output.js --no-border-checks
```
