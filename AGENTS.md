# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Stack
- Vue 3 with TypeScript
- Framework7 (lite-bundle) with Vue integration
- Vite as bundler
- Capacitor for mobile app builds (iOS/Android)
- Pinia for state management
- Vue I18n for internationalization
- Tailwind CSS for styling

## Build/Lint/Test Commands

### Development
- `pnpm run dev` - Start development server
- `pnpm start` - Alias for development server (runs `npm run dev`)

### Build
- `pnpm run build` - Build web app for production (runs with type checking)
- `pnpm run build-only` - Build web app without type checking
- `pnpm run build-capacitor-ios` - Build and copy to iOS capacitor project
- `pnpm run build-capacitor-android` - Build and copy to Android capacitor project
- `pnpm run ios` - Build and copy to iOS capacitor project
- `pnpm run ios-open` - Build, copy to iOS, and open in Xcode
- `pnpm run android` - Build and copy to Android capacitor project
- `pnpm run android-open` - Build, copy to Android, and open in Android Studio

### Preview
- `pnpm run preview` - Preview production build locally on port 4173

### Type Checking
- `pnpm run type-check` - Run TypeScript type checking (vue-tsc --noEmit)

### Other Commands
- `pnpm run postinstall` - Copy font files from node_modules to src/fonts/

## Code Style Guidelines

### Imports
- Use `@/*` alias for paths relative to `src/` directory (e.g., `@/modules/home/views/Home.vue`)
- Use `@modules/*` alias for paths relative to `src/modules/*` directory (configured in vite.config.ts)
- Import types with `import type` syntax for TypeScript type imports
- Auto-imported functions are configured via `unplugin-auto-import` and listed in `.biomelintrc-auto-import.json`

### Formatting
- Use TypeScript with strict type checking
- Use Vue 3 Composition API with `<script setup>` syntax
- Use Tailwind CSS utility classes with arbitrary values (e.g., `!rounded-b-2xl`)
- Component names follow Framework7 naming convention (e.g., `F7Page`, `F7Navbar`)

### Naming Conventions
- Route parameter arrays named as `{module}Routes` (e.g., `homeRoutes`, `aboutRoutes`)
- Vue components use PascalCase (e.g., `Home.vue`, `About.vue`)
- Composables follow `use{Feature}` pattern (e.g., `useAppTheme`, `useLanguageStore`)
- Store files use `use{Feature}.stores.ts` pattern (note the plural "stores")

### Error Handling
- Async route loading uses dynamic imports with `.then()` for component resolution
- TypeScript types from Framework7 are imported as `import type { Router } from "framework7/types"`

### Project Structure
- Modular architecture with feature modules in `src/modules/{module-name}/`
- Each module has components, composables, router, services, stores, and views directories
- Shared utilities in `src/shared/` directory
- Plugins in `src/plugins/` directory with auto-registration
- Assets in `src/assets/` and fonts in both `src/assets/fonts/` and `src/fonts/`

### Testing
- No explicit test commands in package.json, but Vite config includes vitest patterns
- To run a single test, use: `vitest run path/to/test-file.test.ts`

## Code-specific Rules

### Auto-imports and VueUse Functions
- `useLocalStorage`, `computed`, `provide`, `inject`, `onMounted`, and other Vue composables are auto-imported via `unplugin-auto-import`
- These functions are configured in `vite.config.ts` with the `getFramework7AutoImports()` function
- No need to manually import these functions from 'vue' or other libraries
- Check `.biomelintrc-auto-import.json` for the complete list of auto-imported functions

### Framework7 Component Resolution
- Framework7 components can be used in both PascalCase (F7Page, F7Navbar) and kebab-case (f7-page, f7-navbar)
- The `Framework7VueResolver()` in `src/shared/utils/resolvers/resolvers.ts` handles the component resolution
- Components are automatically resolved from 'framework7-vue' package

### Route Configuration
- Each module has its own routes defined in `src/modules/{module}/router/routes/index.ts`
- Route arrays must be named as `{module}Routes` (e.g., `homeRoutes`, `aboutRoutes`)
- Async route loading uses dynamic imports with `.then()` for component resolution
- Route parameters use `Router.RouteParameters[]` type from Framework7

### Theme Provider Pattern
- The `useAppThemeProvider` composable must be called in a parent component to provide theme context
- `useAppTheme` hook can only be used within components that have a parent with the theme provider
- Theme and dark mode preferences are stored in localStorage with keys "app-theme" and "dark-mode"

### Import Aliases
- Use `@/*` for paths relative to `src/` directory (e.g., `@/modules/home/views/Home.vue`)
- Use `@modules/*` for paths relative to `src/modules/*` directory
- These aliases are configured in `vite.config.ts` under resolve.alias

### Capacitor Plugin Integration
- Capacitor functionality is managed through `src/plugins/capacitor.plugin.ts`
- Android back button, keyboard, and splash screen handling are integrated automatically
- All Capacitor plugins are initialized in the main App component

### Component Structure
- Vue components use PascalCase naming (e.g., `Home.vue`, `About.vue`)
- Components use `<script setup>` syntax with TypeScript
- Framework7 components follow the F7 prefix convention (e.g., `F7Page`, `F7Navbar`)

### Store Files
- Store files use `use{Feature}.stores.ts` pattern (note the plural "stores")
- Stores are located in `src/shared/stores/` or `src/modules/{module}/stores/`
- Pinia with persisted state is configured globally

### Missing Imports in useAppTheme
- The `useAppTheme.ts` file is missing imports for `computed`, `provide`, `inject`, `onMounted`, and `useLocalStorage`
- These should be imported from 'vue' and '@vueuse/core' respectively
- The functions work due to auto-imports but explicit imports would be more clear