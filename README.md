# NOMA English School — Plataforma

Sistema completo da NOMA English School: landing page, área do aluno com agendamento de aulas e painel administrativo.

---

## Estrutura do projeto

```
learning-with-noma/
├── frontend/          # React + Vite + Tailwind CSS
└── backend/           # FastAPI + SQLAlchemy + PostgreSQL (Aiven)
```

---

## Pré-requisitos

- **Node.js** 18+ e npm
- **Python** 3.11+
- Acesso ao banco **Aiven PostgreSQL** (credenciais no `backend/.env`)

---

## 1. Configurar o backend

### 1.1 Criar o ambiente virtual e instalar dependências

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 1.2 Variáveis de ambiente

Copie o arquivo de exemplo e preencha os valores:

```bash
cp .env.example .env
```

Edite o `.env`:

```env
# Banco de dados (Aiven)
DATABASE_URL=postgres://avnadmin:SENHA@host:28669/defaultdb?sslmode=require

# JWT
SECRET_KEY=sua-chave-secreta-aqui-minimo-32-caracteres
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=30

# E-mail (Gmail com App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seuemail@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx   # App Password do Gmail
FRONTEND_URL=http://localhost:5173
```

> **App Password Gmail:** acesse [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) (requer 2FA ativado), gere uma senha para o app "NOMA" e cole aqui.

### 1.3 Aplicar migrações do banco

```bash
cd backend
python -m alembic upgrade head
```

### 1.4 Popular o banco com dados iniciais (Seed)

Execute ao configurar o banco pela primeira vez para criar os planos padrão, o admin e o aluno de teste:

```bash
cd backend
python seed.py
```

Isso popula o banco com:
- **Planos padrão** (Light Beige, Light Orange, Light Green, Light Gold, Full Beige, etc.)
- **Admin padrão**: usuário `Atum_admin`, senha `Atum2026#`
- **Aluno padrão**: usuário `Atum_aluno`, senha `Atum2026#`

### 1.5 Iniciar o servidor

```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

O backend estará disponível em `http://localhost:8000`.  
Documentação interativa: `http://localhost:8000/docs`

---

## 2. Configurar o frontend

### 2.1 Instalar dependências

```bash
cd frontend
npm install
```

### 2.2 Iniciar o servidor de desenvolvimento

```bash
cd frontend
npm run dev
```

O frontend estará em `http://localhost:5173`.

> O Vite já possui proxy configurado: chamadas para `/api/*` são redirecionadas automaticamente para `http://localhost:8000`.

---

## 3. Iniciar o projeto completo

Abra **dois terminais**:

**Terminal 1 — Backend:**
```bash
cd backend
venv\Scripts\activate        # Windows
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Acesse `http://localhost:5173`.

---

## 4. Rotas da aplicação

| Rota | Descrição |
|------|-----------|
| `/` | Landing page pública |
| `/aluno/login` | Login do aluno |
| `/aluno/dashboard` | Área do aluno (autenticado) |
| `/admin` | Login do administrador |
| `/admin/dashboard` | Painel administrativo (admin) |

---

## 5. Área do Aluno

O aluno acessa com **usuário ou e-mail** + senha.

**Abas disponíveis:**

- **Agendar aula** — grade semanal com horários disponíveis/bloqueados. Navegação por semanas. Confirmação antes de agendar.
- **Minhas aulas** — lista de aulas confirmadas, realizadas e canceladas. Permite cancelar aulas futuras.
- **Meu perfil** — dados do plano, turma, método e vigência do contrato.

**Primeiro acesso:** alunos convidados pelo admin devem criar uma senha pessoal antes de entrar no dashboard.

---

## 6. Painel Administrativo

Login em `/admin` com as credenciais de admin.

**Abas disponíveis:**

| Aba | Funcionalidades |
|-----|----------------|
| **Alunos** | Convidar aluno por e-mail · Cadastro manual · Editar dados · Excluir |
| **Agendamentos** | Ver todos os agendamentos confirmados · Cancelar · Exportar CSV |
| **Horários** | Bloquear/desbloquear slots manualmente |
| **Quiz** | Ver respostas do quiz da landing page |

### Convidar aluno

O admin informa **nome** e **e-mail**. O sistema:
1. Gera um username automático (ex: `maria_silva`)
2. Gera uma senha temporária segura
3. Cria o aluno no banco
4. Envia e-mail com as credenciais e link de acesso

---

## 7. Regras de negócio do agendamento

- Todos os horários **antes de 01/07/2026** aparecem bloqueados (bloqueio sistêmico de lançamento)
- Horários **antes das 19h** ficam bloqueados por padrão (admin pode desbloquear)
- Aluno só pode agendar **dentro do período do contrato**
- Limite de aulas por semana e por dia conforme o plano
- Cancelamento só é permitido para **aulas futuras**
- O admin pode cancelar qualquer agendamento sem restrição

---

## 8. Build de produção

```bash
# Frontend
cd frontend
npm run build
# Gera dist/ para hospedar no Vercel

# Backend
# Hospedar no Railway — configurar variáveis de ambiente no painel
```

---

## 9. Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 · Vite 8 · Tailwind CSS v4 · React Router v7 · Axios |
| Backend | FastAPI · Uvicorn · SQLAlchemy 2 · Alembic · python-jose · bcrypt |
| Banco de dados | PostgreSQL 17 (Aiven Cloud) |
| E-mail | Gmail SMTP (App Password) |
| Deploy | Vercel (frontend) · Railway (backend) |
