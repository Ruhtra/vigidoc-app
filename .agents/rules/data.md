---
trigger: always_on
---

# Data Rules

> Regras para manipulação, armazenamento e formulários de dados em aplicações móveis dinâmicas Local-First.

---

## Formulários Dinâmicos

Sistemas modulares tipicamente possuem dados com configurações customizáveis. Padronize a configuração no seu catálogo de tipos:

```typescript
// types/form.types.ts
export type FieldType =
  | 'text'          // Texto curto
  | 'textarea'      // Texto descritivo
  | 'number'        // Numérico genérico
  | 'date'          // Picker nativo
  | 'select'        // Dropdown / ActionSheet
  | 'boolean'       // Switch
  | 'photo'         // Componente de câmera local
  | 'signature'     // Capture component

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  sensitive?: boolean; // Se `true`, trate criptografia local na gravação (Local-First security)
  options?: string[];  // Útil para 'select'
  validation?: ValidationRule;
}

export interface ValidationRule {
  min?: number;
  max?: number;
  pattern?: string;
}
```

---

## Validação de Campos (Validation Flow)

O processo de validação em fluxos críticos possui 2 fases:

1. **No Blur** (Feedback inline): Valide após o usuário sair do input para evitar layout shift ruidoso.
2. **No Submit** (Avanço/Guarda): Bloco final que varre regras completas para não gerar corrompimento de DB local.

```typescript
export function validateField(field: FormField, value: unknown): string | null {
  if (field.required && !value) {
    return 'Campo obrigatório';
  }
  // Aplique outras regras de bounds (min/max), regex de strings...
  return null;
}
```

---

## Manipulação Local de Mídias

### Mídias (Fotos, Assinaturas)

- Lide com mídias localmente de modo temporário antes do upload.
- O sistema deve fazer uso de "Multipart FormData" ou envio para serviços como "S3 Pre-signed URLs" nas chamadas diretas com a API para persistência.
- Trate o estado de upload na UI (mostrando o progresso ou spinners).

---

## Busca e Filtragem na API

Para lidar com listas densas, a busca textual pesada e filtragem devem ocorrer no backend.

```typescript
// Exemplo em um Hook do React Query
export function useSearchQuery(searchTerm: string) {
  // Faça o debounce do searchTerm antes de passá-lo aqui
  return useQuery({
    queryKey: ['search', searchTerm],
    queryFn: () => SearchService.query(searchTerm),
    enabled: searchTerm.length > 2,
  });
}
```

**Filtro Local**: Se os dados já vieram completos da API, é aceitável realizar um array `filter` simples em memória para listas curtas.

---

## Paginação via Cursor Diferido

Para views e listas densas, consuma serviços paginados do servidor através do cursor pattern ou offset via `useInfiniteQuery`:

```typescript
// Paginando dados da API
export function useIterativeList() {
  return useInfiniteQuery({
    queryKey: ['items'],
    queryFn: ({ pageParam }) => ItemService.fetchPage({ cursor: pageParam }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
```

---

## Trabalhando com Wizard Multi-step

Formulários extensos não combinam com UX mobile de telas curtas e exigem Wizards (`step/1`, `step/2`):

1. Controle o avanço momentâneo do Wizard com um store (`Zustand`) mantido localmente.
2. Como o dado é governado pelo usuário, ele pode abandonar a tela e ao voltar, as marcações `isDirty: true` preencherão seus slots perdidos.
