# pfc-v3
PFC (Personal Finance Center) v3

## How to install on localhost

- Download or clone the repo to a location of your choice
- Install NodeJS and NPM
- Install MySQL and create a database called "pfc_v3".
- Run the file database/create-tables.sql on your new database.
- Copy the file "secret-config-base.json" and rename it "secret-config.json".
- Copy the file "frontend/src/config-base.json" and rename it "frontend/src/config.json".
- Fill out the necessary fields on these files.
- Run the command "npm install" on the root folder.
- Run the command "npm install" on the frontend folder.
- Run the command "npm run build" on the frontend folder.
- Run the command "npm start" on the root folder to start the application.
- On your browser go to localhost:3000

### (Optional)

- Create a file ".env" on the root of the project.
- Set the port on this file like this: PORT=1234

## Como utilizar o PFC3

O PFC3 deve ser preenchido mensalmente.

Esta aplicação assume que o BPI é a conta principal e as outras são secundárias.

### BPI

#### Descarregar o extrato mensal BPI

- Ir ao site  https://www.bancobpi.pt/particulares
- Iniciar sessão
- Ir à página de consulta de movimentos
- Fazer scroll para baixo até ver o botão "Ver mais"
- Clicar de modo a que apareçam todos os movimentos do mês passado.
- No canto superior direito clicar em "Exportar XLS"
- O ficheiro irá ser descarregado para a pasta de transferências.

#### Importar o extrato mensal no PFC3

- Ir à página "BPI"
- Carregar no botão "Escolher ficheiro"
- Selecionar o ficheiro do extrato descarregado anteriormente
- Clicar no botão "Import XLS"
- Depois de receber confirmação que o ficheiro foi importado corretamente, pode definir certos movimentos como sendo ou não sendo despesas clicando no botão da última coluna.

#### Adicionar movimento BPI

- Caso queira reportar por exemplo uma entrada e saída em cash que não passe pelo banco pode adicionar movimentos no extrato BPI.
- Preencha os campos "Data Mov.", "Data Valor", "Descrição", "Valor", "Saldo" e "Despesa".
- Atenção que o saldo deve ser a soma do saldo do movimento anterior a essa data com o valor do movimento que vai inserir.
- Clicar em "Submeter"

#### Definir saídas como não-despesas

- Nas páginas BPI, Santander e Revolut pode definir valores negativos como não sendo despesas (por exemplo se forem transferências ou investimentos).
- Basta clicar no botão da última coluna para definir se é ou não despesa. (Este botão apenas está visível para valores negativos)

#### Descarregar o extrato mensal Santander

- Entrar no NetBanco Particulares.
- Na página iniciar clicar em "Ver movimentos" debaixo do seu saldo.
- Clicar em "Pesquisar e ordenar" por cima da tabela do extrato.
- Selecionar "Data inicial" e "Data final" como 1 e 31 do mês passado.
- Clicar em "Pesquisar"
- Debaixo da tabela clicar em "Exportar (Excel)"

#### Importar o extrato mensal Santander

- Ir à página "Santander"
- Introduza o saldo atual no Santander.
- Carregar no botão "Escolher ficheiro"
- Selecionar o ficheiro Excel.
- Clicar no botão "Submeter"

#### Descarregar o extrato mensal Revolut

- Inicie sessão no Revolut em browser desktop.
- Na página "Início" clicar no botão "Extrato".
- Escolher o formato Excel.
- Definir o mês de início e o mês de fim para o mês anterior.
- Clicar em "Gerar"

#### Importar o extrato mensal Revolut

- Ir à página "Revolut"
- Carregar no botão "Escolher ficheiro"
- Selecionar o ficheiro Excel.
- Clicar no botão "Submeter"

#### Inserir movimento de conta Revolut

