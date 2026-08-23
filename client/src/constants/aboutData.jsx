import React from "react";
import { FaCode, FaServer, FaReact, FaNodeJs } from "react-icons/fa";
import { SiMongodb, SiExpress } from "react-icons/si";

export const teamMembers = [
  {
    id: 1,
    name: "Udit Bansal",
    role: "Frontend Developer",
    description:
      "Specializes in React, Redux, and modern UI/UX design. Creates responsive, accessible interfaces with focus on performance and user experience.",
    image:
      "https://media.licdn.com/dms/image/v2/D4E03AQFFgvO1gCVD6A/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1696403393779?e=1766620800&v=beta&t=HqCY3W8yxUbIuETcs8x5Ef-6xki1yaeD5uHgBeDcLcg",
    github: "https://github.com/Bansaludit1385",
    linkedin: "https://www.linkedin.com/in/udit-bansal-8288ba294/",
    instagram: "https://instagram.com/alexchen_dev",
    skills: ["React", "JavaScript", "TypeScript", "Tailwind", "Redux"],
    icon: <FaReact className="text-cyan-500" />,
  },
  {
    id: 2,
    name: "Amrit Raj",
    role: "Team Lead & Full Stack Developer",
    description:
      "Leads the team with 1+ years MERN stack experience. Excels in architecture design, API development, and project management. Ensures best practices across the stack.",
    image:
      "https://media.licdn.com/dms/image/v2/D5635AQF2I8ouSN5LjA/profile-framedphoto-shrink_400_400/B56Zr_IrUTIsAg-/0/1765217056810?e=1767074400&v=beta&t=stuvEKUQgzAxLgK8IGKz0CmHeOfLmjGoviSwDZT7AEI",
    github: "https://github.com/amritraj006",
    linkedin: "https://www.linkedin.com/in/amrit-raj-54652b294/",
    instagram: "https://instagram.com/sam.codes",
    skills: ["Node.js", "Express", "MongoDB", "React", "Docker", "AWS"],
    icon: <FaCode className="text-purple-500" />,
  },
  {
    id: 3,
    name: "Suryadev Rana",
    role: "Backend Developer",
    description:
      "Focuses on server-side logic, database design, and API security. Implements scalable and efficient backend systems with optimal performance.",
    image:
      "https://media.licdn.com/dms/image/v2/D5603AQFhWh-2_bo5bQ/profile-displayphoto-shrink_400_400/B56ZbXq5F3GsAg-/0/1747375068998?e=1766620800&v=beta&t=6fw6so4LLDHSiPw3x-dIyY6q1UcmftF3U6fA12QuQK8",
    github: "https://www.linkedin.com/in/suryadev-rana-878a19272/",
    linkedin: "https://www.linkedin.com/in/suryadev-rana-878a19272/",
    instagram: "https://instagram.com/marcus_dev",
    skills: ["Node.js", "Express", "MongoDB", "REST APIs", "JWT", "Redis"],
    icon: <FaServer className="text-green-500" />,
  },
];

export const techStack = [
  {
    name: "MongoDB",
    icon: <SiMongodb className="text-green-600 text-2xl" />,
    color: "bg-green-100",
  },
  {
    name: "Express",
    icon: <SiExpress className="text-gray-800 text-2xl" />,
    color: "bg-gray-100",
  },
  {
    name: "React",
    icon: <FaReact className="text-cyan-600 text-2xl" />,
    color: "bg-cyan-100",
  },
  {
    name: "Node.js",
    icon: <FaNodeJs className="text-green-700 text-2xl" />,
    color: "bg-green-100",
  },
  {
    name: "Tailwind CSS",
    icon: <FaCode className="text-teal-500 text-2xl" />,
    color: "bg-teal-100",
  },
];
