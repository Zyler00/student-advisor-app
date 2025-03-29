// build-vercel.mjs
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Starting build process...');

console.log('Running Vite build...');
execSync('npx vite build', { stdio: 'inherit' });

console.log('Build completed successfully!');