- Caso realize alguma transação no mercado da bolsa no Revolut terá que adicionar um movimento de conta na página Revolut.
- Preencha os campos "Data Mov.", "Tipo", "Nome", "Quantidade", "Preço", "Valor" e "Retorno".
- O campo "Quantidade" é o número de ações.
- O campo "Preço" é o preço por cada ação (em euros).
- O campo "Valor" é o preço vezes a quantidade (em euros).
- O campo "Retorno" apenas deve ser preenchido em vendas e é o lucro ou perda dessa venda.

#### Inserir Resumo do Portfolio

- Todos os meses nas páginas "Revolut" e "Trading 212" poderá inserir um resumo do portfolio.
- Preencha os campos "Saldo" e "Lucro" com os valores atuais do Portfolio no total.
- Preencha os campos "Nome", "Preço", "Quantidade", "Valor" e "Retorno" para cada posição.
- Clique em "Submeter".
- Os valores devem ser em euros. O preço é o preço atual por cada ação, a quantidade é a quantidade de ações, o valor é o preço atual vezes a quantidade e o retorno é o lucro ou perda.

#### Trading212

- Preencher o campo "Balance" com o saldo total da conta Trading212 em euros.
- Preencher o campo "Profit" com o retorno, seja ele positivo ou negativo.
- Para cada posição que tiver de momento preencher os campos "Name" (Nome da ação), "Price" (preço atual da ação), "Quantity" (quantidade de ações), "Value" (valor atual da posição) e "Return" (lucro ou perda atual da ação).
- Clicar no botão "Add" para cada posição.
- Quando terminar clique em "Submit" para inserir o snapshot do seu portfolio na base de dados.

#### Coinbase

- Preencher o campo "Balance" com o saldo total da sua conta Coinbase em euros.
- Para cada asset em sua posse preencher os campos "Name" (nome da criptomoeda), "Deposit" (valor em euros que gastou na criptomoeda), "Quantity" (quantidade da criptomoeda atual em sua posse), "Value" (Valor em euros a que corresponde a sua posição nesta criptomoeda atualmente)
- Clicar no botão "Add" para cada asset.
- Clicar no botão "Submit" para submeter o snapshot do portfolio.
- Se tiver snapshot do mês anterior ele aparecerá em baixo de modo a poder comparar com o atual.

#### Despesas Coinbase

- Na página Coinbase pode adicionar despesas preenchendo os campos "Data", "Descrição" e "Valor".
- O valor deve ser um número positivo apesar de ser uma despesa neste caso.

#### Binance

- As instruções para o Binance são iguais às do Coinbase em termos dos resumos de portfolio.

#### Polymarket

- Preencher o campo "Balance" com o saldo total da sua conta Polymarket em euros.
- Preencher o campo "Profit" com o retorno atual, seja ele positivo ou negativo.
- Preencher o campo "Deposit" com o valor total de depósito que efetuou neste site.

#### Painel de Estatísticas

##### Retornos

- O Património inclui os saldos da Trading 212 e do Revolut de acordo com os resumos de portfolio e no Revolut também a conta à ordem.
- As vendas da T212, se forem reinvestidas irão-se refletir no saldo T212. Se não terão que ser transferidas para o BPI ou Santander de modo a serem refletidas no Património.
- No Revolut poderá transferir o valor dessas vendas para a conta à ordem Revolut e será contabilizado ou poderá reinvestir.
- Se tiver dinheiro na conta de ações da Revolut que não esteja investido (ativo Euros) este não será contabilizado a não ser que o preencha nos resumos de portfolio.
- A atividade de conta na T212 e no Revolut serve para determinar as vendas por ano. Não tem impacto no património.
- O lucro de criptomoedas também está incluído no património de acordo com os resumos do Coinbase, Binance e Polymarket. Este valor é ao longo de todo o tempo e não apenas por ano.
- O Valor Total do Inventário não está incluído no Património.
- Os campos que têm um lápis à frente podem ser editados.
- Em cada mês depois de importar os extratos e preencher os resumos deverá clicar no botão "Guardar Património" debaixo do gráfico do património de modo a poder visualizar a variação do património ao longo dos meses.