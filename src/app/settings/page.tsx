
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
import { useProfile, useUser } from '@/firebase';
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
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile as updateAuthProfile } from 'firebase/auth';

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
    disabled: true,
  },
];

const userRoles = ["Software Engineer", "Lawyer", "Marketing Manager", "Student", "Researcher", "Other"];
const aiTones = ["Professional", "Casual", "Formal", "Friendly"];
const aiOutputFormats = ["Paragraphs", "Bullet Points", "Concise Summary"];

function AccountSettings() {
    const { profile, updateProfile, isLoading } = useProfile();
    const { user, auth } = useUser();
    const { toast } = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if(profile) {
            setName(profile.name || user?.displayName || '');
            setEmail(profile.email || user?.email || '');
            setPreviewUrl(profile.profilePictureUrl || user?.photoURL || null);
        }
    }, [profile, user]);

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
        if (!user || !auth) return;
        setIsSaving(true);
        let photoURL = profile?.profilePictureUrl || user.photoURL;

        try {
            if (newAvatarFile) {
                const storage = getStorage();
                const storageRef = ref(storage, `profile-pictures/${user.uid}/${newAvatarFile.name}`);
                const snapshot = await uploadBytes(storageRef, newAvatarFile);
                photoURL = await getDownloadURL(snapshot.ref);
            }

            // Update both firestore profile and firebase auth profile
            await updateProfile({ name, email, profilePictureUrl: photoURL });
            if (auth.currentUser) {
                await updateAuthProfile(auth.currentUser, { displayName: name, photoURL });
            }

            toast({
                title: 'Profile Updated',
                description: 'Your account details have been saved.',
            });
            setNewAvatarFile(null);
        } catch (error) {
            console.error("Error updating profile:", error);
             toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Could not update your profile. Please try again.',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const cancelUpdate = () => {
        setNewAvatarFile(null);
        setPreviewUrl(profile?.profilePictureUrl || user?.photoURL || null);
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
                        <Button variant="ghost" onClick={() => updateProfile({ profilePictureUrl: '' })}>Remove</Button>
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
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className='max-w-sm'/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className='max-w-sm'/>
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

function SecuritySettings() {
    const [isMfaEnabled, setIsMfaEnabled] = useState(false);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>
                    Manage your account's security settings.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 divide-y">
                <div className="space-y-4 pt-6 first:pt-0">
                    <h3 className="font-semibold flex items-center gap-2"><KeyRound className='h-4 w-4'/> Change Password</h3>
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" className='max-w-sm'/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" className='max-w-sm'/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" className='max-w-sm'/>
                    </div>
                    <div>
                        <Button>Update Password</Button>
                    </div>
                </div>

                 <div className="space-y-4 pt-6">
                    <h3 className="font-semibold flex items-center gap-2"><ShieldCheck className='h-4 w-4'/> Multi-Factor Authentication (2FA)</h3>
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <Label className="text-base">
                                Enable 2FA
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Secure your account with an additional layer of protection.
                            </p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                 <Switch
                                    checked={isMfaEnabled}
                                    onCheckedChange={(checked) => !checked && setIsMfaEnabled(false)}
                                />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Enable Two-Factor Authentication?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will require you to use an authenticator app to log in. Are you sure you want to proceed?
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => setIsMfaEnabled(true)}>
                                    Continue
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                       
                    </div>
                     {isMfaEnabled && (
                        <Card className="bg-muted/50 p-4">
                             <CardDescription>
                                Scan the QR code with your authenticator app (e.g., Google Authenticator, Authy).
                            </CardDescription>
                            <div className="flex justify-center p-4">
                                <Skeleton className="h-40 w-40" />
                            </div>
                            <Label htmlFor="2fa-code">Enter the code from your app</Label>
                            <div className="flex gap-2 mt-2">
                                <Input id="2fa-code" placeholder="123456" className="max-w-xs" />
                                <Button>Verify & Enable</Button>
                            </div>
                        </Card>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

function AiSettings() {
  const { profile, updateProfile, isLoading } = useProfile();

  const handleToggle = (tool: any) => {
    if (tool.disabled || isLoading) return;

    const currentPreferences = profile?.aiPreferences || {};
    const newPreferences = {
      ...currentPreferences,
      [tool.preferenceKey]: !currentPreferences[tool.preferenceKey],
    };
    updateProfile({ aiPreferences: newPreferences });
  };

  const handlePreferenceChange = (key: string, value: string) => {
      if (isLoading) return;
       const currentPreferences = profile?.aiPreferences || {};
       const newPreferences = {
        ...currentPreferences,
        [key]: value,
       };
       updateProfile({ aiPreferences: newPreferences });
  }
  
  if (isLoading) {
    return (
       <div className="space-y-8">
        <div className="space-y-4">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-4">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-10 w-full" />
        </div>
         <div className="space-y-4">
            <Skeleton className="h-5 w-1/4" />
             <div className="flex gap-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
       <div className="space-y-6 pt-6">
        {Array.from({length: 2}).map((_, i) => (
           <div key={i} className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-1/4" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
           </div>
        ))}
      </div>
      </div>
    )
  }

  return (
     <div className="space-y-8">
        <div>
            <Label htmlFor="user-role" className="text-base font-semibold">Your Role</Label>
            <p className="text-sm text-muted-foreground mb-2">This helps the AI tailor its expertise and advice to your profession.</p>
            <Select 
                value={profile?.aiPreferences?.role}
                onValueChange={(value) => handlePreferenceChange('role', value)}
            >
                <SelectTrigger id="user-role" className="w-full md:w-1/2">
                    <SelectValue placeholder="Select your role..." />
                </SelectTrigger>
                <SelectContent>
                    {userRoles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>

         <div>
            <Label htmlFor="ai-tone" className="text-base font-semibold">AI Tone of Voice</Label>
            <p className="text-sm text-muted-foreground mb-2">Choose the default tone for AI-generated content.</p>
             <Select 
                value={profile?.aiPreferences?.tone}
                onValueChange={(value) => handlePreferenceChange('tone', value)}
            >
                <SelectTrigger id="ai-tone" className="w-full md:w-1/2">
                    <SelectValue placeholder="Select a tone..." />
                </SelectTrigger>
                <SelectContent>
                    {aiTones.map(tone => <SelectItem key={tone} value={tone}>{tone}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>

        <div>
            <Label className="text-base font-semibold">AI Output Format</Label>
            <p className="text-sm text-muted-foreground mb-2">Choose how you want the AI to structure its responses.</p>
            <RadioGroup 
                defaultValue={profile?.aiPreferences?.outputFormat || 'Paragraphs'} 
                className="flex flex-wrap gap-4"
                onValueChange={(value) => handlePreferenceChange('outputFormat', value)}
            >
                {aiOutputFormats.map(format => (
                    <div key={format} className="flex items-center space-x-2">
                        <RadioGroupItem value={format} id={format} />
                        <Label htmlFor={format}>{format}</Label>
                    </div>
                ))}
            </RadioGroup>
        </div>

        <div className="space-y-6 pt-6 border-t">
            {aiTools.map((tool) => (
            <div
                key={tool.id}
                className="flex flex-row items-center justify-between rounded-lg border p-4"
            >
                <div className="space-y-0.5">
                <Label htmlFor={tool.id} className={`text-base ${tool.disabled ? 'text-muted-foreground' : ''}`}>
                    {tool.name}
                </Label>
                <p className="text-sm text-muted-foreground">
                    {tool.description}
                </p>
                </div>
                <Switch
                id={tool.id}
                aria-label={`Toggle ${tool.name}`}
                disabled={tool.disabled}
                checked={!tool.disabled && profile?.aiPreferences?.[tool.preferenceKey] === true}
                onCheckedChange={() => handleToggle(tool)}
                />
            </div>
            ))}
        </div>
      </div>
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
          <Card>
            <CardHeader>
              <CardTitle>AI Preferences</CardTitle>
              <CardDescription>
                Customize your AI assistant&apos;s behavior and enable specific tools.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AiSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
