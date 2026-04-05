---
description: como criar um novo componente de UI reutilizável no VigidocApp
---

# Workflow: Novo Componente

Siga estes passos para criar qualquer novo componente em `components/`.

## 1. Classificar o Componente

| Tipo | Pasta | Exemplos |
|---|---|---|
| Primitivo de UI genérico | `components/ui/` | `Button`, `Card`, `Badge`, `TextInput` |
| Componente de domínio | `components/[feature]/` | `PatientCard`, `FormFieldRenderer` |

## 2. Criar o Arquivo

Use `kebab-case` para o nome do arquivo. Nunca use espaços ou caracteres especiais.

```
components/ui/sync-badge.tsx     ✅
components/patient/patient-card.tsx  ✅
components/PatientCard.tsx           ❌ (PascalCase no arquivo)
```

## 3. Estrutura Base do Componente

```tsx
// components/ui/nome-do-componente.tsx
import { StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Colors } from '@constants/colors';
import { Typography } from '@constants/typography';

// 1. Defina os Props com tipo explícito
interface NomeDoComponenteProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  // nunca use `any`
}

// 2. Exporte como named export (não default)
export function NomeDoComponente({ label, onPress, variant = 'primary' }: NomeDoComponenteProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={[styles.container, variant === 'secondary' && styles.secondary]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
      >
        {/* conteúdo */}
      </Pressable>
    </Animated.View>
  );
}

// 3. Styles inline para estilos únicos, StyleSheet para reutilizados
const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderCurve: 'continuous',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  pressable: {
    padding: 16,
  },
  pressed: {
    opacity: 0.7,
  },
  secondary: {
    backgroundColor: Colors.secondaryBg.light, // use hook de tema em produção
  },
});
```

## 4. Checklist de Qualidade

- [ ] Nome do arquivo em `kebab-case`
- [ ] Props tipadas explicitamente (sem `any`)
- [ ] `accessibilityRole` + `accessibilityLabel` em elementos interativos
- [ ] `borderCurve: 'continuous'` em todos os `borderRadius` (exceto cápsulas)
- [ ] `boxShadow` em vez de `elevation` ou shadow props legadas
- [ ] Animação `entering` + `exiting` com Reanimated (se o componente aparece/desaparece)
- [ ] Sem lógica de dados no componente (dados chegam por props)
- [ ] Sem chamadas a `lib/` ou `stores/` dentro de componentes `ui/`
- [ ] Dark mode considerado (use tokens de `constants/colors.ts`)
- [ ] Export nomeado, não default
- [ ] Testado visualmente em iOS e Android (Expo Go primeiro)

## 5. Documentação Inline

Adicione um comentário JSDoc conciso no topo do componente descrevendo o propósito:

```tsx
/**
 * Exibe a pílula de status geral do paciente (ativo, inativo, alta).
 * Use em PatientCard e PatientHeader.
 */
export function StatusBadge({ status }: StatusBadgeProps) { ... }
```