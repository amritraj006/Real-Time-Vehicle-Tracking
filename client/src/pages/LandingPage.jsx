import React, { useEffect, useRef, useState } from "react";
import video1 from "../assets/video2.mp4";
import { ChevronLeft, ChevronRight } from "lucide-react";
import play_icon from "../assets/play_icon.png";
import pause_icon from "../assets/pause_icon.png";
import { useNavigate } from "react-router-dom";
import "../styles/LandingPage.css";
import { slides } from "../assets/slides";


const LandingPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [slideIndex, setSlideIndex] = useState(0);


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
  className="group relative px-10 py-4 backdrop-blur-sm bg-green-500/90 border border-emerald-400/30 text-white font-semibold rounded-full 
            shadow-lg hover:shadow-2xl hover:bg-emerald-600/95 hover:scale-[1.02] hover:border-emerald-300/50
            active:scale-[0.98] transition-all duration-300
            focus:outline-none focus:ring-3 focus:ring-emerald-300/50 focus:ring-offset-2 focus:ring-offset-white/10"
>
  <span className="relative z-10">Get Started</span>
  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent 
                   translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
</button>
        </div>

        {/* 🔸 Slide Controls */}
<div className="absolute bottom-10 flex items-center space-x-6">
  <button
    aria-label="Previous slide"
    onClick={handlePrevSlide}
    className="group h-14 w-14 flex items-center justify-center backdrop-blur-md bg-white/10 border border-white/20 rounded-full shadow-xl 
              hover:shadow-2xl hover:bg-white/20 hover:border-white/30 hover:scale-110 transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95"
  >
    <ChevronLeft className="h-7 w-7 text-white group-hover:translate-x-[-2px] transition-transform" />
  </button>

            <img
            src={isPlaying ? pause_icon : play_icon}
            alt={isPlaying ? "Pause" : "Play"}
            className="w-14 h-14 hover:scale-110 transition-transform"
            onClick={handleTogglePlay}
          />

  <button
    aria-label="Next slide"
    onClick={handleNextSlide}
    className="group h-14 w-14 flex items-center justify-center backdrop-blur-md bg-white/10 border border-white/20 rounded-full shadow-xl 
              hover:shadow-2xl hover:bg-white/20 hover:border-white/30 hover:scale-110 transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95"
  >
    <ChevronRight className="h-7 w-7 text-white group-hover:translate-x-[2px] transition-transform" />
  </button>
</div>


        {/* 🔸 Play / Pause */}
       
      </div>
    </div>
  );
};

export default LandingPage;
