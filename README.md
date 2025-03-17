# Projeto Next.js 14 & React 18

Este projeto é uma aplicação web desenvolvida com Next.js 14 e React 18, integrando autenticação via Auth0, gestão de base de dados com Prisma e funcionalidades adicionais através da API do OpenAI.

## Pré-requisitos

- **Node.js:** Recomenda-se a versão LTS.
- **Gestor de pacotes:** npm ou yarn.
- **Conta Auth0:** Regista uma conta em [Auth0](https://auth0.com) e cria uma aplicação para obter as credenciais necessárias.
- **Base de Dados PostgreSQL:** Certifica-te de que tens uma instância local ou remota.
- **Conta OpenAI:** Regista uma conta em [OpenAI](https://openai.com) para obter a chave API.

## Instalação

1. **Clonar o repositório**

   ```bash
   git clone https://github.com/username/repository.git
Navegar até à pasta do projeto
cd repository
Instalar as dependências
npm install
Configurar as variáveis de ambiente
Cria um ficheiro .env na raiz do projeto com o seguinte conteúdo (substitui os valores de exemplo pelas tuas credenciais):

NODE_ENV='development'

# Auth0
AUTH0_SECRET='a_tua_chave_secreta'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://dev-55mj1i3iax56m6qn.us.auth0.com'
AUTH0_CLIENT_ID='o_teu_client_id'
AUTH0_CLIENT_SECRET='o_teu_client_secret'
AUTH0_SCOPE='openid profile email'
AUTH0_DEBUG=true
AUTH0_ADMIN_ROLE_ID='admin'
AUTH0_TEACHER_ROLE_ID='teacher'
AUTH0_SUBSTITUTE_ROLE_ID='substitute'
AUTH0_STUDENT_ROLE_ID='student'

# Prisma
DATABASE_URL="postgresql://postgres:admin@localhost:5432/educaplandb"
OPTIMIZE_API_KEY="a_tua_optimize_api_key"

# OpenAI
OPENAI_API_KEY="a_tua_openai_api_key"
Notas:

Auth0: Após registares a tua conta, cria uma aplicação e atualiza as variáveis AUTH0_SECRET, AUTH0_CLIENT_ID e AUTH0_CLIENT_SECRET com as credenciais fornecidas pela Auth0.
Prisma: Configura a variável DATABASE_URL com os dados da tua instância PostgreSQL.
OpenAI: Substitui OPENAI_API_KEY pela chave API obtida na tua conta OpenAI.
Utilização

Para iniciar a aplicação em ambiente de desenvolvimento, executa:

npm run dev
A aplicação estará disponível em http://localhost:3000.

Contribuição

Se desejas contribuir para o projeto, segue os seguintes passos:

Cria um fork do repositório.
Desenvolve as tuas alterações.
Submete um pull request com as respetivas alterações.
Licença

Este projeto está licenciado sob a MIT License.