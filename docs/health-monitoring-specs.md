# Especificação Técnica: Dashboard de Monitoramento VigiDoc

Este documento define a lógica de estados, gatilhos de alteração e responsabilidades dos indicadores de saúde em tempo real (Insights) do VigiDoc.

---

## 1. Arquitetura de Domínios (As 3 Colunas de Insight)

O Dashboard centraliza a saúde em três domínios independentes para facilitar o diagnóstico de problemas (técnicos vs. clínicos).

| Domínio | Label Sugerido | Responsabilidade | Camada |
| :--- | :--- | :--- | :--- |
| **Padrão de IA** | Análise de IA | Reconhecimento de tendências e anomalias rítmicas. | Software (ML) |
| **Hardware / IoT** | Status Sensores | Integridade da coleta e conectividade do wearable. | Hardware (IoT) |
| **Clínico / Bio** | Estado Geral | Resumo do estado do paciente baseado em thresholds. | Médico (Bio) |

---

## 2. Matriz de Estados e Variações (Três Níveis)

Cada indicador deve operar em um sistema de semáforo (Traffic Light System) para sinalização visual imediata.

### A. Reconhecimento de Padrão (IA)
Focado no "comportamento" da curva de dados, não apenas no número bruto.

*   **Padrão Normal (Cyan/Green)**: Histórico estável. Variabilidade da frequência cardíaca (HRV) dentro da curva de Gauss do usuário.
*   **Anomalia Detectada (Yellow)**: Mudança súbita no padrão de sono ou respiração. Possível início de quadro inflamatório ou estresse.
*   **Padrão Crítico (Red)**: Assinatura de dados compatível com arritmia maligna, apnéia grave ou queda súbita.

### B. Status de Sensores (Conectividade)
Focado na confiança do dado que está sendo exibido.

*   **Sensores OK (Green)**: Dispositivo conectado e com boa impedância (sinal limpo).
*   **Check Posicionamento (Yellow)**: Sensor conectado, mas com ruído excessivo. Pode indicar que o dispositivo está folgado.
*   **Desconectado (Gray)**: Sem recebimento de pacotes de dados via Bluetooth/Cloud.

### C. Estado Clínico (Definição Médica)
Focado nos limiares (Thresholds) definidos pela equipe de oncologia/cardiologia.

*   **Estável (Violet)**: Todos os sinais vitais brutos dentro do intervalo de referência.
*   **Alerta de Saúde (Orange)**: Pelo menos um sinal vital cruzou o limite de segurança (ex: Saturação < 93% ou Pressão > 14/9).
*   **Estado Crítico (Red)**: Sinais vitais em níveis de urgência/emergência ou múltiplos sinais em alerta simultâneo.

---

## 3. Gatilhos de Alteração (Triggers)

| Sinal Vital | Nível: Estável (Normal) | Nível: Alerta (Atenção) | Nível: Crítico (Urgente) |
| :--- | :--- | :--- | :--- |
| **Freq. Cardíaca** | 60 — 100 bpm | 101 — 120 bpm (ou < 50) | > 120 bpm (ou < 40) |
| **Saturação (SpO2)** | 95 — 100% | 93 — 94% | < 92% |
| **Temperatura** | 36.1 — 37.2 °C | 37.3 — 38.3 °C | > 38.4 °C |
| **Pressão (PAS)** | 100 — 130 mmHg | 131 — 145 mmHg | > 150 mmHg |

---

## 4. Benefícios Estratégicos para a Equipe Médica

1.  **Redução de Ruído**: Ao separar "Falha de Sensor" de "Alerta Clínico", evitamos falsos positivos na central de monitoramento.
2.  **Ação Preditiva**: O indicador de IA pode prever um estado de alerta clínico horas antes dos sinais vitais brutos saírem da zona de conforto.
3.  **Engajamento do Usuário**: Facilita a compreensão do paciente sobre quando ele deve "apertar a pulseira" ou quando deve "ir ao hospital".

---
*Documento Gerado para reunião de Alinhamento de Produto - VigiDoc v1.0*
