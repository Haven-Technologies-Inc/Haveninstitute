'use client';

import { useState } from 'react';
import { cn, getInitials } from '@/lib/utils';
import { useUser } from '@/lib/hooks';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  School,
  Calendar,
  Camera,
  Save,
  Loader2,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────

interface ProfileFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  school: string;
  program: string;
  graduationYear: string;
  bio: string;
}

// ── Component ──────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user } = useUser();

  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<ProfileFormState>({
    firstName: user?.name?.split(' ')[0] ?? 'Jane',
    lastName: user?.name?.split(' ').slice(1).join(' ') ?? 'Doe',
    email: user?.email ?? 'jane.doe@email.com',
    phone: '(555) 123-4567',
    school: 'State University School of Nursing',
    program: 'BSN',
    graduationYear: '2026',
    bio: 'Aspiring nurse passionate about pediatric care. Currently preparing for the NCLEX-RN and looking forward to starting my nursing career. Love connecting with fellow students and sharing study tips!',
  });

  const updateField = <K extends keyof ProfileFormState>(
    field: K,
    value: ProfileFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
  };

  const displayName = `${form.firstName} ${form.lastName}`.trim();
  const roleBadge = user?.role === 'admin' ? 'Admin' : 'Student';

  return (
    <div className="space-y-8">
      <PageHeader
        title="Profile"
        description="Manage your personal information and preferences"
      />

      {/* Profile Card */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <CardContent className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                {user?.image && (
                  <AvatarImage src={user.image} alt={displayName} />
                )}
                <AvatarFallback className="text-2xl bg-muted font-semibold">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <button
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Change avatar"
              >
                <Camera className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold">{displayName}</h2>
                <Badge variant="secondary">{roleBadge}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {form.email}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="Email address"
                  className="pl-10"
                  disabled
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Contact support to change your email address.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="Phone number"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            Education
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="school">School / University</Label>
            <div className="relative">
              <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="school"
                value={form.school}
                onChange={(e) => updateField('school', e.target.value)}
                placeholder="School or university name"
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="program">Program</Label>
              <Select
                value={form.program}
                onValueChange={(val) => updateField('program', val)}
              >
                <SelectTrigger id="program">
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BSN">BSN - Bachelor of Science in Nursing</SelectItem>
                  <SelectItem value="ADN">ADN - Associate Degree in Nursing</SelectItem>
                  <SelectItem value="MSN">MSN - Master of Science in Nursing</SelectItem>
                  <SelectItem value="DNP">DNP - Doctor of Nursing Practice</SelectItem>
                  <SelectItem value="LPN">LPN - Licensed Practical Nurse</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="graduationYear">Expected Graduation Year</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
                <Select
                  value={form.graduationYear}
                  onValueChange={(val) => updateField('graduationYear', val)}
                >
                  <SelectTrigger id="graduationYear" className="pl-10">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {['2025', '2026', '2027', '2028', '2029', '2030'].map(
                      (year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Bio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <textarea
            rows={4}
            value={form.bio}
            onChange={(e) => updateField('bio', e.target.value)}
            placeholder="Tell other students a little about yourself..."
            className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {form.bio.length}/500 characters
          </p>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="min-w-[140px]">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
