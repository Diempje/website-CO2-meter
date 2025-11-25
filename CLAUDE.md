# CLAUDE.md - Website CO2 Meter Documentation

**AI Assistant Guide for Website CO2 Meter Project**

Last Updated: 2025-11-25
Repository: https://github.com/Diempje/website-CO2-meter

---

## 📋 Project Overview

**Purpose:** A sustainability analysis tool that measures website CO2 footprint and provides evidence-based sustainability scoring. The tool analyzes websites using Google PageSpeed Insights data and CO2.js calculations to determine environmental impact per page visit.

**Key Features:**
- Website CO2 emission analysis (grams per visit)
- Performance scoring integration with Google PageSpeed Insights
- Green hosting detection via Green Web Foundation API
- Evidence-based sustainability scoring (7-factor algorithm)
- Visitor impact projections (monthly/yearly CO2 calculations)
- Contact form for consulting lead generation
- Password-protected analytics dashboard
- Real-time benchmarking against industry standards

**Deployment:** Vercel (production), Node.js server (development)

---

## 🛠 Technology Stack

### Backend
- **Runtime:** Node.js (>= v22.19.0)
- **Framework:** Express.js ^4.18.2
- **Database:** PostgreSQL with `pg` ^8.16.3
- **ORM:** Prisma ^7.0.0 (minimally configured)
- **Email:** Nodemailer ^7.0.6 (SMTP via mailprotect.be)
- **HTTP Client:** Axios ^1.6.0
- **CO2 Calculation:** @tgwf/co2 ^0.15.0 (Sustainable Web Design model)

### Frontend
- **HTML5:** Semantic markup, minimal template structure
- **CSS3:** Custom properties (52 variables), grid/flexbox, animations
- **JavaScript:** Vanilla ES6+ (no frameworks)
- **Module Pattern:** Object literal modules (not ES6 modules)

### External APIs
- **Google PageSpeed Insights API v5** - Performance metrics
- **Green Web Foundation API** - Green hosting detection
- **Plausible Analytics** - Privacy-friendly analytics tracking

### Deployment & Tools
- **Vercel:** Production deployment platform
- **PM2:** Optional process manager for development
- **dotenv:** Environment variable management

---

## 📁 Codebase Structure

```
website-CO2-meter/
├── index.js                    # Express server (713 lines) - Main backend
├── package.json                # Dependencies and scripts
├── vercel.json                 # Vercel deployment configuration
├── .env                        # Environment variables (NOT committed)
├── .gitignore                  # Git ignore rules
├── analytics.db                # SQLite backup (legacy)
├── prisma/
│   ├── schema.prisma          # Prisma schema (minimal config)
│   └── migrations/            # Database migrations
├── prisma.config.ts           # Prisma configuration
└── public/                    # Frontend assets (served statically)
    ├── index.html             # Main SPA entry point (58 lines)
    ├── analytics.html         # Password-protected dashboard (100+ lines)
    ├── css/
    │   ├── main.css          # Core styles & CSS custom properties
    │   ├── components.css    # Component-specific styles (1,815 lines)
    │   └── responsive.css    # Mobile/tablet breakpoints
    ├── js/
    │   ├── main.js                    # Core app logic (1,344 lines)
    │   ├── sustainability-scorer.js   # Scoring algorithm (344 lines)
    │   ├── utils.js                   # Utilities & caching (18,079 lines)
    │   └── api.js                     # API client module (96 lines)
    ├── images/                # 30+ SVG icons, WebP logo
    └── fonts/                 # Web fonts (raleway.woff2)
```

### Key Files and Their Purposes

| File | Lines | Purpose |
|------|-------|---------|
| `index.js` | 713 | Express server, API endpoints, database operations, email handling |
| `main.js` | 1,344 | App initialization, event listeners, result rendering, form handling |
| `sustainability-scorer.js` | 344 | Evidence-based sustainability scoring (7 factors) |
| `utils.js` | 18,079 | Formatting functions, icons, climate tips, DOM caching |
| `components.css` | 1,815 | Detailed component styling (forms, cards, results, animations) |
| `api.js` | 96 | Fetch wrapper, URL validation, API orchestration |

