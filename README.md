# 🏢 HSDJ Holdings - Real Estate Investment Platform

> **A modern, enterprise-grade platform for managing real estate investments with advanced analytics, secure portfolio management, and seamless investor experience.**

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![React](https://img.shields.io/badge/react-19.0-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📋 Table of Contents

- [🎯 Project Overview](#-project-overview)
- [🏗️ Architecture](#️-architecture)
- [✨ Key Features](#-key-features)
- [🚀 Quick Start](#-quick-start)
- [📦 Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🔒 Security](#-security)
- [💡 Complex Concepts Explained](#-complex-concepts-explained)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🎯 Project Overview

**HSDJ Holdings** is a comprehensive real estate investment management platform designed for modern investors seeking to build diversified property portfolios with institutional-grade tools. The platform serves as a bridge between property developers and investors, offering transparency, analytics, and secure transaction management.

### The Vision

To become the most trusted real estate investment partner in Karnataka, creating sustainable wealth for investors while contributing to thriving, sustainable communities.

### Core Principles

- **Customer-Centric Approach**: Every decision prioritizes investor success and financial growth
- **Quality Development**: Maintaining highest standards in construction, design, and project management
- **Sustainable Growth**: Focusing on consistent, sustainable returns for stakeholders
- **Innovation & Technology**: Leveraging cutting-edge tech for seamless investment management

---

## 🏗️ Architecture

### System Design Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │  Properties  │  │  Analytics   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                             ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Express.js)                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Authentication │ Properties │ Portfolio │ Analytics  │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                  Data Layer (MongoDB)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │Properties│  │Portfolios│  │ AuditLog │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Three-Tier Architecture

#### **Tier 1: Presentation Layer (Frontend)**
- **Technology**: React 19, Vite, Tailwind CSS
- **Key Responsibilities**:
  - Rendering user interfaces with Lucide React icons
  - Real-time data visualization using Recharts
  - State management with Redux Toolkit
  - Responsive design for desktop and mobile
- **Components**:
  - Dashboard: Overview of portfolio, investments, and key metrics
  - Property Marketplace: Browse, filter, and invest in properties
  - Portfolio Manager: Track investments and returns
  - Analytics Engine: Visualize market trends and performance

#### **Tier 2: Business Logic Layer (Backend)**
- **Technology**: Node.js, Express.js
- **Key Responsibilities**:
  - Request validation and processing
  - Authentication & authorization
  - Business logic implementation
  - Audit logging and security monitoring
  - Rate limiting and DDoS protection
- **Critical Routes**:
  - `/api/auth`: User authentication and 2FA management
  - `/api/properties`: Property listing and details
  - `/api/portfolio`: Investment management
  - `/api/analytics`: Market data and insights
  - `/api/admin`: Director dashboard operations

#### **Tier 3: Data Layer (Database)**
- **Technology**: MongoDB with Mongoose
- **Collections**:
  - **Users**: Investor profiles, security settings, credentials
  - **Properties**: Property details, amenities, pricing, status
  - **Portfolios**: Investment records, ownership stakes, returns
  - **AuditLog**: Security events, user actions, system alerts
  - **Certificates**: Share certificates and ownership documentation

---

## ✨ Key Features

### 🏠 Property Management
- **6+ Property Types**: Residential, Commercial, Villas, IT Parks, etc.
- **Comprehensive Details**: Location, pricing, amenities, ROI projections
- **Status Tracking**: Pre-Launch, Under Construction, Ready to Move, Selling Fast
- **Visual Showcase**: Property images, 360° tours, video demonstrations
- **Dynamic Pricing**: Original and discounted prices with price-per-sqft metrics

### 📊 Portfolio Analytics
- **Real-time Dashboard**: Portfolio value, investment count, performance metrics
- **ROI Tracking**: Individual property returns and aggregate performance
- **Market Insights**: Predictive analytics and market trend analysis
- **Performance Reports**: Customizable reports with data export capabilities
- **Goal Alignment**: AI-powered property matching based on investment goals

### 🔐 Enterprise Security
- **Multi-Factor Authentication (2FA)**: Google Authenticator integration
- **End-to-End Encryption**: 256-bit AES encryption for sensitive data
- **Audit Trail**: Comprehensive logging of all user actions
- **IP Whitelisting**: Restrict access from known locations
- **Anomaly Detection**: ML-based suspicious activity detection
- **Role-Based Access Control (RBAC)**: Granular permission management

### 💼 Director Dashboard
- **Shareholder Management**: Add, edit, monitor investor profiles
- **Share Distribution**: Allocate and track share certificates
- **Pending Certificates**: Queue management with approval workflows
- **System Statistics**: Real-time metrics on properties, shareholders, portfolio value
- **Bulk Operations**: Efficient management of large-scale data

### 📱 User Experience
- **Responsive Design**: Seamless experience across all devices
- **Dark/Light Modes**: User preference based themes
- **Offline Access**: Critical data available without internet
- **Push Notifications**: Real-time alerts on property updates and market changes
- **Accessibility**: WCAG 2.1 AA compliance for inclusive design

---

## 🚀 Quick Start

### Prerequisites

```bash
# System Requirements
- Node.js >= 16.0.0
- npm >= 8.0.0 or yarn >= 1.22.0
- MongoDB >= 5.0 (local or Atlas)
- Git >= 2.0
```

### Installation Steps

#### 1. Clone the Repository
```bash
git clone https://github.com/hsdj-holdings/real-estate-platform.git
cd real-estate-platform
```

#### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file with required variables
cat > .env << EOF
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/hsdj-holdings
MONGODB_TEST_URI=mongodb://localhost:27017/hsdj-holdings-test

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRE=30d

# 2FA Configuration
ENABLE_2FA=true
2FA_ISSUER=HSDJ Holdings

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SENDER_EMAIL=noreply@hsdj-holdings.com

# File Upload
MAX_FILE_SIZE=10485760 # 10MB
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW=15 # minutes
RATE_LIMIT_MAX_REQUESTS=100 # per window

# Security
CORS_ORIGIN=http://localhost:3000
SESSION_SECRET=your_session_secret
EOF

# Run migrations (if applicable)
npm run migrate

# Start the backend server
npm run dev
# Server runs on http://localhost:5000
```

#### 3. Frontend Setup
```bash
cd ../client

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=HSDJ Holdings
VITE_ENV=development
VITE_ENABLE_ANALYTICS=false
EOF

# Start the development server
npm run dev
# Application runs on http://localhost:5173
```

### Verification

```bash
# Check backend health
curl http://localhost:5000/api/health

# Frontend loads at
http://localhost:5173

# Test login with demo credentials
Email: investor@demo.com
Password: Demo@123456
```

---

## 📦 Tech Stack

### Frontend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **React** | UI Framework | 19.0 |
| **Vite** | Build Tool | 6.0+ |
| **Tailwind CSS** | Styling | 4.0+ |
| **Lucide React** | Icons | 0.263+ |
| **Recharts** | Charts & Graphs | 3.1+ |
| **Redux Toolkit** | State Management | 2.8+ |
| **React Router** | Navigation | 7.8+ |
| **Axios** | HTTP Client | Latest |
| **React Toastify** | Notifications | 11.0+ |

### Backend
| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | Runtime | 16+ |
| **Express.js** | Web Framework | 5.0+ |
| **MongoDB** | Database | 5.0+ |
| **Mongoose** | ODM | Latest |
| **JWT** | Authentication | jsonwebtoken |
| **Speakeasy** | 2FA/TOTP | Latest |
| **Bcrypt** | Password Hashing | 5.1+ |
| **Morgan** | Logging | 1.10+ |
| **Helmet** | Security Headers | 7.0+ |
| **CORS** | Cross-Origin Support | 2.8+ |
| **Dotenv** | Environment Variables | 16.0+ |

### DevOps & Tools
- **Docker**: Containerization
- **GitHub Actions**: CI/CD
- **ESLint**: Code Linting
- **Prettier**: Code Formatting
- **Postman**: API Testing

---

## 📁 Project Structure

```
real-estate-platform/
│
├── 📂 frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── homepage/
│   │   │   │   ├── DirectorMessage.jsx    # Founder's message & vision
│   │   │   │   ├── AboutSection.jsx       # Property showcase & details
│   │   │   │   ├── FeaturesSection.jsx    # Platform capabilities
│   │   │   │   └── ContactSection.jsx     # Investor contact form
│   │   │   ├── dashboard/
│   │   │   │   ├── DirectorDashboard.jsx  # Admin control center
│   │   │   │   ├── InvestorDashboard.jsx  # Portfolio overview
│   │   │   │   └── AnalyticsDashboard.jsx # Performance metrics
│   │   │   ├── common/
│   │   │   │   ├── Header.jsx             # Navigation
│   │   │   │   ├── Footer.jsx             # Footer section
│   │   │   │   └── Layout.jsx             # Page layout wrapper
│   │   │   └── auth/
│   │   │       ├── Login.jsx              # User login
│   │   │       ├── Register.jsx           # User registration
│   │   │       └── TwoFactorAuth.jsx      # 2FA verification
│   │   ├── pages/
│   │   ├── hooks/
│   │   │   ├── useAuth.js                 # Authentication logic
│   │   │   ├── usePortfolio.js            # Portfolio management
│   │   │   └── useAnalytics.js            # Analytics data fetching
│   │   ├── store/                         # Redux store configuration
│   │   ├── services/                      # API services
│   │   ├── utils/                         # Utility functions
│   │   ├── styles/                        # Global styles
│   │   ├── App.jsx                        # Root component
│   │   └── main.jsx                       # Entry point
│   ├── public/                            # Static assets
│   ├── vite.config.js                     # Vite configuration
│   ├── tailwind.config.js                 # Tailwind configuration
│   └── package.json
│
├── 📂 backend/
│   ├── models/
│   │   ├── User.js                        # User schema & methods
│   │   ├── Property.js                    # Property listing model
│   │   ├── Portfolio.js                   # Investment portfolio model
│   │   ├── AuditLog.js                    # Security audit logs
│   │   └── Certificate.js                 # Share certificate model
│   ├── routes/
│   │   ├── auth.js                        # Authentication endpoints
│   │   ├── properties.js                  # Property management
│   │   ├── portfolio.js                   # Investment management
│   │   ├── analytics.js                   # Analytics data
│   │   ├── admin.js                       # Director operations
│   │   └── health.js                      # System health checks
│   ├── middleware/
│   │   ├── auth.js                        # JWT verification
│   │   ├── errorHandler.js                # Global error handling
│   │   ├── rateLimiter.js                 # Request rate limiting
│   │   ├── auditLogger.js                 # Action logging
│   │   ├── validator.js                   # Input validation
│   │   └── securityHeaders.js             # Security headers
│   ├── controllers/
│   │   ├── authController.js              # Auth business logic
│   │   ├── propertyController.js          # Property operations
│   │   ├── portfolioController.js         # Portfolio management
│   │   └── analyticsController.js         # Analytics computation
│   ├── utils/
│   │   ├── tokenManager.js                # JWT token handling
│   │   ├── emailService.js                # Email notifications
│   │   ├── encryption.js                  # Data encryption
│   │   ├── validators.js                  # Schema validators
│   │   └── logger.js                      # Application logging
│   ├── config/
│   │   ├── database.js                    # MongoDB connection
│   │   ├── aws.js                         # AWS S3 configuration
│   │   └── constants.js                   # App constants
│   ├── server.js                          # Server entry point
│   ├── .env.example                       # Environment template
│   └── package.json
│
├── 📂 docs/
│   ├── API.md                             # API documentation
│   ├── DATABASE_SCHEMA.md                 # Data model documentation
│   ├── DEPLOYMENT.md                      # Deployment guide
│   └── SECURITY.md                        # Security protocols
│
├── docker-compose.yml                     # Docker orchestration
├── .github/
│   └── workflows/                         # CI/CD pipelines
├── .gitignore
└── README.md
```

---

## 💡 Complex Concepts Explained

### 1. **Authentication & 2FA System**

#### How It Works:
```
User Login
    ↓
[Email + Password]
    ↓
Verify Credentials (bcrypt comparison)
    ↓
Generate JWT Tokens
├─ Access Token (15 min expiry)
└─ Refresh Token (30 day expiry)
    ↓
Check if 2FA Enabled
├─ YES: Generate TOTP Challenge
│   └─ User Scans QR Code → Authenticator App
│   └─ Enters 6-Digit Code
│   └─ Server Verifies Code
├─ NO: Direct Login Success
    ↓
Return to Dashboard with Auth Cookies
```

**Why It's Complex:**
- **TOTP (Time-based One-Time Password)**: Uses cryptographic algorithms to generate time-synchronized codes
- **Token Refresh**: Keeps access tokens short-lived for security while allowing long sessions with refresh tokens
- **Secure Cookies**: HttpOnly, Secure, SameSite flags prevent XSS/CSRF attacks

### 2. **Audit Logging & Security Monitoring**

#### Comprehensive Audit System:
```javascript
// Every Action Tracked
{
  userId: "user_id",
  action: "login|property_view|investment_made",
  success: true/false,
  ipAddress: "192.168.1.1",
  userAgent: "Mozilla/5.0...",
  timestamp: ISOString,
  details: {
    // Context-specific data
  },
  severity: "low|medium|high|critical"
}
```

#### Anomaly Detection:
- **Failed Login Attempts**: Alert after 5 failed attempts from same IP
- **Unusual Access Patterns**: Flag logins from 3+ different locations
- **Bulk Operations**: Monitor after-hours mass data operations
- **Geographic Anomalies**: Impossible travel detection (login from US then India in 5 minutes)

### 3. **Real Estate Investment Mathematics**

#### ROI Calculation:
```
Base Formula:
ROI = ((Current Value - Initial Investment) / Initial Investment) × 100

Example:
Initial Investment: ₹85,00,000
Current Value: ₹95,75,000
ROI = ((95,75,000 - 85,00,000) / 85,00,000) × 100 = 12.65%

Compound Returns (Annual):
Future Value = Present Value × (1 + Annual Rate) ^ Years

Property Value Projection:
Year 1: ₹85,00,000
Year 2: ₹85,00,000 × 1.125 = ₹95,62,500
Year 3: ₹95,62,500 × 1.125 = ₹1,07,578,125
```

#### Property Classification:
| Type | Use Case | Typical ROI |
|------|----------|-----------|
| **Residential** | Personal living + appreciation | 8-12% |
| **Commercial** | Rental income + capital growth | 12-15% |
| **Villas** | Luxury segment + prestige | 15-18% |
| **IT Parks** | Corporate tenants + premium location | 14-16% |

### 4. **Portfolio Diversification Algorithm**

#### AI-Powered Matching:
```
User Profile:
├─ Risk Tolerance (Low/Medium/High)
├─ Investment Amount (₹50L - ₹5Cr)
├─ Time Horizon (1-30 years)
├─ Preferred Location
└─ Expected Returns (8%-20%)

System Analysis:
├─ Calculates Property Risk Score
├─ Predicts Appreciation Rate
├─ Assesses Location Growth Potential
└─ Matches with User Preferences

Recommendation:
✓ Property 1: 60% allocation (Conservative)
✓ Property 2: 25% allocation (Growth)
✓ Property 3: 15% allocation (Speculative)
```

### 5. **Data Encryption Strategy**

#### Layers of Encryption:
```
1. Transit Layer (HTTPS/TLS)
   └─ All API calls encrypted with SSL/TLS 1.3

2. Database Layer (at-rest encryption)
   └─ Sensitive Fields (PAN, Bank Account, Password)
   └─ Algorithm: AES-256-GCM
   └─ Key Management: Environment-based secure keys

3. Application Layer (selective encryption)
   └─ PII (Personally Identifiable Information)
   └─ Financial Data (Investments, Accounts)
   └─ Important Documents
```

### 6. **Rate Limiting & DDoS Protection**

#### Progressive Rate Limiting:
```
IP Address: 192.168.1.100

Request 1-100: ✓ Allowed (within 15-min window)
Request 101-150: ⚠ Warning Headers Sent
Request 151+: 🚫 HTTP 429 (Too Many Requests)
              └─ Temporary ban for 1 hour

Brute Force Detection:
└─ 5 Failed Logins → Account Locked (15 min)
└─ 10 Failed Logins → Admin Notification
└─ 20+ Failed Logins → Permanent Block (require support)
```

---

## 🔒 Security

### Security Best Practices Implemented

✅ **OWASP Top 10 Protection**
- SQL Injection Prevention (Parameterized Queries)
- XSS Protection (Input Sanitization + CSP Headers)
- CSRF Protection (Token-based verification)
- Secure Authentication (bcrypt + 2FA)
- Sensitive Data Exposure Prevention (Encryption)
- Broken Access Control (RBAC + Middleware)
- Security Misconfiguration (Environment-based configs)
- XXE Prevention (Strict XML parsing)
- Broken Authentication (Session management)
- Insecure Deserialization (Strict JSON parsing)

✅ **Data Security**
- Database credentials in environment variables (never in code)
- API keys rotated monthly
- Sensitive fields encrypted at rest
- PCI-DSS compliance for payment data
- GDPR compliance for user data

✅ **Infrastructure Security**
- HTTPS enforced (TLS 1.3+)
- Security headers (Helmet.js)
- Rate limiting on all endpoints
- DDoS protection enabled
- IP whitelisting available
- WAF (Web Application Firewall) ready

### Recommended: Additional Security Hardening

```bash
# 1. Enable environment-based secret rotation
npm run rotate-secrets

# 2. Run security audit
npm audit
npm audit fix

# 3. Check for vulnerabilities
npm install -g snyk
snyk test

# 4. Monitor logs for suspicious activity
tail -f logs/audit.log | grep "severity: high"
```

---

## 📖 API Documentation

### Base URL
```
Development: http://localhost:5000/api
Production: https://api.hsdj-holdings.com/api
```

### Authentication Endpoints

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "investor@example.com",
  "password": "SecurePassword123!"
}

Response (200):
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "investor@example.com",
      "name": "John Investor",
      "twoFactorEnabled": true
    },
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

#### 2FA Setup
```bash
POST /api/auth/setup-2fa
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEBLW64TMMQ",
    "qrCode": "data:image/png;base64,...",
    "manualEntryKey": "JBSWY3DPEBLW64TMMQ"
  }
}
```

### Property Endpoints

#### Get All Properties
```bash
GET /api/properties?type=residential&location=Hubballi&minPrice=5000000&maxPrice=10000000
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": "prop_123",
        "title": "HSDJ Luxury Residences",
        "location": "Vidyanagar, Hubballi",
        "price": "₹85,00,000",
        "roi": "+12.5%",
        "beds": 3,
        "baths": 3,
        "sqft": 1850,
        "status": "Ready to Move",
        "amenities": ["Swimming Pool", "Gym", "Parking"]
      }
    ],
    "total": 42,
    "page": 1,
    "pageSize": 20
  }
}
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow
```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes and test
npm run test
npm run lint

# 3. Commit with conventional commits
git commit -m "feat: add property filter functionality"

# 4. Push and create Pull Request
git push origin feature/your-feature-name
```

### Commit Message Format
```
feat: add new feature
fix: bug fix
docs: documentation updates
style: code style changes
refactor: code refactoring
test: test additions
chore: dependency updates
```

### Code Standards
- ESLint configuration must pass
- 80%+ test coverage required
- No console.log in production code
- Meaningful variable names in English

---

## 📄 License

This project is proprietary software owned by HSDJ Holdings. All rights reserved.

---

## 📞 Support & Contact

### Get Help
- **Documentation**: [Full Docs](./docs/)
- **Email**: support@hsdj-holdings.com
- **Phone**: +1 (555) 123-4567
- **Hours**: 9 AM - 6 PM IST, Monday-Saturday

### Report Issues
- **Bug Reports**: GitHub Issues
- **Security Issues**: security@hsdj-holdings.com
- **Feature Requests**: feedback@hsdj-holdings.com

---

## 🙏 Acknowledgments

- **Founder**: Dr. Syeda Maryam Gazala
- **25+ Years** of Real Estate Development Experience
- **250+ Properties** Successfully Developed
- **1000+ Happy Investors** Across India
- **15% Average Annual Returns** Track Record

---

<div align="center">

### Made with ❤️ by HSDJ Holdings Team


**Building Trust. Creating Wealth. Shaping Futures.**

</div>
