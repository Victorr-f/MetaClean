MetaClean

📌 **Informações Gerais**

* **Nome do Projeto: MetaClean**
* **Equipe:** Luís Miguel Mendes Costa 3A,Matheus Henrique Santos Dutra 3B, Victor Rogerio Fideles Hordones Olimpio 2B, Lucas Mateus Soares de Cristo Paiva 1A, Lucas Custódio Rodrigues 1B, Isabelle Oliveira Ramos 1A
* **Curso:** Técnico em Informática
* **Instituição:** FUNEC-RIACHO
* **Ano/Semestre:** 2026/2
* **Professor Orientador:** Adriana Aguiar
* **Cliente/Setor Solicitante:** Setor de Sustentabilidade e Energias Renováveis

🎯 **Objetivo do Projeto**
Desenvolver um sistema web integrado a dispositivos IoT (ESP32) para monitorar em tempo real variáveis ambientais e de produção de biogás (temperatura, umidade, nível de resíduos e gás produzido), permitindo visualização gráfica, controle de acesso seguro e verificação do status de conexão dos dispositivos.

👥 **Público-Alvo**

* Operadores de biodigestores
* Administradores do sistema de biodigestores

🧩 **Problema a Ser Resolvido**
O monitoramento tradicional de biodigestores muitas vezes depende de anotações manuais ou inspeções presenciais constantes, o que dificulta a identificação rápida de variações críticas de temperatura, nível ou vasamento de biogás.

💡 **Solução Proposta**
Um sistema web moderno com autenticação segura de usuários e um painel em tempo real que se conecta ao Firebase Realtime Database para exibir dados enviados por um microcontrolador ESP32, acompanhado de gráficos dinâmicos e alertas visuais de conexão.

⚙️ **Funcionalidades do Sistema**
**Funcionalidades Principais**

* Autenticação de usuários (Cadastro e Login seguros via Firebase Auth)
* Exibição de métricas em tempo real (Temperatura, Umidade, Nível de Resíduos e Biogás)
* Gráficos dinâmicos interativos com histórico recente (via Chart.js)
* Monitoramento do status de conexão do ESP32 com verificação automática de inatividade (*timeout*)
* Navegação por seções (Visão Geral, Monitoramento Detalhado, Alertas e Histórico)

🛠️ **Tecnologias Utilizadas**

* **Front-end:** HTML, CSS, JavaScript
* **Biblioteca de Gráficos:** Chart.js
* **Banco de Dados & Auth:** Firebase Realtime Database e Firebase Authentication
* **Hardware/IoT:** ESP32 (C++) com sensores integrados
* **Hospedagem:** Vercel
* **Versionamento:** Git e GitHub
* **IDE:** VS Code

🗂️ **Estrutura do Projeto**

```
/metaclean
│ ├── index.html
│ ├── style.css
│ ├── script.js


```

🧪 **Requisitos Funcionais**

* **RF01** – O sistema deve permitir o cadastro de novos usuários na plataforma.
* **RF02** – O sistema deve permitir o login seguro de usuários cadastrados.
* **RF03** – O sistema deve ler e exibir em tempo real os dados de temperatura, umidade, nível e gás enviados pelo ESP32.
* **RF04** – O sistema deve atualizar dinamicamente os gráficos de monitoramento a cada nova leitura.
* **RF05** – O sistema deve indicar visualmente se o ESP32 está conectado ou desconectado com base no tempo da última transmissão.

🚫 **Requisitos Não Funcionais**

* **RNF01** – O sistema deve ser acessível via navegador web em computadores e dispositivos móveis.
* **RNF02** – O sistema deve possuir uma interface limpa e intuitiva, com tema escuro otimizado para longas jornadas de uso.
* **RNF03** – O sistema deve garantir a segurança no acesso aos dados utilizando credenciais individuais de usuário.
* **RNF04** – O sistema deve processar e refletir atualizações em tempo real com baixa latência.

📅 **Cronograma do Projeto**

| Etapa | Descrição | Responsável | Data |
| --- | --- | --- | --- |
| 1 | Levantamento de requisitos e definição do escopo | Equipe | [Mês/Ano] |
| 2 | adwd | Equipe | [Mês/Ano] |
| 3 | adwd | Equipe | [Mês/Ano] |
| 4 | adwd | Equipe | [Mês/Ano] |
| 5 | adwd | Equipe | [Mês/Ano] |
| 6 | Apresentação e entrega do projeto | Equipe | [Mês/Ano] |

🧑‍💻 **Integrantes da Equipe**

| Nome | Função | Responsabilidade |
| --- | --- | --- |
| [Nome] | Desenvolvedor | Estrutura web, lógica JS e integração com Firebase |
| [Nome] | Desenvolvedor  / Hardware | Programação do ESP32 e configuração dos sensores |
| [Nome] | Designer / Testador | Estilização CSS, paleta de cores e validação de requisitos |

🔐 **Controle de Acesso**

* **Administrador / Usuário:**
 
📷 **Protótipos / Telas**

* *Inserir capturas de tela *

📦 **Como Executar o Projeto**


1. Acessar: metaclean-nine.vercel.app
