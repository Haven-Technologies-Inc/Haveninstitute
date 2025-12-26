import { X, Shield } from 'lucide-react';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicy({ isOpen, onClose }: PrivacyPolicyProps) {
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
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy Policy</h2>
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
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-8">
          <div className="max-w-none space-y-5 sm:space-y-6 text-[13px] sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            
            <p className="text-justify">
              Haven Technologies Inc. ("Haven Institute," "we," "us," or "our"), a company registered in Washington State, operates the Haven Institute NCLEX preparation platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
            </p>

            <section>
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">1. Information We Collect</h3>
              
              <h4 className="text-[13px] sm:text-base font-medium text-gray-800 dark:text-gray-200 mb-1.5 sm:mb-2">1.1 Personal Information</h4>
              <p className="text-justify mb-2 sm:mb-3">We collect information you provide directly to us, including:</p>
              <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1 mb-3 sm:mb-4 ml-1">
                <li>Name, email address, and account credentials</li>
                <li>Educational background and nursing program information</li>
                <li>Payment and billing information (processed securely through third-party providers)</li>
                <li>Profile information and preferences</li>
                <li>Communications you send to us</li>
              </ul>

              <h4 className="text-[13px] sm:text-base font-medium text-gray-800 dark:text-gray-200 mb-1.5 sm:mb-2">1.2 Usage Information</h4>
              <p className="text-justify mb-2 sm:mb-3">We automatically collect information about your use of our services:</p>
              <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1 ml-1">
                <li>Study activity, quiz responses, and performance data</li>
                <li>Device information (browser type, operating system, device identifiers)</li>
                <li>Log data (IP address, access times, pages viewed)</li>
                <li>Learning patterns and progress metrics</li>
              </ul>
            </section>

            <section>
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">2. How We Use Your Information</h3>
              <p className="text-justify mb-2 sm:mb-3">We use the information we collect to:</p>
              <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1 ml-1">
                <li>Provide, maintain, and improve our NCLEX preparation services</li>
                <li>Personalize your learning experience using AI-powered recommendations</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, and administrative messages</li>
                <li>Respond to your comments, questions, and support requests</li>
                <li>Analyze usage patterns to improve our platform</li>
                <li>Detect, investigate, and prevent fraudulent or unauthorized activity</li>
              </ul>
            </section>

            <section>
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">3. Information Sharing</h3>
              <p className="text-justify mb-2 sm:mb-3">We do not sell your personal information. We may share your information in the following circumstances:</p>
              <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 ml-1">
                <li><span className="font-medium text-gray-800 dark:text-gray-200">Service Providers:</span> With vendors who perform services on our behalf</li>
                <li><span className="font-medium text-gray-800 dark:text-gray-200">Legal Requirements:</span> When required by law or to respond to legal process</li>
                <li><span className="font-medium text-gray-800 dark:text-gray-200">Protection:</span> To protect the rights, privacy, safety, or property of Haven Institute</li>
                <li><span className="font-medium text-gray-800 dark:text-gray-200">Business Transfers:</span> In connection with a merger, acquisition, or sale of assets</li>
                <li><span className="font-medium text-gray-800 dark:text-gray-200">With Your Consent:</span> When you have given us permission to share your information</li>
              </ul>
            </section>

            <section>
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">4. Data Security</h3>
              <p className="text-justify">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption, secure servers, and regular security assessments. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">5. Your Rights Under Washington State Law</h3>
              <p className="text-justify mb-2 sm:mb-3">Under the Washington My Health My Data Act and other applicable laws, you have the right to:</p>
              <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 ml-1">
                <li><span className="font-medium text-gray-800 dark:text-gray-200">Access:</span> Request access to the personal information we hold about you</li>
                <li><span className="font-medium text-gray-800 dark:text-gray-200">Correction:</span> Request correction of inaccurate personal information</li>
                <li><span className="font-medium text-gray-800 dark:text-gray-200">Deletion:</span> Request deletion of your personal information</li>
                <li><span className="font-medium text-gray-800 dark:text-gray-200">Data Portability:</span> Receive your data in a portable format</li>
                <li><span className="font-medium text-gray-800 dark:text-gray-200">Opt-Out:</span> Opt out of certain data processing activities</li>
              </ul>
            </section>

            <section>
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">6. Health Information</h3>
              <p className="text-justify">
                While Haven Institute is an educational platform and not a healthcare provider, we take the protection of any health-related information seriously. We do not collect, use, or share health information for purposes other than providing our educational services.
              </p>
            </section>

            <section>
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">7. Children's Privacy</h3>
              <p className="text-justify">
                Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children under 18. If we learn we have collected such information, we will delete it promptly.
              </p>
            </section>

            <section>
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">8. Data Retention</h3>
              <p className="text-justify">
                We retain your personal information for as long as your account is active or as needed to provide you services. We may retain certain information as required by law or for legitimate business purposes, such as resolving disputes or enforcing our agreements.
              </p>
            </section>

            <section>
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">9. Third-Party Services</h3>
              <p className="text-justify">
                Our platform may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
              </p>
            </section>

            <section>
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">10. Changes to This Policy</h3>
              <p className="text-justify">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">11. Contact Us</h3>
              <p className="text-justify mb-2 sm:mb-3">
                If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us:
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4 text-[13px] sm:text-base">
                <p className="font-medium text-gray-900 dark:text-white">Haven Technologies Inc.</p>
                <p>Email: <a href="mailto:privacy@havenstudy.com" className="text-blue-600 dark:text-blue-400 hover:underline">privacy@havenstudy.com</a></p>
                <p>State of Registration: Washington, United States</p>
              </div>
            </section>

            <section>
              <h3 className="text-sm sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">12. Consent</h3>
              <p className="text-justify">
                By creating an account and using Haven Institute's services, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
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
