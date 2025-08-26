# eVEND - Digital Vending Machine Platform

## Overview

eVEND is a modern digital vending machine platform that connects users to physical vending machines through a web application. Users can browse available drinks, make payments digitally, and receive OTP codes to retrieve their purchases from physical vending machines. The platform features a React frontend with a Node.js/Express backend, integrated with PostgreSQL for data persistence and Replit's authentication system for user management.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, built using Vite for fast development and optimized production builds
- **UI Library**: Shadcn/UI components built on Radix UI primitives for accessible, customizable interface components
- **Styling**: Tailwind CSS with custom CSS variables for theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript with ES modules for type safety and modern JavaScript features
- **Authentication**: Replit's OpenID Connect (OIDC) authentication system with Passport.js strategy
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **API Design**: RESTful endpoints with JSON responses and comprehensive error handling

### Database Layer
- **Database**: PostgreSQL with Neon serverless driver for scalable cloud database connectivity
- **ORM**: Drizzle ORM for type-safe database operations and schema management
- **Schema Design**: 
  - Users table for authentication and wallet management
  - Drinks table for product catalog
  - Orders table for transaction tracking with OTP generation
  - Sessions table for authentication state persistence
- **Migration Strategy**: Drizzle Kit for database schema migrations and version control

### Authentication & Authorization
- **Provider**: Replit Authentication using OpenID Connect protocol
- **Session Storage**: Server-side sessions stored in PostgreSQL with 7-day TTL
- **Security**: HTTP-only cookies with secure flags for production environments
- **User Management**: Automatic user creation/update with profile synchronization

### Key Design Patterns
- **Separation of Concerns**: Clear separation between client, server, and shared code directories
- **Type Safety**: End-to-end TypeScript with shared schema definitions between frontend and backend
- **Error Handling**: Centralized error handling with user-friendly error messages and proper HTTP status codes
- **Responsive Design**: Mobile-first approach with touch-friendly interfaces for vending machine interactions
- **Real-time Feedback**: Immediate UI updates with optimistic updates and proper loading states

### Business Logic
- **Payment Flow**: Digital wallet system with balance management and transaction processing
- **OTP System**: 4-digit OTP generation for secure drink retrieval from physical machines
- **Inventory Management**: Stock tracking with availability checks before purchase
- **Order Processing**: Complete order lifecycle from selection to OTP delivery

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for cloud database connectivity
- **drizzle-orm**: Modern TypeScript ORM with excellent type inference and developer experience
- **express**: Fast, unopinionated web framework for Node.js API development
- **@tanstack/react-query**: Powerful data synchronization for React applications

### Authentication & Session Management
- **passport**: Authentication middleware for Node.js with extensive strategy ecosystem
- **openid-client**: OpenID Connect client library for Replit authentication integration
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **express-session**: Session middleware for Express applications

### UI & Styling Dependencies
- **@radix-ui/***: Comprehensive set of accessible, unstyled UI components
- **tailwindcss**: Utility-first CSS framework for rapid UI development
- **class-variance-authority**: Utility for creating variant-based component APIs
- **lucide-react**: Beautiful, customizable icon library

### Development & Build Tools
- **vite**: Next-generation frontend build tool with fast HMR and optimized builds
- **tsx**: TypeScript execution environment for development server
- **esbuild**: Fast JavaScript bundler for production server builds
- **drizzle-kit**: CLI tool for database schema management and migrations

### Validation & Type Safety
- **zod**: TypeScript-first schema validation library
- **drizzle-zod**: Integration between Drizzle ORM and Zod for schema validation
- **@hookform/resolvers**: Validation resolvers for React Hook Form

### Additional Utilities
- **wouter**: Minimalist routing library for React applications
- **date-fns**: Modern JavaScript date utility library
- **nanoid**: URL-safe, unique string ID generator for OTP creation
- **memoizee**: Memoization library for function result caching