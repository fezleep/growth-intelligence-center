# Growth Intelligence Center

Growth Intelligence Center é uma simulação técnica realista de um workspace de analytics, atribuicao, rastreamento e qualidade de dados.

O projeto foi criado por **felipe virginio** para demonstrar, em um ambiente de produto, como dados podem ser investigados quando campanhas, CRM, eventos e relatórios não contam a mesma historia.

Este repositório **nao representa um sistema real em producao**. Ele foi pensado para mostrar capacidade de leitura de negocio, engenharia de dados, automacao e investigacao de discrepancias.

## O que e

Uma interface de produto que simula o fluxo entre captacao de leads, integracoes e camada analitica. A experiencia foi desenhada para parecer um software real: organizado, operativo e focado em diagnostico.

## Por que foi criado

O projeto existe para demonstrar como uma pessoa pode:

* identificar discrepancias entre fontes
* explicar a origem de uma variacao
* observar qualidade de dados
* inspecionar eventos e tracking
* transformar sinais operacionais em decisoes mais confiaveis

O contexto ficticio usado na aplicacao e a **EduGrowth Academy**, com um fluxo de marketing e vendas que passa por Meta Ads, Google Ads, landing page, formulario, CRM, Conversion API, analytics e workspace.

## Problema que resolve

O produto simula um problema comum em marketing analytics: os numeros nao batem entre as ferramentas.

Exemplo principal:

* Meta Ads mostra **100 leads**
* o workspace mostra **130 leads**

A diferenca pede investigacao para entender se houve:

* leads duplicados
* atraso de atribuicao
* falha no CRM
* evento rejeitado
* erro de rastreamento

## Cenario da EduGrowth Academy

A EduGrowth Academy representa um caso ficticio de operacao de crescimento com:

* captacao de leads
* campanhas pagas
* rastreamento de eventos
* sincronizacao com CRM
* envio para Conversion API
* leitura em analytics
* monitoramento no workspace

O objetivo e reproduzir um ambiente que pareca real o suficiente para investigar discrepancias sem transformar o produto em um portfolio pessoal.

## Fluxo de dados

O fluxo central do projeto segue esta sequencia:

`ads -> landing page -> formulario -> webhook -> crm -> conversion api -> analytics -> workspace`

Em termos praticos:

1. O anuncio gera o clique.
2. A landing page recebe a visita.
3. O formulario registra o lead.
4. O webhook envia o evento.
5. O CRM recebe e atualiza o contato.
6. A Conversion API replica o evento para as plataformas.
7. O analytics consolida o dado.
8. O workspace apresenta a leitura final.

## Principais funcionalidades

* overview operacional com indicadores resumidos
* investigacao de causa raiz
* simulador de eventos no GTM preview
* simulador de incidentes
* tracking plan
* sql explorer
* data quality center
* attribution center
* workspace com leitura visual do caso

## Caso principal

O caso central da aplicacao e a divergencia entre fontes:

* Meta Ads: 100 leads
* Workspace: 130 leads

A tela de root cause analysis reconstrói a diferenca e mostra o que explica a variacao:

* eventos duplicados
* atribuicao orgânica herdando campanha paga
* atraso de matching da plataforma

## Investigacao da causa raiz

A investigacao foi desenhada como uma narrativa objetiva:

* problema
* o que foi encontrado
* impacto
* causa
* como corrigir

Isso ajuda tanto um recrutador quanto uma pessoa sem contexto tecnico a entender o raciocinio sem precisar decodificar termos internos.

## GTM Preview Simulator

Simula o comportamento de uma sessao de preview do Google Tag Manager e deixa visivel:

* evento enviado
* evento duplicado
* evento falhou
* destinos afetados
* payload e sinais de depuracao

O objetivo e demonstrar leitura de rastreamento sem depender de linguagem excessivamente tecnica.

## Incident Simulator

Gera incidentes operacionais simulados para mostrar como uma falha se propaga entre:

* evento
* qualidade
* incidente
* logs
* impacto no workspace

## Tracking Plan

O tracking plan documenta os eventos que sustentam a leitura analitica do produto.

Ele serve para mostrar:

* quais eventos existem
* qual o gatilho de cada evento
* quais parametros sao esperados
* para onde os dados vao
* como validar consistencia

## SQL Explorer

Area de consulta read-only para explorar perguntas analiticas como:

* performance de campanhas
* atribuicao de leads
* qualidade de dados
* investigacao de incidentes

O SQL Explorer nao executa consultas reais de producao. Ele existe para demonstrar raciocinio analitico e governanca.

## Data Quality Center

Central de inconsistencias que ajuda a localizar problemas como:

* leads duplicados
* UTMs ausentes
* emails invalidos
* divergencias de CRM
* falhas de conversao
* divergencias de campanha

## Stack utilizada

* React 18
* TypeScript
* Vite
* Recharts
* React Flow
* Lucide React

## Como rodar localmente

Instale as dependencias:

```bash
npm install
```

Inicie o ambiente local:

```bash
npm run dev
```

## Como fazer build

```bash
npm run build
```

## Proximos passos possiveis

O projeto ja cobre a experiencia principal. Se houver evolucao futura, os proximos passos naturais seriam:

* ampliar cenarios de discrepancia
* detalhar mais validacoes de tracking
* enriquecer o catalogo de incidentes simulados
* adicionar novas variações de consultas analiticas

## Autor

**felipe virginio**  
software engineer • analytics • automação

Links oficiais:

* GitHub: https://github.com/fezleep
* LinkedIn: https://www.linkedin.com/in/fezleep/
* Portfólio: https://portfolio-dev-alpha-eight.vercel.app/

