import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Save,
  Camera,
  Bell,
  Lock,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Check,
  X,
  Shield,
  Activity,
  CreditCard,
  Settings as SettingsIcon
} from 'lucide-react';
import {
  getCurrentUserProfile,
  updateUserProfile,
  uploadAvatar,
  removeAvatar,
  updateNotificationSettings,
  updatePreferences,
  updatePassword,
  getActivityLog,
  exportUserData,
  type UserProfile as UserProfileType
} from '../services/profileApi';
import { useAuth } from './auth/AuthContext';
import { toast } from 'sonner@2.0.3';

export function UserProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.id) {
      loadProfile();
    }
  }, [user?.id]);

  const loadProfile = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await getCurrentUserProfile(user.id);
      setProfile(data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setUploadingAvatar(true);
    try {
      const response = await uploadAvatar(user.id, file);
      if (response.success) {
        toast.success(response.message);
        loadProfile();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user?.id || !confirm('Remove avatar?')) return;
    try {
      await removeAvatar(user.id);
      toast.success('Avatar removed');
      loadProfile();
    } catch (error) {
      toast.error('Failed to remove avatar');
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="size-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Avatar */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="size-32 rounded-full overflow-hidden border-4 border-purple-600 shadow-lg">
                <img
                  src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName)}&background=667eea&color=fff&size=128`}
                  alt={profile.fullName}
                  className="size-full object-cover"
                />
              </div>
              <button
                onClick={handleAvatarClick}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 p-2 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors group-hover:scale-110"
              >
                {uploadingAvatar ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Camera className="size-5" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl text-gray-900 dark:text-white mb-2">{profile.fullName}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-3">{profile.email}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  {profile.subscription.plan.toUpperCase()}
                </Badge>
                <Badge className={`${profile.subscription.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800'}`}>
                  {profile.subscription.status}
                </Badge>
                {profile.educationLevel && (
                  <Badge variant="outline">{profile.educationLevel}</Badge>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">{profile.stats.questionsCompleted}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Questions</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{profile.stats.studyStreak}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Day Streak</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{Math.round(profile.stats.totalStudyTime / 60)}h</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Study Time</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-6 justify-center md:justify-end">
            <Button variant="outline" onClick={handleRemoveAvatar}>
              <Trash2 className="size-4 mr-2" />
              Remove Avatar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 h-auto p-2">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Personal Info */}
        <TabsContent value="personal">
          <PersonalInfoTab profile={profile} onSave={loadProfile} />
        </TabsContent>

        {/* Education */}
        <TabsContent value="education">
          <EducationTab profile={profile} onSave={loadProfile} />
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <NotificationsTab profile={profile} onSave={loadProfile} />
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <SecurityTab profile={profile} />
        </TabsContent>

        {/* Activity */}
        <TabsContent value="activity">
          <ActivityTab userId={profile.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Personal Info Tab
function PersonalInfoTab({ profile, onSave }: { profile: UserProfileType; onSave: () => void }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: profile.fullName,
    phone: profile.phone || '',
    dateOfBirth: profile.dateOfBirth || '',
    bio: profile.bio || '',
    address: {
      street: profile.address?.street || '',
      city: profile.address?.city || '',
      state: profile.address?.state || '',
      zipCode: profile.address?.zipCode || '',
      country: profile.address?.country || ''
    },
    socialLinks: {
      linkedin: profile.socialLinks?.linkedin || '',
      twitter: profile.socialLinks?.twitter || '',
      website: profile.socialLinks?.website || ''
    }
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await updateUserProfile(user.id, formData);
      toast.success('Profile updated successfully');
      onSave();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white">Personal Information</CardTitle>
        <CardDescription className="dark:text-gray-400">Update your personal details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Full Name</label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Email</label>
            <Input
              value={profile.email}
              disabled
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600 opacity-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Phone</label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Date of Birth</label>
            <Input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>

        <div>
          <label className="text-gray-700 dark:text-gray-300 mb-2 block">Bio</label>
          <Textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            rows={3}
            placeholder="Tell us about yourself..."
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-white">Address</h4>
          <Input
            value={formData.address.street}
            onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
            placeholder="Street Address"
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              value={formData.address.city}
              onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
              placeholder="City"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            <Input
              value={formData.address.state}
              onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
              placeholder="State"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            <Input
              value={formData.address.zipCode}
              onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zipCode: e.target.value } })}
              placeholder="ZIP Code"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <Input
            value={formData.address.country}
            onChange={(e) => setFormData({ ...formData, address: { ...formData.address, country: e.target.value } })}
            placeholder="Country"
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 dark:text-white">Social Links</h4>
          <Input
            value={formData.socialLinks.linkedin}
            onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value } })}
            placeholder="LinkedIn URL"
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <Input
            value={formData.socialLinks.twitter}
            onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, twitter: e.target.value } })}
            placeholder="Twitter URL"
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <Input
            value={formData.socialLinks.website}
            onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, website: e.target.value } })}
            placeholder="Website URL"
            className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="size-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// Education Tab
