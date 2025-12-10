# GetApp API Microservice

A NestJS-based microservices architecture for the GetApp platform.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Services](#running-the-services)
  - [Database Migrations](#database-migrations)
- [Libs Repository Management](#libs-repository-management)
- [Deployment](#deployment)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Overview

This repository contains the **API** microservice for the GetApp platform. Each microservice is maintained in its own separate repository and follows a microservices architecture pattern with shared libraries.

## Architecture

The GetApp platform consists of the following microservices (each in a separate repository):

- **API** (this repository) - Main API gateway service
- **Upload** - File upload handling service
- **Discovery** - Service discovery and device management
- **Offering** - Offerings and catalog management
- **Delivery** - Content delivery and caching service
- **Project-Management** - Project lifecycle management
- **Deploy** - Deployment orchestration service
- **Get-Map** - Mapping and location services

Each service can be developed, deployed, and scaled independently.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Docker and Docker Compose
- PostgreSQL 14.1+
- Git
- Access to the getappsh GitHub organization

## Installation

1. **Clone the repository:**

```bash
git clone git@github.com:getappsh/api.git
cd api
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

Create a `.env` file in the root directory with the required environment variables for development.

For detailed environment variable configuration, refer to the [Environment Variables Documentation](https://docs.getapp.sh/docs/category/environment-variables).

4. **Start the development infrastructure:**

Use Docker Compose to start all required services (PostgreSQL, Kafka, Keycloak, MinIO, etc.):

```bash
docker-compose up -d
```

This will start the complete development environment including:
- PostgreSQL database (port 5432)
- Kafka message broker (port 9092)
- Kafka UI (port 8081)
- Keycloak authentication (port 8080)
- MinIO object storage (ports 9090, 9091)
- Matomo analytics (port 8082)

Verify all services are running:

```bash
docker-compose ps
```

## Running the Services

### Development Mode

#### Run Single Service (API)

```bash
# With automatic migration
npm run start:dev

# Without migration
npm run start:dev:no-mig
```

#### Run All Services Concurrently (Multi-Repo Setup)

To run all microservices together, you need to clone and run each service in its own repository:

```bash
# Clone all service repositories
cd /path/to/your/workspace
git clone git@github.com:getappsh/api.git
git clone git@github.com:getappsh/upload.git
git clone git@github.com:getappsh/discovery.git
git clone git@github.com:getappsh/offering.git
git clone git@github.com:getappsh/delivery.git
git clone git@github.com:getappsh/project-management.git
git clone git@github.com:getappsh/deploy.git
git clone git@github.com:getappsh/getmap.git

# Start each service in a separate terminal or use a process manager
```

Alternatively, if using the `all:dev` script from the API repository, it will attempt to start services from sibling directories:

```bash
npm run all:dev
```

This assumes all service repositories are cloned in the same parent directory.

### Production Mode

```bash
npm run start:prod
```

### Watch Mode

```bash
npm run start:dev
```

---

> **💡 Tip: VS Code Workspace Setup**
> 
> When working with multiple GetApp microservices, create a multi-root workspace in VS Code:
> 
> 1. Clone all service repositories in the same parent directory
> 2. Open VS Code and go to `File` > `Add Folder to Workspace`
> 3. Add each service folder (api, upload, discovery, etc.)
> 4. Save the workspace: `File` > `Save Workspace As...` > `getapp-services.code-workspace`
> 
> Your workspace file structure will look like:
> ```json
> {
>   "folders": [
>     { "path": "./api" },
>     { "path": "./upload" },
>     { "path": "./discovery" },
>     { "path": "./offering" },
>     { "path": "./delivery" },
>     { "path": "./project-management" },
>     { "path": "./deploy" },
>     { "path": "./getmap" }
>   ],
>   "settings": {}
> }
> ```
> 
> Benefits:
> - Browse all services in one window
> - Search across all repositories
> - Use integrated terminals for each service
> - Manage git operations for all repos

### Database Migrations

#### Create a New Migration

After adding a new column or making database schema changes:

```bash
npm run migration:create --name=<migration_name>
```

Example:
```bash
npm run migration:create --name=add-user-email-column
```

#### Generate Migration from Entities

Automatically generate migration based on entity changes:

```bash
npm run migration:generate --name=<migration_name>
```

#### Run Migrations

Apply pending migrations to the database:

```bash
npm run migration:run
```

#### Show Migration Status

```bash
npm run migration:show
```

#### Revert Last Migration

```bash
npm run migration:revert
```

**Important:** Always run migrations after creating them to apply the database changes.

---

## Libs Repository Management

The API microservice (and other GetApp services) use Git subtree to manage the shared `libs` directory from a separate repository. This allows all services to share common code, utilities, and database entities while maintaining independent repositories.

### Initial Setup

Configure the libs repository as a remote:

```bash
cd api
git remote add libs git@github.com:getappsh/libs.git
git fetch libs
git subtree pull --prefix=libs libs develop
git branch --set-upstream-to=origin/develop
```

### Pull Latest Changes from Libs

```bash
git subtree pull --prefix=libs libs develop
```

### Push Changes to Libs Repository

```bash
git subtree push --prefix=libs libs develop
```

### Setting Up Git Shortcuts

Add the following aliases to your `.gitconfig` file for easier lib management:

```bash
[alias]
  libs-pull = "!f() { BRANCH=${1:-develop}; git subtree pull --prefix=libs libs $BRANCH; }; f"
  libs-push = "!f() { BRANCH=${1:-develop}; git subtree push --prefix=libs libs $BRANCH; }; f"
```

Then you can use the shortcuts:

```bash
# Pull from libs (defaults to develop branch)
git libs-pull

# Pull from specific branch
git libs-pull feature-branch

# Push to libs (defaults to develop branch)
git libs-push

# Push to specific branch
git libs-push feature-branch
```


## Deployment

### Development Environment Setup

The development environment uses Docker Compose to orchestrate all required infrastructure services.

#### Prerequisites

Ensure Docker and Docker Compose are installed and running on your system.

#### Start Development Infrastructure

```bash
docker-compose up -d
```

This command starts all infrastructure services defined in `docker-compose.yaml`:

**Core Services:**
- **PostgreSQL** - Database server (port 5432)
- **Kafka** - Message broker (port 9092)
- **Kafka UI** - Kafka management interface (port 8081)

**Supporting Services:**
- **Keycloak** - Authentication and authorization (port 8080)
- **MinIO** - S3-compatible object storage (ports 9090, 9091)
- **Matomo** - Analytics platform (port 8082)
- **Matomo DB** - MariaDB for Matomo (port 3307)

#### Access Services

- **Kafka UI**: http://localhost:8081
- **Keycloak**: http://localhost:8080
- **MinIO Console**: http://localhost:9091
- **Matomo**: http://localhost:8082

#### Stop Development Infrastructure

```bash
# Stop all services
docker-compose down

# Stop and remove all data volumes
docker-compose down -v
```

### Using Docker Compose for Production

**Note:** The default `docker-compose.yaml` is configured for development. For production deployments, use appropriate configuration.



## Testing

### Run Unit Tests

```bash
npm run test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```


## Building the Application

### Build for Production

```bash
npm run build
```

This command will:
1. Build migrations
2. Build the application

### Build Individual Components

```bash
# Build app only
npm run build:app

# Build migrations only
npm run build:migration
```

## Project Structure

This API microservice repository structure:

```
api/
├── apps/                    # Application source code
│   └── api/                # API service implementation
│       ├── src/            # Source files
│       └── test/           # Test files
├── libs/                    # Shared libraries (managed via git subtree)
│   └── common/             # Common utilities, DTOs, and entities
│       ├── database/       # Database configurations and migrations
│       ├── microservice-client/  # Inter-service communication
│       └── ...             # Other shared modules
├── webpack/                 # Webpack configurations for builds
├── docker-compose.yaml      # Development Docker setup
├── Dockerfile              # Production Docker image
├── nest-cli.json           # NestJS CLI configuration
├── package.json            # Dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

**Note:** Other microservices (upload, discovery, offering, etc.) have their own separate repositories with similar structures.

## Troubleshooting

### Common Issues

#### Migration Errors

If you encounter migration errors:

1. Check database connection in your `.env` file
2. Ensure PostgreSQL is running (via Docker or locally)
3. Verify migration files in `libs/common/src/database/migration/`
4. Run `npm run migration:show` to check migration status

#### Port Already in Use

If port 3000 is already in use:

```bash
# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change the port in your environment variables
```

#### Docker Issues

```bash
# Stop all containers
docker-compose down

# Remove volumes and rebuild
docker-compose down -v
docker-compose up --build -d
```

### TypeORM Tips

- After adding a new column to an entity, always create and run a migration
- Use descriptive names for migrations: `npm run migration:create --name=add-user-profile-fields`
- Review generated migrations before running them
- Never modify migration files after they've been committed and run in production

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Documentation](https://typeorm.io)
- [Docker Documentation](https://docs.docker.com)
- [Kafka Documentation](https://kafka.apache.org/documentation)

## Environment Variables

For detailed environment variable configuration, refer to the [Environment Variables Documentation](https://docs.getapp.sh/docs/category/environment-variables).


## Contributing

When contributing to this repository:

1. Create a feature branch from `develop`
2. Make your changes and ensure tests pass
3. If modifying database entities, create and test migrations
4. If updating shared libs, push changes to the libs repository
5. Submit a pull request with a clear description of changes


## Support

For issues and questions, please contact the development team or create an issue in the repository.

---

**Last Updated:** December 2025
