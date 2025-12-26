import { X, FileText } from 'lucide-react';

interface TermsOfUseProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsOfUse({ isOpen, onClose }: TermsOfUseProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-0 sm:p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 w-full h-full sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-2xl sm:rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 sm:px-6 sm:py-5 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Terms of Use</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Last updated: December 26, 2024</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-6 sm:py-8">
          <div className="max-w-none space-y-6 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            
            <p className="text-justify">
              Welcome to Haven Institute. These Terms of Use ("Terms") govern your access to and use of the Haven Institute NCLEX preparation platform operated by Haven Technologies Inc., a company registered in Washington State. By creating an account or using our services, you agree to be bound by these Terms.
            </p>

            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">1. Acceptance of Terms</h3>
              <p className="text-justify">
                By accessing or using Haven Institute's services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not use our services.
              </p>
            </section>

            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">2. Eligibility</h3>
              <p className="text-justify mb-3">You must meet the following requirements to use our services:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Be at least 18 years of age</li>
                <li>Be a nursing student or graduate preparing for the NCLEX examination</li>
                <li>Provide accurate and complete registration information</li>
                <li>Have the legal capacity to enter into a binding agreement</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">3. Account Registration and Security</h3>
              <p className="text-justify mb-3">You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Update your information to keep it accurate and current</li>
                <li>Notify us immediately of any unauthorized access or security breach</li>
                <li>Not share your account credentials with others</li>
                <li>Not create multiple accounts or accounts for others without authorization</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">4. Services Description</h3>
              <p className="text-justify mb-3">Haven Institute provides:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>NCLEX-RN and NCLEX-PN examination preparation materials</li>
                <li>AI-powered adaptive learning and testing</li>
                <li>Practice questions and simulated examinations</li>
                <li>Study resources, flashcards, and educational content</li>
                <li>Progress tracking and performance analytics</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">5. Educational Disclaimer</h3>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-justify text-amber-800 dark:text-amber-200">
                  <span className="font-semibold">Important:</span> Haven Institute is an educational preparation service. We do not guarantee that you will pass the NCLEX examination. Success on the NCLEX depends on many factors, including your individual preparation, nursing education, and test-taking abilities. Our materials are supplementary to, not a replacement for, your formal nursing education.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">6. Intellectual Property Rights</h3>
              <p className="text-justify mb-3">
                All content on Haven Institute, including but not limited to text, graphics, logos, images, audio, video, software, and the compilation thereof, is the property of Haven Technologies Inc. or its content suppliers and is protected by United States and international copyright laws.
              </p>
              <p className="text-justify mb-3">You may not:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Copy, reproduce, distribute, or create derivative works from our content</li>
                <li>Reverse engineer, decompile, or disassemble any software</li>
                <li>Remove any copyright or proprietary notices</li>
                <li>Share, sell, or transfer your account access to others</li>
                <li>Use our content for commercial purposes without written permission</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">7. Acceptable Use Policy</h3>
              <p className="text-justify mb-3">You agree not to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use our services for any unlawful purpose</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Post or transmit any harmful, offensive, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Interfere with or disrupt the integrity or performance of our services</li>
                <li>Use automated systems (bots, scrapers) to access our services</li>
                <li>Share exam questions or answers outside the platform</li>
                <li>Engage in any form of academic dishonesty or cheating</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">8. Payment Terms</h3>
              <p className="text-justify mb-3">Certain features of Haven Institute require payment. By purchasing a subscription or service:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>You agree to pay all fees and charges associated with your account</li>
                <li>Subscriptions automatically renew unless cancelled before the renewal date</li>
                <li>Refunds are subject to our refund policy</li>
                <li>We reserve the right to change pricing with reasonable notice</li>
              </ul>
            </section>

            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">9. Refund Policy</h3>
              <p className="text-justify">
                We offer a 7-day money-back guarantee for new subscriptions. After 7 days, refunds are granted at our discretion. To request a refund, contact us at privacy@havenstudy.com.
              </p>
            </section>

            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">10. Termination</h3>
              <p className="text-justify">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use our services will immediately cease.
              </p>
            </section>

            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">11. Disclaimer of Warranties</h3>
              <p className="text-justify text-xs sm:text-sm uppercase tracking-wide">
                Our services are provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that our services will be uninterrupted, error-free, or completely secure.
              </p>
            </section>

            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">12. Limitation of Liability</h3>
              <p className="text-justify text-xs sm:text-sm uppercase tracking-wide">
                To the maximum extent permitted by Washington State and federal law, Haven Technologies Inc. shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or other intangible losses, resulting from your use of our services.
              </p>
            </section>

            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">13. Indemnification</h3>
              <p className="text-justify">
                You agree to indemnify and hold harmless Haven Technologies Inc. and its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising out of your use of our services or violation of these Terms.
              </p>
            </section>

            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">14. Governing Law</h3>
              <p className="text-justify">
                These Terms shall be governed by and construed in accordance with the laws of the State of Washington, United States, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be resolved in the state or federal courts located in Washington State.
              </p>
            </section>

            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">15. Dispute Resolution</h3>
              <p className="text-justify">
                Before filing any legal claim, you agree to first contact us at privacy@havenstudy.com to attempt to resolve the dispute informally. If the dispute cannot be resolved informally within 30 days, either party may pursue formal legal proceedings.
              </p>
            </section>

            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">16. Changes to Terms</h3>
              <p className="text-justify">
                We reserve the right to modify these Terms at any time. We will notify users of material changes by posting the updated Terms on our platform and updating the "Last Updated" date. Your continued use of our services after changes are posted constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">17. Severability</h3>
              <p className="text-justify">
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
              </p>
            </section>

            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">18. Entire Agreement</h3>
              <p className="text-justify">
                These Terms, together with our Privacy Policy, constitute the entire agreement between you and Haven Technologies Inc. regarding your use of our services and supersede any prior agreements.
              </p>
            </section>

            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">19. Contact Information</h3>
              <p className="text-justify mb-3">For questions about these Terms of Use, please contact us:</p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="font-medium text-gray-900 dark:text-white">Haven Technologies Inc.</p>
                <p>Email: <a href="mailto:privacy@havenstudy.com" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@havenstudy.com</a></p>
                <p>State of Registration: Washington, United States</p>
              </div>
            </section>

            <section>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3">20. Acknowledgment</h3>
              <p className="text-justify font-medium">
                By creating an account, you acknowledge that you have read these Terms of Use, understand them, and agree to be bound by them.
              </p>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0">
          <button
            onClick={onClose}
            className="w-full h-11 sm:h-12 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-medium rounded-lg transition-all"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
