import React, { useState } from 'react';
import { Button, Input } from '@/components/ui';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { get, del } from '@/services/apiService';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import CustomPagination from '@/components/common/custom-pagination';
import {
    Loader,
    ChevronUp,
    ChevronDown,
    Edit,
    Trash2,
    Filter,
    Download,
    Plus,
} from 'lucide-react';
import ConfirmDialog from '@/components/common/confirm-dialog';

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
    lastLogin: string | null;
    active: boolean;
};

const fetchUsers = async (page: number, sortBy: string, sortOrder: string, search: string, active: string) => {
    const response = await get(`/users?page=${page}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${search}&active=${active}`);
    return response;
};

const UserList = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('name'); // Default sort column
    const [sortOrder, setSortOrder] = useState('asc'); // Default sort order
    const [search, setSearch] = useState(''); // Search query
    const [active, setActive] = useState('all'); // Active filter (all, true, false)
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
    const navigate = useNavigate();
    const recordsPerPage = 10;

    // Fetch users using react-query
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['users', currentPage, sortBy, sortOrder, search, active],
        queryFn: () => fetchUsers(currentPage, sortBy, sortOrder, search, active),
        keepPreviousData: true, // Keeps previous data while fetching new data
    });

    const users = data?.users || [];
    const totalPages = data?.totalPages || 1;
    const totalUsers = data?.totalUsers || 0;

    // Handle user deletion
    const handleDelete = async (id: number) => {
        try {
            await del(`/users/${id}`);
            toast.success('User deleted successfully');
            refetch(); // Refetch users after deletion
        } catch {
            toast.error('Failed to delete user');
        } finally {
            setShowConfirmation(false);
            setUserToDelete(null);
        }
    };

    const confirmDelete = (id: number) => {
        setUserToDelete(id);
        setShowConfirmation(true);
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Handle sorting
    const handleSort = (column: string) => {
        if (sortBy === column) {
            // Toggle sort order if the same column is clicked
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // Set new column and default to ascending order
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setCurrentPage(1); // Reset to the first page
    };

    // Handle active filter change
    const handleActiveChange = (value: string) => {
        setActive(value);
        setCurrentPage(1); // Reset to the first page
    };

    return (
        <div className="mt-2 p-6">
            <h1 className="text-2xl font-bold mb-6">User Management</h1>
            <Card className="mx-auto mt-10">
                <CardContent>
                    {/* Toolbar */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex gap-2">
                            {/* Filter Button */}
                            <Button
                                variant="outline"
                                onClick={() => console.log('Filter clicked')}
                            >
                                <Filter className="mr-2 h-4 w-4" />
                                Filter
                            </Button>

                            {/* Export Button */}
                            <Button
                                variant="outline"
                                onClick={() => console.log('Export clicked')}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </div>

                        {/* Create Button */}
                        <Button onClick={() => navigate('/users/create')} variant="primary">
                            <Plus className="mr-2 h-4 w-4" />
                            Create User
                        </Button>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex gap-4 mb-4">
                        <Input
                            placeholder="Search users..."
                            value={search}
                            onChange={handleSearchChange}
                            className="w-1/3"
                        />
                        <Select value={active} onValueChange={handleActiveChange}>
                            <SelectTrigger className="w-1/3">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Separator className="mb-4" />
                    {isLoading ? (
                        <div className="flex justify-center items-center h-32">
                            <Loader className="mr-2 h-8 w-8 animate-spin" />
                        </div>
                    ) : isError ? (
                        <div className="text-center text-red-500">
                            Failed to load users.
                        </div>
                    ) : users.length > 0 ? (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead
                                            onClick={() => handleSort('name')}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-center">
                                                <span>Name</span>
                                                {sortBy === 'name' && (
                                                    <span className="ml-1">
                                                        {sortOrder === 'asc' ? (
                                                            <ChevronUp size={16} />
                                                        ) : (
                                                            <ChevronDown size={16} />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            onClick={() => handleSort('email')}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-center">
                                                <span>Email</span>
                                                {sortBy === 'email' && (
                                                    <span className="ml-1">
                                                        {sortOrder === 'asc' ? (
                                                            <ChevronUp size={16} />
                                                        ) : (
                                                            <ChevronDown size={16} />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            onClick={() => handleSort('role')}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-center">
                                                <span>Role</span>
                                                {sortBy === 'role' && (
                                                    <span className="ml-1">
                                                        {sortOrder === 'asc' ? (
                                                            <ChevronUp size={16} />
                                                        ) : (
                                                            <ChevronDown size={16} />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            onClick={() => handleSort('lastLogin')}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-center">
                                                <span>Last Login</span>
                                                {sortBy === 'lastLogin' && (
                                                    <span className="ml-1">
                                                        {sortOrder === 'asc' ? (
                                                            <ChevronUp size={16} />
                                                        ) : (
                                                            <ChevronDown size={16} />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </TableHead>
                                        <TableHead
                                            onClick={() => handleSort('active')}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-center">
                                                <span>Active</span>
                                                {sortBy === 'active' && (
                                                    <span className="ml-1">
                                                        {sortOrder === 'asc' ? (
                                                            <ChevronUp size={16} />
                                                        ) : (
                                                            <ChevronDown size={16} />
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.role}</TableCell>
                                            <TableCell>
                                                {user.lastLogin
                                                    ? new Date(user.lastLogin).toLocaleString()
                                                    : 'Never'}
                                            </TableCell>
                                            <TableCell>{user.active ? 'Yes' : 'No'}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => navigate(`/users/${user.id}/edit`)}
                                                    >
                                                        <Edit size={16} />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => confirmDelete(user.id)}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <CustomPagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalRecords={totalUsers}
                                recordsPerPage={recordsPerPage}
                                onPageChange={handlePageChange}
                            />
                        </>
                    ) : (
                        <div className="text-center">No users found.</div>
                    )}
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showConfirmation}
                title="Confirm Deletion"
                description="Are you sure you want to delete this user?"
                onCancel={() => {
                    setShowConfirmation(false);
                    setUserToDelete(null);
                }}
                onConfirm={() => {
                    userToDelete && handleDelete(userToDelete);
                }}
            />
        </div>
    );
};

export default UserList;