---

## 🔧 Development Workflows

### Initial Setup

```bash
# Clone repository
git clone https://github.com/Diempje/website-CO2-meter.git
cd website-CO2-meter

# Install dependencies
npm install

# Create .env file with required variables (see Environment Variables section)
cp .env.example .env  # Edit with your values

# Run database migrations (if using Prisma)
npx prisma migrate dev

# Start development server
npm run serve
```

### Development Commands

```bash
npm run serve       # Start server (node index.js)
npm start           # Start with PM2 process manager
npm stop            # Stop PM2 process
npm restart         # Restart PM2 process
npm run logs        # View PM2 logs
npm run list        # List PM2 processes
```

### Git Workflow

**Current Branch:** `claude/claude-md-miemawszftj4nn70-01PaBKHiG5QxZEcSNhCqENs3`

**Important:**
- Always develop on the designated Claude branch
- Use descriptive commit messages in Dutch (project language)
- Push to the Claude branch with: `git push -u origin <branch-name>`
- Retry push operations up to 4 times with exponential backoff on network failures
- Never force push to main/master

**Recent Commits Show:**
- Active maintenance with focus on analytics improvements
- Password security for dashboard
- Icon path fixes (relative paths)
- Dark mode improvements
- DOM element averaging

---

## 📏 Key Conventions

### File Naming
- **JavaScript:** camelCase (`main.js`, `api.js`, `sustainability-scorer.js`)
- **CSS:** kebab-case (`main.css`, `components.css`, `responsive.css`)
- **Images:** snake_case (`tree_icon.svg`, `context_icon.svg`)

### Code Naming Conventions

**Variables & Functions:**
```javascript
// Constants: UPPERCASE_SNAKE_CASE
const BENCHMARK_DATA = { ... };
const APP_STATE = { ... };

// Functions: camelCase with descriptive verbs
function calculateBenchmarks(data) { ... }
function validateURLInput(url) { ... }

// Event handlers: handle*Click, handle*Submit
function handleAnalyzeClick() { ... }
function handleCTASubmit(event) { ... }

// Display/generation: generate*HTML, display*
function generateSustainabilityHeroHTML(data) { ... }
function displayResults(result) { ... }

// Async functions: descriptive async pattern
async function performAnalysis(url) { ... }
```

**CSS Classes:**
```css
/* kebab-case for all CSS classes */
.analyze-btn { }
.result-card { }
.cta-form { }
.input-group { }
```

**Data Object Keys:**
- **Database fields:** snake_case (`co2_per_visit`, `green_hosting`, `dom_elements`)
- **API responses:** camelCase (`co2PerVisit`, `greenHosting`, `domElements`)

### Module Pattern

Frontend uses object literal module pattern:
```javascript
const ModuleName = {
    property: value,
    publicMethod: function() { },
    _privateMethod: function() { }  // underscore prefix for private methods
};
```

### Color Scheme
- **Background:** #032615 (dark green)
- **Text:** #fefdc7 (golden/cream)
- **Accent:** Various green shades for sustainability theme
- **Dark mode:** Active with careful contrast considerations

---

## 🌐 API Documentation

### Public Endpoints

