import React from "react";
import { Mail, Truck, Navigation, UserCircle } from "lucide-react";

const UserCard = ({ user }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <img
              src={user.image}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
            />

          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Mail size={14} />
              <span>{user.email}</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-700 flex items-center gap-2">
              <Truck size={16} />
              Assigned Vehicles
            </h4>
            <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              {user.vehicles?.length || 0}
            </span>
          </div>
          
          {user.vehicles?.length > 0 ? (
            <div className="space-y-2">
              {user.vehicles.slice(0, 3).map((vehicle, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-gray-700 font-medium">{vehicle}</span>
                  
                </div>
              ))}
              {user.vehicles.length > 3 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  +{user.vehicles.length - 3} more vehicles
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <UserCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No vehicles assigned</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;