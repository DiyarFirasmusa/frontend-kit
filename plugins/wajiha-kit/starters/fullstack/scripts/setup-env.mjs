// Creates .env.local from .env.example once. Works the same on Windows, macOS and Linux.
import { copyFileSync, existsSync } from 'node:fs';

if (existsSync('.env.local')) {
  console.log('.env.local already exists, nothing to do');
} else {
  copyFileSync('.env.example', '.env.local');
  console.log('created .env.local from .env.example');
}
