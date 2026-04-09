# Fluxo de Autenticação e Identidade - VigiDocApp

Este documento descreve como o aplicativo gerencia a sessão do usuário e se comunica de forma autenticada com o backend Vigidoc.

## 1. Login e Persistência

O processo de entrada utiliza o **Better-Auth** como motor principal:

1.  **Entrada de Credenciais**: O usuário fornece e-mail e senha na tela de Login.
2.  **Autenticação**: O `AuthService.signInEmail` chama a API do backend.
3.  **Objeto de Sessão**: O backend retorna um objeto contendo:
    *   `session`: Dados da sessão (ID, Token, Expiração).
    *   `user`: Dados do usuário (ID, Nome, Role, DoctorId).
4.  **Armazenamento Seguro**: Este objeto é salvo no **Expo SecureStore** (chave: `vigidoc_session`) para persistência entre reinicializações do app.

## 2. Duração e Renovação da Sessão

Para garantir uma experiência "infinita" no aplicativo mobile:
*   **Duração (ExpiresIn)**: As sessões são configuradas no backend para durar **365 dias**.
*   **Renovação Automática (UpdateAge)**: A cada 7 dias de uso ativo do app, a expiração da sessão é empurrada automaticamente para +1 ano no futuro. Isso garante que usuários ativos nunca precisem refazer o login.
*   **Persistência Native**: Como os dados estão no `SecureStore`, a sessão sobrevive mesmo se o app for fechado ou o dispositivo reiniciado.

## 3. Gerenciamento de Estado (Zustand)

O `auth.store.ts` é responsável por manter o estado global da sessão:
*   **Hydration**: Ao abrir o app, o store lê o `SecureStore` e carrega a sessão na memória.
*   **Reatividade**: Componentes da UI podem reagir a mudanças de autenticação (ex: redirecionar para Login se a sessão expirar).

## 3. Interceptor de Requisições (O Coração do Fluxo)

Para evitar que cada serviço precise passar tokens manualmente, configuramos um **Interceptor de Requisição** no Axios (`src/lib/api/client.ts`).

### Funcionamento do Interceptor:
Antes de toda requisição sair do aplicativo, o interceptor realiza os seguintes passos:

1.  Recupera a sessão atual do `SecureStore`.
2.  Extrai o `token` de autenticação.
3.  Extrai os dados de identidade do usuário (`id`, `role`, `doctorId`).
4.  Injeta automaticamente os cabeçalhos (Headers) descritos abaixo.

## 4. Cabeçalhos de Autenticação (Headers)

Enviamos dois conjuntos de cabeçalhos para o backend:

### A. Autenticação Padrão (Better-Auth)
Estes headers garantem que o servidor reconheça a sessão via biblioteca Better-Auth.
*   `Authorization: Bearer <token>`
*   `x-better-auth-session-token: <token>`

### B. Identidade Direta (Optimization Headers)
Estes headers permitem que o backend identifique o usuário instantaneamente no `getAuthContext`, **evitando uma consulta extra ao banco de dados** em cada requisição. Isso melhora drasticamente a performance da API.
*   `x-user-id`: O UUID do usuário logado.
*   `x-user-role`: A função do usuário (ex: `admin`, `user`).
*   `x-doctor-id`: (Opcional) O ID do médico vinculado ao usuário, se houver.

## 5. Fluxo de Saída (Logout)

Ao realizar o logout:
1.  O `AuthService.signOut` é chamado no backend.
2.  O `auth.store.ts` limpa o estado na memória.
3.  O `SecureStore` é limpo para remover a sessão física.
4.  O usuário é redirecionado para a tela de Login.

---

**Nota para Futuros Desenvolvedores**: Caso novas rotas protegidas sejam criadas no backend, elas já estarão cobertas por esse fluxo, desde que utilizem o `getAuthContext()` para validar a permissão.
