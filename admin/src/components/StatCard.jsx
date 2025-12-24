import React from "react";

const StatCard = ({ card }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${card.color} bg-opacity-10`}>
          <card.icon className={`w-6 h-6 ${card.color.replace('bg-', 'text-')} text-white`} />
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
          LIVE
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-700">{card.title}</h3>
      <div className="flex items-end justify-between mt-2">
        <p className="text-3xl font-bold text-gray-900">{card.value}</p>
        <div className={`h-1 w-16 rounded-full bg-gradient-to-r ${card.gradient}`}></div>
      </div>
    </div>
  );
};

export default StatCard;