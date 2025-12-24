/**
 * Question Template Generator
 * Creates downloadable templates for each NextGen NCLEX question type
 */

import { type QuestionType, getQuestionTypeName } from '../types/nextGenNCLEX';

interface TemplateSection {
  title: string;
  description: string;
  fields: string[];
  example?: string;
}

const TEMPLATE_CONTENT: Record<QuestionType, TemplateSection[]> = {
  'multiple-choice': [
    {
      title: 'Question Information',
      description: 'Basic question metadata',
      fields: [
        'Category: [Select: Management of Care | Safety and Infection Control | Health Promotion | Psychosocial | Basic Care | Pharmacological | Risk Reduction | Physiological Adaptation]',
        'Difficulty: [Select: Easy | Medium | Hard]',
      ]
    },
    {
      title: 'Question Stem',
      description: 'The main question text',
      fields: ['Question: _______________________________________________'],
      example: 'Example: A nurse is caring for a client who has been prescribed metoprolol. Which assessment finding should the nurse report to the provider immediately?'
    },
    {
      title: 'Answer Options',
      description: 'Provide 4 options, mark the correct one with ✓',
      fields: [
        '[ ] Option A: _______________________________________',
        '[ ] Option B: _______________________________________',
        '[ ] Option C: _______________________________________',
        '[ ] Option D: _______________________________________',
      ],
      example: 'Example:\n[✓] Option A: Heart rate of 48 bpm\n[ ] Option B: Blood pressure of 128/78 mmHg\n[ ] Option C: Respiratory rate of 16 breaths/min\n[ ] Option D: Temperature of 98.6°F'
    },
    {
      title: 'Rationale',
      description: 'Explain why the correct answer is correct and why others are incorrect',
      fields: ['Rationale: _______________________________________________']
    }
  ],
  
  'select-all': [
    {
      title: 'Question Information',
      description: 'Basic question metadata',
      fields: [
        'Category: [Select: Management of Care | Safety and Infection Control | Health Promotion | Psychosocial | Basic Care | Pharmacological | Risk Reduction | Physiological Adaptation]',
        'Difficulty: [Select: Easy | Medium | Hard]',
      ]
    },
    {
      title: 'Question Stem',
      description: 'The main question text (include "Select all that apply")',
      fields: ['Question: _______________________________________________'],
      example: 'Example: A nurse is assessing a client with heart failure. Which findings would the nurse expect? Select all that apply.'
    },
    {
      title: 'Answer Options',
      description: 'Provide 5-7 options, mark ALL correct ones with ✓',
      fields: [
        '[ ] Option A: _______________________________________',
        '[ ] Option B: _______________________________________',
        '[ ] Option C: _______________________________________',
        '[ ] Option D: _______________________________________',
        '[ ] Option E: _______________________________________',
        '[ ] Option F: _______________________________________',
      ],
      example: 'Example:\n[✓] Option A: Peripheral edema\n[✓] Option B: Crackles in lungs\n[ ] Option C: Decreased urine output\n[✓] Option D: Weight gain\n[ ] Option E: Bradycardia'
    },
    {
      title: 'Rationale',
      description: 'Explain each correct and incorrect option',
      fields: ['Rationale: _______________________________________________']
    }
  ],
  
  'ordered-response': [
    {
      title: 'Question Information',
      description: 'Basic question metadata',
      fields: [
        'Category: [Select from NCLEX categories]',
        'Difficulty: [Select: Easy | Medium | Hard]',
      ]
    },
    {
      title: 'Question Stem',
      description: 'The main question asking for correct sequence',
      fields: ['Question: _______________________________________________'],
      example: 'Example: Place the steps for donning personal protective equipment (PPE) in the correct order.'
    },
    {
      title: 'Items (in CORRECT order)',
      description: 'List items in the correct sequence. System will shuffle for students.',
      fields: [
        '1. _______________________________________',
        '2. _______________________________________',
        '3. _______________________________________',
        '4. _______________________________________',
        '5. _______________________________________',
      ],
      example: 'Example:\n1. Perform hand hygiene\n2. Don gown\n3. Don mask\n4. Don eye protection\n5. Don gloves'
    },
    {
      title: 'Rationale',
      description: 'Explain why this order is correct',
      fields: ['Rationale: _______________________________________________']
    }
  ],
  
  'cloze-dropdown': [
    {
      title: 'Question Information',
      description: 'Basic question metadata',
      fields: [
        'Category: [Select from NCLEX categories]',
        'Difficulty: [Select: Easy | Medium | Hard]',
      ]
    },
    {
      title: 'Question Stem',
      description: 'Brief context for the fill-in-the-blank statement',
      fields: ['Question: _______________________________________________']
    },
    {
      title: 'Template Text',
      description: 'Use {{1}}, {{2}}, etc. to mark dropdown locations',
      fields: ['Template: _______________________________________________'],
      example: 'Example: The nurse should administer {{1}} insulin at a {{2}} angle to ensure proper absorption.'
    },
    {
      title: 'Dropdown Options',
      description: 'For each blank, list options and mark correct with ✓',
      fields: [
        'Blank {{1}} Options:',
        '  [✓] Option 1: _____________',
        '  [ ] Option 2: _____________',
        '  [ ] Option 3: _____________',
        '',
        'Blank {{2}} Options:',
        '  [ ] Option 1: _____________',
        '  [✓] Option 2: _____________',
        '  [ ] Option 3: _____________',
      ]
    },
    {
      title: 'Rationale',
      description: 'Explain the correct answers',
      fields: ['Rationale: _______________________________________________']
    }
  ],
  
  'matrix': [
    {
      title: 'Question Information',
      description: 'Basic question metadata',
      fields: [
        'Category: [Select from NCLEX categories]',
        'Difficulty: [Select: Easy | Medium | Hard]',
      ]
    },
    {
      title: 'Question Stem',
      description: 'The main question for the matrix',
      fields: ['Question: _______________________________________________'],
      example: 'Example: For each medication, identify whether the nurse should administer or hold the dose.'
    },
    {
      title: 'Matrix Structure',
      description: 'Define rows (items) and columns (options)',
      fields: [
        'Column Headers: _____________ | _____________',
        '',
        'Row 1: _____________ [Mark correct column]',
        'Row 2: _____________ [Mark correct column]',
        'Row 3: _____________ [Mark correct column]',
        'Row 4: _____________ [Mark correct column]',
      ],
      example: 'Example:\nColumn Headers: Administer | Hold\n\nRow 1: Metoprolol      [ ] | [✓]\nRow 2: Aspirin         [✓] | [ ]\nRow 3: Lisinopril      [ ] | [✓]\nRow 4: Furosemide      [ ] | [✓]'
    },
    {
      title: 'Rationale',
      description: 'Explain each row selection',
      fields: ['Rationale: _______________________________________________']
    }
  ],
  
  'highlight': [
    {
      title: 'Question Information',
      description: 'Basic question metadata',
      fields: [
        'Category: [Select from NCLEX categories]',
        'Difficulty: [Select: Easy | Medium | Hard]',
      ]
    },
    {
      title: 'Question Stem',
      description: 'Brief context',
      fields: ['Question: _______________________________________________']
    },
    {
      title: 'Instruction',
      description: 'What students should highlight',
      fields: ['Instruction: _______________________________________________'],
      example: 'Example: Highlight the findings that require immediate intervention.'
    },
    {
      title: 'Passage',
      description: 'The text passage. Use [brackets] around highlightable segments.',
      fields: ['Passage:\n_______________________________________________\n_______________________________________________'],
      example: 'Example: The client\'s vital signs are: [BP 88/52 mmHg], HR 92 bpm, [RR 28 breaths/min], SpO2 94%. The client reports [chest pain rated 8/10].'
    },
    {
      title: 'Correct Highlights',
      description: 'List the segments that should be highlighted (use ✓)',
      fields: [
        '[✓] Segment 1: _____________',
        '[ ] Segment 2: _____________',
        '[✓] Segment 3: _____________',
      ]
    },
    {
      title: 'Rationale',
      description: 'Explain why these findings are significant',
      fields: ['Rationale: _______________________________________________']
    }
  ],
  
  'bow-tie': [
    {
      title: 'Question Information',
      description: 'Basic question metadata',
      fields: [
        'Category: [Select from NCLEX categories]',
        'Difficulty: [Select: Easy | Medium | Hard]',
      ]
    },
    {
      title: 'Question Stem',
      description: 'Brief overview',
      fields: ['Question: _______________________________________________']
    },
    {
      title: 'Clinical Scenario',
      description: 'Detailed client scenario',
      fields: ['Scenario:\n_______________________________________________'],
      example: 'Example: A 72-year-old client is admitted with confusion, lethargy, and irregular heart rhythm. Lab results show potassium 6.8 mEq/L.'
    },
    {
      title: 'Center Condition',
      description: 'The diagnosis/condition in the center',
      fields: ['Condition: _____________'],
      example: 'Example: Hyperkalemia'
    },
    {
      title: 'Left Side - Risk Factors/Causes',
      description: 'List 6 options, mark 2 correct with ✓',
      fields: [
        'Label: Risk Factors/Causes',
        'Select: 2 correct answers',
        '',
        '[✓] Option 1: _____________',
        '[ ] Option 2: _____________',
        '[✓] Option 3: _____________',
        '[ ] Option 4: _____________',
        '[ ] Option 5: _____________',
        '[ ] Option 6: _____________',
      ]
    },
    {
      title: 'Right Side - Interventions/Actions',
      description: 'List 6 options, mark 3 correct with ✓',
      fields: [
        'Label: Priority Interventions',
        'Select: 3 correct answers',
        '',
        '[✓] Option 1: _____________',
        '[ ] Option 2: _____________',
        '[✓] Option 3: _____________',
        '[✓] Option 4: _____________',
        '[ ] Option 5: _____________',
        '[ ] Option 6: _____________',
      ]
    },
    {
      title: 'Rationale',
      description: 'Explain the clinical reasoning',
      fields: ['Rationale: _______________________________________________']
    }
  ],
  
  'hot-spot': [
    {
      title: 'Question Information',
      description: 'Basic question metadata',
      fields: [
        'Category: [Select from NCLEX categories]',
        'Difficulty: [Select: Easy | Medium | Hard]',
      ]
    },
    {
      title: 'Question Stem',
      description: 'What students should identify on the image',
      fields: ['Question: _______________________________________________'],
      example: 'Example: Click on the area where the nurse should auscultate the mitral valve.'
    },
    {
      title: 'Image',
      description: 'Attach or describe the image',
      fields: [
        'Image File: _______________ (attach separately)',
        'Image Description: _______________________________________________',
      ]
    },
    {
      title: 'Correct Area(s)',
      description: 'Describe the correct clickable region(s)',
      fields: [
        'Correct Area 1: _____________ (coordinates or description)',
        'Correct Area 2: _____________ (if applicable)',
      ]
    },
    {
      title: 'Rationale',
      description: 'Explain why this location is correct',
      fields: ['Rationale: _______________________________________________']
    }
  ],
  
  'case-study': [
    {
      title: 'Question Information',
      description: 'Basic question metadata',
      fields: [
        'Category: [Select from NCLEX categories]',
        'Difficulty: [Select: Easy | Medium | Hard]',
      ]
    },
    {
      title: 'Case Scenario',
      description: 'Extended clinical scenario',
      fields: [
        'Scenario:\n_______________________________________________\n_______________________________________________\n_______________________________________________'
      ]
    },
    {
      title: 'Tab Information (Optional)',
      description: 'Additional data in tabs (labs, history, etc.)',
      fields: [
        'Tab 1 Title: _____________ Content: _____________',
        'Tab 2 Title: _____________ Content: _____________',
        'Tab 3 Title: _____________ Content: _____________',
      ]
    },
    {
      title: 'Sub-Questions',
      description: 'List 2-6 questions about this case',
      fields: [
        'Sub-Question 1:',
        '  Type: [Multiple Choice / Select All / Matrix / Ordered Response]',
        '  Question: _____________',
        '  Options: _____________',
        '  Correct: _____________',
        '',
        'Sub-Question 2:',
        '  Type: [Multiple Choice / Select All / Matrix / Ordered Response]',
        '  Question: _____________',
        '  Options: _____________',
        '  Correct: _____________',
      ]
    },
    {
      title: 'Overall Rationale',
      description: 'Explain the case and answers',
      fields: ['Rationale: _______________________________________________']
    }
  ]
};

