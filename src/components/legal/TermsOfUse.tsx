import { X } from 'lucide-react';

interface TermsOfUseProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsOfUse({ isOpen, onClose }: TermsOfUseProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Terms of Use</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 prose prose-sm dark:prose-invert max-w-none">
          <p className="text-sm text-gray-500 mb-4">Last Updated: December 26, 2024</p>

          <p>
            Welcome to Haven Institute. These Terms of Use ("Terms") govern your access to and use of the Haven Institute 
            NCLEX preparation platform operated by Haven Technologies Inc., a company registered in Washington State. 
            By creating an account or using our services, you agree to be bound by these Terms.
          </p>

          <h3>1. Acceptance of Terms</h3>
          <p>
            By accessing or using Haven Institute's services, you acknowledge that you have read, understood, and agree 
            to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use our services.
          </p>

          <h3>2. Eligibility</h3>
          <p>You must meet the following requirements to use our services:</p>
          <ul>
            <li>Be at least 18 years of age</li>
            <li>Be a nursing student or graduate preparing for the NCLEX examination</li>
            <li>Provide accurate and complete registration information</li>
            <li>Have the legal capacity to enter into a binding agreement</li>
          </ul>

          <h3>3. Account Registration and Security</h3>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities 
            that occur under your account. You agree to:
          </p>
          <ul>
            <li>Provide accurate, current, and complete information during registration</li>
            <li>Update your information to keep it accurate and current</li>
            <li>Notify us immediately of any unauthorized access or security breach</li>
            <li>Not share your account credentials with others</li>
            <li>Not create multiple accounts or accounts for others without authorization</li>
          </ul>

          <h3>4. Services Description</h3>
          <p>Haven Institute provides:</p>
          <ul>
            <li>NCLEX-RN and NCLEX-PN examination preparation materials</li>
            <li>AI-powered adaptive learning and testing</li>
            <li>Practice questions and simulated examinations</li>
            <li>Study resources, flashcards, and educational content</li>
            <li>Progress tracking and performance analytics</li>
          </ul>

          <h3>5. Educational Disclaimer</h3>
          <p>
            <strong>Important:</strong> Haven Institute is an educational preparation service. We do not guarantee that 
            you will pass the NCLEX examination. Success on the NCLEX depends on many factors, including your individual 
            preparation, nursing education, and test-taking abilities. Our materials are supplementary to, not a 
            replacement for, your formal nursing education.
          </p>

          <h3>6. Intellectual Property Rights</h3>
          <p>
            All content on Haven Institute, including but not limited to text, graphics, logos, images, audio, video, 
            software, and the compilation thereof, is the property of Haven Technologies Inc. or its content suppliers 
            and is protected by United States and international copyright laws.
          </p>
          <p>You may not:</p>
          <ul>
            <li>Copy, reproduce, distribute, or create derivative works from our content</li>
            <li>Reverse engineer, decompile, or disassemble any software</li>
            <li>Remove any copyright or proprietary notices</li>
            <li>Share, sell, or transfer your account access to others</li>
            <li>Use our content for commercial purposes without written permission</li>
          </ul>

          <h3>7. Acceptable Use Policy</h3>
          <p>You agree not to:</p>
          <ul>
            <li>Use our services for any unlawful purpose</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Post or transmit any harmful, offensive, or inappropriate content</li>
            <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
            <li>Interfere with or disrupt the integrity or performance of our services</li>
            <li>Use automated systems (bots, scrapers) to access our services</li>
            <li>Share exam questions or answers outside the platform</li>
            <li>Engage in any form of academic dishonesty or cheating</li>
          </ul>

          <h3>8. Payment Terms</h3>
          <p>
            Certain features of Haven Institute require payment. By purchasing a subscription or service:
          </p>
          <ul>
            <li>You agree to pay all fees and charges associated with your account</li>
            <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
            <li>Refunds are subject to our refund policy</li>
            <li>We reserve the right to change pricing with reasonable notice</li>
          </ul>

          <h3>9. Refund Policy</h3>
          <p>
            We offer a 7-day money-back guarantee for new subscriptions. After 7 days, refunds are granted at our 
            discretion. To request a refund, contact us at privacy@havenstudy.com.
          </p>

          <h3>10. Termination</h3>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason, 
            including if you breach these Terms. Upon termination, your right to use our services will immediately cease.
          </p>

          <h3>11. Disclaimer of Warranties</h3>
          <p>
            OUR SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR 
            IMPLIED. WE DO NOT WARRANT THAT OUR SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE.
          </p>

          <h3>12. Limitation of Liability</h3>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY WASHINGTON STATE AND FEDERAL LAW, HAVEN TECHNOLOGIES INC. SHALL NOT BE 
            LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, 
            DATA, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF OUR SERVICES.
          </p>

          <h3>13. Indemnification</h3>
          <p>
            You agree to indemnify and hold harmless Haven Technologies Inc. and its officers, directors, employees, 
            and agents from any claims, damages, losses, liabilities, and expenses arising out of your use of our 
            services or violation of these Terms.
          </p>

          <h3>14. Governing Law</h3>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the State of Washington, 
            United States, without regard to its conflict of law provisions. Any disputes arising from these Terms 
            shall be resolved in the state or federal courts located in Washington State.
          </p>

          <h3>15. Dispute Resolution</h3>
          <p>
            Before filing any legal claim, you agree to first contact us at privacy@havenstudy.com to attempt to 
            resolve the dispute informally. If the dispute cannot be resolved informally within 30 days, either 
            party may pursue formal legal proceedings.
          </p>

          <h3>16. Changes to Terms</h3>
          <p>
            We reserve the right to modify these Terms at any time. We will notify users of material changes by 
            posting the updated Terms on our platform and updating the "Last Updated" date. Your continued use of 
            our services after changes are posted constitutes acceptance of the modified Terms.
          </p>

          <h3>17. Severability</h3>
          <p>
            If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited 
            or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
          </p>

          <h3>18. Entire Agreement</h3>
          <p>
            These Terms, together with our Privacy Policy, constitute the entire agreement between you and Haven 
            Technologies Inc. regarding your use of our services and supersede any prior agreements.
          </p>

          <h3>19. Contact Information</h3>
          <p>
            For questions about these Terms of Use, please contact us at:
          </p>
          <p>
            <strong>Haven Technologies Inc.</strong><br />
            Email: <a href="mailto:privacy@havenstudy.com" className="text-blue-600">privacy@havenstudy.com</a><br />
            State of Registration: Washington, United States
          </p>

          <h3>20. Acknowledgment</h3>
          <p>
            BY CREATING AN ACCOUNT, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF USE, UNDERSTAND THEM, AND 
            AGREE TO BE BOUND BY THEM.
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
