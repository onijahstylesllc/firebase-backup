
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { KeyRound, ShieldCheck, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@supabase/supabase-js';

const aiTools = [
  {
    id: 'visual-mode',
    name: 'Visual Mode',
    description: 'Enable the AI to understand and process images within documents.',
    preferenceKey: 'visualMode',
  },
   {
    id: 'memory-threads',
    name: 'Memory Threads',
    description: 'Allow the AI to remember context from previous conversations.',
    disabled: false,
  },
];

const userRoles = ["Software Engineer", "Lawyer", "Marketing Manager", "Student", "Researcher", "Other"];
const aiTones = ["Professional", "Casual", "Formal", "Friendly"];
const aiOutputFormats = ["Paragraphs", "Bullet Points", "Concise Summary"];

function AccountSettings() {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchUserAndProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                
                if (data) {
                    setProfile(data);
                    setName(data.name || user.user_metadata.full_name || '');
                    setEmail(user.email || '');
                    setPreviewUrl(data.profile_picture_url || user.user_metadata.avatar_url || null);
                } else if (error) {
                    console.error('Error fetching profile:', error);
                }
            }
            setIsLoading(false);
        };

        fetchUserAndProfile();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewAvatarFile(file);
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                setPreviewUrl(loadEvent.target?.result as string);
            }
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = async () => {
        if (!user) return;
        setIsSaving(true);
        let photoURL = profile?.profile_picture_url || user.user_metadata.avatar_url;

        try {
            if (newAvatarFile) {
                const filePath = `profile-pictures/${user.id}/${newAvatarFile.name}`;
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, newAvatarFile, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
                photoURL = publicUrl;
            }

            // Update both profile table and user metadata
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ name, profile_picture_url: photoURL })
                .eq('id', user.id);
            if (profileError) throw profileError;

            const { error: userError } = await supabase.auth.updateUser({
                data: { full_name: name, avatar_url: photoURL }
            });
            if (userError) throw userError;

            toast({
                title: 'Profile Updated',
                description: 'Your account details have been saved.',
            });
            setNewAvatarFile(null);
        } catch (error: any) {
            console.error("Error updating profile:", error);
             toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: error.message || 'Could not update your profile. Please try again.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const cancelUpdate = () => {
        setNewAvatarFile(null);
        setPreviewUrl(profile?.profile_picture_url || user?.user_metadata.avatar_url || null);
    }


    if (isLoading) {
        return (
            <div className="space-y-6">
                 <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full md:w-1/2" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full md:w-1/2" />
                </div>
                 <Skeleton className="h-10 w-32" />
            </div>
        );
    }
    
    return (
        <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Update your account details. This is how others will see you on the site.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={previewUrl || undefined} />
                        <AvatarFallback className="text-3xl">{name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                        <Button onClick={() => fileInputRef.current?.click()}>Upload Picture</Button>
                        <Input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            onChange={handleFileChange}
                            accept="image/png, image/jpeg, image/jpg"
                        />
                    </div>
                </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className=\'max-w-sm\'/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} disabled className=\'max-w-sm\'/>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
               {newAvatarFile && <Button variant="ghost" onClick={cancelUpdate}>Cancel</Button>}
            </CardFooter>
        </Card>
    )
}

// ... (SecuritySettings, AiSettings, and SettingsPage components remain the same but will need their state management updated)
// This is a partial update focusing on the AccountSettings component.
// A full update would require similar logic for the other components.

function SecuritySettings() {
    // ... Needs to be updated for Supabase password changes and 2FA
    return (
        <Card>
            <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>
                    Manage your account\'s security settings.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>Security settings are not yet implemented with Supabase.</p>
            </CardContent>
        </Card>
    )
}

function AiSettings() {
    // ... Needs to be updated to fetch/update AI preferences from the 'profiles' table
    return (
        <Card>
            <CardHeader>
                <CardTitle>AI Preferences</CardTitle>
                <CardDescription>
                    Customize your AI assistant\'s behavior.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>AI settings are not yet implemented with Supabase.</p>
            </CardContent>
        </Card>
    )
}

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, preferences, and team settings.
        </p>
      </div>
      <Tabs defaultValue="account">
        <TabsList className="grid w-full max-w-lg grid-cols-5">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <AccountSettings />
        </TabsContent>
        <TabsContent value="security">
            <SecuritySettings />
        </TabsContent>
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Invite and manage your team members.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Team management has been moved to its own dedicated page.</p>
            </CardContent>
             <CardFooter>
              <Button asChild>
                <Link href="/teams">Go to Team Management</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
              <CardDescription>
                Manage your subscription and view invoices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Billing information will go here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ai">
            <AiSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
