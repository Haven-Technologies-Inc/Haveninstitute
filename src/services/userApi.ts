// Mock API service for User Management
// In production, replace these with actual API calls to your backend

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  subscription: 'Free' | 'Pro' | 'Premium';
  status: 'active' | 'suspended' | 'inactive';
  joinDate: string;
  lastActive: string;
  questionsAnswered: number;
  averageScore: number;
  userType?: 'nursing-student' | 'nclex-prep' | 'both';
  phone?: string;
  location?: string;
  graduationYear?: string;
  bio?: string;
  profileImage?: string;
  hoursStudied?: number;
  studyStreak?: number;
}

export interface UserFilters {
  search?: string;
  role?: 'all' | 'student' | 'admin';
  status?: 'all' | 'active' | 'suspended' | 'inactive';
  subscription?: 'all' | 'Free' | 'Pro' | 'Premium';
  userType?: 'all' | 'nursing-student' | 'nclex-prep' | 'both';
  sortBy?: 'name' | 'email' | 'joinDate' | 'lastActive' | 'averageScore';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Mock data store
let mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    role: 'student',
    subscription: 'Premium',
    status: 'active',
    joinDate: '2024-01-15',
    lastActive: '2 hours ago',
    questionsAnswered: 456,
    averageScore: 82,
    userType: 'nclex-prep',
    phone: '+1 (555) 123-4567',
    location: 'Los Angeles, CA',
    graduationYear: '2025',
    hoursStudied: 45,
    studyStreak: 7
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.c@example.com',
    role: 'student',
    subscription: 'Pro',
    status: 'active',
    joinDate: '2024-01-10',
    lastActive: '1 day ago',
    questionsAnswered: 892,
    averageScore: 78,
    userType: 'both',
    phone: '+1 (555) 234-5678',
    location: 'New York, NY',
    graduationYear: '2024',
    hoursStudied: 62,
    studyStreak: 12
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.r@example.com',
    role: 'student',
    subscription: 'Free',
    status: 'active',
    joinDate: '2024-02-01',
    lastActive: '5 hours ago',
    questionsAnswered: 234,
    averageScore: 85,
    userType: 'nursing-student',
    phone: '+1 (555) 345-6789',
    location: 'Miami, FL',
    graduationYear: '2026',
    hoursStudied: 28,
    studyStreak: 5
  },
  {
    id: '4',
    name: 'Admin User',
    email: 'admin@nursehaven.com',
    role: 'admin',
    subscription: 'Premium',
    status: 'active',
    joinDate: '2023-12-01',
    lastActive: '10 minutes ago',
    questionsAnswered: 0,
    averageScore: 0,
    location: 'San Francisco, CA'
  },
  {
    id: '5',
    name: 'Jessica Williams',
    email: 'jessica.w@example.com',
    role: 'student',
    subscription: 'Free',
    status: 'inactive',
    joinDate: '2023-11-20',
    lastActive: '30 days ago',
    questionsAnswered: 156,
    averageScore: 65,
    userType: 'nclex-prep',
    phone: '+1 (555) 456-7890',
    location: 'Chicago, IL',
    graduationYear: '2025',
    hoursStudied: 18,
    studyStreak: 0
  },
  {
    id: '6',
    name: 'David Martinez',
    email: 'david.m@example.com',
    role: 'student',
    subscription: 'Pro',
    status: 'active',
    joinDate: '2024-02-10',
    lastActive: '3 hours ago',
    questionsAnswered: 678,
    averageScore: 88,
    userType: 'both',
    phone: '+1 (555) 567-8901',
    location: 'Houston, TX',
    graduationYear: '2024',
    hoursStudied: 55,
    studyStreak: 9
  },
  {
    id: '7',
    name: 'Amanda Lee',
    email: 'amanda.l@example.com',
    role: 'student',
    subscription: 'Premium',
    status: 'active',
    joinDate: '2024-01-05',
    lastActive: '1 hour ago',
    questionsAnswered: 1024,
    averageScore: 92,
    userType: 'nclex-prep',
    phone: '+1 (555) 678-9012',
    location: 'Seattle, WA',
    graduationYear: '2024',
    hoursStudied: 78,
    studyStreak: 15
  },
  {
    id: '8',
    name: 'James Brown',
    email: 'james.b@example.com',
    role: 'student',
    subscription: 'Free',
    status: 'suspended',
    joinDate: '2023-12-15',
    lastActive: '15 days ago',
    questionsAnswered: 89,
    averageScore: 55,
    userType: 'nursing-student',
    phone: '+1 (555) 789-0123',
    location: 'Boston, MA',
    graduationYear: '2026',
    hoursStudied: 12,
    studyStreak: 0
  }
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// GET: Fetch all users with filters and pagination
export async function getAllUsers(filters: UserFilters = {}): Promise<PaginatedResponse<User>> {
  await delay(300); // Simulate network delay

  let filtered = [...mockUsers];

  // Apply search filter
  if (filters.search) {
    const query = filters.search.toLowerCase();
    filtered = filtered.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }

  // Apply role filter
  if (filters.role && filters.role !== 'all') {
    filtered = filtered.filter(user => user.role === filters.role);
  }

  // Apply status filter
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter(user => user.status === filters.status);
  }

  // Apply subscription filter
  if (filters.subscription && filters.subscription !== 'all') {
    filtered = filtered.filter(user => user.subscription === filters.subscription);
  }

  // Apply user type filter
  if (filters.userType && filters.userType !== 'all') {
    filtered = filtered.filter(user => user.userType === filters.userType);
  }

  // Apply sorting
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      let aVal: any = a[filters.sortBy!];
      let bVal: any = b[filters.sortBy!];

      if (filters.sortBy === 'joinDate' || filters.sortBy === 'lastActive') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (aVal < bVal) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Apply pagination
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginated = filtered.slice(start, end);

  return {
    data: paginated,
    total: filtered.length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit)
  };
}

