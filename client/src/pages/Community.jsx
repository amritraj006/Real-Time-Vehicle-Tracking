import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Community = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    formData.append(
      "access_key",
      import.meta.env.VITE_WEB3FORMS_ACCESS_KEY
    );

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert("Success! Your message has been sent.");
        e.target.reset();
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 relative">
      
      {/* Home Button */}
      <button
        onClick={() => navigate("/home")}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-white border border-gray-300 px-3 sm:px-4 py-2 rounded-md shadow hover:bg-gray-100 transition text-sm sm:text-base"
      >
        ⬅ Home
      </button>

      {/* Contact Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white w-full max-w-3xl p-6 sm:p-8 md:p-10 rounded-xl shadow-lg flex flex-col items-center text-sm"
      >
        <p className="text-lg text-green-600 font-medium pb-2 text-center">
          Contact Us
        </p>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-700 pb-4 text-center">
          Get in touch with us
        </h1>

        <p className="text-sm text-gray-500 text-center pb-8 sm:pb-10 max-w-xl">
          A real-time vehicle tracking system built to monitor, share,
          and manage vehicle locations efficiently.
          <br className="hidden sm:block" />
          Developed as a practical and scalable college project.
        </p>

        {/* Name & Email */}
        <div className="flex flex-col md:flex-row gap-6 w-full">
          <div className="w-full">
            <label className="text-black/70">Your Name</label>
            <input
              name="name"
              type="text"
              required
              className="h-12 p-2 mt-2 w-full border border-gray-500/30 rounded-md outline-none focus:border-green-400"
            />
          </div>

          <div className="w-full">
            <label className="text-black/70">Your Email</label>
            <input
              name="email"
              type="email"
              required
              className="h-12 p-2 mt-2 w-full border border-gray-500/30 rounded-md outline-none focus:border-green-400"
            />
          </div>
        </div>

        {/* Message */}
        <div className="mt-6 w-full">
          <label className="text-black/70">Message</label>
          <textarea
            name="message"
            required
            className="w-full mt-2 p-2 h-36 sm:h-40 border border-gray-500/30 rounded-md resize-none outline-none focus:border-green-400"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-8 bg-green-500 hover:bg-green-600 text-white h-12 w-full sm:w-56 rounded-md active:scale-95 transition disabled:opacity-60"
        >
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
};

export default Community;
