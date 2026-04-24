#!/bin/bash

echo "============================================"
echo "   👻 AI Ghost Kitchen Network Manager"
echo "   Starting Application..."
echo "============================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Project root
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# Check for .env
if [ ! -f .env ]; then
    echo -e "${RED}ERROR: .env file not found!${NC}"
    echo "Please create a .env file in the project root."
    exit 1
fi

# Load env
set -a
source .env
set +a

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

# Kill processes on ports
echo -e "${YELLOW}Cleaning up ports $BACKEND_PORT and $FRONTEND_PORT...${NC}"
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}Killing process(es) on port $port: $pids${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null
        sleep 1
    fi
}

kill_port $BACKEND_PORT
kill_port $FRONTEND_PORT

# Check PostgreSQL
echo -e "${BLUE}Checking PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${RED}PostgreSQL client not found. Please install PostgreSQL.${NC}"
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -q 2>/dev/null; then
    echo -e "${YELLOW}PostgreSQL is not running. Attempting to start...${NC}"
    if command -v brew &> /dev/null; then
        brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null
    fi
    sleep 2
    if ! pg_isready -q 2>/dev/null; then
        echo -e "${RED}Could not start PostgreSQL. Please start it manually.${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}PostgreSQL is running.${NC}"

# Create database and user if they don't exist
echo -e "${BLUE}Setting up database...${NC}"
psql postgres -c "CREATE USER ghostkitchen WITH PASSWORD 'ghostkitchen123';" 2>/dev/null
psql postgres -c "ALTER USER ghostkitchen CREATEDB;" 2>/dev/null
psql postgres -c "CREATE DATABASE ghostkitchen_db OWNER ghostkitchen;" 2>/dev/null
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE ghostkitchen_db TO ghostkitchen;" 2>/dev/null
echo -e "${GREEN}Database ready.${NC}"

# Install backend dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
cd "$PROJECT_DIR/backend"
npm install

# Run seed
echo -e "${BLUE}Seeding database with sample data...${NC}"
node seed.js
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Database seeded successfully!${NC}"
else
    echo -e "${RED}Seed failed. Check database connection.${NC}"
    exit 1
fi

# Install frontend dependencies
echo -e "${BLUE}Installing frontend dependencies...${NC}"
cd "$PROJECT_DIR/frontend"
npm install

# Start backend with nodemon for hot reload
echo -e "${GREEN}Starting backend on port $BACKEND_PORT...${NC}"
cd "$PROJECT_DIR/backend"
npx nodemon server.js &
BACKEND_PID=$!

# Wait for backend
sleep 3

# Start frontend with Vite (hot reload built-in)
echo -e "${GREEN}Starting frontend on port $FRONTEND_PORT...${NC}"
cd "$PROJECT_DIR/frontend"
npx vite --port $FRONTEND_PORT &
FRONTEND_PID=$!

sleep 2

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}   👻 Ghost Kitchen is RUNNING!${NC}"
echo -e "${GREEN}============================================${NC}"
echo -e "${BLUE}   Frontend:  http://localhost:$FRONTEND_PORT${NC}"
echo -e "${BLUE}   Backend:   http://localhost:$BACKEND_PORT${NC}"
echo -e "${BLUE}   Login:     admin@ghostkitchen.com / password123${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Trap to clean up on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down Ghost Kitchen...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    kill_port $BACKEND_PORT
    kill_port $FRONTEND_PORT
    echo -e "${GREEN}Goodbye! 👻${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait
wait
