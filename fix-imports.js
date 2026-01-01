const fs = require('fs');
const path = require('path');

// List of files to fix
const filesToFix = [
  'src/routes/mfa.routes.ts',
  'src/routes/practice.routes.ts',
  'src/routes/question.routes.ts',
  'src/routes/search.routes.ts',
  'src/routes/stripe.routes.ts',
  'src/routes/studyMaterial.routes.ts',
  'src/routes/subscription.routes.ts',
  'src/routes/upload.routes.ts',
  'src/routes/systemSettings.routes.ts',
  'src/routes/studyPlanner.routes.ts',
  'src/routes/settings.routes.ts',
  'src/routes/studyGroup.routes.ts',
  'src/routes/security.routes.ts',
  'src/routes/progress.routes.ts',
  'src/routes/quiz.routes.ts',
  'src/routes/oauth.routes.ts',
  'src/routes/notification.routes.ts',
  'src/routes/flashcard.routes.ts',
  'src/routes/gamification.routes.ts',
  'src/routes/book.routes.ts',
  'src/routes/cat.routes.ts',
  'src/routes/analytics.routes.ts',
  'src/routes/auth.routes.ts',
  'src/routes/admin.routes.ts',
  'src/routes/ai.routes.ts'
];

const backendPath = 'C:/Users/adeen/OneDrive/Desktop/Haven Institute/Haveninstitute/backend';

filesToFix.forEach(file => {
  const filePath = path.join(backendPath, file);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix middleware/auth imports
    content = content.replace(/from '\.\.\/middleware\/auth'/g, "from '../middleware/authenticate'");
    
    // Fix middleware/rateLimit imports
    content = content.replace(/from '\.\.\/middleware\/rateLimit'/g, "from '../middleware/rateLimiter'");
    
    // Fix rateLimit usage
    content = content.replace(/rateLimit\(/g, "rateLimiter(");
    
    // Fix database/pool imports
    content = content.replace(/from '\.\.\/database\/pool'/g, "from '../config/database'");
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed imports in: ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});

console.log('Import fixes completed!');
