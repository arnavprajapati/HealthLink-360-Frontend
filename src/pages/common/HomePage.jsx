import React, { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { TrendingUp, Brain, Calendar, Users, Shield, Activity, Heart, ArrowRight, HeartPulse, Menu } from 'lucide-react'

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

const videos = [
    "https://cdn.pixabay.com/video/2022/08/31/129734-745175075_large.mp4",
    "https://cdn.pixabay.com/video/2020/06/10/41612-430008505_large.mp4",
    "https://cdn.pixabay.com/video/2022/08/31/129731-745175056_large.mp4",
];


const HomePage = () => {
    const containerRef = useRef(null)
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false)
    
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-66.66%"])
    const smoothX = useSpring(x, { stiffness: 250, damping: 35, mass: 0.4 })

    const scrollToSection = (index) => {
        if (!containerRef.current) return;
        
        if (isMobile) {
            const sections = ['mobile-hero', 'mobile-features', 'mobile-how-it-works'];
            const element = document.getElementById(sections[index]);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
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

    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    useEffect(() => {
        if (!isMobile) {
            const unsubscribe = scrollYProgress.on('change', (latest) => {
                if (latest < 0.33) {
                    setCurrentSectionIndex(0);
                } else if (latest < 0.67) {
                    setCurrentSectionIndex(1);
                } else {
                    setCurrentSectionIndex(2);
                }
            });
            return () => unsubscribe();
        }
    }, [scrollYProgress, isMobile]);

    return (
        <div ref={containerRef} className='relative bg-white' style={{ height: isMobile ? 'auto' : '300vh' }}>

            <header className='fixed top-0 left-0 right-0 z-50 bg-white shadow-md'>
                <div className='max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-6 lg:px-8 py-4'>
                    <div className='flex items-center gap-2'>
                        <div className="p-2 bg-[#00a896] rounded-full text-white shadow-lg">
                            <HeartPulse className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-extrabold text-gray-800 ml-3 tracking-wide">
                            HealthLink<span className="text-[#028090] font-black">-360</span>
                        </h2>
                    </div>

                    <nav className='hidden lg:flex items-center gap-8'>
                        {sectionNames.map((name, index) => (
                            <button
                                key={index}
                                onClick={() => scrollToSection(index)}
                                className={`
                                    font-medium cursor-pointer text-lg transition-colors relative 
                                    ${currentSectionIndex === index
                                        ? 'text-teal-600 font-bold'
                                        : 'text-gray-700 hover:text-teal-500'}
                                `}
                            >
                                {name}
                                {currentSectionIndex === index && (
                                    <motion.div
                                        layoutId="active-nav-indicator"
                                        className='absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 -mb-1'
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </nav>

                    <div className='hidden md:flex items-center gap-4'>
                        <button className='text-gray-700 cursor-pointer font-medium transition-colors hover:text-teal-600'  onClick={() => navigate('/login')} >
                            Sign In
                        </button>
                        <button className='bg-teal-500 cursor-pointer text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-teal-600 transition-all shadow-md flex items-center gap-1'  onClick={() => navigate('/signup')}>
                            Get Started <ArrowRight className="w-4 h-4" />
                        </button>
                    </div> 

                    <button className='md:hidden bg-teal-500 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-teal-600 transition-all shadow-md text-base'>
                        Start
                    </button>
                </div>
            </header>

            {isMobile ? (
                <div className='bg-white'>
                    <section id="mobile-hero" className='min-h-screen flex items-center justify-center px-5 sm:px-8 bg-white pt-24 pb-16'>
                        <div className='max-w-7xl w-full flex flex-col items-center text-center'>
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className='text-5xl sm:text-6xl font-bold text-gray-900 mb-5 leading-tight'
                            >
                                Your health, <span className='text-teal-600 italic font-serif'>understood</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className='text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed'
                            >
                                Track vitals, monitor trends, and receive personalized insights. HealthTrack AI bridges the gap between patients and doctors with intelligent health analytics.
                            </motion.p>
                        </div>
                    </section>

                    <section id="mobile-features" className='min-h-screen flex items-center justify-center px-5 sm:px-8 bg-white py-16'>
                        <div className='max-w-7xl w-full flex flex-col'>
                            <div className='text-center mb-10'>
                                <h2 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-4'>
                                    Core Features & Benefits
                                </h2>
                                <p className='text-base sm:text-lg text-gray-700 max-w-4xl mx-auto px-4'>
                                    Comprehensive tools for patients and healthcare providers, powered by intelligent analytics.
                                </p>
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6'>
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        initial="hidden"
                                        whileInView="visible"
                                        viewport={{ once: true, amount: 0.3 }}
                                        className='bg-white p-5 sm:p-6 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300'
                                    >
                                        <div className='w-12 h-12 sm:w-14 sm:h-14 bg-teal-500/10 rounded-full flex items-center justify-center mb-4 text-teal-600'>
                                            {feature.icon}
                                        </div>
                                        <h3 className='text-lg sm:text-xl font-bold text-gray-900 mb-2.5'>{feature.title}</h3>
                                        <p className='text-sm sm:text-base text-gray-600 leading-relaxed'>{feature.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="mobile-how-it-works" className='min-h-screen flex items-center justify-center px-5 sm:px-8 bg-white py-16'>
                        <div className='max-w-6xl w-full'>
                            <div className='text-center mb-10'>
                                <motion.h2
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8 }}
                                    className='text-4xl sm:text-5xl font-bold text-gray-900 mb-6'
                                >
                                    How it works
                                </motion.h2>
                                <motion.p
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2, duration: 0.8 }}
                                    className='text-base sm:text-lg text-gray-600'
                                >
                                    Get started in minutes. Your health journey, simplified.
                                </motion.p>
                            </div>

                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6'>
                                {steps.map((step, index) => (
                                    <motion.div
                                        key={index}
                                        viewport={{ once: true, amount: 0.3 }}
                                        className='relative bg-gray-50 p-5 sm:p-6 rounded-xl border border-gray-200 shadow-md hover:border-teal-500/50 transition-all duration-300 group'
                                    >
                                        <div className='mb-4 flex items-start gap-3'>
                                            <span className='text-4xl sm:text-5xl font-extrabold text-teal-500/20 group-hover:text-teal-500/40 transition-colors'>{step.number}</span>
                                            <h3 className='text-lg sm:text-xl font-bold text-gray-900 pt-1 border-b-2 border-teal-500/50'>{step.title}</h3>
                                        </div>
                                        <p className='text-sm sm:text-base text-gray-600 leading-relaxed'>{step.description}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
            ) : (
                <div className='sticky top-0 h-screen flex items-center overflow-hidden bg-white'>
                    <motion.div
                        style={{ x: smoothX }}
                        className='flex flex-nowrap'
                    >
                        <section className='flex-shrink-0 h-screen flex items-center justify-center px-16 bg-white' style={{ width: '100vw' }}>
                            <div className='max-w-7xl w-full flex items-center gap-24'>
                                <div className='flex-1 max-w-xl'>
                                    <motion.h1
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8 }}
                                        className='text-7xl font-bold text-gray-900 mb-6 leading-tight'
                                    >
                                        Your health, <span className='text-teal-600 italic font-serif'>understood</span>
                                    </motion.h1>
                                    <motion.p
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.8, delay: 0.2 }}
                                        className='text-xl text-gray-600 mb-8 leading-relaxed'
                                    >
                                        Track vitals, monitor trends, and receive personalized insights. HealthTrack AI bridges the gap between patients and doctors with intelligent health analytics.
                                    </motion.p>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 1, delay: 0.5 }}
                                    className='flex-1 flex gap-6 h-[730px]'
                                >
                                    <div className='flex-1 relative overflow-hidden'>
                                        <div className='flex flex-col gap-6 animate-scroll-up'>
                                            {[...videos, ...videos].map((videoUrl, index) => (
                                                <div
                                                    key={`top-${index}`}
                                                    className='relative rounded-3xl overflow-hidden w-full flex-shrink-0 shadow-xl border border-gray-100'
                                                    style={{ height: '300px' }}
                                                >
                                                    <video autoPlay loop muted playsInline className='w-full h-full object-cover'>
                                                        <source src={videoUrl} type='video/mp4' />
                                                    </video>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className='flex-1 relative overflow-hidden pt-12'>
                                        <div className='flex flex-col gap-6 animate-scroll-down'>
                                            {[...videos, ...videos].map((videoUrl, index) => (
                                                <div
                                                    key={`bottom-${index}`}
                                                    className='relative rounded-3xl overflow-hidden w-full flex-shrink-0 shadow-xl border border-gray-100'
                                                    style={{ height: '300px' }}
                                                >
                                                    <video autoPlay loop muted playsInline className='w-full h-full object-cover'>
                                                        <source src={videoUrl} type='video/mp4' />
                                                    </video>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </section>

                        <section className='flex-shrink-0 h-screen flex items-center justify-center px-16 bg-white' style={{ width: '100vw' }}>
                            <div className='max-w-7xl w-full flex flex-col pt-24 pb-10'>
                                <div className='text-center mb-16'>
                                    <h2 className='text-4xl font-bold text-gray-900 mb-4'>
                                        Core Features & Benefits
                                    </h2>
                                    <p className='text-xl text-gray-700 max-w-4xl mx-auto'>
                                        Comprehensive tools for patients and healthcare providers, powered by intelligent analytics.
                                    </p>
                                </div>

                                <div className='grid grid-cols-3 gap-8'>
                                    {features.map((feature, index) => (
                                        <motion.div
                                            key={index}
                                            initial="hidden"
                                            whileInView="visible"
                                            viewport={{ once: true, amount: 0.3 }}
                                            className='bg-white p-6 rounded-xl border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300'
                                        >
                                            <div className='w-12 h-12 bg-teal-500/10 rounded-full flex items-center justify-center mb-4 text-teal-600'>
                                                {feature.icon}
                                            </div>
                                            <h3 className='text-lg font-bold text-gray-900 mb-2.5'>{feature.title}</h3>
                                            <p className='text-base text-gray-600 leading-relaxed'>{feature.description}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className='flex-shrink-0 h-screen flex items-center justify-center px-16 bg-white' style={{ width: '100vw' }}>
                            <div className='max-w-6xl w-full'>
                                <div className='text-center mb-16'>
                                    <motion.h2
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.8 }}
                                        className='text-6xl font-bold text-gray-900 mb-6'
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

                                <div className='grid grid-cols-4 gap-6'>
                                    {steps.map((step, index) => (
                                        <motion.div
                                            key={index}
                                            viewport={{ once: true, amount: 0.3 }}
                                            className='relative bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-md hover:border-teal-500/50 transition-all duration-300 group'
                                        >
                                            <div className='mb-4 flex items-start gap-3'>
                                                <span className='text-5xl font-extrabold text-teal-500/20 group-hover:text-teal-500/40 transition-colors'>{step.number}</span>
                                                <h3 className='text-xl font-bold text-gray-900 pt-1 border-b-2 border-teal-500/50'>{step.title}</h3>
                                            </div>
                                            <p className='text-base text-gray-600 leading-relaxed'>{step.description}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </section>

                    </motion.div>
                </div>
            )}

            <style>{`
                @keyframes scrollUp {
                    from {
                        transform: translateY(0);
                    }
                    to {
                        transform: translateY(calc(-300px * 3 - 24px)); 
                    }
                }

                @keyframes scrollDown {
                    from {
                        transform: translateY(calc(-300px * 3 - 24px)); 
                    }
                    to {
                        transform: translateY(0);
                    }
                }

                .animate-scroll-up {
                    animation: scrollUp 20s linear infinite;
                }

                .animate-scroll-down {
                    animation: scrollDown 20s linear infinite;
                }
            `}</style>
        </div>
    )
}

export default HomePage