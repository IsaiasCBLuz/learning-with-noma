# NOMA — Tutorial de Execução e Deploy

## Pré-requisitos
- Python 3.11+
- Node.js 18+
- Conta no [Aiven](https://aiven.io) (PostgreSQL)
- Conta no [Railway](https://railway.app) ou [Render](https://render.com) (backend)
- Conta na [Vercel](https://vercel.com) (frontend)
- Conta no [Google Cloud](https://console.cloud.google.com) (Google Calendar)

---

## 1. Banco de Dados — Aiven PostgreSQL

1. Crie um serviço **PostgreSQL** no Aiven (plano gratuito disponível)
2. Copie a **Connection String** (URI) — vai parecer com:
   ```
   postgresql://user:password@host.aivencloud.com:12345/defaultdb?sslmode=require
   ```
3. Para o SQLAlchemy async, troque `postgresql://` por `postgresql+asyncpg://`

---

## 2. Backend — Configuração Local

```bash
cd backend

# Criar ambiente virtual
python -m venv .venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate       # Linux/Mac

# Instalar dependências
pip install -r requirements.txt
```

### Criar o arquivo .env

Copie `.env.example` para `.env` e preencha:

```bash
# Gerar FERNET_KEY (execute uma vez):
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# Gerar ADMIN_PASSWORD_HASH (substitua 'suasenha' pela senha desejada):
python -c "from passlib.context import CryptContext; ctx = CryptContext(schemes=['bcrypt']); print(ctx.hash('suasenha'))"

# Gerar SECRET_KEY:
python -c "import secrets; print(secrets.token_hex(32))"
```

Preencha o `.env`:
```env
DATABASE_URL=postgresql+asyncpg://user:pass@host:port/db?ssl=require
SECRET_KEY=<gerado acima>
FERNET_KEY=<gerado acima>
ADMIN_PASSWORD_HASH=<gerado acima>
FRONTEND_URL=http://localhost:5173
GOOGLE_CALENDAR_ID=   # preencher depois
GOOGLE_SERVICE_ACCOUNT_JSON=  # preencher depois
```

### Rodar migrations

```bash
cd backend
alembic upgrade head
```

> **Importante:** A `DATABASE_URL` no `.env` deve usar `?ssl=require` (não `sslmode=require`).
> O código normaliza automaticamente, mas usar o formato certo evita dúvidas.
> Aiven entrega a connection string com `sslmode=require` — troque para `ssl=require` ao copiar.

### Criar usuário admin no banco

Após `alembic upgrade head`, use o script dedicado:

```bash
cd backend
python create_admin.py --email admin@noma.com --password suasenha --name "Admin NOMA"
```

O script valida duplicatas e confirma a criação.

### Iniciar backend

```bash
uvicorn app.main:app --reload
# Acesse: http://localhost:8000/docs
```

---

## 3. Frontend — Configuração Local

```bash
cd frontend
npm install
```

Copie `.env.example` para `.env`:
```env
VITE_API_URL=http://localhost:8000
```

Iniciar frontend:
```bash
npm run dev
# Acesse: http://localhost:5173
```

---

## 4. Google Calendar — Service Account

1. Acesse [Google Cloud Console](https://console.cloud.google.com)
2. Crie um projeto (ou use existente)
3. Ative a **Google Calendar API**
4. Em "Credenciais" → "Criar credenciais" → **Conta de serviço**
5. Baixe o JSON da conta de serviço
6. No Google Calendar da Teacher Juli:
   - Vá em Configurações do calendário
   - "Compartilhar com pessoas específicas"
   - Adicione o email da conta de serviço com permissão **"Fazer alterações em eventos"**
7. Copie o ID do calendário (Settings → "ID do calendário")
8. No `.env`:
   ```env
   GOOGLE_CALENDAR_ID=xxxxx@gmail.com
   GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":...}
   ```
   > Dica: minifique o JSON em uma linha só, ou use uma variável de arquivo.

---

## 5. Deploy — Backend no Railway

1. Crie conta no [Railway](https://railway.app)
2. "New Project" → "Deploy from GitHub repo" → selecione este repositório
3. Defina o **Root Directory** como `backend`
4. Railway detecta o `Procfile` automaticamente
5. Em "Variables", adicione todas as variáveis do `.env`:
   - `DATABASE_URL`
   - `SECRET_KEY`
   - `FERNET_KEY`
   - `ADMIN_PASSWORD_HASH`
   - `FRONTEND_URL` (URL da Vercel, ex: `https://noma.vercel.app`)
   - `GOOGLE_CALENDAR_ID`
   - `GOOGLE_SERVICE_ACCOUNT_JSON`
6. Copie a URL gerada (ex: `https://noma-api.up.railway.app`)

---

## 6. Deploy — Frontend na Vercel

1. Crie conta na [Vercel](https://vercel.com)
2. "New Project" → importe do GitHub
3. **Root Directory**: `frontend`
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. Em "Environment Variables":
   ```
   VITE_API_URL = https://noma-api.up.railway.app
   ```
7. Deploy → copie a URL (ex: `https://noma.vercel.app`)
8. Volte ao Railway e atualize `FRONTEND_URL` com esta URL

---

## 7. Rodar migrations na produção

Conecte ao banco Aiven remotamente:

```bash
cd backend
# Com DATABASE_URL apontando para Aiven:
DATABASE_URL="postgresql+asyncpg://..." alembic upgrade head
```

Ou use o Railway Shell para rodar `alembic upgrade head` diretamente.

---

## 8. Testar o sistema

1. Acesse `https://noma.vercel.app`
2. Faça o quiz — verifique se salva no banco
3. Registre um aluno pelo admin (5 cliques no logo → senha admin)
4. Faça login como aluno
5. Agende uma aula
6. Verifique se o evento aparece no Google Calendar da Teacher Juli

---

## Variáveis de Ambiente — Resumo

| Variável | Onde usar | Descrição |
|----------|-----------|-----------|
| `DATABASE_URL` | Backend | PostgreSQL Aiven (asyncpg) |
| `SECRET_KEY` | Backend | Chave JWT (32+ chars) |
| `FERNET_KEY` | Backend | Chave de criptografia de dados pessoais |
| `ADMIN_PASSWORD_HASH` | Backend | bcrypt hash da senha admin |
| `FRONTEND_URL` | Backend | URL do site na Vercel (CORS) |
| `GOOGLE_CALENDAR_ID` | Backend | ID do calendário da Teacher Juli |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Backend | JSON da conta de serviço Google |
| `VITE_API_URL` | Frontend | URL da API no Railway |

---

## Dúvidas frequentes

**Como trocar a senha admin?**
Gere um novo hash: `python -c "from passlib.context import CryptContext; print(CryptContext(schemes=['bcrypt']).hash('novasenha'))"` e atualize `ADMIN_PASSWORD_HASH` nas variáveis do Railway.

**Como adicionar mais slots de horário?**
Edite `TIME_SLOTS` em `frontend/src/components/sections/StudentArea.jsx`.

**Como adicionar feriados?**
No momento os feriados são validados pelo backend. Uma versão futura pode incluir uma tabela `holidays` no banco.

**Aiven precisa de SSL?**
Sim. Sempre use `?ssl=require` ou `?sslmode=require` na connection string.
