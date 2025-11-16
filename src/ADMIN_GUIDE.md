# NurseHaven Admin Dashboard - Complete Guide

## 🎯 Overview

The NurseHaven Admin Dashboard is a comprehensive content management system for uploading, managing, and analyzing NCLEX practice questions. It supports multiple file formats, automated question parsing, and detailed analytics.

---

## 🚀 Key Features

### 1. **Question Upload System**

#### **Supported File Formats:**
- **PDF** (.pdf)
- **Microsoft Word** (.doc, .docx)  
- **Microsoft Excel** (.xls, .xlsx)

#### **Upload Methods:**

##### **A. Bulk File Upload**
- Upload files containing multiple questions
- Automatic parsing and categorization
- Preview before saving to database
- Supports up to 10MB per file

##### **B. Manual Entry**
- Add individual questions through web form
- Full control over all question parameters
- Real-time validation
- Instant save to database

---

## 📝 File Format Guidelines

### **Excel Format:**
```
Column A: Question Text
Column B: Option A
Column C: Option B
Column D: Option C
Column E: Option D
Column F: Correct Answer (1, 2, 3, or 4)
Column G: Explanation/Rationale
Column H: (Optional) Difficulty Level
```

**Example Excel Row:**
```
A: "A nurse is preparing to administer digoxin..."
B: "Blood pressure"
C: "Apical pulse for 1 full minute"
D: "Respiratory rate"
E: "Temperature"
F: 2
G: "Digoxin affects heart rate and rhythm..."
H: medium
```

### **Word/PDF Format:**
```
Question: [Question text here]

Options:
A) [First option]
B) [Second option]
C) [Third option]
D) [Fourth option]

Answer: B

Explanation: [Detailed explanation here]

Difficulty: Medium
Category: pharmacological-therapies

---
[Next question starts here]
```

**Important Formatting Rules:**
- Use clear separators between questions (--- or blank lines)
- Label sections clearly: "Question:", "Options:", "Answer:", "Explanation:"
- Answer should be a letter (A, B, C, D) or number (1, 2, 3, 4)
- One blank line between sections

---

## 🏷️ NCLEX Categories

All questions must be assigned to one of the **8 official NCLEX subcategories:**

### **1. Safe and Effective Care Environment**
- **Management of Care** (`management-of-care`)
  - Delegation, prioritization, ethical/legal issues
  - 17-23% of NCLEX exam
  
- **Safety and Infection Control** (`safety-infection-control`)
  - Standard precautions, error prevention, equipment safety
  - 9-15% of NCLEX exam

### **2. Health Promotion and Maintenance** (`health-promotion-maintenance`)
- Growth & development, disease prevention, health screening
- 6-12% of NCLEX exam

### **3. Psychosocial Integrity** (`psychosocial-integrity`)
- Mental health, coping mechanisms, crisis intervention
- 6-12% of NCLEX exam

### **4. Physiological Integrity**
- **Basic Care and Comfort** (`basic-care-comfort`)
  - ADLs, nutrition, mobility, elimination
  - 6-12% of NCLEX exam
  
- **Pharmacological and Parenteral Therapies** (`pharmacological-therapies`)
  - Medications, IV therapy, dosage calculations
  - 12-18% of NCLEX exam
  
- **Reduction of Risk Potential** (`reduction-risk-potential`)
  - Lab values, diagnostic tests, monitoring for complications
  - 9-15% of NCLEX exam
  
- **Physiological Adaptation** (`physiological-adaptation`)
  - Illness management, medical emergencies, pathophysiology
  - 11-17% of NCLEX exam

---

## 📊 Question Types

NurseHaven supports all NCLEX question formats:

### **1. Multiple Choice (Single Answer)**
- Most common NCLEX format
- 4 options, only 1 correct answer
- Standard A/B/C/D format

### **2. Select All That Apply (SATA)**
- Multiple correct answers possible
- Also known as "Multiple Response"
- Requires selecting ALL correct options

### **3. Fill in the Blank**
- Numerical or short text answer
- Common for dosage calculations
- Must provide exact answer

