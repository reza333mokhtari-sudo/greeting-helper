#!/usr/bin/env node
import { execSync } from 'child_process';

function checkCargo() {
  try {
    const version = execSync('cargo --version').toString().trim();
    console.log(`✅ Found Rust: ${version}`);
    return true;
  } catch (e) {
    console.error('❌ Error: Rust toolchain (cargo) not found.');
    console.error('\nTo fix this, please install Rust from: https://rustup.rs/');
    console.error('After installation, restart your terminal and try again.');
    process.exit(1);
  }
}

function runBuild() {
  checkCargo();
  console.log('🚀 Starting Tauri production build...');
  try {
    execSync('tauri build', { stdio: 'inherit' });
  } catch (e) {
    console.error('❌ Build failed.');
    process.exit(1);
  }
}

runBuild();
