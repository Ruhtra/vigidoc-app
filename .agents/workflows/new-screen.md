---
description: como criar uma nova tela no VigidocApp
---

# Workflow: Nova Tela

Siga estes passos em ordem para criar qualquer nova tela no app.

## 1. Planejamento

Antes de criar o arquivo, responda:
- A tela pertence a qual tab? (`patients`, `forms`, `settings`)
- É uma tela de lista, detalhe, formulário ou modal/sheet?
- Ela precisa de dados do servidor ou apenas locais?
- Ela funciona offline? (resposta esperada: sim)

## 2. Criar o Arquivo de Rota

Crie o arquivo em `app/` seguindo a convenção de nomenclatura:
- Telas de detalhe: `app/(tabs)/(patients)/[id].tsx`
- Telas de criação: `app/(tabs)/(patients)/new.tsx`
- Modais: `app/modal-name.tsx` + registre no root `_layout.tsx`
- Sheets: registre com `presentation: 'formSheet'`

```tsx
// Estrutura mínima de toda tela
import { ScrollView } from 'react-native';
import { Stack } from 'expo-router';

export default function NomeDaTela() {
  return (
    <>
      <Stack.Screen options={{ title: 'Título da Tela' }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        {/* conteúdo aqui */}
      </ScrollView>
    </>
  );
}
```

## 3. Criar o Hook de Dados

Crie o hook em `hooks/` para encapsular a query de dados:

```typescript
// hooks/use-patients.ts
import { useQuery } from '@tanstack/react-query';
import { PatientService } from '@lib/services/patient.service';

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: () => PatientService.findAll(),
    staleTime: 1000 * 30, // 30 segundos
  });
}
```

// turbo
## 4. Verificar Checklist

- [ ] O arquivo da rota está em `app/`, não em `components/`
- [ ] O primeiro filho é `ScrollView` com `contentInsetAdjustmentBehavior="automatic"`
- [ ] O título da tela está em `Stack.Screen options`, não em elemento `<Text>` na página
- [ ] A tela lida corretamente com loading states e network errors (APIs)
- [ ] Campos com dados clínicos têm prop `selectable`
- [ ] Elementos interativos têm `accessibilityLabel`
- [ ] Listas usam `FlashList`, não `ScrollView` com `.map()`

## 5. Registrar no Layout de Tabs (se necessário)

Se for uma nova tab, adicione o trigger em `app/(tabs)/_layout.tsx`:

```tsx
<NativeTabs.Trigger name="(nova-tab)">
  <Icon sf="nome.do.icone" />
  <Label>Nova Tab</Label>
</NativeTabs.Trigger>
```