import UserList from '../components/UserList';
import { useAuth } from '../context/AuthContext';

const Users = () => {
  const { users } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">User Management</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">All Users</h2>
              <p className="text-gray-600">Total: {users?.length} users</p>
            </div>
            <UserList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;