/**
 * Generate and download a template file
 */
export function generateQuestionTemplate(
  questionType: QuestionType, 
  format: 'word' | 'pdf' | 'csv' | 'excel'
): void {
  const typeName = getQuestionTypeName(questionType);
  const sections = TEMPLATE_CONTENT[questionType];
  
  if (format === 'csv' || format === 'excel') {
    downloadCSVTemplate(questionType, typeName);
    return;
  }
  
  // Generate HTML content for Word/PDF
  const content = generateTemplateHTML(typeName, sections);
  
  if (format === 'word') {
    downloadAsWord(content, `${questionType}-template`);
  } else {
    downloadAsPDF(content, `${questionType}-template`);
  }
}

function generateTemplateHTML(typeName: string, sections: TemplateSection[]): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${typeName} Question Template</title>
  <style>
    body {
      font-family: 'Calibri', 'Arial', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
      line-height: 1.6;
      color: #333;
    }
    h1 {
      color: #1e40af;
      border-bottom: 3px solid #1e40af;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    h2 {
      color: #1e40af;
      margin-top: 30px;
      margin-bottom: 10px;
      font-size: 1.2em;
    }
    .section {
      margin-bottom: 30px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
    }
    .description {
      color: #64748b;
      font-style: italic;
      margin-bottom: 15px;
    }
    .field {
      margin: 8px 0;
      padding: 8px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
    }
    .example {
      margin-top: 15px;
      padding: 15px;
      background: #ecfdf5;
      border: 1px solid #86efac;
      border-radius: 4px;
      font-size: 0.9em;
    }
    .example-title {
      font-weight: bold;
      color: #166534;
      margin-bottom: 8px;
    }
    .instructions {
      background: #fef3c7;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .instructions h3 {
      color: #92400e;
      margin-top: 0;
    }
    .instructions ul {
      margin: 0;
      padding-left: 20px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <h1>📝 ${typeName} Question Template</h1>
  
  <div class="instructions">
    <h3>📋 Instructions</h3>
    <ul>
      <li>Fill in all required fields (marked with *)</li>
      <li>Use [✓] to mark correct answers</li>
      <li>Save this file and upload to the Question Management system</li>
      <li>You can create multiple questions by copying the template sections</li>
    </ul>
  </div>
  
  ${sections.map(section => `
    <div class="section">
      <h2>${section.title}</h2>
      <p class="description">${section.description}</p>
      ${section.fields.map(field => `<div class="field">${field}</div>`).join('')}
      ${section.example ? `
        <div class="example">
          <div class="example-title">Example:</div>
          <pre style="white-space: pre-wrap; margin: 0;">${section.example.replace('Example: ', '')}</pre>
        </div>
      ` : ''}
    </div>
  `).join('')}
  
  <div class="footer">
    <p>Haven Institute - NCLEX Prep Platform</p>
    <p>NextGen NCLEX Question Template</p>
  </div>
</body>
</html>
  `;
}

function downloadAsWord(htmlContent: string, filename: string): void {
  // Create Word document using HTML
  const blob = new Blob([`
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${filename}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
        </w:WordDocument>
      </xml>
      <![endif]-->
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `], { type: 'application/msword' });
  
  downloadBlob(blob, `${filename}.doc`);
}

function downloadAsPDF(htmlContent: string, filename: string): void {
  // For PDF, we'll create a printable HTML that users can print to PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  } else {
    // Fallback: download as HTML
    const blob = new Blob([htmlContent], { type: 'text/html' });
    downloadBlob(blob, `${filename}.html`);
    alert('Pop-up blocked. Please allow pop-ups to print as PDF, or use the downloaded HTML file.');
  }
}

function downloadCSVTemplate(questionType: QuestionType, typeName: string): void {
  let csvContent = '';
  
  if (questionType === 'multiple-choice') {
    csvContent = `Question Type,Category,Difficulty,Question Stem,Option A,Option B,Option C,Option D,Correct Answer (A/B/C/D),Rationale
multiple-choice,management-of-care,medium,"Example question here?","Option A text","Option B text","Option C text","Option D text",A,"Explanation here"
multiple-choice,pharmacological,hard,"Another question?","Answer 1","Answer 2","Answer 3","Answer 4",C,"Rationale here"`;
  } else if (questionType === 'select-all') {
    csvContent = `Question Type,Category,Difficulty,Question Stem,Option A,Option B,Option C,Option D,Option E,Option F,Correct Answers (comma separated),Rationale
select-all,physiological-adaptation,medium,"Select all that apply question?","Option A","Option B","Option C","Option D","Option E","Option F","A,B,D","Explanation"`;
  } else {
    csvContent = `Question Type,Category,Difficulty,Question Stem,Additional Data (JSON format),Rationale
${questionType},management-of-care,medium,"Question text here","{}","Rationale here"`;
  }
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${questionType}-bulk-template.csv`);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse uploaded template back to question object
 */
export function parseTemplateFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        if (file.name.endsWith('.csv')) {
          const questions = parseCSV(content);
          resolve(questions);
        } else {
          // For Word/HTML files, we'd need more complex parsing
          reject(new Error('Please use CSV format for bulk uploads'));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

function parseCSV(content: string): any[] {
  const lines = content.split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const questions: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Simple CSV parsing (doesn't handle all edge cases)
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    const cleanValues = values.map(v => v.replace(/^"|"$/g, '').trim());
    
    if (cleanValues.length >= headers.length - 1) {
      const question: any = {};
      headers.forEach((header, index) => {
        question[header.toLowerCase().replace(/ /g, '_')] = cleanValues[index] || '';
      });
      questions.push(question);
    }
  }
  
  return questions;
}

export default {
  generateQuestionTemplate,
  parseTemplateFile
};
