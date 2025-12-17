import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input'; // 👈 NEW
import { usersApi } from '@/services/api';
import { User, UserRole } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [search, setSearch] = useState(''); // 👈 NEW

  // Load users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      const res = await usersApi.getAll();

      if (res.success && res.data) {
        setUsers(res.data);
      } else {
        toast({
          title: 'Failed to load users',
          description: res.message || 'Please try again later.',
          variant: 'destructive',
        });
      }

      setIsLoading(false);
    };

    fetchUsers();
  }, [toast]);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setActionUserId(userId);
    const res = await usersApi.updateRole(userId, role);

    if (res.success && res.data) {
      // use user returned from backend
      const updatedUser = res.data;
      setUsers(prev =>
        prev.map(u => (u.id === userId ? updatedUser : u)),
      );
      toast({
        title: 'Role updated',
        description: res.message || `User role changed to "${role}".`,
      });
    } else {
      toast({
        title: 'Failed to update role',
        description: res.message || 'Please try again.',
        variant: 'destructive',
      });
    }

    setActionUserId(null);
  };

  const handleBanToggle = async (userId: string, currentlyBanned: boolean) => {
    const nextIsBanned = !currentlyBanned;

    const res = await usersApi.toggleBan(userId, nextIsBanned);

    if (res.success && res.data) {
      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, isBanned: nextIsBanned } : u
        )
      );
      toast({
        title: res.data.isBanned ? 'User banned' : 'User unbanned',
      });
    } else {
      toast({
        title: 'Ban action failed',
        description: res.message,
        variant: 'destructive',
      });
    }
  };

  // 👇 Filter by displayName OR email (case-insensitive)
  const filteredUsers = users.filter(user => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (user.displayName || '').toLowerCase().includes(q) ||
      (user.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Title + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">Users Management</h2>
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full sm:w-72"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">
              Loading users…
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">
                        {user.displayName || user.email}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Select
                        value={user.role}
                        onValueChange={v =>
                          handleRoleChange(user.id, v as UserRole)
                        }
                        disabled={actionUserId === user.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={user.isBanned ? 'destructive' : 'default'}
                      >
                        {user.isBanned ? 'Banned' : 'Active'}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleBanToggle(user.id, user.isBanned)
                        }
                      >
                        {user.isBanned ? 'Unban' : 'Ban'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                      No users match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
