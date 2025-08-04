
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { toast } from 'sonner';
import AppLayout from '../components/layout/AppLayout';

interface ProfileData {
  full_name: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    display_name: '',
    avatar_url: null,
    bio: ''
  });
  
  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        
        if (!user) return;
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setProfileData({
            full_name: data.full_name || '',
            display_name: data.display_name || '',
            avatar_url: data.avatar_url,
            bio: data.bio || ''
          });
        }
      } catch (error: any) {
        console.error('Error loading profile:', error.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadProfile();
  }, [user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setUpdating(true);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profileData.full_name,
          display_name: profileData.display_name,
          bio: profileData.bio,
          updated_at: new Date()
        });
      
      if (error) {
        throw error;
      }
      
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };
  
  const getInitials = () => {
    if (profileData.display_name) {
      return profileData.display_name.charAt(0).toUpperCase();
    }
    if (profileData.full_name) {
      return profileData.full_name.charAt(0).toUpperCase();
    }
    return user?.email?.charAt(0).toUpperCase() || '?';
  };

  return (
    <AppLayout>
      <div className="container mx-auto p-4 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-white">Your Profile</h1>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <Card className="bg-gray-800 border-gray-700 text-white">
            <CardHeader className="flex flex-col items-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={profileData.avatar_url || undefined} />
                <AvatarFallback className="bg-blue-600 text-xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <CardTitle>{profileData.display_name || user?.email}</CardTitle>
              <CardDescription className="text-gray-400">
                {user?.email}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="full_name" className="text-sm font-medium text-gray-300">
                    Full Name
                  </label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={profileData.full_name}
                    onChange={handleChange}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="display_name" className="text-sm font-medium text-gray-300">
                    Display Name
                  </label>
                  <Input
                    id="display_name"
                    name="display_name"
                    value={profileData.display_name}
                    onChange={handleChange}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <p className="text-xs text-gray-400">
                    This is how your name will appear throughout the app
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium text-gray-300">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-white"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={updating}
                >
                  {updating ? 'Saving...' : 'Save Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}