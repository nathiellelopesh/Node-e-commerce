# E-commerce Back-end API

Este é o back-end de uma aplicação de e-commerce, construído com Node.js, Express e TypeScript, utilizando o Supabase como banco de dados e solução de autenticação. A arquitetura segue o padrão de Camadas de Serviço e Controladores para manter a lógica de negócio separada da manipulação das requisições HTTP e da camada de persistência.

# Tecnologias e Arquitetura

Linguagem: TypeScript

Framework: Express.js

Database/BaaS: Supabase (PostgreSQL para dados, Auth para autenticação)

Persistência: Uso de funções RPC (Remote Procedure Calls) do Supabase para transações complexas (ex: create_sale_transaction), e API REST/Funções customizadas para CRUD.

Processamento Assíncrono: Implementação de worker_threads para processamento de uploads de CSV em segundo plano (Cadastro em Massa de Produtos).

Autenticação: Middleware AuthMiddleware baseado em tokens Bearer JWT do Supabase.

# Funcionalidades Principais (Serviços e Rotas)

O projeto é estruturado em torno de serviços modulares que engloba a lógica de negócio e interagem com o Supabase.

## Autenticação (/auth)

Gerencia o ciclo de vida do usuário (Clientes e Vendedores).

A rota /auth/register com o método POST cadastra novo usuário (cliente ou vendedor).

A rota /auth/login com o método POST realiza login e retorna um access_token JWT.

A rota /auth/logout com o método POST encerra a sessão do usuário.

A rota /auth/deactivate com o método DELETE desativa a conta do usuário (soft delete: marca uma data em deletedAt). Também desativa seus produtos.

## Produtos (/products)

Gerencia o catálogo de produtos. O acesso é dividido entre clientes (visualização) e vendedores (gerenciamento).

A rota /products com o método POST cria um novo produto.

A rota /products/upload-csv com o método POST faz o upload de CSV para cadastro em massa (processado via Worker Thread).

A rota /products/inventory com o método GET retorna o inventário do vendedor autenticado.

A rota /products/:id com o método GET retorna um produto específico pelo id.

A rota /products com o método GET retorna todos os produtos ativos (também com filtro por nome).

A rota /products/:id com o método PUT atualiza um produto.

A rota /products/:id com o método DELETE exclui um produto.

## Carrinho (/cart)

Gerencia os itens no carrinho de compras do usuário autenticado.

A rota /cart com o método POST adiciona ou atualiza a quantidade de um item no carrinho.

A rota /cart com o método GET retorna todos os itens do carrinho do usuário.

A rota /cart/:id com o método PUT atualiza a quantidade de um item no carrinho (pelo product_id).

A rota /cart/:id com o método DELETE remove um item específico do carrinho (pelo product_id).

A rota /cart com o método DELETE Limpa completamente o carrinho.

## Favoritos (/favorites)

Permite aos usuários gerenciar sua lista de produtos favoritos.

A rota /favorites com o método POST adiciona um produto aos favoritos.

A rota /favorites/:id com o método DELETE remove um produto dos favoritos (pelo product_id).

A rota /favorites com o método GET retorna a lista de favoritos do usuário.

## Vendas (/sales)

Gerencia o processo de checkout e o histórico de compras.

A rota /sales com o mtodo POST processa uma venda. Usa RPC do Supabase.

A rota /sales com o método GET retorna o histórico de vendas do usuário autenticado.

## Relatórios (/reports)

Fornece métricas de vendas para fins administrativos.

A rota /reports com o método GET retorna métricas de vendas (Faturamento Total, Vendas por Vendedor, Produto mais Vendido). Usa RPCs do Supabase.

# Configuração e Instalação

## Pré-requisitos

Node.js (versão LTS recomendada)

Conta Supabase ativa

Configuração do banco de dados (tabelas: profiles, Products, CartItem, FavoriteItem, sales, sale_items)

Criação das funções PostgreSQL RPC (get_total_revenue, get_products_sold_by_seller, get_best_selling_product, create_sale_transaction).

## Variáveis de Ambiente

Crie um arquivo .env na raiz do projeto com as seguintes variáveis:

SUPABASE_URL="[SUA_URL_SUPABASE]"
SUPABASE_ANON_KEY="[SUA_CHAVE_ANON_PÚBLICA]"

## Instalação

Clone o repositório e instale as dependências:

git clone [URL_DO_SEU_REPO]
cd [nome-do-projeto]
npm install

## Execução

Para iniciar o servidor em ambiente de desenvolvimento (que deve usar ts-node ou similar para rodar o código TypeScript):

Exemplo de comando de execução (assumindo que você tenha o ts-node instalado ou um script de inicialização): npm run dev

# Design de Usuário (is_seller)

O sistema suporta dois tipos de usuários, diferenciados pelo campo booleano is_seller:

Cliente (is_seller: false): Pode navegar no catálogo, adicionar/remover do carrinho e favoritos, e realizar compras.

Vendedor (is_seller: true): pode criar, visualizar (inventário), atualizar e excluir seus próprios produtos. Os endpoints de produtos são protegidos pelo AuthMiddleware para impor essa restrição.

## Observações:

Camada Supabase Genérica: O arquivo supabase.js (com funções save, update, drop, list) atua como uma camada de abstração de persistência genérica, simplificando as operações CRUD básicas nos Services.

Transações de Venda (RPC): A finalização da compra (create_sale_transaction) utiliza uma função RPC do PostgreSQL/Supabase. Isso garante que a verificação de estoque e a criação dos registros de venda e itens de venda ocorram atomicamente (como uma transação única), prevenindo corridas de dados e garantindo a integridade.

Soft Delete de Conta: A desativação de conta marca o campo deletedAt no perfil em vez de excluir o registro, garantindo que o histórico de vendas (vendedor e cliente) permaneça rastreável.

Processamento em Segundo Plano: O uso de worker_threads para o upload de CSV garante que o processamento de grandes arquivos não bloqueie o event loop principal do servidor, mantendo a API responsiva.