function EducationTab({ profile, onSave }: { profile: UserProfileType; onSave: () => void }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    educationLevel: profile.educationLevel || 'bachelor',
    nursingProgram: profile.nursingProgram || '',
    graduationDate: profile.graduationDate || '',
    targetExamDate: profile.targetExamDate || '',
    preferredStudyTime: profile.preferredStudyTime || 'evening',
    studyGoals: profile.studyGoals || []
  });
  const [saving, setSaving] = useState(false);
  const [newGoal, setNewGoal] = useState('');

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await updateUserProfile(user.id, formData);
      toast.success('Education info updated');
      onSave();
    } catch (error) {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setFormData({ ...formData, studyGoals: [...formData.studyGoals, newGoal.trim()] });
      setNewGoal('');
    }
  };

  const removeGoal = (index: number) => {
    setFormData({
      ...formData,
      studyGoals: formData.studyGoals.filter((_, i) => i !== index)
    });
  };

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white">Education & Study Goals</CardTitle>
        <CardDescription className="dark:text-gray-400">Manage your academic information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Education Level</label>
            <select
              value={formData.educationLevel}
              onChange={(e) => setFormData({ ...formData, educationLevel: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              <option value="associate">Associate Degree</option>
              <option value="bachelor">Bachelor's Degree</option>
              <option value="master">Master's Degree</option>
              <option value="doctorate">Doctorate</option>
            </select>
          </div>
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Nursing Program</label>
            <Input
              value={formData.nursingProgram}
              onChange={(e) => setFormData({ ...formData, nursingProgram: e.target.value })}
              placeholder="e.g., University of XYZ"
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Graduation Date</label>
            <Input
              type="date"
              value={formData.graduationDate}
              onChange={(e) => setFormData({ ...formData, graduationDate: e.target.value })}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Target NCLEX Date</label>
            <Input
              type="date"
              value={formData.targetExamDate}
              onChange={(e) => setFormData({ ...formData, targetExamDate: e.target.value })}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
        </div>

        <div>
          <label className="text-gray-700 dark:text-gray-300 mb-2 block">Preferred Study Time</label>
          <select
            value={formData.preferredStudyTime}
            onChange={(e) => setFormData({ ...formData, preferredStudyTime: e.target.value as any })}
            className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value="morning">Morning (6AM - 12PM)</option>
            <option value="afternoon">Afternoon (12PM - 6PM)</option>
            <option value="evening">Evening (6PM - 10PM)</option>
            <option value="night">Night (10PM - 6AM)</option>
          </select>
        </div>

        <div>
          <label className="text-gray-700 dark:text-gray-300 mb-2 block">Study Goals</label>
          <div className="flex gap-2 mb-3">
            <Input
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addGoal()}
              placeholder="Add a study goal..."
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            <Button onClick={addGoal} type="button">Add</Button>
          </div>
          <div className="space-y-2">
            {formData.studyGoals.map((goal, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <span className="text-gray-900 dark:text-white">{goal}</span>
                <button
                  onClick={() => removeGoal(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}

// Notifications Tab
function NotificationsTab({ profile, onSave }: { profile: UserProfileType; onSave: () => void }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState(profile.notifications);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await updateNotificationSettings(user.id, settings);
      toast.success('Notification settings updated');
      onSave();
    } catch (error) {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white">Notification Preferences</CardTitle>
        <CardDescription className="dark:text-gray-400">Manage how you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { key: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
          { key: 'push', label: 'Push Notifications', description: 'Browser push notifications' },
          { key: 'sms', label: 'SMS Notifications', description: 'Text message notifications' },
          { key: 'studyReminders', label: 'Study Reminders', description: 'Daily study reminders' },
          { key: 'progressUpdates', label: 'Progress Updates', description: 'Weekly progress reports' },
          { key: 'marketingEmails', label: 'Marketing Emails', description: 'Promotional content and offers' }
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg">
            <div>
              <p className="text-gray-900 dark:text-white">{item.label}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
            </div>
            <input
              type="checkbox"
              checked={settings[item.key as keyof typeof settings]}
              onChange={(e) => setSettings({ ...settings, [item.key]: e.target.checked })}
              className="size-5"
            />
          </div>
        ))}

        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
          Save Preferences
        </Button>
      </CardContent>
    </Card>
  );
}

// Security Tab
function SecurityTab({ profile }: { profile: UserProfileType }) {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChangePassword = async () => {
    if (!user?.id) return;
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const result = await updatePassword(user.id, currentPassword, newPassword);
      if (result.success) {
        toast.success(result.message);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    if (!user?.id) return;
    try {
      const data = await exportUserData(user.id);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nursehaven-data-${Date.now()}.json`;
      a.click();
      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Change Password</CardTitle>
          <CardDescription className="dark:text-gray-400">Update your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Current Password</label>
            <div className="relative">
              <Input
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPasswords ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">New Password</label>
            <Input
              type={showPasswords ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Confirm New Password</label>
            <Input
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>

          <Button onClick={handleChangePassword} disabled={saving}>
            {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Lock className="size-4 mr-2" />}
            Update Password
          </Button>
        </CardContent>
      </Card>

      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Data & Privacy</CardTitle>
          <CardDescription className="dark:text-gray-400">Manage your personal data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleExportData} variant="outline">
            <Download className="size-4 mr-2" />
            Export My Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// Activity Tab
function ActivityTab({ userId }: { userId: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, [userId]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getActivityLog(userId);
      setLogs(data);
    } catch (error) {
      toast.error('Failed to load activity');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="py-12 text-center">
          <Loader2 className="size-8 animate-spin text-purple-600 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white">Recent Activity</CardTitle>
        <CardDescription className="dark:text-gray-400">Your recent account activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 p-4 border dark:border-gray-700 rounded-lg">
              <Activity className="size-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-gray-900 dark:text-white">{log.description}</p>
                <div className="flex gap-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                  {log.device && <span>• {log.device}</span>}
                  {log.ipAddress && <span>• {log.ipAddress}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
