# VueF7 - Enterprise Mobile-First Development Template

**VueF7** is a comprehensive, enterprise-level mobile application template that combines Vue.js 3, TypeScript, Framework7, and Capacitor for cross-platform development with multiple database implementation options and advanced features.

## 🚀 Key Features

### Core Technologies
- **Vue 3** with Composition API
- **TypeScript** for type safety
- **Framework7** for native look and feel
- **Capacitor** for cross-platform deployment (iOS, Android, Web)
- **Vite** as the build tool with fast HMR
- **Rollup** with optimized chunking for performance

### Development Experience
- **Auto-imports** - Automatic imports for Vue composables and utilities
- **Auto-components** - Automatic component registration
- **Turbo Console** - Enhanced debugging experience
- **Type-safe routing** with Framework7
- **Pinia** for state management with persisted state
- **Modular architecture** - Feature-based module organization
- **TailwindCSS** for styling with custom UI components

### Internationalization & Localization
- **Vue I18n** for comprehensive i18n support
- **Multi-language** content management
- **RTL support** with localization features

### Database & Offline-First
This template provides **three different branch implementations** for database solutions:

#### 1. SQLite Branch (`db/sqlite`)
- Capacitor Community SQLite
- Kysely ORM for type-safe queries
- IndexedDB storage engine
- Offline-first capabilities

#### 2. PowerSync Branch (`db/powersync`)
- PowerSync for real-time sync with Supabase
- WASQLite for web and CapacitorSQLite for mobile
- OPFS (Origin Private File System) for web performance
- Real-time data synchronization
- Multi-tab support with SharedWorker

#### 3. WASQLite OPFS Branch (`db/sqlite-opfs`) - Current Branch
- WASQLite with OPFS for extremely fast web performance
- PowerSync architecture without their platform
- Client-side only implementation for local-first apps
- Uses OPFS (Origin Private File System) for fastest web performance
- Kysely ORM integration for type-safe queries

#### 4. Evolu Branch (`db/evolu`) - Local-First Alternative
- Evolu for local-first, conflict-free data structures
- CRDT-based data management
- Type-safe schema definitions

## 📦 Branch Structure

The project includes multiple database implementation branches:

- `main` - Base template with core features
- `db/sqlite` - Capacitor SQLite with Kysely ORM implementation
- `db/powersync` - PowerSync with Supabase integration for real-time sync
- `db/sqlite-opfs` - WASQLite with OPFS for maximum web performance
- `db/evolu` - Evolu for local-first, CRDT-based data

## 🛠️ Installation

First, install dependencies:
```bash
npm install
# or
pnpm install
```

## 🚀 Quick Start

### Development
```bash
npm run dev
# or
pnpm run dev
```

### Production Build
```bash
npm run build
# or
pnpm run build
```

### Capacitor Setup
This project supports iOS and Android deployment:

```bash
# Add Capacitor platforms
npx cap add ios
npx cap add android

# Build for specific platform
npm run build:ios
npm run build:android
# or
npm run build-capacitor-ios
npm run build-capacitor-android
```

### Opening in IDEs
```bash
# Open in native IDEs
npm run ios-open
npm run android-open
```

## 🏗️ Architecture

### Modular Structure
```
src/
├── modules/          # Feature-based modules
│   ├── home/         # Home module
│   ├── about/        # About module
│   └── sales/        # Sales module
├── shared/           # Shared utilities
│   ├── components/   # Reusable components
│   ├── composables/  # Vue composables
│   ├── services/     # Services (auth, database)
│   ├── stores/       # Pinia stores
│   └── utils/        # Utility functions
├── plugins/          # Vue plugins
├── router/           # Route configuration
└── assets/           # Static assets
```

### Database Implementation
This branch uses WASQLite with OPFS for optimal web performance and CapacitorSQLite for native performance, with PowerSync architecture for synchronization capabilities.

## 📱 Capacitor Configuration

This project is built for cross-platform development:
- **iOS** support with native look and feel
- **Android** support with adaptive UI
- **Web** support with offline capabilities
- **Native features** via Capacitor plugins

### Available Scripts
* 🔥 `start` - Run development server
* 🔧 `dev` - Run development server with HMR
* 📦 `build` - Build web app for production
* 📱 `build:ios` / `build:android` - Build for specific platforms
* 📱 `ios-open` / `android-open` - Build and open in native IDEs
* 🔍 `type-check` - Run TypeScript type checking

## 🔧 Advanced Features

### Performance Optimizations
- WASQLite with OPFS for fastest web database performance
- Bundle chunking and optimization
- Tree shaking for minimal bundle size
- Lazy loading for modules

### Developer Experience
- **Hot Module Replacement** with Vite
- **Auto-imports** for composables and utilities
- **Auto-component registration**
- **TypeScript** with strict mode
- **ESLint** and **Prettier** pre-configured
- **Git hooks** for code quality

### UI/UX Features
- Native iOS and Material Design components
- Smooth animations and transitions
- Dark/light theme support
- Responsive design with TailwindCSS
- Framework7's native UI components

## 🌐 Internationalization (i18n)

The project includes comprehensive internationalization support:
```typescript
// Example usage
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const message = t('welcome.message')
```

Locales are stored in `src/locales/` directory with support for multiple languages.

## 💾 Database Strategies

### WASQLite + OPFS (Current Branch)
- Extremely fast database performance for web
- Origin Private File System for secure storage
- Type-safe queries with Kysely
- Offline-first architecture

### PowerSync Integration
- Real-time synchronization with backend services
- Conflict resolution and offline editing
- Multi-device sync capabilities
- Supabase integration ready

### Capacitor SQLite
- Native performance on mobile
- Kysely ORM for type safety
- SQL-based queries with TypeScript support
- Fallback to IndexedDB on web

## 🔐 Security Features

- Secure storage for sensitive data
- Proper encryption for offline data
- Secure API communication
- Input validation and sanitization

## 🧪 Testing

Coming soon: Comprehensive testing configuration for:
- Unit tests with Vitest
- Component tests with Vue Test Utils
- E2E tests with Playwright
- Database operation tests

## 🚀 Deployment

### Web Deployment
Build the project with `npm run build` and deploy the `dist/` folder to any static hosting service.

### Mobile Deployment
1. Build the project: `npm run build`
2. Copy to Capacitor: `npx cap copy ios` or `npx cap copy android`
3. Open in native IDE: `npx cap open ios` or `npx cap open android`
4. Build and deploy from the IDE

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Vue.js](https://vuejs.org/) for the progressive framework
- [Framework7](https://framework7.io/) for native mobile components
- [Capacitor](https://capacitorjs.com/) for cross-platform development
- [Vite](https://vitejs.dev/) for the next-generation build tool
- [WASQLite](https://github.com/journeyapps/wa-sqlite) for fast web database
- [PowerSync](https://powersync.co/) for real-time sync capabilities
- [Kysely](https://kysely.dev/) for type-safe SQL queries

## 🏷️ Tags
vue, vue3, typescript, framework7, mobile, capacitor, sqlite, powersync, wasqlite, opfs, offline, offline-first, cross-platform, mobile-app, ios, android, web, vite, tailwindcss, pinia, i18n