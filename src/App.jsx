import React, { useState, useEffect, useRef } from 'react';
import { 
  Github, 
  Linkedin, 
  Mail, 
  ExternalLink, 
  Code2, 
  Cpu, 
  PenTool, 
  Briefcase, 
  GraduationCap, 
  Terminal,
  ChevronDown,
  Globe,
  Award,
  MessageSquare,
  Sparkles,
  X,
  Send,
  Loader2,
  Bot
} from 'lucide-react';

// --- PORTFOLIO DATA (Centralized for AI Context) ---
const PORTFOLIO_DATA = {
  name: "Harmish Bhavsar",
  role: "System Engineer & Frontend Developer",
  currentCompany: "Tata Consultancy Services (Contracted to Pfizer)",
  summary: "Excelling in Frontend Development and Java programming. Specialized in creating intuitive user interfaces, wireframing in Figma, and delivering robust system solutions.",
  experiences: [
    {
      company: "Tata Consultancy Services",
      role: "System Engineer",
      period: "Oct 2023 - Present",
      location: "Mumbai, Maharashtra",
      description: "Contracted to Pfizer. Excelling in Frontend Development and Java programming. Specializing in creating intuitive user interfaces, wireframing in Figma, and delivering robust system solutions.",
      skills: ["React", "Java", "Figma", "System Design"]
    },
    {
      company: "Brainheaters",
      role: "Content Writer",
      period: "Dec 2021 - Dec 2023",
      location: "Mumbai, Maharashtra",
      description: "Worked as a content developer intern, creating engaging technical content and documentation.",
      skills: ["Content Strategy", "Technical Writing"]
    },
    {
      company: "FlyHawk RoboSpace",
      role: "Sales Manager Intern",
      period: "Sep 2021 - Feb 2022",
      location: "Delhi (Remote)",
      description: "Managed sales and marketing with CEO Anmol Gulati. Pitched Arduino and robotic projects to customers and collaborated with schools across cities.",
      skills: ["Sales", "Communication", "Robotics"]
    },
    {
      company: "Siemens",
      role: "Student Internship",
      period: "Dec 2021 (1 Month)",
      location: "Mumbai, Maharashtra",
      description: "Industrial automation software training using S7 1200 PLC at Siemens Centre of Excellence.",
      skills: ["PLC", "Automation", "S7 1200"]
    }
  ],
  education: [
    {
      school: "Vidyavardhini's College of Eng. & Tech",
      degree: "B.E. in Electronics & Telecommunication",
      period: "2019 - 2022",
      details: "Graduated with comprehensive knowledge in EXTC."
    },
    {
      school: "Shri TP Bhatia College of Science",
      degree: "HSC (Science & Electronics)",
      period: "2017 - 2019",
      grade: "69.54%",
      details: "Active in electronics projects (Arduino, LED control sequences). Won certificates in elocution and debate."
    },
    {
      school: "St. Xavier's High School",
      degree: "Secondary School",
      period: "2016 - 2017",
      grade: "87.40%",
      details: "1st Prize in Interschool Professional Debate Competition. Excelled in Grammar and Content Writing."
    }
  ],
  skills: [
    "React.js", "JavaScript (ES6+)", "HTML5/CSS3", "Java", 
    "Tailwind CSS", "Figma", "Wireframing", "Git/GitHub", 
    "Arduino", "Technical Writing", "Public Speaking", "Sales"
  ]
};

