import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { TrendingUp, Brain, Calendar, Users, Shield, Activity, ArrowRight, HeartPulse } from 'lucide-react';

import patientImg from '../../assets/patient-phone.jpg';
import doctorImg from '../../assets/doctor-dashboard.jpg';
import aiBrainImg from '../../assets/ai-brain.jpg';

const sectionIDs = ['hero', 'features', 'how-it-works'];
const sectionNames = ['Home', 'Features', 'How It Works'];

const features = [
    {
        icon: <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />,
        title: "Smart Analytics",
        description: "Track trends across all your vitals with intelligent pattern recognition and predictive insights."
    },
    {
        icon: <Brain className="w-6 h-6 sm:w-8 sm:h-8" />,
        title: "AI-Powered Insights",
        description: "Receive personalized health recommendations based on your unique health profile and history."
    },
    {
        icon: <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />,
        title: "Calendar Integration",
        description: "Sync appointments with Google Calendar. Never miss a checkup or medication reminder."
    },
    {
        icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />,
        title: "Doctor Dashboard",
        description: "Healthcare providers get a comprehensive view of patient data with clinical notes and summaries."
    },
    {
        icon: <Shield className="w-6 h-6 sm:w-8 sm:h-8" />,
        title: "Secure & Private",
        description: "End-to-end encryption and HIPAA compliance ensure your health data stays protected."
    },
    {
        icon: <Activity className="w-6 h-6 sm:w-8 sm:h-8" />,
        title: "Multi-Disease Support",
        description: "Whether it's diabetes, hypertension, or cardiac health - track multiple conditions seamlessly."
    }
];

const steps = [
    {
        number: "01",
        title: "Create Your Profile",
        description: "Sign up and input your basic health information. Connect wearables or manually log your readings."
    },
    {
        number: "02",
        title: "Track Your Vitals",
        description: "Log blood pressure, heart rate, glucose levels, and more. Set goals and monitor your progress over time."
    },
    {
        number: "03",
        title: "Receive AI Insights",
        description: "Our AI analyzes your data patterns and provides personalized recommendations to improve your health."
    },
    {
        number: "04",
        title: "Connect with Doctors",
        description: "Share your health data with healthcare providers. Get clinical notes and schedule appointments seamlessly."
    }
];

