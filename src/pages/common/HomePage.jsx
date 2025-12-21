import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, color } from 'framer-motion';
import { TrendingUp, Brain, Calendar, Users, Shield, Activity, ArrowRight, HeartPulse } from 'lucide-react';

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
                <div className='max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-6  py-4'>
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
                    <section
                        id="hero"
                        className={`flex-shrink-0 flex items-center justify-center px-6 md:px-36 relative bg-white ${!isMobile ? 'h-screen' : 'py-10'}`}
                        style={{ width: isMobile ? '100%' : '100vw' }}
                    >
                        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                            <div className="md:col-span-8 flex flex-col items-start">
                                <div className="flex items-center gap-3 mb-8">
                                    <span className="px-3 py-1 border border-slate-300 rounded-lg text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">Next-Gen Architecture</span>
                                    <span className="px-3 py-1 border border-slate-300 rounded-lg text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">AI Integrated</span>
                                </div>

                                <h1 className="text-6xl md:text-8xl font-bold text-[#0f172a] tracking-tight leading-[0.95] mb-8">
                                    Empowering <br />your <span className="bg-gradient-to-r from-[#0f172a] to-[#14b8a6] bg-clip-text text-transparent">Wellness <br />Journey.</span>
                                </h1>

                                <p className="text-xl md:text-2xl text-slate-500 max-w-2xl font-normal leading-relaxed">
                                    Experience a centralized ecosystem for medical records, real-time vitals, and AI-driven diagnostics.
                                    <span className="text-slate-900 font-bold ml-1">Healthcare, reimagined.</span>
                                </p>
                            </div>

                            <div className="md:col-span-4 flex flex-col space-y-12 border-l border-slate-300 pl-10 hidden md:flex">
                                <div className="space-y-10"> 
                                    <div>
                                        <p className="text-[#14b8a6] font-bold uppercase tracking-[0.2em] text-[16px] mb-1">
                                            360° Monitoring
                                        </p>
                                        <p className="text-slate-700 font-normal text-[18px] md:text-lg leading-relaxed">
                                            Centralized tracking of vitals and medical categories with real-time cloud synchronization.
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[#14b8a6] font-bold uppercase tracking-[0.2em] text-[16px] mb-1">
                                            AI-Powered Insights
                                        </p>
                                        <p className="text-slate-700 font-normal text-[18px] md:text-lg leading-relaxed">
                                            Advanced analysis of medical reports to provide instant, actionable health summaries.
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[#14b8a6] font-bold uppercase tracking-[0.2em] text-[16px] mb-1">
                                            Seamless Care
                                        </p>
                                        <p className="text-slate-700 font-normal text-[18px] md:text-lg leading-relaxed">
                                            Bridge the gap between specialized doctors and patients via secure digital connectivity.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-10 left-10 right-10 hidden md:flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-42 h-[1.5px] bg-[#14b8a6]"></div>
                                <span className="text-lg font-bold text-slate-400 uppercase tracking-widest">HealthLink-360</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-lg font-bold text-slate-400 uppercase tracking-widest">Global Health Tech</span>
                                <div className="w-18 h-[1.5px] bg-[#14b8a6]"></div>
                            </div>
                        </div>
                    </section>

                    <section
                        id="features"
                        className={`flex-shrink-0 flex items-center justify-center px-4 md:px-16 bg-white ${!isMobile ? 'h-screen' : 'py-20'}`}
                        style={{ width: isMobile ? '100%' : '100vw' }}
                    >
                        <div className='max-w-7xl w-full flex flex-col pt-10 md:pt-34 pb-10'>
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
        </div>
    );
};

export default HomePage;