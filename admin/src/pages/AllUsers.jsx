import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import UserCard from '../components/UserCard';
import { FiArrowLeft, FiSearch, FiUsers } from 'react-icons/fi';
import { HiOutlineUserGroup } from 'react-icons/hi';

const AllUsers = () => {
  const { users } = useAppContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter users based on search input
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button on Left */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin-dashboard')}
            className="inline-flex items-center gap-2 px-4 py-3 bg-white text-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:bg-gray-50 border border-gray-200 mb-6 group"
          >
            <FiArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Admin Dashboard</span>
          </button>

          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-200">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow">
                <HiOutlineUserGroup className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  User Management
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                    {users.length} total users
                  </span>
                  <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                    {filteredUsers.length} filtered
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-600 mt-4 text-lg">
              Manage all registered users and their associated vehicles in one centralized dashboard
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <FiSearch className="w-5 h-5 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900">Search Users</h2>
          </div>
          <div className="relative max-w-2xl">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or any user details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="mt-3 text-sm text-gray-500">
              Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} matching "{searchTerm}"
            </p>
          )}
        </div>

        {/* Users Grid Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <FiUsers className="w-6 h-6 text-gray-700" />
              <h2 className="text-2xl font-bold text-gray-900">All Users</h2>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Sorted by:</span> Recent activity
            </div>
          </div>

          {filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredUsers.map((user, index) => (
                <div 
                  key={user._id} 
                  className="transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <UserCard user={user} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <FiUsers className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                No users found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'No users are currently registered in the system'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AllUsers;