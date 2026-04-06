# Plano de Atualização: API & Database (VigiDoc v1.1)

Este documento descreve o roteiro técnico para adaptar a API do VigiDoc ao novo Schema do Prisma, garantindo a compatibilidade com as funcionalidades de aprovação de usuários, monitoramento clínico avançado e gamificação (streaks).

---

## 1. Fase de Migração de Dados (Database)

A primeira etapa é garantir que o banco comporte as novas métricas sem quebrar os dados existentes.

### Ações:
1.  **Backup de Produção/Staging:** Gerar dump do banco atual.
2.  **Execução da Migration:** `npx prisma migrate dev --name upgrade_vigidoc_schema`.
3.  **Default States:** Atualizar usuários existentes para `status: ACTIVE` (para não bloquear quem já usa o app).
4.  **Enriquecimento do PatientProfile:** Criar CPFs fictícios ou temporários para perfis antigos (se houver restrição de UNIQUE).

---

## 2. Refatoração de Endpoints Existentes

### 2.1. Registro de Usuário (`POST /api/auth/sign-up/email`)
*   **Alteração:** O endpoint deve agora aceitar os novos campos: `cpf`, `birthDate`, `phone`.
*   **Lógica:** Definir `status: PENDING` por padrão no momento da criação.
*   **Resposta:** Enviar payload informando que a conta aguarda aprovação manual.

### 2.2. Login (`POST /api/auth/sign-in/email`)
*   **Middleware de Bloqueio:** Validar se o usuário tem `status == ACTIVE`. Caso contrário, retornar erro `403 Forbidden` com a mensagem: "Sua conta ainda não foi aprovada por um administrador".

### 2.3. Lembretes (`GET | POST /api/reminders`)
*   **Suporte a Ícones:** Adaptar para salvar e retornar os campos `icon` e `period` (Enum).

---

## 3. Desenvolvimento de Novos Endpoints (Admin & Dashboard)

### 3.1. Administração (Aprovação de Usuários)
*   **`GET /api/admin/users/pending`**: Lista usuários que aguardam aprovação.
*   **`POST /api/admin/users/approve`**: 
    - Body: `{ userId: string, action: 'APPROVE' | 'REJECT' }`.
    - Lógica: Atualizar `User.status` e disparar e-mail de boas-vindas.

### 3.2. Sinais Vitais (Motor de Severidade)
*   **`POST /api/vitals`**: 
    - **Lógica de Backend:** O backend deve comparar os valores (PAS, SpO2, FC) com os thresholds definidos no `health-monitoring-specs.md` e salvar automaticamente o campo `severity` (`NORMAL`, `ALERT`, `CRITICAL`).
*   **`GET /api/vitals/summary`**: Retorna contagem de medições do dia e o status da "Ofensiva" (Streak).

### 3.3. Notificações Push
*   **`POST /api/users/push-token`**: Salvar o `expoPushToken` no perfil do usuário para disparar alertas automáticos em caso de `severity: CRITICAL`.

---

## 4. Integração Frontend (Mobile) → Backend

| Funcionalidade | Endpoint Requerido | Hook Recomentado |
|---|---|---|
| Aprovação Manual | `PATCH /user/status` | `useMutation` |
| Registro de Aferição | `POST /vitals` | `useMutation` |
| Lista de Lembretes | `GET /reminders` | `useQuery` |
| Salvar Push Token | `POST /push-token` | `useEffect` no App Root |

---

## 5. Próximos Passos Sugeridos

1.  **Deploy do Schema:** Executar a migração no ambiente de desenvolvimento.
2.  **Mock de Aprovação:** Criar um script temporário para aprovar usuários enquanto o "Dashboard Admin" não está pronto.
3.  **Teste de Severidade:** Validar se o backend marca corretamente um `VitalRecord` como `ALERT` se a Saturação for `< 94`.

---
> [!IMPORTANT]
> A implementação deve ser atômica: primeiro o Banco, depois a API, e por fim o App Mobile. Isso evita inconsistências de campos nulos em produção.
