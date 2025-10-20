
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Users, Check } from 'lucide-react';
import placeholderImages from '@/lib/placeholder-images.json';
import { useState } from 'react';

// Mock data for team members
const initialTeamMembers = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'Admin',
    avatarId: 'user-avatar-1',
  },
  {
    id: '2',
    name: 'You',
    email: 'you@example.com',
    role: 'Owner',
    avatarId: 'user-avatar-2'
  },
  {
    id: '3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    role: 'Member',
    avatarId: 'user-avatar-3',
  },
   {
    id: '4',
    name: 'Diana Prince',
    email: 'diana@example.com',
    role: 'Member',
    avatarId: 'testimonial-avatar-1',
  },
];

const availableRoles = ['Admin', 'Member', 'Viewer'];


export default function TeamsPage() {
    
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers);

  const getAvatarImage = (avatarId?: string) => {
    if (!avatarId) return null;
    return placeholderImages.placeholderImages.find(p => p.id === avatarId);
  }

  const handleRoleChange = (memberId: string, newRole: string) => {
      setTeamMembers(teamMembers.map(m => m.id === memberId ? {...m, role: newRole} : m));
      // In a real app, you would call a function to update this in Firestore.
  }

  return (
    <div className="grid gap-8 animate-fade-in">
       <div className="mb-2">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
          <Users className="h-8 w-8" />
          Team Management
        </h1>
        <p className="text-muted-foreground">
          Invite, manage roles, and collaborate with your team.
        </p>
      </div>

       <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Manage who has access to your team's documents and what they can do.
            </CardDescription>
          </div>
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead className="hidden md:table-cell">Role</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.map((member) => {
              const memberAvatar = getAvatarImage(member.avatarId);
              return (
                <TableRow key={member.email}>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        {memberAvatar && <AvatarImage src={memberAvatar.imageUrl} alt={member.name} />}
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={member.role === 'Owner' || member.role === 'Admin' ? 'default' : 'secondary'}>
                        {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                          disabled={member.role === 'Owner'}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>Change Role</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                             <DropdownMenuRadioGroup value={member.role} onValueChange={(newRole) => handleRoleChange(member.id, newRole)}>
                                {availableRoles.map(role => (
                                     <DropdownMenuRadioItem key={role} value={role}>
                                        {role}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Remove from team
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </div>
  );
}
