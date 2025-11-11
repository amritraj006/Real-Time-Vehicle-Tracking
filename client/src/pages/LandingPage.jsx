import React, { useEffect, useRef, useState } from "react";
import video1 from "../assets/video1.mp4";
import { ChevronLeft, ChevronRight } from "lucide-react";
import play_icon from "../assets/play_icon.png";
import pause_icon from "../assets/pause_icon.png";
import { useNavigate } from "react-router-dom";
import "../styles/LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Real-Time Vehicle Tracking",
      description:
        "Monitor your vehicles live with instant location updates anywhere, anytime.",
    },
    {
      id: 2,
      title: "Smart Fleet Management",
      description:
        "Empower admins to track, manage, and optimize vehicle operations efficiently.",
    },
    {
      id: 3,
      title: "Share Live Location",
      description:
        "Users can share their live vehicle location securely with friends and family.",
    },
    {
      id: 4,
      title: "Built with MERN Stack",
      description:
        "A modern web solution integrating MongoDB, Express, React, and Node.js.",
    },
  ];

  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) video.pause();
    else video.play();

    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handlePrevSlide = () => {
    setSlideIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  const handleNextSlide = () => {
    setSlideIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const currentSlide = slides[slideIndex];

  return (
    <div className="fixed inset-0 overflow-hidden font-sans">
      {/* 🔹 Background Video */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        src={video1}
        autoPlay
        muted
        loop
        playsInline
      />

      {/* 🔹 Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />

      {/* 🔹 Content */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center space-y-8 px-6">
        {/* 🔸 Logo */}
        <div
          onClick={() => navigate("/home")}
          className="absolute top-6 left-6 cursor-pointer"
        >
          <img
            src="/favicon.svg"
            alt="Logo"
            className="h-16 w-16 hover:scale-105 transition-transform"
          />
        </div>

        {/* 🔸 Slide Text */}
        <div
          key={currentSlide.id}
          className="space-y-6 transition-all duration-700 ease-in-out animate-fadeSlide"
        >
          <h1 className="text-white text-4xl md:text-6xl font-medium drop-shadow-lg tracking-wide">
            {currentSlide.title}
          </h1>
          <h3 className="text-white text-lg md:text-xl text-center drop-shadow-md leading-relaxed px-4 max-w-2xl mx-auto">
            {currentSlide.description}
          </h3>

          <button
            onClick={() => navigate("/home")}
            className="mt-4 text-white bg-red-500 px-8 py-3 rounded-full text-lg hover:scale-105 hover:bg-red-600 transition-transform shadow-lg"
          >
            Get Started
          </button>
        </div>

        {/* 🔸 Slide Controls */}
        <div className="absolute bottom-10 flex items-center space-x-10">
  <div
    onClick={handlePrevSlide}
    className="h-14 w-14 flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full shadow-lg cursor-pointer 
    hover:from-purple-600 hover:to-pink-500 hover:scale-125 hover:shadow-2xl transition-all duration-300 ease-in-out"
  >
    <ChevronLeft className="h-7 w-7" />
  </div>

  <div
    onClick={handleNextSlide}
    className="h-14 w-14 flex items-center justify-center bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-full shadow-lg cursor-pointer 
    hover:from-blue-500 hover:to-purple-600 hover:scale-125 hover:shadow-2xl transition-all duration-300 ease-in-out"
  >
    <ChevronRight className="h-7 w-7" />
  </div>
</div>


        {/* 🔸 Play / Pause */}
        <div className="absolute bottom-10 right-10 cursor-pointer">
          <img
            src={isPlaying ? pause_icon : play_icon}
            alt={isPlaying ? "Pause" : "Play"}
            className="w-12 h-12 hover:scale-110 transition-transform"
            onClick={handleTogglePlay}
          />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
