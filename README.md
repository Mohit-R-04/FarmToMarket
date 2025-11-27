# FarmToMarket

A full-stack application with a Spring Boot backend and React frontend.

## Prerequisites

Before running this project, ensure you have the following installed:

- **Java 21** (for backend)
- **Maven 3.6+** (for backend)
- **Node.js 18+** and **Yarn** or **npm** (for frontend)
- **PostgreSQL** (or access to the configured Neon database)

## Project Structure

```
FarmToMarket/
├── backend/          # Spring Boot application (Java 21)
└── frontend/         # React + TypeScript + Vite application
```

## Running the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Build and run the Spring Boot application:
   ```bash
   # Using Maven wrapper (recommended)
   ./mvnw spring-boot:run
   
   # Or if you have Maven installed globally
   mvn spring-boot:run
   ```

3. The backend will start on `http://localhost:8080` (default Spring Boot port)

### Backend Configuration

The backend is configured to use a PostgreSQL database (Neon). The database connection details are in `backend/src/main/resources/application.properties`.

**Note**: Make sure the database credentials in `application.properties` are correct and the database is accessible.

## Running the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   # Using Yarn (recommended, as yarn.lock exists)
   yarn install
   
   # Or using npm
   npm install
   ```

3. Start the development server:
   ```bash
   yarn dev
   # Or
   npm run dev
   ```

4. The frontend will start on `http://localhost:5173` (default Vite port)

## Running Both Services

You'll need to run both the backend and frontend in separate terminal windows:

### Terminal 1 - Backend:
```bash
cd backend
./mvnw spring-boot:run
```

### Terminal 2 - Frontend:
```bash
cd frontend
yarn install  # Only needed once
yarn dev
```

## Additional Commands

### Backend
- **Build**: `./mvnw clean package`
- **Run tests**: `./mvnw test`

### Frontend
- **Build for production**: `yarn build`
- **Preview production build**: `yarn preview`
- **Lint**: `yarn lint`

## Troubleshooting

1. **Backend won't start**: 
   - Check if Java 21 is installed: `java -version`
   - Verify database connection in `application.properties`
   - Check if port 8080 is available

2. **Frontend won't start**:
   - Make sure Node.js is installed: `node --version`
   - Delete `node_modules` and reinstall: `rm -rf node_modules && yarn install`
   - Check if port 5173 is available

3. **Database connection issues**:
   - Verify the PostgreSQL connection string in `application.properties`
   - Ensure the database server is accessible
   - Check network/firewall settings

## Technology Stack

### Backend
- Spring Boot 3.5.5
- Java 21
- Spring Data JPA
- PostgreSQL
- Maven

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Clerk (Authentication)
- Radix UI components

