import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaGithub, 
  FaLinkedin, 
  FaInstagram, 
  FaHome,
  FaCode,
  FaDatabase,
  FaServer,
  FaReact,
  FaNodeJs
} from 'react-icons/fa';
import { SiMongodb, SiExpress } from 'react-icons/si';

const About = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Udit Bansal",
      role: "Frontend Developer",
      description: "Specializes in React, Redux, and modern UI/UX design. Creates responsive, accessible interfaces with focus on performance and user experience.",
      image: "https://media.licdn.com/dms/image/v2/D4E03AQFFgvO1gCVD6A/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1696403393779?e=1766620800&v=beta&t=HqCY3W8yxUbIuETcs8x5Ef-6xki1yaeD5uHgBeDcLcg",
      github: "https://github.com/Bansaludit1385",
      linkedin: "https://www.linkedin.com/in/udit-bansal-8288ba294/",
      instagram: "https://instagram.com/alexchen_dev",
      skills: ["React", "JavaScript", "TypeScript", "Tailwind", "Redux"],
      icon: <FaReact className="text-cyan-500" />
    },
    {
      id: 2,
      name: "Amrit Raj",
      role: "Team Lead & Full Stack Developer",
      description: "Leads the team with 1+ years MERN stack experience. Excels in architecture design, API development, and project management. Ensures best practices across the stack.",
      image: "https://media.licdn.com/dms/image/v2/D5635AQF2I8ouSN5LjA/profile-framedphoto-shrink_400_400/B56Zr_IrUTIsAg-/0/1765217056810?e=1765825200&v=beta&t=3o8GfVOY6-BwBElnudZiseBGHh5mXOKERaXwfaKRKJ8",
      github: "https://github.com/amritraj006",
      linkedin: "https://www.linkedin.com/in/amrit-raj-54652b294/",
      instagram: "https://instagram.com/sam.codes",
      skills: ["Node.js", "Express", "MongoDB", "React", "Docker", "AWS"],
      icon: <FaCode className="text-purple-500" />
    },
    {
      id: 3,
      name: "Suryadev Rana",
      role: "Backend Developer",
      description: "Focuses on server-side logic, database design, and API security. Implements scalable and efficient backend systems with optimal performance.",
      image: "https://media.licdn.com/dms/image/v2/D5603AQFhWh-2_bo5bQ/profile-displayphoto-shrink_400_400/B56ZbXq5F3GsAg-/0/1747375068998?e=1766620800&v=beta&t=6fw6so4LLDHSiPw3x-dIyY6q1UcmftF3U6fA12QuQK8",
      github: "https://www.linkedin.com/in/suryadev-rana-878a19272/",
      linkedin: "https://www.linkedin.com/in/suryadev-rana-878a19272/",
      instagram: "https://instagram.com/marcus_dev",
      skills: ["Node.js", "Express", "MongoDB", "REST APIs", "JWT", "Redis"],
      icon: <FaServer className="text-green-500" />
    }
  ];

  const techStack = [
    { name: "MongoDB", icon: <SiMongodb className="text-green-600 text-2xl" />, color: "bg-green-100" },
    { name: "Express", icon: <SiExpress className="text-gray-800 text-2xl" />, color: "bg-gray-100" },
    { name: "React", icon: <FaReact className="text-cyan-600 text-2xl" />, color: "bg-cyan-100" },
    { name: "Node.js", icon: <FaNodeJs className="text-green-700 text-2xl" />, color: "bg-green-100" },
    { name: "Tailwind CSS", icon: <FaCode className="text-teal-500 text-2xl" />, color: "bg-teal-100" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-6 sm:p-6 md:p-8">
      {/* Header with Home Button */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 md:mb-16 gap-4 sm:gap-0">
          <Link 
            to="/home"
            className="flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto justify-center sm:justify-start"
          >
            <FaHome className="text-blue-600" />
            <span className="font-semibold text-gray-700">Back to Home</span>
          </Link>
          
          <div className="w-full sm:w-auto text-center sm:text-right">
            <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              MERN Stack Team
            </h1>
          </div>
        </div>

        {/* Page Header */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 px-2">
            Meet Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Development Team</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            We're a passionate team of developers building modern web applications using the MERN stack. 
            Combining expertise in frontend elegance and backend robustness to deliver exceptional digital experiences.
          </p>
        </div>

        {/* Team Members Section - Team Lead in Middle on Large Screens */}
        <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-6 sm:gap-8 mb-16 md:mb-20">
          {teamMembers.map((member) => {
            // Determine if this member is the team lead
            const isTeamLead = member.role.includes("Team Lead");
            
            return (
              <div 
                key={member.id}
                className={`relative w-full max-w-sm sm:max-w-md ${
                  isTeamLead 
                    ? "lg:order-2 lg:-mt-8 lg:scale-105 z-10" 
                    : member.id === 1 
                      ? "lg:order-1" 
                      : "lg:order-3"
                }`}
              >
                {/* Member Card */}
                <div className={`
                  bg-white rounded-2xl shadow-xl overflow-hidden
                  transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl
                  h-full flex flex-col
                  ${isTeamLead 
                    ? "border-4 border-transparent bg-gradient-to-br from-white to-blue-50 shadow-2xl" 
                    : ""
                  }
                `}>
                  {/* Profile Header */}
                  <div className="relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-50"></div>
                    
                    {/* Profile Image */}
                    <div className="relative flex justify-center -mb-16">
                      <div className="
                        w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white 
                        shadow-xl overflow-hidden mt-6 sm:mt-8
                      ">
                        <img 
                          src={member.image} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Member Info */}
                  <div className="pt-20 sm:pt-20 px-5 sm:px-6 md:px-8 pb-6 sm:pb-8 flex-grow">
                    {/* Name and Role */}
                    <div className="text-center mb-4 sm:mb-6">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800">{member.name}</h3>
                      <div className="flex items-center justify-center gap-2 mt-1 sm:mt-2">
                        {member.icon}
                        <p className="text-base sm:text-lg font-semibold text-blue-600">{member.role}</p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-center mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                      {member.description}
                    </p>

                    {/* Skills */}
                    <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-8">
                      {member.skills.map((skill, idx) => (
                        <span 
                          key={idx}
                          className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Social Links */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                      <a 
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors duration-300 shadow-md"
                      >
                        <FaGithub className="text-lg sm:text-xl" />
                        <span className="font-medium text-sm sm:text-base">GitHub</span>
                      </a>
                      
                      <a 
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 shadow-md"
                      >
                        <FaLinkedin className="text-lg sm:text-xl" />
                        <span className="font-medium text-sm sm:text-base">LinkedIn</span>
                      </a>
                      
                      <a 
                        href={member.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg hover:opacity-90 transition-colors duration-300 shadow-md"
                      >
                        <FaInstagram className="text-lg sm:text-xl" />
                        <span className="font-medium text-sm sm:text-base">Instagram</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Technology Stack */}
        <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 md:p-8 mb-10 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-8 sm:mb-10">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Technology Stack</span>
          </h2>
          
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10">
            {techStack.map((tech, index) => (
              <div 
                key={index}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className={`
                  w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-2xl flex items-center justify-center
                  ${tech.color} shadow-lg group-hover:shadow-xl
                  transform transition-all duration-300 group-hover:scale-110
                  mb-3 sm:mb-4
                `}>
                  {tech.icon}
                </div>
                <span className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors text-sm sm:text-base">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-8 sm:mt-10 md:mt-12 text-center">
            <div className="inline-flex flex-wrap items-center justify-center px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full gap-2">
              <span className="text-xl sm:text-2xl font-bold text-white">M</span>
              <span className="text-xl sm:text-2xl font-bold text-white">E</span>
              <span className="text-xl sm:text-2xl font-bold text-white">R</span>
              <span className="text-xl sm:text-2xl font-bold text-white">N</span>
              <span className="ml-2 sm:ml-3 text-white font-semibold text-sm sm:text-base">Full Stack Excellence</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-xs sm:text-sm mb-6 sm:mb-8 px-2">
          <p>© {new Date().getFullYear()} MERN Stack Team. All rights reserved.</p>
          <p className="mt-1 sm:mt-2">Building the future, one line of code at a time.</p>
        </div>
      </div>
    </div>
  );
};

export default About;