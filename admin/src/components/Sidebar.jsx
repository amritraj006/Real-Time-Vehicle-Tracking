import React from "react";
import { BarChart3, Users, Truck, Shield, Wifi } from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab, socket }) => {
  const menuItems = [
    { id: "stats", label: "Dashboard", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "vehicles", label: "Vehicles", icon: Truck },
  ];

  return (
    <aside className="lg:w-64 bg-gradient-to-b from-white to-gray-50 shadow-xl lg:h-screen lg:sticky lg:top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gradient-to-br from-green-600 to-blue-700 rounded-xl">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-800 bg-clip-text text-transparent">
              Admin Panel
            </h2>
            <p className="text-xs text-gray-500">Real-time Tracking System</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-l-4 border-blue-600 shadow-md"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon 
                size={20} 
                className={activeTab === item.id ? "text-blue-600" : "text-gray-500"} 
              />
              <span className="font-medium">{item.label}</span>
              {activeTab === item.id && (
                <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-8 p-4 bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">System Status</span>
          </div>
          <p className="text-xs text-gray-300">All systems operational</p>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1">
              <Wifi size={10} />
              Socket:
            </span>
            <span className={`font-medium ${socket ? 'text-green-400' : 'text-red-400'}`}>
              {socket ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>



      </div>
    </aside>
  );
};

export default Sidebar;