// --- GEMINI API HELPER ---
const callGeminiAPI = async (prompt) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // Set by environment
  const systemInstruction = `You are an AI assistant for Harmish Bhavsar's portfolio website. 
  Here is his complete profile data: ${JSON.stringify(PORTFOLIO_DATA)}.
  
  Your goal is to answer questions about Harmish professionally, concisely, and enthusiastically.
  - If asked about skills, list them from the data.
  - If asked about experience, summarize the relevant roles.
  - If asked "Why hire him?", generate a persuasive pitch based on his combination of System Engineering and Frontend skills.
  - Keep answers short (under 3 sentences) unless asked for details.
  - Use emojis occasionally.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] }
        })
      }
    );

    if (!response.ok) throw new Error("API call failed");
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble connecting to the AI brain right now.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Offline mode: Unable to reach Gemini AI. Please check your connection.";
  }
};

const Portfolio = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [scrollY, setScrollY] = useState(0);

  // AI State
  const [showChat, setShowChat] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', text: "Hi! I'm Harmish's AI Assistant. Ask me anything about his skills, experience, or projects! 🤖" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const [aiSummary, setAiSummary] = useState("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, showChat]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      const sections = ['home', 'about', 'experience', 'education', 'contact'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= 300) {
            setActiveSection(section);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- AI HANDLERS ---

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput("");
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    const response = await callGeminiAPI(userMsg);
    
    setIsTyping(false);
    setChatHistory(prev => [...prev, { role: 'assistant', text: response }]);
  };

  const handleGenerateSummary = async () => {
    if (aiSummary) return; // Don't regenerate if already done
    setIsGeneratingSummary(true);
    const summary = await callGeminiAPI("Generate a powerful, 2-sentence 'Elevator Pitch' for Harmish that highlights his transition from Electronics to System Engineering/Frontend. Make it sound impressive.");
    setAiSummary(summary);
    setIsGeneratingSummary(false);
  };

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 selection:bg-cyan-500 selection:text-white font-sans overflow-x-hidden">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md bg-slate-950/70 border-b border-slate-800/50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity" onClick={() => scrollTo('home')}>
            HB.
          </div>
          
          <div className="hidden md:flex gap-8 text-sm font-medium">
            {['About', 'Experience', 'Education', 'Contact'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollTo(item.toLowerCase())}
                className="hover:text-cyan-400 transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all group-hover:w-full"></span>
              </button>
            ))}
          </div>

          <a 
            href="https://www.linkedin.com/in/harmish-bhavsar-822968214" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 border border-slate-700 flex items-center gap-2"
          >
            <Linkedin size={16} /> Connect
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative z-10 min-h-screen flex items-center justify-center pt-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-sm animate-fade-in-up">
            System Engineer & Frontend Developer
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight animate-fade-in-up animation-delay-100">
            Hi, I'm <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">Harmish Bhavsar</span>
          </h1>
          
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            I craft responsive, high-performance digital experiences. Currently building robust systems at 
            <span className="text-white font-semibold"> Tata Consultancy Services</span>.
            Specialized in Frontend Engineering, Java, and UI Design.
          </p>

          {/* AI Generated Summary Area */}
          <div className="h-24 mb-8 max-w-2xl mx-auto animate-fade-in-up animation-delay-300">
             {!aiSummary && !isGeneratingSummary && (
                <button 
                  onClick={handleGenerateSummary}
                  className="group relative inline-flex items-center gap-2 px-6 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-purple-500/50 rounded-full text-sm text-purple-300 transition-all"
                >
                  <Sparkles size={16} className="text-purple-400 group-hover:animate-pulse" />
                  Tap to Generate AI Profile Summary
                </button>
             )}
             
             {isGeneratingSummary && (
               <div className="flex items-center justify-center gap-2 text-purple-400">
                 <Loader2 size={20} className="animate-spin" />
                 <span className="text-sm">Gemini is analyzing profile...</span>
               </div>
             )}

             {aiSummary && (
               <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-xl p-4 text-sm text-slate-300 shadow-lg backdrop-blur-sm animate-fade-in-up">
                 <div className="flex gap-2 items-start">
                    <Sparkles size={16} className="text-purple-400 mt-1 flex-shrink-0" />
                    <p>"{aiSummary}"</p>
                 </div>
               </div>
             )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-300">
            <button 
              onClick={() => scrollTo('experience')}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full font-semibold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              View Work <ChevronDown size={18} />
            </button>
            <button 
              onClick={() => setShowChat(true)}
              className="px-8 py-3 bg-slate-900 border border-slate-700 rounded-full font-semibold text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all flex items-center justify-center gap-2 group"
            >
              Ask AI About Me <Bot size={18} className="text-cyan-400 group-hover:animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {/* About & Skills Grid */}
      <section id="about" className="relative z-10 py-20 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Technical <span className="text-cyan-400">Arsenal</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-white">More Than Just Code</h3>
              <p className="text-slate-400 leading-relaxed">
                My journey started with electronics—tinkering with <span className="text-cyan-400">Arduino boards</span> and <span className="text-cyan-400">Oscilloscopes</span>. This hardware foundation gave me a unique perspective on how software interacts with the physical world.
              </p>
              <p className="text-slate-400 leading-relaxed">
                Today, I leverage that analytical mindset in <strong>Frontend Development</strong>. Whether it's debating complex topics or architecting scalable Java applications, I bring passion and precision to every project.
              </p>
            </div>

            <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Terminal size={100} />
              </div>
              <div className="flex flex-wrap gap-3 relative z-10">
                {PORTFOLIO_DATA.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-medium text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/50 transition-all cursor-default hover:-translate-y-1"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" className="relative z-10 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">
            Professional <span className="text-cyan-400">Journey</span>
          </h2>

          <div className="relative space-y-12">
            {/* Vertical Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/0 via-cyan-500/50 to-cyan-500/0"></div>

            {PORTFOLIO_DATA.experiences.map((exp, index) => (
              <div key={index} className={`relative flex flex-col md:flex-row gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                
                {/* Timeline Dot */}
                <div className="absolute left-4 md:left-1/2 -translate-x-[9px] w-5 h-5 rounded-full border-4 border-slate-950 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] z-10 mt-1.5"></div>

                {/* Content Card */}
                <div className="ml-12 md:ml-0 md:w-1/2 group">
                  <div className={`p-6 bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1 ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                        {index === 0 ? <Code2 size={20} /> : index === 1 ? <PenTool size={20} /> : index === 2 ? <Briefcase size={20} /> : <Cpu size={20} />}
                      </div>
                      <h3 className="text-xl font-bold text-white">{exp.role}</h3>
                    </div>
                    
                    <h4 className="text-lg font-medium text-slate-300 mb-1">{exp.company}</h4>
                    <div className="flex justify-between text-sm text-slate-500 mb-4 font-mono">
                      <span>{exp.period}</span>
                      <span>{exp.location}</span>
                    </div>
                    
                    <p className="text-slate-400 text-sm leading-relaxed mb-4 border-l-2 border-slate-700 pl-3">
                      {exp.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {exp.skills.map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-400 group-hover:text-cyan-300 transition-colors">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section id="education" className="relative z-10 py-24 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
            Education & <span className="text-purple-400">Background</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PORTFOLIO_DATA.education.map((edu, index) => (
              <div key={index} className="bg-gradient-to-b from-slate-800 to-slate-900 p-[1px] rounded-2xl hover:scale-105 transition-transform duration-300">
                <div className="bg-slate-950 h-full rounded-2xl p-6 flex flex-col relative overflow-hidden">
                  {/* Decorative gradient overlay */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
                  
                  <div className="mb-4 text-purple-400">
                    {index === 0 ? <GraduationCap size={24} /> : <Award size={24} />}
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2 leading-tight">{edu.school}</h3>
                  <p className="text-purple-300 text-sm font-medium mb-1">{edu.degree}</p>
                  
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-4 font-mono border-b border-slate-800 pb-2">
                    <span>{edu.period}</span>
                    {edu.grade && <span>Grade: {edu.grade}</span>}
                  </div>
                  
                  <p className="text-sm text-slate-400 flex-grow">
                    {edu.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / Contact */}
      <section id="contact" className="relative z-10 py-20 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Let's Build Something <span className="text-cyan-400">Great</span></h2>
          <p className="text-slate-400 mb-10 max-w-lg mx-auto">
            Currently working at TCS but always open to connecting with fellow developers and tech enthusiasts.
          </p>
          
          <div className="flex justify-center gap-6 mb-12">
            <a 
              href="https://www.linkedin.com/in/harmish-bhavsar-822968214"
              target="_blank"
              rel="noreferrer" 
              className="p-4 bg-slate-900 rounded-full text-slate-400 hover:text-white hover:bg-blue-600 transition-all hover:-translate-y-1 shadow-lg hover:shadow-blue-500/25"
            >
              <Linkedin size={24} />
            </a>
            <a 
              href="mailto:contact@example.com"
              className="p-4 bg-slate-900 rounded-full text-slate-400 hover:text-white hover:bg-red-500 transition-all hover:-translate-y-1 shadow-lg hover:shadow-red-500/25"
            >
              <Mail size={24} />
            </a>
            <a 
              href="#"
              className="p-4 bg-slate-900 rounded-full text-slate-400 hover:text-white hover:bg-slate-700 transition-all hover:-translate-y-1 shadow-lg"
            >
              <Github size={24} />
            </a>
          </div>

          <div className="text-sm text-slate-600">
            <p>© {new Date().getFullYear()} Harmish Bhavsar. Built with React & Tailwind. Powered by Gemini AI.</p>
          </div>
        </div>
      </section>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {!showChat && (
          <button 
            onClick={() => setShowChat(true)}
            className="p-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full shadow-lg shadow-cyan-500/30 hover:scale-110 transition-transform animate-bounce-slow"
          >
            <MessageSquare size={24} />
          </button>
        )}

        {showChat && (
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-80 sm:w-96 shadow-2xl flex flex-col h-[500px] overflow-hidden animate-fade-in-up">
            {/* Header */}
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <h3 className="font-semibold text-white">Ask AI Harmish ✨</h3>
              </div>
              <button 
                onClick={() => setShowChat(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/50">
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-cyan-600 text-white rounded-tr-none' 
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                 <div className="flex justify-start">
                   <div className="bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl rounded-tl-none p-3 text-sm flex gap-1">
                     <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                     <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                     <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                   </div>
                 </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about my projects..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
              <button 
                type="submit"
                disabled={!chatInput.trim() || isTyping}
                className="p-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Custom Styles for animations */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        .animation-delay-100 { animation-delay: 0.1s; opacity: 0; }
        .animation-delay-200 { animation-delay: 0.2s; opacity: 0; }
        .animation-delay-300 { animation-delay: 0.3s; opacity: 0; }
      `}</style>
    </div>
  );
};

export default Portfolio;