#### `POST /api/analyze`
**Purpose:** Main website analysis endpoint

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "url": "https://example.com",
  "co2PerVisit": 0.45,
  "transferSize": 850,
  "performanceScore": 85,
  "grade": "A",
  "comparison": "1.11km autorijden",
  "domElements": 450,
  "httpRequests": 35,
  "greenHosting": {
    "isGreen": true,
    "provider": "Combell",
    "impact": "Lagere CO2 impact door groene energie!"
  },
  "optimizations": {
    "imageOptimizationScore": 0.85,
    "unusedCSS": 45,
    "unusedJS": 120,
    "canSave": 165
  },
  "benchmarks": {
    "pageSize": { ... },
    "co2": { ... },
    "performance": { ... }
  },
  "visitorImpact": [ ... ]
}
```

**Flow:**
1. Fetch Google PageSpeed Insights API
2. Extract metrics (transfer size, DOM, performance score)
3. Check Green Web Foundation API for green hosting
4. Calculate CO2 using CO2.js (Sustainable Web Design model)
5. Calculate benchmarks and visitor impact
6. Save to analytics table (async, non-blocking)
7. Return full analysis object

#### `GET /api/stats`
**Purpose:** Public aggregate statistics

**Response:**
```json
{
  "totalAnalyses": 1234,
  "averagePerformanceScore": 68,
  "averageSustainabilityScore": 72,
  "averageCO2": 0.85,
  "gradeDistribution": [...],
  "hostingTypes": [...],
  "topDomains": [...]
}
```

#### `POST /api/track-sustainability`
**Purpose:** Update sustainability score after frontend calculation

**Request:**
```json
{
  "url": "https://example.com",
  "sustainability_score": 75,
  "sustainability_grade": "B"
}
```

#### `POST /api/contact`
**Purpose:** Contact form submission with dual email delivery

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Example Corp",
  "interest": "Sustainability Audit",
  "message": "...",
  "website_url": "https://example.com",
  "current_score": 75,
  "current_grade": "B",
  "co2_per_visit": 0.5
}
```

**Emails Sent:**
- Notification to admin (`klopklop@diim.be`)
- Confirmation to user with analysis context

