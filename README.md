# Driversnote Assessment API

A secure, fully-featured REST API service built with Fastify, TypeScript, and MongoDB for the Driversnote assessment project.

## 🚀 Features

- **Secure Authentication** - API key authentication required for all endpoints
- **User Management** - Complete CRUD operations for user data with extended profile information
- **Receipt Management** - Track and manage user receipts
- **Security-First** - Multiple layers of protection including rate limiting, request validation, and security headers
- **TypeScript** - Full type safety and excellent developer experience
- **Swagger Documentation** - Interactive API documentation at `/docs`
- **Comprehensive Testing** - Full test suite with 100% endpoint coverage

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Environment Configuration](#environment-configuration)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 22.0.0
- npm ≥ 10.0.0
- MongoDB Atlas account or local MongoDB instance

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jhjdev/driversnote-assessment-api.git
cd driversnote-assessment-api
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```bash
# Server Configuration
NODE_ENV=development
PORT=4000
HOST=0.0.0.0
API_KEY=your-secure-api-key-here

# MongoDB Configuration
MONGODB_URI=your-mongodb-connection-string
MONGODB_DB_NAME=driversnote

# Security Configuration
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
```

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:4000` with Swagger documentation at `http://localhost:4000/docs`.

## 📚 API Documentation

### Base URL
```
http://localhost:4000/api
```

### Authentication
All endpoints (except `/api/health`) require an API key in the header:
```http
X-API-Key: your-api-key-here
```

### Endpoints

#### Health Check
```http
GET /api/health
```
**Public endpoint** - No authentication required.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected",
  "version": "1.0.0"
}
```

#### Users

##### Get All Users
```http
GET /api/users
```
**Headers:** `X-API-Key: your-api-key`

**Response:**
```json
[
  {
    "id": 1,
    "full_name": "John Doe",
    "tag": "developer",
    "address1": "123 Main St",
    "address2": "Apt 4B",
    "postal_code": "12345",
    "city": "New York",
    "country_name": "United States",
    "country_id": "US",
    "organisation_id": 1
  }
]
```

##### Get User by ID
```http
GET /api/users/{id}
```
**Headers:** `X-API-Key: your-api-key`

**Response:**
```json
{
  "id": 1,
  "full_name": "John Doe",
  "tag": "developer",
  "address1": "123 Main St",
  "address2": "Apt 4B",
  "postal_code": "12345",
  "city": "New York",
  "country_name": "United States",
  "country_id": "US",
  "organisation_id": 1
}
```

##### Create User
```http
POST /api/users
```
**Headers:** `X-API-Key: your-api-key`

**Request Body:**
```json
{
  "full_name": "Jane Smith",
  "tag": "designer",
  "address1": "456 Oak Ave",
  "address2": null,
  "postal_code": 67890,
  "city": "Los Angeles",
  "country_name": "United States",
  "country_id": "US",
  "organisation_id": 2
}
```

**Response:** `201 Created`
```json
{
  "id": 2,
  "full_name": "Jane Smith",
  "tag": "designer",
  "address1": "456 Oak Ave",
  "address2": null,
  "postal_code": 67890,
  "city": "Los Angeles",
  "country_name": "United States",
  "country_id": "US",
  "organisation_id": 2
}
```

##### Update User
```http
PUT /api/users/{id}
```
**Headers:** `X-API-Key: your-api-key`

**Request Body:** (all fields optional)
```json
{
  "full_name": "Jane Johnson",
  "city": "San Francisco"
}
```

##### Delete User
```http
DELETE /api/users/{id}
```
**Headers:** `X-API-Key: your-api-key`

**Response:**
```json
{
  "success": true
}
```

##### Initialize Users Collection
```http
POST /api/users/initialize
```
**Headers:** `X-API-Key: your-api-key`

**Request Body:**
```json
{
  "users": [
    {
      "id": 1,
      "full_name": "John Doe",
      "tag": "developer"
    }
  ]
}
```

#### Receipts

##### Get All Receipts
```http
GET /api/receipts
```
**Headers:** `X-API-Key: your-api-key`

##### Get Receipt by ID
```http
GET /api/receipts/{id}
```
**Headers:** `X-API-Key: your-api-key`

##### Create Receipt
```http
POST /api/receipts
```
**Headers:** `X-API-Key: your-api-key`

**Request Body:**
```json
{
  "userId": 1,
  "userName": "John Doe",
  "beaconQuantity": 5,
  "discount": 10.50,
  "deliveryAddress": "123 Main St, New York, NY",
  "totalPrice": 89.50
}
```

### Error Responses

All endpoints may return these error responses:

#### 401 Unauthorized
```json
{
  "error": "API key is required",
  "message": "Please provide a valid API key in the X-API-Key header"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "User not found"
}
```

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid user ID"
}
```

#### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "message": "Too Many Requests"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to fetch users"
}
```

## 🔒 Security

This API implements enterprise-grade security features to protect against unauthorized access and reduce operational costs.

### Authentication
- **API Key Required**: All endpoints except `/api/health` require authentication
- **Secure Headers**: Set strong `X-API-Key` environment variable
- **No Public Access**: Zero endpoints accessible without proper credentials

### IP Whitelisting (Recommended for Production)

Restrict access to specific IP addresses:

```bash
# Enable IP whitelisting
ENABLE_IP_WHITELIST=true

# Specify allowed IPs (comma-separated)
ALLOWED_IPS=192.168.1.100,203.0.113.0/24,198.51.100.42
```

### Rate Limiting

Automatic request limiting to prevent abuse:
- **Development**: 100 requests per 15 minutes
- **Production**: 50 requests per 15 minutes (recommended)
- **Automatic Banning**: After 10 violations in production

```bash
# Production rate limiting
RATE_LIMIT_MAX=50
RATE_LIMIT_WINDOW=900000  # 15 minutes
```

### Security Headers

Automatically applied security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` 
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Bot Protection

Automatically blocks requests with suspicious user agents:
- Bots, crawlers, spiders
- Automated tools (curl, wget)
- Exception: Health check endpoint remains accessible

### Request Validation

- **Maximum request size**: 1MB
- **Suspicious URL pattern detection**
- **Path traversal protection**
- **Script injection detection**

### Cost Protection Features

1. **Rate Limiting**: Prevents API abuse
2. **IP Whitelisting**: Restricts access to known IPs
3. **Bot Blocking**: Reduces automated traffic
4. **Request Size Limits**: Prevents large payload attacks
5. **Authentication**: Ensures only authorized users

## ⚙️ Environment Configuration

### Required Environment Variables

```bash
# Server Configuration
NODE_ENV=development|production
PORT=4000
HOST=0.0.0.0
API_KEY=your-secure-api-key-here

# MongoDB Configuration
MONGODB_URI=your-mongodb-connection-string
MONGODB_DB_NAME=driversnote

# Security Configuration
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# Optional: IP Whitelisting
ENABLE_IP_WHITELIST=false
ALLOWED_IPS=127.0.0.1,::1
```

### Production Configuration Example

```bash
NODE_ENV=production
PORT=4000
HOST=0.0.0.0
API_KEY=super-secure-production-key-with-32-chars

MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=driversnote_prod

CORS_ORIGIN=https://your-frontend-domain.com
RATE_LIMIT_MAX=50
RATE_LIMIT_WINDOW=900000

ENABLE_IP_WHITELIST=true
ALLOWED_IPS=203.0.113.10,198.51.100.0/24
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run watch        # Watch TypeScript compilation

# Building
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm test             # Run test suite
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run validate     # Run linting and tests

# Security
npm run security:audit # Run npm security audit
npm run security:fix   # Fix security vulnerabilities
```

### Project Structure

```
src/
├── index.ts           # Application entry point
├── plugins/
│   └── auth.ts        # Authentication plugin
├── routes/
│   ├── users.ts       # User CRUD operations
│   └── receipts.ts    # Receipt operations
├── types/
│   ├── index.ts       # TypeScript interfaces and schemas
│   └── swagger.ts     # Swagger configuration types
└── utils/
    └── mongodb.ts     # MongoDB connection utilities

tests/
├── helpers/
│   ├── testApp.ts     # Test application factory
│   └── mockDatabase.ts # Database mocking utilities
├── setup.ts           # Test environment setup
└── unit/
    ├── auth.test.ts   # Authentication tests
    └── users.test.ts  # User route tests
```

