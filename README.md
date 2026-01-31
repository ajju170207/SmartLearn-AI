# SmartLearn AI Platform

An AI-powered learning and developer productivity platform that combines personalized learning assistance with intelligent coding support.

## 🚀 Features

- **Learning Assistance**: Explain complex concepts in simple language with step-by-step breakdowns
- **Developer Productivity**: Code explanation, debugging assistance, and workflow optimization
- **Personalization**: Adaptive explanations based on user skill level and learning context
- **Knowledge Retrieval**: RAG-powered semantic search for accurate, contextual responses
- **Analytics**: Track learning progress and provide personalized insights

## 🏗️ Architecture

SmartLearn AI follows a microservices architecture with the following components:

- **Frontend**: React/Next.js web application
- **API Gateway**: Nginx load balancer and request routing
- **Core Services**:
  - Authentication Service (Node.js/Express)
  - Learning Assistant Service (Python/FastAPI)
  - Code Assistant Service (Python/FastAPI)
  - Personalization Engine (Python/FastAPI)
  - Analytics Service (Node.js/Express)
- **Data Layer**:
  - PostgreSQL (Primary database)
  - Redis (Caching and sessions)
  - ChromaDB/Pinecone (Vector database for RAG)

## 🛠️ Tech Stack

### Frontend
- React.js / Next.js
- TypeScript
- Tailwind CSS
- Chart.js / D3.js

### Backend
- **Node.js Services**: Express.js, TypeScript
- **Python Services**: FastAPI, Pydantic
- **Databases**: PostgreSQL, Redis, ChromaDB
- **AI/ML**: OpenAI API, Sentence Transformers, scikit-learn

### Infrastructure
- Docker & Docker Compose
- Nginx (API Gateway)
- GitHub Actions (CI/CD)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ajju170207/SmartLearn-AI.git
   cd SmartLearn-AI
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

5. **Or start services individually**
   ```bash
   # Start databases
   docker-compose up -d postgres redis chromadb
   
   # Start all services in development mode
   npm run dev
   ```

### Development Setup

1. **Install Python dependencies**
   ```bash
   cd services
   pip install -r requirements.txt
   ```

2. **Set up database**
   ```bash
   # Run database migrations
   npm run db:migrate
   
   # Seed initial data
   npm run db:seed
   ```

3. **Start individual services**
   ```bash
   # Authentication service
   npm run dev:auth
   
   # Learning assistant service
   npm run dev:learning
   
   # Code assistant service
   npm run dev:code
   
   # Personalization service
   npm run dev:personalization
   
   # Analytics service
   npm run dev:analytics
   
   # Frontend
   npm run dev:frontend
   ```

## 📚 API Documentation

Once the services are running, you can access the API documentation:

- **Authentication Service**: http://localhost:3001/docs
- **Learning Assistant**: http://localhost:8001/docs
- **Code Assistant**: http://localhost:8002/docs
- **Personalization Engine**: http://localhost:8003/docs
- **Analytics Service**: http://localhost:3002/docs

## 🧪 Testing

### Run all tests
```bash
npm test
```

### Run specific test suites
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Property-based tests
npm run test:property

# Frontend tests
npm run test:frontend
```

### Test Coverage
```bash
npm run test:coverage
```

## 🔧 Configuration

### Environment Variables

Key environment variables to configure:

- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `OPENAI_API_KEY`: OpenAI API key for LLM integration
- `CHROMA_URL`: ChromaDB connection URL
- `JWT_SECRET`: Secret key for JWT token signing

### Service Configuration

Each service can be configured through environment variables or configuration files in their respective directories.

## 📊 Monitoring

### Health Checks
- **Overall Health**: http://localhost/health
- **Service Health**: http://localhost/{service}/health

### Metrics
- **Prometheus Metrics**: http://localhost/metrics
- **Service Metrics**: http://localhost/{service}/metrics

## 🚀 Deployment

### Docker Deployment
```bash
# Build all services
docker-compose build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment
```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write comprehensive tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the LLM API
- The open-source community for the amazing tools and libraries
- Contributors and maintainers of this project

## 📞 Support

For support, email support@smartlearn-ai.com or join our [Discord community](https://discord.gg/smartlearn-ai).

## 🗺️ Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Integration with popular IDEs
- [ ] Collaborative learning features
- [ ] Advanced ML models for personalization

---

**SmartLearn AI** - Empowering developers and learners with AI-driven education and productivity tools.