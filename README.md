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

## Como utilizar o PFC3

O PFC3 deve ser preenchido mensalmente.

### BPI

#### Descarregar o extrato mensal

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

#### Binance

- As instruções para o Binance são iguais às do Coinbase.

#### Polymarket

- Preencher o campo "Balance" com o saldo total da sua conta Polymarket em euros.
- Preencher o campo "Profit" com o retorno atual, seja ele positivo ou negativo.
- Preencher o campo "Deposit" com o valor total de depósito que efetuou neste site.

## ROADMAP

- Criar tabelas paginadas para todos os movimentos e snapshots.
- Adicionar opções para editar e apagar movimentos e snapshots.
- Adicionar formulário para inserir movimentos singulares na página BPI.
