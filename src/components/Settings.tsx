import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import {
  User,
  Bell,
  Shield,
  Palette,
  Mail,
  Lock,
  Globe,
  Moon,
  Sun,
  Save,
  Eye,
  EyeOff,
  Upload,
  Camera,
  X,
  Check,
  MapPin,
  Phone,
  Calendar
} from 'lucide-react';
import { useAuth } from './auth/AuthContext';
import { useDarkMode } from './DarkModeContext';
import { SecuritySettings } from './settings/SecuritySettings';

export function Settings() {
  const { user, updateUser } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [showPassword, setShowPassword] = useState(false);
  
  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    bio: '',
    graduationYear: ''
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [studyReminders, setStudyReminders] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      
      // Check file type
      if (!file.type.match('image/(jpeg|jpg|png|gif)')) {
        alert('Please upload a valid image file (JPG, PNG, or GIF)');
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = () => {
    setProfileImage(null);
    setImageFile(null);
  };
  
  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSaveProfile = () => {
    // Here you would typically upload the image and save the profile data to your backend
    if (updateUser) {
      updateUser({
        ...user,
        name: profileData.name,
        email: profileData.email
      });
    }
    
    setSaveSuccess(true);
    setIsEditing(false);
    
    // Reset success message after 3 seconds
    setTimeout(() => setSaveSuccess(false), 3000);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfileData({
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      location: '',
      bio: '',
      graduationYear: ''
    });
    setProfileImage(null);
    setImageFile(null);
  };

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl mb-2 text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account preferences and settings</p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 dark:bg-gray-800">
          <TabsTrigger value="profile" className="dark:data-[state=active]:bg-gray-700">
            <User className="size-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="dark:data-[state=active]:bg-gray-700">
            <Bell className="size-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="dark:data-[state=active]:bg-gray-700">
            <Palette className="size-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="security" className="dark:data-[state=active]:bg-gray-700">
            <Shield className="size-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="dark:text-white">Profile Information</CardTitle>
                  <CardDescription className="dark:text-gray-400">Update your personal information and profile picture</CardDescription>
                </div>
                {!isEditing && (
                  <Button 
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    <User className="size-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Success Message */}
              {saveSuccess && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
                  <Check className="size-5 text-green-600 dark:text-green-400" />
                  <p className="text-sm text-green-800 dark:text-green-200 font-semibold">
                    Profile updated successfully!
                  </p>
                </div>
              )}

              {/* Profile Picture Section */}
              <div>
                <Label className="dark:text-gray-300 mb-3 block">Profile Picture</Label>
                <div className="flex items-start gap-6">
                  {/* Current/Preview Image */}
                  <div className="relative">
                    {profileImage ? (
                      <div className="relative group">
                        <img 
                          src={profileImage} 
                          alt="Profile" 
                          title="Profile image"
                          aria-label="Profile image"
                          className="size-24 rounded-full object-cover border-4 border-blue-500 dark:border-purple-500 shadow-lg"
                        />
                        {isEditing && (
                          <button
                            onClick={handleRemoveImage}
                            title="Remove profile image"
                            aria-label="Remove profile image"
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-colors"
                          >
                            <X className="size-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="size-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl shadow-lg">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex gap-3">
                          <label className="cursor-pointer">
                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                              <Camera className="size-4" />
                              <span className="text-sm">Upload New Photo</span>
                            </div>
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/gif"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                          </label>
                          {profileImage && (
                            <Button 
                              onClick={handleRemoveImage}
                              variant="outline"
                              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            >
                              <X className="size-4 mr-2" />
                              Remove
                            </Button>
                          )}
                        </div>
                        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <Upload className="size-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div className="text-xs text-blue-800 dark:text-blue-200">
                            <p className="font-semibold mb-1">Image Requirements:</p>
                            <ul className="list-disc list-inside space-y-0.5">
                              <li>JPG, PNG or GIF format</li>
                              <li>Maximum file size: 2MB</li>
                              <li>Recommended: Square image, at least 400x400px</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Click "Edit Profile" to update your profile picture
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          JPG, PNG or GIF. Max 2MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="dark:text-gray-300 flex items-center gap-2">
                    <User className="size-4" />
                    Full Name
                  </Label>
                  <Input 
                    id="fullName" 
                    value={profileData.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    disabled={!isEditing}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600 disabled:opacity-50"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="dark:text-gray-300 flex items-center gap-2">
                    <Mail className="size-4" />
                    Email Address
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profileData.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    disabled={!isEditing}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600 disabled:opacity-50"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="dark:text-gray-300 flex items-center gap-2">
                    <Phone className="size-4" />
                    Phone Number
                  </Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={profileData.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    disabled={!isEditing}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600 disabled:opacity-50"
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location" className="dark:text-gray-300 flex items-center gap-2">
                    <MapPin className="size-4" />
                    Location
                  </Label>
                  <Input 
                    id="location" 
                    placeholder="City, State"
                    value={profileData.location}
                    onChange={(e) => handleProfileChange('location', e.target.value)}
                    disabled={!isEditing}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600 disabled:opacity-50"
                  />
                </div>

                {/* Expected Graduation Year */}
                <div className="space-y-2">
                  <Label htmlFor="graduationYear" className="dark:text-gray-300 flex items-center gap-2">
                    <Calendar className="size-4" />
                    Expected Graduation
                  </Label>
                  <Input 
                    id="graduationYear" 
                    placeholder="e.g., 2025"
                    value={profileData.graduationYear}
                    onChange={(e) => handleProfileChange('graduationYear', e.target.value)}
                    disabled={!isEditing}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="dark:text-gray-300">
                  Bio / About Me
                </Label>
                <Textarea 
                  id="bio" 
                  placeholder="Tell us a bit about yourself, your nursing goals, and what you're preparing for..."
                  value={profileData.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                  disabled={!isEditing}
                  rows={4}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600 disabled:opacity-50 resize-none"
                />
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {profileData.bio.length}/500 characters
                </p>
              </div>

              {/* Subscription Info */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Label className="dark:text-gray-300 mb-3 block">Subscription Plan</Label>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <Badge className={
                      user?.subscription === 'Premium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-lg px-3 py-1' :
                      user?.subscription === 'Pro' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-lg px-3 py-1' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 text-lg px-3 py-1'
                    }>
                      {user?.subscription === 'Premium' && '👑 '}
                      {user?.subscription === 'Pro' && '⭐ '}
                      {user?.subscription}
                    </Badge>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {user?.subscription === 'Premium' ? 'Premium Plan' :
                         user?.subscription === 'Pro' ? 'Pro Plan' : 'Free Plan'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {user?.subscription === 'Premium' ? 'All features unlocked' :
                         user?.subscription === 'Pro' ? 'Advanced features included' : 'Limited features'}
                      </p>
                    </div>
                  </div>
                  <Button variant="link" className="text-blue-600 dark:text-blue-400">
                    Upgrade Plan →
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={handleSaveProfile} 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex-1"
                  >
                    <Save className="size-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button 
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  >
                    <X className="size-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Notification Preferences</CardTitle>
              <CardDescription className="dark:text-gray-400">Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-gray-500 dark:text-gray-400" />
                    <Label className="dark:text-white">Email Notifications</Label>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Bell className="size-4 text-gray-500 dark:text-gray-400" />
                    <Label className="dark:text-white">Push Notifications</Label>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive push notifications in browser</p>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>

              {/* Study Reminders */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Globe className="size-4 text-gray-500 dark:text-gray-400" />
                    <Label className="dark:text-white">Study Reminders</Label>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get reminders for scheduled study sessions</p>
                </div>
                <Switch checked={studyReminders} onCheckedChange={setStudyReminders} />
              </div>

              {/* Weekly Reports */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-gray-500 dark:text-gray-400" />
                    <Label className="dark:text-white">Weekly Progress Reports</Label>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Receive weekly summary of your progress</p>
                </div>
                <Switch checked={weeklyReports} onCheckedChange={setWeeklyReports} />
              </div>

              <Button onClick={handleSave} className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Save className="size-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">Appearance Settings</CardTitle>
              <CardDescription className="dark:text-gray-400">Customize how NurseHaven looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dark Mode */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {isDarkMode ? (
                      <Moon className="size-4 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <Sun className="size-4 text-gray-500 dark:text-gray-400" />
                    )}
                    <Label className="dark:text-white">Dark Mode</Label>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isDarkMode ? 'Currently using dark theme' : 'Currently using light theme'}
                  </p>
                </div>
                <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  💡 Dark mode helps reduce eye strain during late-night study sessions
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}