const fs = require('fs');
const path = require('path');

// List of controller files to fix
const controllersToFix = [
  'src/controllers/flashcard.controller.ts',
  'src/controllers/practice.controller.ts',
  'src/controllers/settings.controller.ts'
];

const backendPath = 'C:/Users/adeen/OneDrive/Desktop/Haven Institute/Haveninstitute/backend';

controllersToFix.forEach(file => {
  const filePath = path.join(backendPath, file);
  
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add AuthRequest import if not present
    if (!content.includes('AuthRequest')) {
      content = content.replace(
        "import { Request, Response } from 'express';",
        "import { Request, Response } from 'express';\nimport { AuthRequest } from '../middleware/authenticate';"
      );
    }
    
    // Replace Request with AuthRequest in method signatures
    content = content.replace(/static async \w+\(req: Request,/g, match => match.replace('Request', 'AuthRequest'));
    
    // Also fix parameter types in function definitions
    content = content.replace(/static async \w+\(req: AuthRequest, res: Response\)/g, match => match);
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed controller: ${file}`);
  } else {
    console.log(`Controller not found: ${file}`);
  }
});

console.log('Controller fixes completed!');
