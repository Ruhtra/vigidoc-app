---
trigger: always_on
---

# Architecture Rules

> Diretrizes arquiteturais baseadas em padrões escaláveis para React Native (Expo Router e New Architecture).

---

## Estrutura de Pastas

```
app/                        ← APENAS rotas. Nada mais aqui.
├── _layout.tsx             ← Root layout (Stack + ThemeProvider)
├── (tabs)/                 ← NativeTabs root
│   ├── _layout.tsx
│   ├── (items)/            ← Shared stack group genérico (ex: entities, feeds)
│   │   ├── _layout.tsx
│   │   ├── index.tsx       ← Lista mestre
│   │   ├── [id].tsx        ← Detalhe do item
│   │   └── new.tsx         ← Criar item
│   └── (settings)/
│       ├── _layout.tsx
│       └── index.tsx
├── feature-flow/           ← Fluxos secundários
│   ├── [id].tsx            ← Tela do fluxo
│   └── summary.tsx         ← Revisão/Conclusão
└── modal.tsx               ← Global Modals

components/                 ← Componentes React reutilizáveis
├── ui/                     ← Primitivos de UI (button, card, badge...)
└── [feature]/              ← Componentes vinculados ao domínio da feature

lib/                        ← Lógica de negócio e infraestrutura
├── api/                    ← Clientes HTTP (Axios/Fetch configurados)
├── services/               ← Padrão Service para chamadas a API (PatientService.ts)
└── storage/                ← Abstração de Secure Storage

hooks/                      ← React hooks reutilizáveis (useData.ts, useTheme.ts)
stores/                     ← Estado global (Zustand) (auth.store.ts)
constants/                  ← Valores estáticos (colors.ts, typography.ts)
types/                      ← Tipos compartilhados genéricos
```

---

## Aliases de Path (tsconfig)

Sempre configure os aliases na sua IDE/TSConfig e use-os nos imports:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@components/*": ["./components/*"],
      "@lib/*": ["./lib/*"],
      "@hooks/*": ["./hooks/*"],
      "@stores/*": ["./stores/*"],
      "@constants/*": ["./constants/*"],
      "@types/*": ["./types/*"]
    }
  }
}
```

**Regra**: nunca use caminhos relativos retrocedendo muitos níveis (`../../../`).

---

## Convenções de Nomenclatura

| Artefato | Convenção | Exemplo |
|---|---|---|
| Arquivos/pastas | `kebab-case` | `item-card.tsx` |
| Componentes React | `PascalCase` | `ItemCard` |
| Hooks | `camelCase` com prefixo `use` | `useData` |
| Funções utilitárias | `camelCase` | `formatDocument()` |
| Constantes | `UPPER_SNAKE_CASE` | `MAX_RETRIES` |
| Tipos/Interfaces | `PascalCase` com sufixo `Type` ou `Props` | `EntityType`, `CardProps` |
| Stores Zustand | `camelCase` com sufixo `Store` | `appStore` |
| Serviços (API) | `PascalCase` com sufixo `Service` | `EntityService` |

---

## Regras de Camada (Dependency Direction)

```
app/ (rotas)
  └── depende de → components/
components/
  └── depende de → hooks/, stores/, constants/, types/
hooks/
  └── depende de → lib/, stores/
lib/services/
  └── depende de → lib/api/
```

**Regra**: as camadas inferiores NUNCA importam das superiores. Ex: Um hook de estado nunca deve importar da tela.

---

## Estado

| Tipo de Estado | Solução |
|---|---|
| Cache da API / Dados Remotos | **React Query** (`useQuery`, `useMutation`) isolado em `hooks/use-*.ts` e lidando com estados de loading e erro. |
| Estado global de UI | **Zustand** isolado em `stores/` |
| Estado local | `useState` / `useReducer` interno |
| Inputs e Forms grandes | Uncontrolled state / Local context |

---

## Padrão de Service (API Client)

Toda camada visual ou hooks de query devem consultar as funções de service. As regras de endpoints ficam isoladas nelas.

```typescript
// Exemplo genérico API Client
import { api } from '@lib/api/client';

export const EntityService = {
  findAll: async () => {
    const response = await api.get('/entities');
    return response.data;
  },
  findById: async (id: string) => {
    const response = await api.get(`/entities/${id}`);
    return response.data;
  }
};
```

---

## Rotas e Navegação

- Tabs: `NativeTabs` (`expo-router/unstable-native-tabs`) para máxima performance nas abas.
- Modais: preferir overlays via `presentation: 'modal'` ou `'formSheet'`.
- Lists: Em listas densas, use prefetching se aplicável.

---

## TypeScript Safety

- `strict: true` ativado.
- **Nenhum** uso de `any`. Use `unknown` e refine os tipos com Guards.
- Prefira exportar `type` em vez de `interface` (salvo extensões dinâmicas).
- Componentes e hooks não deduzíveis visualmente devem ter retornos explícitos, mas em Arrow functions React o type inference é recomendado.