### Adding New Endpoints

1. Create the route handler in `src/routes/`
2. Define TypeScript interfaces in `src/types/index.ts`
3. Add Swagger schema definitions
4. Register the route in your plugin
5. Write tests in `tests/unit/`

Example route structure:
```typescript
fastify.get('/endpoint', {
  schema: {
    tags: ['Category'],
    description: 'Endpoint description',
    security: [{ apiKey: [] }],
    response: {
      200: responseSchema
    }
  }
}, async (request: FastifyRequest, reply: FastifyReply) => {
  // Check authentication
  const isAuthenticated = await authenticateRequest(request, reply);
  if (!isAuthenticated) return;

  // Your logic here
});
```

## 🧪 Testing

The project includes comprehensive test coverage for all endpoints and security features.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Test individual route handlers and business logic
- **Integration Tests**: Test full request/response cycles
- **Security Tests**: Verify authentication and authorization
- **Mock Database**: Tests run against mocked MongoDB for speed and isolation

### Test Coverage

Current test coverage includes:
- ✅ Authentication middleware
- ✅ All user CRUD operations
- ✅ Error handling
- ✅ Input validation
- ✅ Security features

## 🚀 Deployment

### Production Deployment Checklist

#### Security Setup
- [ ] Set strong `API_KEY` (32+ characters)
- [ ] Enable `ENABLE_IP_WHITELIST=true`
- [ ] Configure `ALLOWED_IPS` with your IP addresses
- [ ] Set `RATE_LIMIT_MAX=50` or lower
- [ ] Set `NODE_ENV=production`

#### Infrastructure
- [ ] Configure MongoDB Atlas with proper networking
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx/CloudFlare)
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies

#### Monitoring
- [ ] Set up health check monitoring
- [ ] Configure error alerting
- [ ] Monitor API usage and rate limits
- [ ] Track security events

### Environment-Specific Considerations

#### Development
- Use local MongoDB or MongoDB Atlas free tier
- Enable debug logging
- Use relaxed rate limits

#### Staging
- Mirror production security settings
- Use separate MongoDB database
- Test with production-like data

#### Production
- Strict security settings enabled
- Comprehensive monitoring
- Regular security audits
- Backup and disaster recovery

### Emergency Response

If you detect unauthorized access:

1. **Immediate Actions**:
   - Rotate the `API_KEY` immediately
   - Review and update `ALLOWED_IPS`
   - Temporarily reduce `RATE_LIMIT_MAX`

2. **Investigation**:
   - Check application logs for suspicious activity
   - Review MongoDB access logs
   - Analyze traffic patterns

3. **Recovery**:
   - Update security configurations
   - Consider temporarily disabling the service if needed
   - Implement additional monitoring

## 📝 API Response Schemas

### User Schema
```typescript
interface User {
  id: number;
  full_name: string;
  tag?: string;
  address1?: string | null;
  address2?: string | null;
  postal_code?: number | string | null;
  city?: string | null;
  country_name?: string;
  country_id?: string;
  organisation_id?: number | null;
}
```

### Receipt Schema
```typescript
interface Receipt {
  id: string;
  userId: number;
  userName: string;
  beaconQuantity: number;
  discount: number;
  deliveryAddress: string;
  totalPrice: number;
  timestamp: string;
}
```

### API Response Schema
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

## 📞 Support

- **Documentation**: Visit `/docs` endpoint for interactive API documentation
- **Health Check**: Monitor `/api/health` for service status
- **Issues**: Report issues via GitHub Issues
- **Security**: For security-related issues, please follow responsible disclosure

## 📄 License

ISC License - see LICENSE file for details.

---

Built with ❤️ using [Fastify](https://fastify.io/), [TypeScript](https://www.typescriptlang.org/), and [MongoDB](https://www.mongodb.com/)