### **4. Ordered Response (Drag & Drop)**
- Steps must be in correct sequence
- Used for procedures and priority questions
- Order matters

### **5. Hot Spot (Image-Based)**
- Click on specific area of image
- Anatomy identification
- Injection site selection

### **6. Chart/Exhibit**
- Multiple tabs of patient information
- Requires analyzing clinical data
- Most complex question type

---

## 🎚️ Difficulty Levels

### **Easy**
- Basic recall and understanding
- Foundational nursing concepts
- Direct application of knowledge
- Target: 70%+ correct rate

### **Medium**
- Application and analysis
- Common clinical scenarios
- Requires critical thinking
- Target: 50-70% correct rate

### **Hard**
- Complex clinical situations
- Synthesis and evaluation
- Multiple correct considerations
- Target: 30-50% correct rate

---

## 🔄 Upload Workflow

### **Step 1: Select Upload Method**
1. Go to Admin Dashboard → Upload Questions tab
2. Choose "Bulk Upload" or "Manual Entry"

### **Step 2: Configure Settings**
1. Select **NCLEX Category** (required)
2. Select **Question Type** (required)
3. Select **Difficulty Level** (optional, defaults to medium)

### **Step 3: Upload File (Bulk Upload)**
1. Click "Choose File" or drag and drop
2. Supported formats: PDF, DOC, DOCX, XLS, XLSX
3. Maximum file size: 10MB
4. Click "Parse and Preview Questions"

### **Step 4: Review Parsed Questions**
1. System automatically extracts questions from file
2. Review each question for accuracy
3. Edit any fields if needed
4. Remove questions that didn't parse correctly

### **Step 5: Save to Database**
1. Click "Save All" to add questions to database
2. Questions are immediately available in the platform
3. Success confirmation shows number of questions saved

### **Alternative: Manual Entry**
1. Fill in question text
2. Add 2-6 answer options
3. Select correct answer(s)
4. Add explanation/rationale
5. Click "Save Question"

---

## 📋 Question Management

### **Search & Filter**
- **Search:** By question text or question ID
- **Filter by Category:** All 8 NCLEX categories
- **Filter by Status:** Active, Draft, Archived
- **Filter by Difficulty:** Easy, Medium, Hard

### **Question Status Types**

#### **Active**
- Visible to students
- Included in quizzes and CAT tests
- Contributes to analytics

#### **Draft**
- Not visible to students
- Under review or incomplete
- Can be edited without affecting users

#### **Archived**
- Removed from active rotation
- Preserved for historical data
- Can be reactivated if needed

### **Bulk Actions**
- Change status for multiple questions
- Export filtered questions
- Delete multiple questions (with confirmation)

### **Individual Question Actions**
- **View:** See complete question details
- **Edit:** Modify any field
- **Delete:** Remove permanently (with confirmation)
- **Change Status:** Activate, draft, or archive

---

## 📈 Admin Analytics

### **Platform Metrics**
- Total Questions in database
- Total Users registered
- Questions added this week
- Active users currently online
- Average student score across platform

### **Category Performance**
- Questions per category
- Average score by category
- Trend indicators (improving/declining)
- Category balance vs NCLEX percentages

### **Question Insights**
- **Most Difficult:** Lowest correct rate
- **Easiest:** Highest correct rate
- **Most Used:** Highest usage count
- **Newest:** Recently added questions

### **User Engagement**
- Daily active users
- Average session time
- Questions per user per day
- Quiz completion rate

### **Difficulty Distribution**
- Percentage of questions at each level
- Ensures balanced question bank
- Target: 30-40% easy, 40-50% medium, 20-30% hard

### **Upload Activity**
- Recent uploads timeline
- Questions added by date
- Uploader tracking
- Category distribution of new questions

---

## 🛠️ Backend Integration Requirements

When implementing the backend (recommended: Supabase):

### **Database Schema**

#### **Questions Table**
```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL,
  category VARCHAR(100) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  explanation TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'draft',
  times_used INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0
);
```

#### **Question Options Table**
```sql
CREATE TABLE question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  option_order INTEGER NOT NULL
);
```

