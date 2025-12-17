import { useState } from 'react';
import { Save, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { locations } from '@/data/mockData';
import { getInitials } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { usersApi } from '@/services/api';
import { authApi } from '@/services/api';


export default function Settings() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    country: user?.country || '',
    city: user?.city || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState(false);

  const availableCities = profileData.country
    ? locations.find(l => l.country === profileData.country)?.cities || []
    : [];

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'country' ? { city: '' } : {}),
    }));
  };

  const handleSaveProfile = async () => {
  if (!user) return;

  const res = await usersApi.updateProfile(user.id, {
    displayName: profileData.displayName,
    country: profileData.country,
    city: profileData.city,
  });

  if (res.success && res.data) {
    // update context with fresh user data from backend
    updateUser(res.data);

    toast({
      title: 'Profile updated',
      description: res.message || 'Your profile has been updated successfully.',
    });
  } else {
    toast({
      title: 'Error',
      description: res.message || 'Failed to update profile.',
      variant: 'destructive',
    });
  }
};


 const handleChangePassword = async () => {
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    toast({
      title: 'Error',
      description: 'New passwords do not match.',
      variant: 'destructive',
    });
    return;
  }

  if (!passwordData.currentPassword || !passwordData.newPassword) {
    toast({
      title: 'Error',
      description: 'Please fill in all password fields.',
      variant: 'destructive',
    });
    return;
  }

  const res = await authApi.changePassword(
    passwordData.currentPassword,
    passwordData.newPassword
  );

  if (res.success) {
    toast({
      title: 'Password changed',
      description: res.message || 'Your password has been changed successfully.',
    });
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  } else {
    toast({
      title: 'Error',
      description: res.message || 'Failed to change password.',
      variant: 'destructive',
    });
  }
};


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-lg">{getInitials(user?.displayName || '')}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-foreground">{user?.displayName}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize">Role: {user?.role}</p>
            </div>
          </div>

          <Separator />

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={profileData.displayName}
                onChange={(e) => handleProfileChange('displayName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email} disabled />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label>Country</Label>
              <Select
                value={profileData.country}
                onValueChange={(v) => handleProfileChange('country', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(loc => (
                    <SelectItem key={loc.country} value={loc.country}>
                      {loc.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>City</Label>
              <Select
                value={profileData.city}
                onValueChange={(v) => handleProfileChange('city', v)}
                disabled={!profileData.country}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.map(city => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveProfile}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type={showPasswords ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type={showPasswords ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleChangePassword} variant="outline">
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
