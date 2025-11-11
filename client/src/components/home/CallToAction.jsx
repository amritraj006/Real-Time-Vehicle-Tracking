import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";

const CallToAction = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { openSignIn } = useClerk();

  const handleStartTracking = (e) => {
    e.preventDefault();
    if (!user) {
      openSignIn(); // Open Clerk login if not logged in
    } else {
      navigate("/map"); // Go to map if logged in
    }
  };

  return (
    <div
      id="cta"
      className="border-y mt-28 border-dashed border-slate-200 w-full max-w-5xl mx-auto px-10 sm:px-16"
    >
      <div className="flex flex-col md:flex-row text-center md:text-left items-center justify-between gap-8 px-3 md:px-10 border-x border-dashed border-slate-200 py-16 sm:py-20 -mt-10 -mb-10 w-full">
        <p className="text-xl font-medium max-w-md text-slate-800">
          Track your vehicles in real-time with precision and ease.  
          Enhance your fleet management and ensure safety on the road.
        </p>

        <button
          onClick={handleStartTracking}
          className="flex items-center gap-2 rounded py-3 px-8 bg-green-600 hover:bg-green-700 transition text-white active:scale-95"
        >
          <span>Start Tracking Now</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4.5"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CallToAction;