#### **File Uploads Table**
```sql
CREATE TABLE file_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  questions_parsed INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'processing'
);
```

### **API Endpoints Needed**

#### **Upload & Parsing**
- `POST /api/admin/upload` - Upload file
- `POST /api/admin/parse` - Parse file content
- `POST /api/admin/questions/bulk` - Save multiple questions
- `POST /api/admin/questions/single` - Save single question

#### **Question Management**
- `GET /api/admin/questions` - List all questions (with filters)
- `GET /api/admin/questions/:id` - Get single question
- `PUT /api/admin/questions/:id` - Update question
- `DELETE /api/admin/questions/:id` - Delete question
- `PATCH /api/admin/questions/:id/status` - Change status

#### **Analytics**
- `GET /api/admin/analytics/overview` - Dashboard stats
- `GET /api/admin/analytics/categories` - Category performance
- `GET /api/admin/analytics/questions` - Question insights
- `GET /api/admin/analytics/users` - User engagement

### **File Parsing Libraries**

For production implementation:

**Excel Parsing:**
```javascript
import * as XLSX from 'xlsx';

async function parseExcel(file) {
  const workbook = XLSX.read(await file.arrayBuffer());
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet);
  return data.map(row => ({
    question: row['Question'],
    options: [row['Option A'], row['Option B'], row['Option C'], row['Option D']],
    correctAnswer: parseInt(row['Correct Answer']) - 1,
    explanation: row['Explanation']
  }));
}
```

**PDF Parsing:**
```javascript
import pdf from 'pdf-parse';

async function parsePDF(file) {
  const buffer = await file.arrayBuffer();
  const data = await pdf(Buffer.from(buffer));
  return parseQuestionsFromText(data.text);
}
```

**Word Parsing:**
```javascript
import mammoth from 'mammoth';

async function parseWord(file) {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ buffer });
  return parseQuestionsFromText(result.value);
}
```

---

## 🔐 Security & Permissions

### **Admin Access Control**
- Require admin role authentication
- Log all question modifications
- Track uploader for each question
- Audit trail for deletions

### **File Upload Security**
- Validate file types on server
- Scan uploaded files for malware
- Limit file size (10MB max)
- Sanitize parsed content

### **Data Validation**
- Ensure all required fields present
- Validate correct answer is within options range
- Check category exists in allowed list
- Verify question type is supported

---

## 📊 Best Practices

### **Question Writing**
1. **Clear and Concise:** Question stem should be direct
2. **Realistic:** Based on actual nursing scenarios
3. **Plausible Distractors:** Wrong answers should be reasonable
4. **Single Focus:** Test one concept per question
5. **Avoid Absolutes:** Rarely use "always" or "never"

### **Category Distribution**
- Match NCLEX percentages as closely as possible
- Pharmacology: 12-18% (largest category)
- Management of Care: 17-23% (second largest)
- Ensure minimum 6% for each category

### **Difficulty Balance**
- Easy: 30-40% (foundation building)
- Medium: 40-50% (most common)
- Hard: 20-30% (challenge questions)

### **Regular Maintenance**
- Review questions with <40% correct rate (may be flawed)
- Update questions with >95% correct rate (may be too easy)
- Archive outdated content
- Add new questions regularly (target: 50+ per week)

---

## 🆘 Troubleshooting

### **File Won't Parse**
- Check file format matches specification
- Ensure no merged cells in Excel
- Verify encoding (UTF-8 recommended)
- Try manual entry for problematic questions

### **Questions Missing After Upload**
- Check if saved as "draft" status
- Verify category selection was made
- Look in archived questions
- Check server logs for errors

### **Low Parse Success Rate**
- Review file format guidelines
- Use template file as reference
- Simplify formatting
- Consider manual entry for complex questions

---

## 📞 Support

For technical issues or questions:
- **Email:** admin@nursehaven.com
- **Documentation:** https://docs.nursehaven.com/admin
- **Support Portal:** https://support.nursehaven.com

---

**Last Updated:** November 2024
**Version:** 1.0.0
