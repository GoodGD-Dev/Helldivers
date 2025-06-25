# 🎮 Helldivers 2 API

Uma API REST completa para gerenciar equipamentos e dados do jogo Helldivers 2, desenvolvida com Node.js, Express e MongoDB.

## 🚀 Características

- ✅ API REST completa com CRUD para todos os equipamentos
- 🛡️ Validação robusta de dados com Joi
- 📊 Paginação e filtros avançados
- 🔒 Rate limiting e middlewares de segurança
- 📝 Tratamento de erros centralizado
- 🌱 Script de seed para popular o banco
- 📚 Documentação automática
- 🔍 Busca e filtros por tipo/nome
- 📈 Endpoints de estatísticas

## 🎯 Modelos Implementados

### 🔫 Armas

- **Armas Primárias**: Assault Rifles, Shotguns, Snipers, SMGs, LMGs, DMRs
- **Armas Secundárias**: Pistols, Revolvers, Auto Pistols

### 💣 Equipamentos

- **Throwables**: Granadas, Incendiários, Anti-Tank, Minas
- **Stratagemas**: Defensivos, Ofensivos, Suprimentos

### 🛡️ Armaduras & Perks

- **Armaduras**: Light, Medium, Heavy (com stats de proteção e mobilidade)
- **Passivas de Armadura**: Efeitos especiais para armaduras
- **Perks**: Habilidades passivas do jogador

## 🛠️ Instalação

### Pré-requisitos

- Node.js 18+
- Conta no MongoDB Atlas
- Git

### Passo a passo

1. **Clone o repositório:**

```bash
git clone <url-do-repositorio>
cd helldivers2-api
```

2. **Instale as dependências:**

```bash
npm install
```

3. **Configure as variáveis de ambiente:**

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/helldivers2?retryWrites=true&w=majority
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. **Inicie o servidor:**

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

5. **Popular o banco de dados (opcional):**

```bash
npm run seed
```

## 📡 Endpoints da API

### 🏠 Principais

- `GET /` - Informações da API
- `GET /health` - Health check
- `GET /api/docs` - Documentação completa

### 🔫 Armas Primárias

- `GET /api/primary-weapons` - Listar todas
- `GET /api/primary-weapons/stats` - Estatísticas
- `GET /api/primary-weapons/:id` - Buscar por ID
- `POST /api/primary-weapons` - Criar nova
- `PUT /api/primary-weapons/:id` - Atualizar
- `DELETE /api/primary-weapons/:id` - Deletar

### 🔫 Armas Secundárias

- `GET /api/secondary-weapons` - Listar todas
- `POST /api/secondary-weapons` - Criar nova
- `PUT /api/secondary-weapons/:id` - Atualizar
- `DELETE /api/secondary-weapons/:id` - Deletar

### 💣 Throwables

- `GET /api/throwables` - Listar todos
- `POST /api/throwables` - Criar novo
- `PUT /api/throwables/:id` - Atualizar
- `DELETE /api/throwables/:id` - Deletar

### 📡 Stratagemas

- `GET /api/stratagems` - Listar todos
- `POST /api/stratagems` - Criar novo
- `PUT /api/stratagems/:id` - Atualizar
- `DELETE /api/stratagems/:id` - Deletar

### 🛡️ Armaduras

- `GET /api/armors` - Listar todas
- `POST /api/armors` - Criar nova
- `PUT /api/armors/:id` - Atualizar
- `DELETE /api/armors/:id` - Deletar

### 🛡️ Passivas de Armadura

- `GET /api/passive-armors` - Listar todas
- `POST /api/passive-armors` - Criar nova
- `PUT /api/passive-armors/:id` - Atualizar
- `DELETE /api/passive-armors/:id` - Deletar

### 🎯 Perks

- `GET /api/perks` - Listar todos
- `POST /api/perks` - Criar novo
- `PUT /api/perks/:id` - Atualizar
- `DELETE /api/perks/:id` - Deletar

## 📊 Parâmetros de Query

### Paginação

