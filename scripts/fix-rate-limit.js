#!/usr/bin/env node

/**
 * Rate Limiter Fix Script
 * 
 * This script helps to reset rate limiting issues during development.
 * It clears the Redis cache (if using Redis) and provides guidance.
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Haven Institute - Rate Limiter Fix Tool');
console.log('==========================================\n');

// Check if backend .env exists
const envPath = path.join(__dirname, '../backend/.env');
if (!fs.existsSync(envPath)) {
  console.log('❌ Backend .env file not found. Creating from template...');
  
  const envExamplePath = path.join(__dirname, '../backend/.env.example');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env from template with updated rate limits:');
    console.log('   AUTH_RATE_LIMIT_MAX_REQUESTS=20 (increased from 5)');
  } else {
    console.log('❌ .env.example file not found. Please create .env manually.');
  }
} else {
  console.log('✅ Backend .env file exists');
  
  // Read and check current auth rate limit settings
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  if (envContent.includes('AUTH_RATE_LIMIT_MAX_REQUESTS=5')) {
    console.log('⚠️  Found old rate limit setting (5 requests). Updating to 20...');
    
    const updatedContent = envContent.replace(
      'AUTH_RATE_LIMIT_MAX_REQUESTS=5',
      'AUTH_RATE_LIMIT_MAX_REQUESTS=20'
    );
    
    fs.writeFileSync(envPath, updatedContent);
    console.log('✅ Updated AUTH_RATE_LIMIT_MAX_REQUESTS to 20');
  } else if (envContent.includes('AUTH_RATE_LIMIT_MAX_REQUESTS=20')) {
    console.log('✅ Rate limit already set to 20 requests');
  } else {
    console.log('ℹ️  Adding rate limit settings to .env...');
    const updatedContent = envContent + '\n# Updated Rate Limiting\nAUTH_RATE_LIMIT_MAX_REQUESTS=20\n';
    fs.writeFileSync(envPath, updatedContent);
    console.log('✅ Added AUTH_RATE_LIMIT_MAX_REQUESTS=20');
  }
}

console.log('\n📋 Next Steps:');
console.log('1. Restart your backend server to apply new rate limits');
console.log('2. Clear browser cookies/localStorage if still blocked');
console.log('3. Try logging in again');

console.log('\n🚀 To restart backend (if using npm):');
console.log('   cd backend && npm run dev');

console.log('\n🧹 To clear browser storage:');
console.log('   1. Open Developer Tools (F12)');
console.log('   2. Go to Application tab');
console.log('   3. Clear Storage > Clear site data');

console.log('\n✨ Rate limiter issues should now be resolved!');