// GET: Fetch single user by ID
export async function getUserById(id: string): Promise<User | null> {
  await delay(200);
  const user = mockUsers.find(u => u.id === id);
  return user || null;
}

// POST: Create new user
export async function createUser(userData: Omit<User, 'id' | 'joinDate' | 'lastActive'>): Promise<User> {
  await delay(300);
  
  const newUser: User = {
    ...userData,
    id: String(Date.now()),
    joinDate: new Date().toISOString().split('T')[0],
    lastActive: 'Just now'
  };
  
  mockUsers.push(newUser);
  return newUser;
}

// PUT: Update existing user
export async function updateUser(id: string, userData: Partial<User>): Promise<User> {
  await delay(300);
  
  const index = mockUsers.findIndex(u => u.id === id);
  if (index === -1) {
    throw new Error('User not found');
  }
  
  mockUsers[index] = { ...mockUsers[index], ...userData };
  return mockUsers[index];
}

// DELETE: Delete user
export async function deleteUser(id: string): Promise<boolean> {
  await delay(300);
  
  const index = mockUsers.findIndex(u => u.id === id);
  if (index === -1) {
    throw new Error('User not found');
  }
  
  mockUsers.splice(index, 1);
  return true;
}

// PATCH: Update user role
export async function updateUserRole(id: string, role: 'student' | 'admin'): Promise<User> {
  await delay(200);
  
  const index = mockUsers.findIndex(u => u.id === id);
  if (index === -1) {
    throw new Error('User not found');
  }
  
  mockUsers[index].role = role;
  return mockUsers[index];
}

// PATCH: Update user subscription
export async function updateUserSubscription(id: string, subscription: 'Free' | 'Pro' | 'Premium'): Promise<User> {
  await delay(200);
  
  const index = mockUsers.findIndex(u => u.id === id);
  if (index === -1) {
    throw new Error('User not found');
  }
  
  mockUsers[index].subscription = subscription;
  return mockUsers[index];
}

// PATCH: Update user status
export async function updateUserStatus(id: string, status: 'active' | 'suspended' | 'inactive'): Promise<User> {
  await delay(200);
  
  const index = mockUsers.findIndex(u => u.id === id);
  if (index === -1) {
    throw new Error('User not found');
  }
  
  mockUsers[index].status = status;
  return mockUsers[index];
}

// POST: Suspend user
export async function suspendUser(id: string, reason?: string): Promise<User> {
  console.log(`Suspending user ${id} for reason: ${reason}`);
  return updateUserStatus(id, 'suspended');
}

// POST: Activate user
export async function activateUser(id: string): Promise<User> {
  return updateUserStatus(id, 'active');
}

// GET: Get user statistics
export async function getUserStats() {
  await delay(200);
  
  return {
    total: mockUsers.length,
    active: mockUsers.filter(u => u.status === 'active').length,
    suspended: mockUsers.filter(u => u.status === 'suspended').length,
    inactive: mockUsers.filter(u => u.status === 'inactive').length,
    students: mockUsers.filter(u => u.role === 'student').length,
    admins: mockUsers.filter(u => u.role === 'admin').length,
    freeUsers: mockUsers.filter(u => u.subscription === 'Free').length,
    proUsers: mockUsers.filter(u => u.subscription === 'Pro').length,
    premiumUsers: mockUsers.filter(u => u.subscription === 'Premium').length
  };
}

// GET: Export users to CSV
export async function exportUsersToCSV(filters: UserFilters = {}): Promise<string> {
  await delay(500);
  
  const { data } = await getAllUsers({ ...filters, page: 1, limit: 1000 });
  
  const headers = ['Name', 'Email', 'Role', 'Subscription', 'Status', 'Join Date', 'Last Active', 'Questions', 'Avg Score'];
  const rows = data.map(user => [
    user.name,
    user.email,
    user.role,
    user.subscription,
    user.status,
    user.joinDate,
    user.lastActive,
    user.questionsAnswered.toString(),
    user.averageScore.toString()
  ]);
  
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  return csv;
}

// POST: Send email to user
export async function sendEmailToUser(id: string, subject: string, message: string): Promise<boolean> {
  await delay(300);
  
  const user = mockUsers.find(u => u.id === id);
  if (!user) {
    throw new Error('User not found');
  }
  
  console.log(`Sending email to ${user.email}:\nSubject: ${subject}\nMessage: ${message}`);
  return true;
}

// POST: Send bulk email to users
export async function sendBulkEmail(userIds: string[], subject: string, message: string): Promise<boolean> {
  await delay(500);
  
  const users = mockUsers.filter(u => userIds.includes(u.id));
  console.log(`Sending bulk email to ${users.length} users:\nSubject: ${subject}\nMessage: ${message}`);
  return true;
}

// GET: Get user activity log
export async function getUserActivityLog(id: string): Promise<any[]> {
  await delay(300);
  
  // Mock activity log
  return [
    { date: '2024-02-15', action: 'Completed CAT Test', details: 'Score: 82%' },
    { date: '2024-02-14', action: 'Study Session', details: '2 hours' },
    { date: '2024-02-13', action: 'Quiz Completed', details: 'Pharmacology - 90%' },
    { date: '2024-02-12', action: 'Flashcard Review', details: '50 cards reviewed' }
  ];
}

// POST: Reset user password
export async function resetUserPassword(id: string): Promise<boolean> {
  await delay(300);
  
  const user = mockUsers.find(u => u.id === id);
  if (!user) {
    throw new Error('User not found');
  }
  
  console.log(`Password reset email sent to ${user.email}`);
  return true;
}