- `page`: Número da página (padrão: 1)
- `limit`: Items por página (padrão: 10, máx: 100)

### Filtros

- `name`: Busca parcial por nome
- `type`: Filtro por tipo específico

**Exemplo:**

```
GET /api/primary-weapons?page=1&limit=5&type=Assault Rifle&name=liberator
```

## 📝 Exemplos de Uso

### Criar uma Arma Primária

```javascript
POST /api/primary-weapons
Content-Type: application/json

{
  "name": "Liberator Carbine",
  "type": "Assault Rifle",
  "damage": 55,
  "fireRate": 700,
  "magazineSize": 30,
  "reloadTime": 2.5,
  "description": "Versão carbine do rifle Liberator, mais compacta"
}
```

### Criar uma Armadura

```javascript
POST /api/armors
Content-Type: application/json

{
  "name": "SC-34 Infiltrator",
  "type": "Light",
  "passive": "64f7b1234567890123456789",
  "armorRating": 120,
  "speed": 90,
  "staminaRegen": 85,
  "description": "Armadura stealth para missões de infiltração"
}
```

## 🔒 Segurança

- **Rate Limiting**: 100 requests por 15 minutos por IP
- **Helmet**: Headers de segurança
- **CORS**: Configurado para domínios específicos
- **Validação**: Joi para validação robusta de dados
- **Sanitização**: Prevenção contra NoSQL injection

## 🧪 Testando a API

### Com curl

```bash
# Listar armas primárias
curl http://localhost:3000/api/primary-weapons

# Buscar por ID
curl http://localhost:3000/api/primary-weapons/64f7b1234567890123456789

# Health check
curl http://localhost:3000/health
```

### Com Postman/Insomnia

Importe a collection usando a URL base: `http://localhost:3000/api`

## 📁 Estrutura do Projeto

```
src/
├── config/          # Configurações (database)
├── controllers/     # Lógica de negócio
├── middleware/      # Middlewares customizados
├── models/          # Schemas do MongoDB
├── routes/          # Definição de rotas
├── utils/           # Utilitários e constantes
├── validators/      # Schemas de validação Joi
└── server.js        # Entrada da aplicação
```

## 🚀 Deploy

### MongoDB Atlas

1. Crie um cluster no [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Configure usuário e senha
3. Adicione seu IP à whitelist
4. Copie a connection string para o `.env`

### Vercel/Railway/Render

```bash
# Build da aplicação
npm start

# Variáveis de ambiente necessárias:
# MONGODB_URI
# NODE_ENV=production
```

## 🧩 Extensões Futuras

- [ ] Autenticação JWT
- [ ] Upload de imagens para equipamentos
- [ ] Sistema de favoritos
- [ ] Comparação entre equipamentos
- [ ] Builds/loadouts de jogadores
- [ ] Cache com Redis
- [ ] Websockets para updates em tempo real
- [ ] Métricas e analytics

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

## 📋 Scripts Disponíveis

- `npm start` - Inicia servidor em produção
- `npm run dev` - Inicia servidor em desenvolvimento com nodemon
- `npm run seed` - Popula banco com dados de exemplo
- `npm test` - Executa testes (Jest)

## 🐛 Troubleshooting

### Erro de Conexão MongoDB

```
❌ Erro ao conectar com MongoDB
```

- Verifique se `MONGODB_URI` está correto no `.env`
- Confirme se seu IP está na whitelist do Atlas
- Teste a conexão string diretamente

### Erro de Validação

```json
{
  "success": false,
  "error": {
    "message": "Dados de validação inválidos",
    "details": ["Nome é obrigatório"]
  }
}
```

- Verifique se todos os campos obrigatórios estão presentes
- Confirme se os tipos de dados estão corretos

## 📞 Suporte

- 📧 Email: seu-email@example.com
- 💬 Issues: Use o sistema de issues do GitHub
- 📚 Docs: Acesse `/api/docs` quando o servidor estiver rodando

---

Feito com ❤️ para a comunidade Helldivers 2! 🎮🚀
