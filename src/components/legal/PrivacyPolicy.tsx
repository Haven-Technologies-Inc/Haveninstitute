import { X } from 'lucide-react';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicy({ isOpen, onClose }: PrivacyPolicyProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 w-full sm:w-[95%] sm:max-w-2xl h-[90vh] sm:h-auto sm:max-h-[85vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Privacy Policy</h2>
          <button
            onClick={onClose}
            className="p-2 -m-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="size-5 sm:size-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 prose prose-sm dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-li:text-gray-600 dark:prose-li:text-gray-300">
          <p className="text-sm text-gray-500 mb-4">Last Updated: December 26, 2024</p>

          <p>
            Haven Technologies Inc. ("Haven Institute," "we," "us," or "our"), a company registered in Washington State, 
            operates the Haven Institute NCLEX preparation platform. This Privacy Policy explains how we collect, use, 
            disclose, and safeguard your information when you use our services.
          </p>

          <h3>1. Information We Collect</h3>
          
          <h4>1.1 Personal Information</h4>
          <p>We collect information you provide directly to us, including:</p>
          <ul>
            <li>Name, email address, and account credentials</li>
            <li>Educational background and nursing program information</li>
            <li>Payment and billing information (processed securely through third-party providers)</li>
            <li>Profile information and preferences</li>
            <li>Communications you send to us</li>
          </ul>

          <h4>1.2 Usage Information</h4>
          <p>We automatically collect information about your use of our services:</p>
          <ul>
            <li>Study activity, quiz responses, and performance data</li>
            <li>Device information (browser type, operating system, device identifiers)</li>
            <li>Log data (IP address, access times, pages viewed)</li>
            <li>Learning patterns and progress metrics</li>
          </ul>

          <h3>2. How We Use Your Information</h3>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our NCLEX preparation services</li>
            <li>Personalize your learning experience using AI-powered recommendations</li>
            <li>Process transactions and send related information</li>
            <li>Send technical notices, updates, and administrative messages</li>
            <li>Respond to your comments, questions, and support requests</li>
            <li>Analyze usage patterns to improve our platform</li>
            <li>Detect, investigate, and prevent fraudulent or unauthorized activity</li>
          </ul>

          <h3>3. Information Sharing</h3>
          <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
          <ul>
            <li><strong>Service Providers:</strong> With vendors who perform services on our behalf (payment processing, hosting, analytics)</li>
            <li><strong>Legal Requirements:</strong> When required by law or to respond to legal process</li>
            <li><strong>Protection:</strong> To protect the rights, privacy, safety, or property of Haven Institute, our users, or others</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            <li><strong>With Your Consent:</strong> When you have given us permission to share your information</li>
          </ul>

          <h3>4. Data Security</h3>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction. These measures include encryption, secure servers, 
            and regular security assessments. However, no method of transmission over the Internet is 100% secure.
          </p>

          <h3>5. Your Rights Under Washington State Law</h3>
          <p>Under the Washington My Health My Data Act and other applicable laws, you have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate personal information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
            <li><strong>Data Portability:</strong> Receive your data in a portable format</li>
            <li><strong>Opt-Out:</strong> Opt out of certain data processing activities</li>
          </ul>

          <h3>6. Health Information</h3>
          <p>
            While Haven Institute is an educational platform and not a healthcare provider, we take the protection of 
            any health-related information seriously. We do not collect, use, or share health information for purposes 
            other than providing our educational services.
          </p>

          <h3>7. Children's Privacy</h3>
          <p>
            Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal 
            information from children under 18. If we learn we have collected such information, we will delete it promptly.
          </p>

          <h3>8. Data Retention</h3>
          <p>
            We retain your personal information for as long as your account is active or as needed to provide you services. 
            We may retain certain information as required by law or for legitimate business purposes, such as resolving 
            disputes or enforcing our agreements.
          </p>

          <h3>9. Third-Party Services</h3>
          <p>
            Our platform may contain links to third-party websites or integrate with third-party services. We are not 
            responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.
          </p>

          <h3>10. Changes to This Policy</h3>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material changes by posting 
            the new Privacy Policy on this page and updating the "Last Updated" date. Your continued use of our services 
            after such changes constitutes acceptance of the updated policy.
          </p>

          <h3>11. Contact Us</h3>
          <p>
            If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact us at:
          </p>
          <p>
            <strong>Haven Technologies Inc.</strong><br />
            Email: <a href="mailto:privacy@havenstudy.com" className="text-blue-600">privacy@havenstudy.com</a><br />
            State of Registration: Washington, United States
          </p>

          <h3>12. Consent</h3>
          <p>
            By creating an account and using Haven Institute's services, you acknowledge that you have read, understood, 
            and agree to be bound by this Privacy Policy.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800 shrink-0 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full h-11 sm:h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-lg transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
