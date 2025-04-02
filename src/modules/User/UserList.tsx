import React, { useState } from 'react';
import { Button, Input } from '@/components/ui';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { get, del } from '@/services/apiService';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { Loader, ChevronUp, ChevronDown, Edit, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/confirm-dialog'; // Updated import for ConfirmDialog

type User = {
    id: number;
    name: string;
    email: string;
    role: string;
    lastLogin: string | null;
    active: boolean;
};

const fetchUsers = async (page: number, sortBy: string, sortDirection: string, search: string, active: string) => {
    const response = await get(`/users?page=${page}&sortBy=${sortBy}&sortDirection=${sortDirection}&search=${search}&active=${active}`);
    return response;
};

const UserList = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('name'); // Default sort column
    const [sortDirection, setSortDirection] = useState('asc'); // Default sort direction
    const [search, setSearch] = useState(''); // Search query
    const [active, setActive] = useState('all'); // Active filter (all, true, false)
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
    const navigate = useNavigate();

    // Fetch users using react-query
    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['users', currentPage, sortBy, sortDirection, search, active],
        queryFn: () => fetchUsers(currentPage, sortBy, sortDirection, search, active),
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
            // Toggle sort direction if the same column is clicked
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Set new column and default to ascending order
            setSortBy(column);
            setSortDirection('asc');
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
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Users</h2>
                        <Button onClick={() => navigate('/users/create')} variant="primary">
                            Create User
                        </Button>
                    </div>
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
                        <div className="text-center text-red-500">Failed to load users.</div>
                    ) : users.length > 0 ? (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                                            <div className="flex items-center">
                                                <span>Name</span>
                                                {sortBy === 'name' && (
                                                    <span className="ml-1">
                                                        {sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    </span>
                                                )}
                                            </div>
                                        </TableHead>
                                        <TableHead onClick={() => handleSort('email')} className="cursor-pointer">
                                            <div className="flex items-center">
                                                <span>Email</span>
                                                {sortBy === 'email' && (
                                                    <span className="ml-1">
                                                        {sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    </span>
                                                )}
                                            </div>
                                        </TableHead>
                                        <TableHead onClick={() => handleSort('role')} className="cursor-pointer">
                                            <div className="flex items-center">
                                                <span>Role</span>
                                                {sortBy === 'role' && (
                                                    <span className="ml-1">
                                                        {sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                    </span>
                                                )}
                                            </div>
                                        </TableHead>
                                        <TableHead onClick={() => handleSort('lastLogin')} className="cursor-pointer">
                                            <div className="flex items-center">
                                                <span>Last Login</span>
                                                {sortBy === 'lastLogin' && (
                                                    <span className="ml-1">
                                                        {sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
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
                            <div className="flex justify-between items-center mt-4">
                                <div>
                                    <span className="text-sm text-gray-600">
                                        Showing {users.length} of {totalUsers} records
                                    </span>
                                </div>
                                <div>
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href="#"
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                />
                                            </PaginationItem>
                                            {Array.from({ length: totalPages }, (_, index) => (
                                                <PaginationItem key={index}>
                                                    <PaginationLink
                                                        href="#"
                                                        onClick={() => handlePageChange(index + 1)}
                                                        isActive={currentPage === index + 1}
                                                    >
                                                        {index + 1}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ))}
                                            <PaginationItem>
                                                <PaginationNext
                                                    href="#"
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            </div>
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
                    console.log('Cancel clicked');
                    setShowConfirmation(false);
                    setUserToDelete(null);
                }}
                onConfirm={() => {
                    console.log('Confirm clicked for user:', userToDelete);
                    userToDelete && handleDelete(userToDelete);
                }}
            />
        </div>
    );
};

export default UserList;
