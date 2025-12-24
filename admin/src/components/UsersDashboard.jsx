import React from "react";
import { Mail, Truck, Navigation, UserCircle, ArrowLeft, ArrowRight } from "lucide-react";
import UserCard from "./UserCard";
import { useNavigate } from "react-router-dom";

const UsersDashboard = ({ users }) => {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-1">All registered users and their vehicles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.slice(0, 6).map((user) => (
          <UserCard key={user._id} user={user} />
        ))}
      </div>

      <div className="flex justify-center">
  <button
    className="bg-green-500 flex transition duration-300 hover:scale-102 items-center gap-2 hover:bg-green-600 text-white px-6 py-3 rounded-sm mt-12"
    onClick={() => navigate('/all-users')}
  >
    View All Users <ArrowRight className="size-4" />
  </button>
</div>

    </div>
  );
};

export default UsersDashboard;