const HomePage = () => {
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-66.66%"]);
    const smoothX = useSpring(x, { stiffness: 250, damping: 35, mass: 0.4 });

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (!isMobile) {
            const unsubscribe = scrollYProgress.on('change', (latest) => {
                if (latest < 0.33) setCurrentSectionIndex(0);
                else if (latest < 0.67) setCurrentSectionIndex(1);
                else setCurrentSectionIndex(2);
            });
            return () => unsubscribe();
        } else {
        }
    }, [scrollYProgress, isMobile]);

    const scrollToSection = (index) => {
        if (!containerRef.current) return;

        if (isMobile) {
            const element = document.getElementById(sectionIDs[index]);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                setCurrentSectionIndex(index);
            }
        } else {
            const windowHeight = window.innerHeight;
            const totalContainerHeight = containerRef.current.offsetHeight;
            const scrollableHeight = totalContainerHeight - windowHeight;
            const scrollPercentage = index / (sectionIDs.length - 1);
            const targetScroll = scrollableHeight * scrollPercentage;

            window.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div 
            ref={containerRef} 
            className='relative bg-white' 
            style={{ height: isMobile ? 'auto' : '300vh' }}
        >
            <header className='fixed top-0 left-0 right-0 z-50 bg-white shadow-md'>
                <div className='max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-6 lg:px-8 py-4'>
                    <div className='flex items-center gap-2'>
                        <div className="p-2 bg-[#00a896] rounded-full text-white shadow-lg">
                            <HeartPulse className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-800 ml-3 tracking-wide">
                            HealthLink<span className="text-[#028090] font-black">-360</span>
                        </h2>
                    </div>

                    <nav className='hidden lg:flex items-center gap-8'>
                        {sectionNames.map((name, index) => (
                            <button
                                key={index}
                                onClick={() => scrollToSection(index)}
                                className={`
                                    font-medium cursor-pointer text-xl transition-colors relative 
                                    ${currentSectionIndex === index
                                        ? 'text-[#02c39a] font-bold'
                                        : 'text-gray-700 hover:text-[#02c39a]'}
                                `}
                            >
                                {name}
                                {currentSectionIndex === index && (
                                    <motion.div
                                        layoutId="active-nav-indicator"
                                        className='absolute bottom-0 left-0 right-0 h-0.5 bg-[#02c39a] -mb-1'
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className='hidden md:flex items-center gap-8'>
                        <button
                            className='text-gray-700 cursor-pointer text-xl font-medium transition-colors hover:text-[#02c39a]'
                            onClick={() => navigate('/login')}
                        >
                            Sign In
                        </button>
                        <button
                            className='bg-[#02c39a] cursor-pointer text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#00a896] transition-all shadow-md flex items-center gap-1 text-xl'
                            onClick={() => navigate('/signup')}
                        >
                            Get Started <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <button className='md:hidden bg-[#02c39a] text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-[#00a896] transition-all shadow-md text-base' onClick={() => navigate('/signup')}>
                        Start
                    </button>
                </div>
            </header>

            <div className={`${!isMobile ? 'sticky top-0 h-screen flex items-center overflow-hidden' : 'pt-24 pb-10 overflow-hidden'}`}>
                
                <motion.div
                    style={!isMobile ? { x: smoothX } : {}}
                    className={`flex ${isMobile ? 'flex-col' : 'flex-nowrap'}`}
                >
                    {/* SECTION 1: HERO */}
                    <section 
                        id="hero"
                        className={`flex-shrink-0 flex items-center justify-center px-4 sm:px-16 relative overflow-hidden ${!isMobile ? 'min-h-screen pt-28' : 'py-10'}`} 
                        style={{ width: isMobile ? '100%' : '100vw' }}
                    >
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#02c39a_1px,transparent_1px)] [background-size:20px_20px]"></div>

                        <div className='max-w-[95vw] w-full z-10'>
                            <div className='text-center mb-10'>
                                <motion.h1
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8 }}
                                    className='text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight'
                                >
                                    <span className="text-[#028090]">HealthTrack AI:</span> Smart Health Monitoring Platform
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className='text-lg md:text-xl text-gray-600 mx-auto max-w-3xl'
                                >
                                    Track vitals, monitor trends, and receive personalized insights. HealthTrack AI bridges the gap between patients and doctors with intelligent health analytics.
                                </motion.p>
                            </div>

                            <div className='flex flex-col xl:flex-row items-center justify-center gap-6 xl:gap-0 w-full'>
                                
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.4 }}
                                    className='group relative bg-white overflow-hidden shadow-2xl transition-all duration-300 border-4 border-[#02c39a] w-full max-w-[500px] rounded-2xl z-20'
                                >
                                    <div className='aspect-[16/10] overflow-hidden relative'>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
                                        <img src={patientImg} alt="Patient tracking" className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700' />
                                        <div className="absolute top-4 left-4 z-20 bg-[#02c39a] text-white px-3 py-1 rounded-full text-lg font-bold shadow-lg">For Patients</div>
                                    </div>
                                    <div className='p-6 bg-white relative z-20'>
                                        <h3 className='text-2xl font-bold text-[#028090] mb-2 flex items-center gap-2'>
                                            Track Vitals & Goals
                                        </h3>
                                        <p className='text-lg text-gray-600 font-medium'>Real-time insights for a healthier you.</p>
                                    </div>
                                </motion.div>

                                <div className="flex flex-col xl:flex-row items-center z-10 -my-4 xl:-my-0 xl:-mx-3">
                                    <div className="h-16 w-1 xl:h-1 xl:w-24 bg-gray-200 relative overflow-hidden rounded-full">
                                        <div className={`absolute bg-[#02c39a] h-full w-full ${isMobile ? 'animate-pulse' : 'animate-pulse-flow'}`}></div>
                                    </div>
                                    <div className="w-3 h-3 bg-[#02c39a] rounded-full shadow-[0_0_10px_#02c39a]"></div>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8, delay: 0.6 }}
                                    className='relative z-30 shrink-0 mx-0 my-4 xl:my-0'
                                >
                                    <div className='relative'>
                                        <div className='absolute inset-0 bg-[#02c39a] rounded-full blur-3xl opacity-20 animate-pulse'></div>
                                        <div className='relative flex items-center justify-center w-40 h-40 md:w-52 md:h-52'>
                                            <div className="absolute inset-0 border-2 border-dashed border-[#02c39a]/40 rounded-full animate-[spin_10s_linear_infinite]"></div>
                                            <div className="absolute inset-4 border border-[#028090]/20 rounded-full"></div>
                                            <img src={aiBrainImg} alt="AI Brain" className='w-32 h-32 md:w-82 md:h-60 object-contain drop-shadow-xl mix-blend-multiply relative z-10' />
                                        </div>
                                    </div>
                                </motion.div>

                                <div className="flex flex-col xl:flex-row items-center z-10 -my-4 xl:-my-0 xl:-mx-3">
                                    <div className="w-3 h-3 bg-[#028090] rounded-full shadow-[0_0_10px_#028090]"></div>
                                    <div className="h-16 w-1 xl:h-1 xl:w-24 bg-gray-200 relative overflow-hidden rounded-full">
                                        <div className={`absolute bg-[#028090] h-full w-full ${isMobile ? 'animate-pulse' : 'animate-pulse-flow-reverse'}`}></div>
                                    </div>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.8 }}
                                    className='group relative bg-white overflow-hidden shadow-2xl transition-all duration-300 border-4 border-[#028090] w-full max-w-[500px] rounded-2xl z-20'
                                >
                                    <div className='aspect-[16/10] overflow-hidden relative'>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
                                        <img src={doctorImg} alt="Doctor Dashboard" className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700' />
                                        <div className="absolute top-4 right-4 z-20 bg-[#028090] text-white px-3 py-1 rounded-full text-lg font-bold shadow-lg">For Doctors</div>
                                    </div>
                                    <div className='p-6 bg-white relative z-20'>
                                        <h3 className='text-2xl font-bold text-[#028090] mb-2 flex items-center justify-between'>
                                            Manage & Analyze
                                            <Activity className="w-6 h-6 text-[#02c39a]" />
                                        </h3>
                                        <p className='text-lg text-gray-600 font-medium'>Advanced tools for better care.</p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 2: FEATURES */}
                    <section 
                        id="features"
                        className={`flex-shrink-0 flex items-center justify-center px-4 md:px-16 bg-white ${!isMobile ? 'h-screen' : 'py-20'}`} 
                        style={{ width: isMobile ? '100%' : '100vw' }}
                    >
                        <div className='max-w-7xl w-full flex flex-col pt-10 md:pt-24 pb-10'>
                            <div className='text-center mb-16'>
                                <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
                                    Core Features & Benefits
                                </h2>
                                <p className='text-xl text-gray-700 max-w-4xl mx-auto'>
                                    Comprehensive tools for patients and healthcare providers.
                                </p>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.3 }}
                                        className='bg-white p-6 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300'
                                    >
                                        <div className='w-12 h-12 bg-[#02c39a]/10 rounded-full flex items-center justify-center mb-4 text-[#02c39a]'>
                                            {feature.icon}
                                        </div>
                                        <h3 className='text-lg font-bold text-gray-900 mb-2.5'>{feature.title}</h3>
                                        <p className='text-lg text-gray-600 leading-relaxed'>{feature.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section 
                        id="how-it-works"
                        className={`flex-shrink-0 flex items-center justify-center px-4 md:px-16 bg-white ${!isMobile ? 'h-screen' : 'py-20'}`} 
                        style={{ width: isMobile ? '100%' : '100vw' }}
                    >
                        <div className='max-w-6xl w-full'>
                            <div className='text-center mb-16'>
                                <motion.h2
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8 }}
                                    className='text-4xl md:text-6xl font-bold text-gray-900 mb-6'
                                >
                                    How it works
                                </motion.h2>
                                <motion.p
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2, duration: 0.8 }}
                                    className='text-xl text-gray-600'
                                >
                                    Get started in minutes. Your health journey, simplified.
                                </motion.p>
                            </div>
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10'>
                                {steps.map((step, index) => (
                                    <motion.div
                                        key={index}
                                        viewport={{ once: true, amount: 0.3 }}
                                        className='relative bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-md hover:border-[#02c39a]/50 transition-all duration-300 group'
                                    >
                                        <div className='mb-4 flex items-start gap-3'>
                                            <span className='text-5xl font-extrabold text-[#02c39a]/20 group-hover:text-[#02c39a]/40 transition-colors'>{step.number}</span>
                                            <h3 className='text-xl font-bold text-gray-900 pt-1 border-b-2 border-[#02c39a]/50'>{step.title}</h3>
                                        </div>
                                        <p className='text-lg text-gray-600 leading-relaxed'>{step.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                </motion.div>
            </div>

            <style>{`
                @keyframes zoomUp {
                    0% { transform: scale(1) translateY(0); }
                    100% { transform: scale(2) translateY(40px); }
                }
                .animate-zoomUp { animation: zoomUp 4s ease-in-out infinite alternate; }

                @keyframes pulse-flow {
                    0% { transform: translateX(-100%); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateX(100%); opacity: 0; }
                }
                .animate-pulse-flow { animation: pulse-flow 2s infinite linear; }

                @keyframes pulse-flow-reverse {
                    0% { transform: translateX(100%); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translateX(-100%); opacity: 0; }
                }
                .animate-pulse-flow-reverse { animation: pulse-flow-reverse 2s infinite linear; }
            `}</style>
        </div>
    );
};

export default HomePage;