#### `GET /health`
**Purpose:** Health check for monitoring

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-11-25T10:30:00.000Z",
  "uptime": 12345.67
}
```

### Protected Endpoints

#### `GET /api/detailed-stats?p=PASSWORD`
**Purpose:** Detailed analytics data (password-protected)

**Query Params:** `p` - password from `ANALYTICS_PASSWORD` env var

**Response:**
```json
{
  "websites": [...],
  "summary": {
    "total_analyses": 1234,
    "unique_websites": 567,
    "avg_co2": 0.85,
    "avg_performance": 68
  }
}
```

#### `GET /secret-dashboard-xyz123?p=PASSWORD`
**Purpose:** Analytics dashboard HTML page

---

## 🗄 Database Schema

### Technology
- **Primary:** PostgreSQL (production)
- **Connection:** Via `pg` library with connection pooling
- **SSL:** Enabled in production (`ssl: { rejectUnauthorized: false }`)
- **Legacy:** SQLite (`analytics.db` - backup/migration artifact)

### Analytics Table

```sql
CREATE TABLE analytics (
  id SERIAL PRIMARY KEY,
  url TEXT,
  domain TEXT,
  score INTEGER,                    -- Performance score (0-100)
  grade TEXT,                       -- Performance grade (A+ to F)
  co2_per_visit DECIMAL,           -- CO2 grams per visit
  transfer_size INTEGER,           -- Page size in KB
  green_hosting BOOLEAN,           -- Green hosting detected
  http_requests INTEGER,           -- Number of HTTP requests
  dom_elements INTEGER,            -- Number of DOM elements
  user_agent TEXT,                 -- Browser user agent
  sustainability_score INTEGER,    -- Sustainability score (0-100)
  sustainability_grade TEXT,       -- Sustainability grade (A+ to F)
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Prisma Configuration

**Status:** Minimally configured - actual schema definitions are handled through direct PostgreSQL queries in `index.js` rather than through Prisma schema.

**Location:** `prisma/schema.prisma` (14 lines - only generator and datasource)

**Improvement Opportunity:** Consider migrating to full Prisma schema for type safety and migrations.

---

## 🔐 Environment Variables

**Location:** `.env` file (NOT committed to git)

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Server
PORT=3000                          # Server port (default: 3000)
NODE_ENV=production               # production or development

# Google PageSpeed Insights
GOOGLE_API_KEY=your_api_key_here

# Email (mailprotect.be SMTP)
EMAIL_USER=your_email@domain.com
EMAIL_PASS=your_email_password

# Analytics Dashboard
ANALYTICS_PASSWORD=your_secure_password
```

### Email Configuration

**Provider:** mailprotect.be SMTP
**Host:** smtp-auth.mailprotect.be
**Port:** 587
**Security:** STARTTLS
**Recipient:** klopklop@diim.be (admin notifications)

---

## 📊 Benchmark Data

The application uses evidence-based benchmarks from Website Carbon Calculator 2024:

```javascript
BENCHMARK_DATA = {
  pageSize: {
    excellent: 512 KB,
    good: 1024 KB,
    average: 2048 KB,
    poor: 4096 KB
  },
  co2PerVisit: {
    excellent: 0.2g,
    good: 0.5g,
    average: 0.8g,      // 2024 median from Website Carbon Calculator
    poor: 2.0g
  },
  performanceScore: {
    excellent: 90,
    good: 75,
    average: 65,
    poor: 50
  },
  httpRequests: {
    excellent: 30,
    good: 50,
    average: 70,
    poor: 100
  },
  domElements: {
    excellent: 50,
    good: 400,
    average: 660,
    poor: 800
  }
}
```

### Grading Scale

| Score | Grade |
|-------|-------|
| 90-100 | A+ |
| 80-89 | A |
| 70-79 | B |
| 60-69 | C |
| 50-59 | D |
| 40-49 | E |
| 0-39 | F |

---

## 🎯 Sustainability Scoring Algorithm

**Location:** `public/js/sustainability-scorer.js`

**Evidence-Based 7-Factor Model:**

1. **Data Efficiency (35%)** - Most impactful factor
   - Page transfer size vs benchmarks
   - Direct correlation to CO2 emissions

2. **Resource Count (20%)** - Second most important
   - HTTP requests optimization
   - Reduces server load and network traffic

3. **Green Hosting (15%)** - Significant impact
   - Verified via Green Web Foundation API
   - 60% CO2 reduction when using green energy

4. **Media Optimization (12%)**
   - Image optimization score from PageSpeed
   - Large impact on transfer size

5. **Code Efficiency (8%)**
   - Unused CSS and JavaScript
   - Optimization opportunities

6. **Loading Efficiency (7%)**
   - DOM element count
   - Rendering performance

7. **User Experience (3%)**
   - Overall performance score
   - User-facing metrics

**Calculation:** Weighted average of all factors produces score 0-100, then converted to grade using standard grading scale.

---

## 🛡️ Security Considerations

### Current Security Measures

1. **SQL Injection Prevention:** All database queries use parameterized statements
2. **Password Protection:** Analytics dashboard requires password via query param
3. **Environment Variables:** Sensitive data stored in `.env` (not committed)
4. **SSL/TLS:** Database connections use SSL in production
5. **Input Validation:** URL validation on both frontend and backend

### Security Improvements to Consider

⚠️ **Analytics Password:** Currently passed via query parameter - consider moving to header-based authentication or session tokens.

⚠️ **Rate Limiting:** No rate limiting on `/api/analyze` - consider implementing to prevent abuse.

⚠️ **CORS:** No explicit CORS configuration - add if needed for cross-origin requests.

⚠️ **API Key Exposure:** Google API key is server-side only (good), but no rate limit protection.

---

## 🔍 Common Tasks for AI Assistants

### Adding New Features

1. **Always read existing files first** before making changes
2. **Maintain consistency** with existing naming conventions
3. **Update both frontend and backend** if adding new metrics
4. **Test API endpoints** after changes
5. **Update this CLAUDE.md** if adding significant features

### Modifying API Endpoints

**Location:** `index.js` (lines 220-713)

**Pattern:**
```javascript
app.post('/api/endpoint-name', async (req, res) => {
    try {
        // Extract request data
        const { param } = req.body;

        // Validate input
        if (!param) {
            return res.status(400).json({ error: 'Message' });
        }

        // Process request
        const result = await someOperation();

        // Return response
        res.json(result);

    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({
            error: 'Error message',
            details: error.message
        });
    }
});
```

### Modifying Sustainability Scoring

**Location:** `public/js/sustainability-scorer.js:344`

**Key Function:** `SustainabilityScorer.calculateSustainabilityScore(analysisResult)`

**Important:**
- Evidence-based weights - don't change without research
- All factors scored 0-100 before weighting
- Returns both score (0-100) and grade (A+ to F)
- Frontend calculates, backend stores via `/api/track-sustainability`

### Database Operations

**Connection:** Use the `pool` object for all queries

**Pattern:**
```javascript
const result = await pool.query(`
    SELECT * FROM analytics
    WHERE domain = $1
    ORDER BY timestamp DESC
    LIMIT 10`,
    [domain]
);

console.log('Results:', result.rows);
```

**Important:**
- Always use parameterized queries ($1, $2, etc.)
- Never string concatenate SQL queries
- Handle errors gracefully
- Log operations for debugging

### Frontend Module Updates

**Architecture:** Object literal pattern, not ES6 modules

**Pattern:**
```javascript
// In utils.js or api.js
const ModuleName = {
    init: function() {
        // Initialization code
    },

    someMethod: function(param) {
        // Implementation
    },

    _privateHelper: function() {
        // Private methods use underscore prefix
    }
};

// Usage in main.js
ModuleName.init();
ModuleName.someMethod(value);
```

### CSS Modifications

**Structure:** Three-file approach
- `main.css` - Global styles, CSS custom properties, base layout
- `components.css` - Component-specific styles (largest file)
- `responsive.css` - Media queries for mobile/tablet

**Pattern:**
```css
/* Use CSS custom properties from main.css */
.new-component {
    background-color: var(--color-primary);
    padding: var(--spacing-md);
    border-radius: var(--border-radius);
}

/* Add responsive styles to responsive.css */
@media (max-width: 768px) {
    .new-component {
        padding: var(--spacing-sm);
    }
}
```

### Testing Changes

1. **Local Testing:**
   ```bash
   npm run serve
   # Visit http://localhost:3000
   ```

2. **Test API Endpoints:**
   ```bash
   curl -X POST http://localhost:3000/api/analyze \
     -H "Content-Type: application/json" \
     -d '{"url":"https://example.com"}'
   ```

3. **Check Database:**
   ```bash
   # Connect to PostgreSQL
   psql $DATABASE_URL
   # Query analytics
   SELECT * FROM analytics ORDER BY timestamp DESC LIMIT 5;
   ```

4. **Monitor Logs:**
   ```bash
   npm run logs  # If using PM2
   # Or watch server output
   ```

---

## 📝 Code Style Guidelines

### JavaScript

- **ES6+ syntax** preferred (const/let, arrow functions, async/await)
- **No semicolons** at end of statements (project convention)
- **Single quotes** for strings
- **Descriptive variable names** (no single letters except in loops)
- **Comments in Dutch** for business logic explanations
- **Console logs with emoji** for visual debugging (🔍, ✅, ❌, 📊, etc.)

### Error Handling

```javascript
// Good pattern from the codebase
try {
    const result = await operation();
    console.log('✅ Operation successful:', result);
} catch (error) {
    console.error('❌ Operation failed:', error.message);
    // Don't re-throw if handling gracefully
}
```

### Async Operations

- Use async/await (not .then() chains)
- Handle errors in try/catch blocks
- Non-blocking operations for analytics logging

### Frontend State Management

**Pattern:** Single APP_STATE object in main.js
```javascript
const APP_STATE = {
    currentResult: null,
    isLoading: false,
    lastAnalyzedUrl: null
};
```

### DOM Caching

**Pattern:** DOM object in main.js for performance
```javascript
const DOM = {
    analyzeBtn: null,
    urlInput: null,
    resultsSection: null,

    cache: function() {
        this.analyzeBtn = document.querySelector('.analyze-btn');
        this.urlInput = document.getElementById('url-input');
        // ... etc
    }
};
```

---

## 🚨 Important Notes for AI Assistants

### Critical Warnings

❌ **Never commit `.env` file** - Contains sensitive credentials
❌ **Never log API keys** - Sanitize before logging
❌ **Never modify benchmark data** without research backing
❌ **Never skip parameterized queries** - SQL injection risk
❌ **Never force push to main/master** - Protected branches

### Best Practices

✅ **Always read files before editing** - Understand context first
✅ **Test API endpoints** after backend changes
✅ **Use emoji in console logs** - Project convention (🔍, ✅, ❌, 📊)
✅ **Write comments in Dutch** - Project language
✅ **Maintain consistent naming** - Follow established conventions
✅ **Update CLAUDE.md** when adding features - Keep documentation current

### Performance Considerations

1. **DOM Caching:** Elements cached in DOM object for reuse
2. **Async Analytics:** Database writes are non-blocking
3. **Connection Pooling:** PostgreSQL uses connection pool
4. **API Timeouts:** Green hosting check has 8-second timeout with fallbacks
5. **Caching Strategy:** Utils has caching for formatting functions

### Known Issues & Quirks

1. **Prisma Minimal Setup:** Schema exists but direct SQL queries used instead
2. **SQLite Legacy:** `analytics.db` file is backup/migration artifact
3. **Green Hosting Fallback:** Hardcoded list for known providers when API fails
4. **Password in Query Param:** Analytics dashboard password via URL (security consideration)
5. **Mixed Database Approach:** Both Prisma client and pg pool instantiated

### Future Improvement Opportunities

1. **Migrate to Full Prisma:** Use schema.prisma for type safety and migrations
2. **Add Rate Limiting:** Protect API endpoints from abuse
3. **Implement Caching:** Redis or in-memory cache for PageSpeed results
4. **Add API Versioning:** `/api/v1/analyze` for future compatibility
5. **Improve Authentication:** Move from query param to header-based auth
6. **Add Frontend Tests:** Currently no test framework configured
7. **Bundle JavaScript:** Consider build step for production optimization
8. **Add TypeScript:** For better type safety (currently vanilla JS)

---

## 📚 External Documentation Links

- **CO2.js Library:** https://github.com/thegreenwebfoundation/co2.js
- **Google PageSpeed API:** https://developers.google.com/speed/docs/insights/v5/get-started
- **Green Web Foundation:** https://www.thegreenwebfoundation.org/
- **Website Carbon Calculator:** https://www.websitecarbon.com/
- **Sustainable Web Design:** https://sustainablewebdesign.org/
- **Express.js Docs:** https://expressjs.com/
- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **Vercel Deployment:** https://vercel.com/docs

---

## 🤝 Contributing Guidelines

### For AI Assistants

1. **Read first, code second** - Always understand existing code before modifying
2. **Test thoroughly** - Verify changes work locally before committing
3. **Commit logically** - One feature/fix per commit with descriptive message
4. **Use Dutch for commits** - Project language (e.g., "dark mode aanpassingen")
5. **Update documentation** - Keep this file current with changes
6. **Follow conventions** - Naming, structure, and style patterns established
7. **Ask when unsure** - Better to clarify than make incorrect assumptions

### Commit Message Format (Dutch)

```
Short descriptive title (imperative mood)

Optional longer description explaining why the change was made
and any relevant context.
```

**Examples from project history:**
- `relatief pad iconen aangepast` (relative path icons adjusted)
- `dark mode aanpassingen en disclaimer aan index.html toegevoegd`
- `gemiddelde DOM Elementen aangepast`
- `password debug`
- `fixed analytics password`

---

## 📞 Support & Contact

**Repository:** https://github.com/Diempje/website-CO2-meter
**Author:** Dimitri Dehouck
**Contact:** klopklop@diim.be
**License:** MIT

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-25
**Maintained By:** AI assistants working on this project

---

*This document is specifically designed for AI assistants (like Claude) to quickly understand and work effectively with the Website CO2 Meter codebase. Keep it updated as the project evolves.*
