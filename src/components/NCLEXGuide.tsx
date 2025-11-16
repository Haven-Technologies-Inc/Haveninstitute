import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { BookOpen, Info } from 'lucide-react';

export function NCLEXGuide() {
  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="size-5 text-blue-600" />
          <CardTitle>Understanding the NCLEX-RN Test Plan</CardTitle>
        </div>
        <CardDescription>
          The NCLEX-RN uses a test plan based on Client Needs categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Category 1 */}
          <div>
            <h4 className="mb-3 flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">Category 1</Badge>
              Safe and Effective Care Environment
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-4">
              <div className="border-l-4 border-blue-500 pl-3 py-2 bg-white rounded">
                <p className="mb-1">Management of Care</p>
                <Badge variant="outline">17-23% of test</Badge>
                <p className="text-gray-600 mt-1">Delegation, prioritization, ethical/legal issues</p>
              </div>
              <div className="border-l-4 border-green-500 pl-3 py-2 bg-white rounded">
                <p className="mb-1">Safety and Infection Control</p>
                <Badge variant="outline">9-15% of test</Badge>
                <p className="text-gray-600 mt-1">Standard precautions, error prevention, safe equipment use</p>
              </div>
            </div>
          </div>

          {/* Category 2 */}
          <div>
            <h4 className="mb-3 flex items-center gap-2">
              <Badge className="bg-yellow-100 text-yellow-800">Category 2</Badge>
              Health Promotion and Maintenance
            </h4>
            <div className="ml-4">
              <div className="border-l-4 border-yellow-500 pl-3 py-2 bg-white rounded">
                <Badge variant="outline">6-12% of test</Badge>
                <p className="text-gray-600 mt-1">Growth & development, disease prevention, lifestyle choices, health screening</p>
              </div>
            </div>
          </div>

          {/* Category 3 */}
          <div>
            <h4 className="mb-3 flex items-center gap-2">
              <Badge className="bg-purple-100 text-purple-800">Category 3</Badge>
              Psychosocial Integrity
            </h4>
            <div className="ml-4">
              <div className="border-l-4 border-purple-500 pl-3 py-2 bg-white rounded">
                <Badge variant="outline">6-12% of test</Badge>
                <p className="text-gray-600 mt-1">Coping mechanisms, mental health, therapeutic communication, crisis intervention</p>
              </div>
            </div>
          </div>

          {/* Category 4 */}
          <div>
            <h4 className="mb-3 flex items-center gap-2">
              <Badge className="bg-red-100 text-red-800">Category 4</Badge>
              Physiological Integrity
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-4">
              <div className="border-l-4 border-indigo-500 pl-3 py-2 bg-white rounded">
                <p className="mb-1">Basic Care and Comfort</p>
                <Badge variant="outline">6-12% of test</Badge>
                <p className="text-gray-600 mt-1">ADLs, nutrition, mobility, elimination</p>
              </div>
              <div className="border-l-4 border-pink-500 pl-3 py-2 bg-white rounded">
                <p className="mb-1">Pharmacological Therapies</p>
                <Badge variant="outline">12-18% of test</Badge>
                <p className="text-gray-600 mt-1">Medications, IV therapy, dosage calculations</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-3 py-2 bg-white rounded">
                <p className="mb-1">Reduction of Risk Potential</p>
                <Badge variant="outline">9-15% of test</Badge>
                <p className="text-gray-600 mt-1">Lab values, diagnostic tests, monitoring for complications</p>
              </div>
              <div className="border-l-4 border-red-500 pl-3 py-2 bg-white rounded">
                <p className="mb-1">Physiological Adaptation</p>
                <Badge variant="outline">11-17% of test</Badge>
                <p className="text-gray-600 mt-1">Illness management, medical emergencies, pathophysiology</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-2">
              <Info className="size-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-900 mb-1">NurseHaven CAT Testing</p>
                <p className="text-blue-800">
                  Our Computer Adaptive Testing mirrors the real NCLEX by selecting questions from all 8 subcategories 
                  based on your ability level and performance, ensuring you're prepared for every section.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
