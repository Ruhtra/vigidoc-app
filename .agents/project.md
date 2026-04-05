# VigidocApp — Project Context

> **Leia este arquivo primeiro.** Ele é o contrato de produto que todo agente deve entender antes de escrever uma linha de código.

---

## O que é o VigidocApp?

O **VigidocApp** é um aplicativo móvel de uso exclusivo de **pacientes em suas casas**. O objetivo central é o **automonitoramento** da saúde do paciente, garantindo que ele se sinta cuidado, protegido e vigiado para o seu bem-estar (daí o nome Vigidoc). 
Toda a parte clínica ou ferramentas para médicos existirão em um *outro projeto*. O foco do app é única e exclusivamente a experiência do paciente.

Futuramente, o VigidocApp será integrado a um **aparelho físico** que monitorará o paciente 24h por dia. A fundação do app atual deve estar preparada para esse horizonte de recebimento de sinais vitais contínuos em curtos intervalos, sendo altamente performático no salvamento e estruturado localmente.

### Arquitetura Baseada em API

O app funciona como um client consumindo serviços REST padrão. Nossa fundação entende que **a nuvem é a fonte da verdade**.
- Leituras e escritas são gerenciadas interagindo diretamente com os endpoints da API.
- Recomenda-se o uso de padrões de UX para tratar o tempo de requisição de forma fluida (ex: Skeletons, Spinners, e estado otimista).

---

## Personas

| Persona | Contexto de uso | Necessidade principal |
|---|---|---|
| **Paciente Doméstico** | Em casa, ao longo do dia | Registrar sintomas, responder monitoramentos diários, visualizar estado de saúde com latência zero, sentir-se amparado. |

---

## Domínio e Entidades

```
User (Paciente)      → Entidade central (o dono do aparelho).
  ├── id: string (UUID v4)
  ├── name: string
  ├── birthDate: string
  ├── sensitiveData: string (dados sigilosos criptografados)
  └── createdAt: string (ISO 8601)

DailyLog             → Registro diário de saúde / check-in
  ├── id: string (UUID v4)
  ├── userId: string
  ├── date: string (ISO 8601)
  ├── moodScore: number
  ├── notes: string
  ├── hasSymptoms: boolean
  └── deletedAt: string | null

HealthMeasurement    → Medições discretas contínuas (pressão, glicose, batimentos futuros pelo aparelho móvel 24h)
  ├── id: string (UUID v4)
  ├── type: 'blood_pressure' | 'heart_rate' | 'temperature' | 'glucose'
  ├── value: number | string
  └── measuredAt: string (ISO 8601)
```

---

## Tech Stack

| Camada | Tecnologia | Versão |
|---|---|---|
| Framework | Expo | ~54 |
| React Native | React Native | 0.81 |
| Navegação | Expo Router | v6 |
| New Architecture | Habilitada | `newArchEnabled: true` |
| React Compiler | Habilitado | `reactCompiler: true` |
| Arquitetura Dados | API Client | (Via REST API Fetch/Axios + React Query) |
| Estado global | Zustand | v5 |
| Estilo | Inline styles + StyleSheet | — |
| Animações | react-native-reanimated | v4 |
| Gestos | react-native-gesture-handler | v2 |
| Dados sensíveis | expo-secure-store | — |

---

## Restrições Não-Negociáveis

1. **Cliente API Limpo**: A interface deve tratar de forma limpa e fluida o tempo de resolução de API (usando loaders, toasts ou estado otimista). A camada de dados não deve misturar lógica de UI.
2. **Experiência Charmosa e Acolhedora**: a UI deve exalar cuidado, segurança e tranquilidade, ajudando o paciente em momentos de fragilidade.
3. **Privacidade de dados**: campos sensíveis (informações clínicas pessoais) jamais podem ser armazenados em texto puro no SQLite. Criptografe campos de risco.
4. **Sem bibliotecas removidas do core**: `AsyncStorage`, `Picker`, `WebView`, `SafeAreaView` do core nunca devem ser usados.
