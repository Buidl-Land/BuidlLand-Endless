#!/bin/bash

echo "===== IdeaPulse: Starting clean Next.js server ====="

echo "1. Stopping any running Node.js processes..."
pkill -f node || echo "   No Node.js processes were running."

echo "2. Cleaning problematic Next.js cache files..."
node force-clean-cache.js

echo "3. Starting Next.js development server..."
yarn dev