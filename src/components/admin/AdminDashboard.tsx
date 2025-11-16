import { useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { AdminOverview } from './AdminOverview';
import { QuestionUpload } from './QuestionUpload';
import { QuestionManager } from './QuestionManager';
import { AdminAnalytics } from './AdminAnalytics';
import { UserManagement } from './UserManagement';
import { RevenueAnalytics } from './RevenueAnalytics';
import { AdminSettings } from './AdminSettings';
import { BookManagement } from './BookManagement';
import { ContentManagement } from './ContentManagement';
import { UserManagementEnhanced } from './UserManagementEnhanced';
import { AdminAnalyticsEnhanced } from './AdminAnalyticsEnhanced';
import { BillingRevenue } from './BillingRevenue';
import { WebsiteContentManagement } from './WebsiteContentManagement';
import { RoleBasedUserManagement } from './RoleBasedUserManagement';

interface AdminDashboardProps {
  onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <AdminLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      onExit={onBack}
    >
      {activeTab === 'overview' && <AdminOverview onTabChange={setActiveTab} />}
      {activeTab === 'upload' && <QuestionUpload />}
      {activeTab === 'manage' && <QuestionManager />}
      {activeTab === 'analytics' && <AdminAnalyticsEnhanced />}
      {activeTab === 'users' && <RoleBasedUserManagement />}
      {activeTab === 'revenue' && <BillingRevenue />}
      {activeTab === 'books' && <BookManagement />}
      {activeTab === 'content' && <ContentManagement />}
      {activeTab === 'website' && <WebsiteContentManagement />}
      {activeTab === 'settings' && <AdminSettings />}
    </AdminLayout>
  );
}