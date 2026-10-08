#!/bin/bash
# Auto Deploy Script for E-Sekolah VPS Server
echo "========================================="
echo "   Auto Deploying E-Sekolah Server..."
echo "========================================="

echo "[1/4] Pulling latest code from Git..."
git pull origin main

echo "[2/4] Installing client dependencies..."
cd client
npm install

echo "[3/4] Building Vite production assets..."
npm run build
cd ..

echo "[4/4] Restarting PM2 process..."
pm2 restart all

echo "========================================="
echo "   Deploy Finished Successfully!"
echo "========================================="
