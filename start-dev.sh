#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📝 Shiori Notes App - Development Server${NC}"
echo "========================================"

# Function to cleanup processes on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping servers...${NC}"
    pkill -f "node server.js" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    echo "Please install npm (usually comes with Node.js)"
    exit 1
fi

echo -e "${BLUE}🔍 Checking dependencies...${NC}"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Installing root dependencies...${NC}"
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Installing backend dependencies...${NC}"
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
fi

echo -e "${GREEN}✅ Dependencies are ready${NC}"

# Start backend server
echo -e "${BLUE}🚀 Starting backend server...${NC}"
cd backend
node server.js &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend server started on http://localhost:3001${NC}"
else
    echo -e "${RED}❌ Failed to start backend server${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend server
echo -e "${BLUE}🚀 Starting frontend server...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 5

echo -e "${GREEN}✅ Development servers are running:${NC}"
echo -e "   📱 Frontend: ${BLUE}http://localhost:3000${NC}"
echo -e "   ⚙️  Backend:  ${BLUE}http://localhost:3001${NC}"
echo -e "   🔗 API:      ${BLUE}http://localhost:3001/api/notes${NC}"
echo
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"

# Keep script running and wait for user to stop
wait $BACKEND_PID $FRONTEND_PID

# Cleanup will be called automatically by the trap
