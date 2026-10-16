import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useScene } from '../../context/SceneContext';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import '../../styles/GlobalOverlay.scss';

gsap.registerPlugin(TextPlugin);

// Clean vector platform icons matching sketch aesthetic
const PlatformIcon = ({ name, size = 18 }) => {
    switch (name?.toLowerCase()) {
        case 'linkedin':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                </svg>
            );
        case 'github':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
            );
        case 'techneekx':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
            );
        case 'leetcode':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                    <line x1="14" y1="4" x2="10" y2="20" />
                </svg>
            );
        case 'kaggle':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4v16" />
                    <path d="M4 12l10-8" />
                    <path d="M7 10l9 10" />
                </svg>
            );
        case 'google':
        case 'google developer profile':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v8" />
                    <path d="M8 12h8" />
                </svg>
            );
        case 'unstop':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                    <path d="M4 22h16" />
                    <path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34" />
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
                </svg>
            );
        case 'instagram':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
            );
        case 'youtube':
        case 'techneekx youtube':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
                </svg>
            );
        case 'community':
        case 'techneekx community':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            );
        case 'x':
        case 'twitter':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            );
        default:
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
            );
    }
};

const GlobalOverlay = () => {
    const { overlayContent, closeOverlay } = useScene();
    const [isVisible, setIsVisible] = useState(false);
    const [animateOpen, setAnimateOpen] = useState(false);

    // Check if mobile based on window width
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (overlayContent) {
            setIsVisible(true);
            const delayAnim = setTimeout(() => {
                setAnimateOpen(true);
            }, 50);
            return () => clearTimeout(delayAnim);
        } else {
            setAnimateOpen(false);
            const timer = setTimeout(() => setIsVisible(false), 800);
            return () => clearTimeout(timer);
        }
    }, [overlayContent]);

    const [cachedContent, setCachedContent] = useState(null);
    useEffect(() => {
        if (overlayContent) {
            setCachedContent(overlayContent);
        }
    }, [overlayContent]);

    const dummyGridContent = {
        title: 'Loading...',
        layout: 'certificate_grid',
        items: [],
        platformConfig: { label: '...' }
    };

    const content = overlayContent || cachedContent || dummyGridContent;

    return <ContentCard content={content} isOpen={animateOpen} onClose={closeOverlay} isMobile={isMobile} />;
};

const ContentCard = ({ content, isOpen, onClose, isMobile }) => {
    if (!content) return null;

    const label = content.platformConfig?.label || 'Overview';
    
    // Robust layout classification
    const isProfile = content.layout === 'profiles_grid' || 
                      content.id === 'award-profiles' || 
                      content.id === 'award-other' || 
                      Boolean(content.items && (label === 'PROFILES' || label === 'ECOSYSTEM' || content.title?.toLowerCase().includes('sarthak') || content.title?.toLowerCase().includes('profile')));

    const isHackathon = !isProfile && (
                        content.layout === 'hackathons_grid' || 
                        content.id === 'award-hackathons' || 
                        content.id === 'award-sotm' || 
                        Boolean(content.sections && (label === 'HACKATHONS' || label === 'COMPETITIONS' || label === 'ACHIEVEMENTS' || content.title?.toLowerCase().includes('hackathon'))));

    const isCertificate = !isProfile && !isHackathon && (
                          content.layout === 'certificates_grid' || 
                          content.layout === 'certificate_grid' || 
                          content.id === 'award-certificates' || 
                          content.id === 'award-sotd' || 
                          Boolean(content.sections && (label === 'CERTIFICATES' || label === 'CREDENTIALS' || label === 'PRESTIGE' || content.title?.toLowerCase().includes('certificat') || content.title?.toLowerCase().includes('award'))));

    const isWideLayout = isProfile || isHackathon || isCertificate;

    // Custom scrollbar state
    const scrollContainerRef = useRef(null);
    const trackRef = useRef(null);
    const thumbRef = useRef(null);
    const isDragging = useRef(false);
    const dragStartY = useRef(0);
    const dragStartScroll = useRef(0);
    const [scrollThumbTop, setScrollThumbTop] = useState(0);
    const [showScrollbar, setShowScrollbar] = useState(false);

    const updateThumbPosition = useCallback(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const { scrollTop, scrollHeight, clientHeight } = el;
        const maxScroll = scrollHeight - clientHeight;
        setShowScrollbar(maxScroll > 10);
        if (maxScroll <= 0) return;
        const scrollRatio = scrollTop / maxScroll;
        const trackEl = trackRef.current;
        if (!trackEl) return;
        const trackHeight = trackEl.clientHeight;
        const thumbHeight = 32;
        const usableHeight = trackHeight * 0.9 - thumbHeight;
        const topOffset = trackHeight * 0.05;
        setScrollThumbTop(topOffset + scrollRatio * usableHeight);
    }, []);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;
        const onScroll = () => updateThumbPosition();
        el.addEventListener('scroll', onScroll, { passive: true });
        const raf = requestAnimationFrame(updateThumbPosition);
        return () => {
            el.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(raf);
        };
    }, [updateThumbPosition, content]);

    useEffect(() => {
        const timer = setTimeout(updateThumbPosition, 200);
        return () => clearTimeout(timer);
    }, [isOpen, content, updateThumbPosition]);

    const handleThumbMouseDown = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        isDragging.current = true;
        dragStartY.current = e.clientY;
        dragStartScroll.current = scrollContainerRef.current?.scrollTop || 0;
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
    }, []);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging.current) return;
            const el = scrollContainerRef.current;
            const trackEl = trackRef.current;
            if (!el || !trackEl) return;
            const deltaY = e.clientY - dragStartY.current;
            const trackHeight = trackEl.clientHeight;
            const thumbHeight = 32;
            const usableHeight = trackHeight * 0.9 - thumbHeight;
            const { scrollHeight, clientHeight } = el;
            const maxScroll = scrollHeight - clientHeight;
            const scrollDelta = (deltaY / usableHeight) * maxScroll;
            el.scrollTop = dragStartScroll.current + scrollDelta;
        };
        const handleMouseUp = () => {
            if (isDragging.current) {
                isDragging.current = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, []);

    const handleTrackClick = useCallback((e) => {
        const el = scrollContainerRef.current;
        const trackEl = trackRef.current;
        if (!el || !trackEl) return;
        const rect = trackEl.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const trackHeight = trackEl.clientHeight;
        const ratio = Math.max(0, Math.min(1, (clickY - trackHeight * 0.05) / (trackHeight * 0.9)));
        const { scrollHeight, clientHeight } = el;
        el.scrollTop = ratio * (scrollHeight - clientHeight);
    }, []);

    const handleBackdropClick = (e) => {
        if (e.target.classList.contains('global-overlay-wrapper') || e.target.classList.contains('global-overlay-backdrop-layer')) {
            onClose();
        }
    };

    const transitionSpring = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.8s ease';
    const transitionContent = 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';

    const cardStyle = isMobile ? {
        width: '92%',
        maxHeight: '80vh',
        bottom: isWideLayout ? 'auto' : '10rem',
        left: '50%',
        top: isWideLayout ? '50%' : 'auto',
        transform: isOpen 
            ? (isWideLayout ? 'translate(-50%, -50%) rotate(0deg)' : 'translate(-50%, 0) rotate(-1deg)') 
            : (isWideLayout ? 'translate(-50%, 100%) rotate(10deg)' : 'translate(-50%, 120%) rotate(10deg)'),
        opacity: isOpen ? 1 : 0,
        color: '#1a1a1a',
    } : {
        width: isWideLayout ? 'clamp(320px, 92vw, 1100px)' : 'clamp(280px, 30vw, 450px)',
        height: isWideLayout ? 'clamp(540px, 86vh, 880px)' : 'auto',
        maxHeight: isWideLayout ? '86vh' : '80vh',
        right: isWideLayout ? 'auto' : 'clamp(2rem, 12vw, 20rem)',
        left: isWideLayout ? '50%' : 'auto',
        top: '50%',
        transform: isOpen 
            ? (isWideLayout ? 'translate(-50%, -50%) rotate(0deg)' : 'translateY(-50%) rotate(1deg)') 
            : (isWideLayout ? 'translate(-50%, 100%) rotate(10deg)' : 'translate(150%, -50%) rotate(15deg)'),
        opacity: isOpen ? 1 : 0,
        color: '#1a1a1a',
    };

    const getStaggerStyle = (delay) => ({
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
        transition: transitionContent,
        transitionDelay: isOpen ? `${delay}ms` : '0ms',
    });

    const maskStyle = isWideLayout ? {
        maskImage: 'none',
        WebkitMaskImage: 'none'
    } : isMobile ? {
        maskImage: 'radial-gradient(circle at 50% 25%, transparent 0%, transparent 15%, black 40%)',
        WebkitMaskImage: 'radial-gradient(circle at 50% 25%, transparent 0%, transparent 15%, black 40%)'
    } : {
        maskImage: 'radial-gradient(circle at 31% 50%, transparent 0%, transparent 12%, black 35%)',
        WebkitMaskImage: 'radial-gradient(circle at 31% 50%, transparent 0%, transparent 12%, black 35%)'
    };

    // Default Fallback Data if empty items/sections received
    const defaultProfileItems = [
        { name: 'LinkedIn', url: 'https://www.linkedin.com/in/sarthak-singhaniya-a4ab9a323', icon: 'linkedin', description: 'Professional journey, internships, achievements, leadership & projects.', buttonText: 'Visit LinkedIn' },
        { name: 'GitHub', url: 'https://github.com/sarthaksinghaniya', icon: 'github', description: 'Open-source projects, AI/ML implementations, development work & experiments.', buttonText: 'Visit GitHub' },
        { name: 'TechNeekX', url: 'https://techneekx.in', icon: 'techneekx', description: 'Founder & Head — technology community focused on AI, development, hackathons and student opportunities.', buttonText: 'Visit TechNeekX' },
        { name: 'LeetCode', url: 'https://leetcode.com/u/FYCfvXYnxf/', icon: 'leetcode', description: '100+ problems solved • DSA • Algorithms • Problem Solving', buttonText: 'View LeetCode' },
        { name: 'Kaggle', url: 'https://www.kaggle.com/singhaniyasarthak', icon: 'kaggle', description: 'AI/ML • Data Science • Engineering AI • Notebooks & datasets', buttonText: 'View Kaggle' },
        { name: 'Google Developer Profile', url: 'https://g.dev/sarthaksinghaniya', icon: 'google', description: 'Google technologies • Generative AI • Developer learning & achievements', buttonText: 'View Profile' },
        { name: 'Unstop', url: 'https://unstop.com/u/sarthsin39721', icon: 'unstop', description: 'Hackathons • Competitions • Challenges • Internships • Achievements', buttonText: 'View Unstop' },
        { name: 'Instagram', url: 'https://www.instagram.com/sarthak_shubh_/', icon: 'instagram', description: 'Technology • Events • Creativity • Personal journey', buttonText: 'Follow' },
        { name: 'TechNeekX YouTube', url: 'https://www.youtube.com/@TechNeekX', icon: 'youtube', description: 'Hackathons • Workshops • Tech events • Community content', buttonText: 'Watch Channel' },
        { name: 'TechNeekX Community', url: 'https://teamtechneekx.netlify.app', icon: 'community', description: 'Student community for learning, building, networking and innovation.', buttonText: 'Explore Community' }
    ];

    const defaultCertificateSections = [
        {
            sectionTitle: 'Featured Recognition',
            items: [{ name: 'INMUN High Commendation', category: 'Leadership & Communication', recognition: 'High Commendation', issuer: 'Ryan INMUN', url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK' }]
        },
        {
            sectionTitle: 'AI / Machine Learning',
            items: [
                { name: 'Google Cloud — Intro to Gen AI Studio', issuer: 'Google', focus: 'Generative AI • Google Cloud • AI Development', url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK' },
                { name: 'Kaggle Engineering AI', issuer: 'Kaggle', focus: 'AI Engineering • Machine Learning • Data Science', url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK' },
                { name: 'Machine Learning Using Python', issuer: 'Tech', focus: 'Machine Learning • Python • Model Development', url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK' },
                { name: 'AI/ML Fundamentals', issuer: 'Tech', focus: 'Artificial Intelligence • Machine Learning', url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK' }
            ]
        },
        {
            sectionTitle: 'Development',
            items: [{ name: 'ChatGPT-4 for Developers', issuer: 'OpenAI', focus: 'AI-assisted development • Developer productivity • LLMs', url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK' }]
        },
        {
            sectionTitle: 'Data & Analytics',
            items: [
                { name: 'Data Visualization with Python', issuer: 'Tech', focus: 'Python • Data Visualization • Analytics', url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK' },
                { name: 'Business Analytics with Excel', issuer: 'Tech', focus: 'Business Analytics • Excel • Data Analysis', url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK' }
            ]
        }
    ];

    const defaultHackathonSections = [
        {
            sectionTitle: 'WINNERS (3+)',
            items: [{ name: 'HackBio — IIT Mandi', achievement: 'WINNER', badge: 'WINNER', institution: 'IIT Mandi', category: 'Hackathon / Innovation', isWinner: true, description: 'Winner at HackBio, demonstrating technical problem-solving, innovation and rapid product development.', url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK' }]
        },
        {
            sectionTitle: 'ORGANIZED & LED (6+)',
            items: [
                { name: 'Kalpathon Hackathon', achievement: 'ORGANIZER & LEAD', badge: 'LEAD ORGANIZER', organizer: 'Kalpathon / TechNeekX', category: 'National Hackathon', description: 'Led and organized Kalpathon! Spearheading national builder challenges, live hacking, and open-source project showcases.', url: 'https://github.com/topics/kalpathonhackathon' },
                { name: 'Innvedx Hackathon', achievement: 'HOST & DIRECTOR', badge: 'DIRECTOR', organizer: 'Innvedx Ecosystem', category: 'Innovation Hackathon', description: 'Directed and hosted the Innvedx Hackathon ecosystem, uniting student builders, AI innovators, and rapid shipping sprints.', url: 'https://github.com/topics/innvedxhackathon' },
                { name: 'TNX Codathon & Workshops', achievement: 'FOUNDER & HOST', badge: 'FOUNDER', organizer: 'TechNeekX Community', category: 'Community Hackathons', description: 'Organized internal coding marathons, AI build sprints, and startup ideation challenges for 100+ developer community members.', url: 'https://teamtechneekx.netlify.app' }
            ]
        },
        {
            sectionTitle: 'JUDGING & MENTORSHIP',
            items: [
                { name: 'Official Hackathon Judge (2 Hackathons)', achievement: 'OFFICIAL JURY (2x)', badge: 'OFFICIAL JURY', category: 'Hackathon Jury / Evaluation', description: 'Served as an official Judge across 2 major hackathons, evaluating 100+ AI agents, system architectures, UI/UX, and live pitch demos.', url: 'https://www.linkedin.com/in/sarthak-singhaniya-a4ab9a323' },
                { name: 'Technical Mentor (3 Hackathons)', achievement: 'TECHNICAL MENTOR (3x)', badge: 'OFFICIAL MENTOR', category: 'Engineering Mentorship', description: 'Mentored participant teams across 3 hackathons, guiding builders through rapid MVP prototyping, AI/ML pipeline debugging, and pitch preparation.', url: 'https://www.linkedin.com/in/sarthak-singhaniya-a4ab9a323' }
            ]
        },
        {
            sectionTitle: 'FINALISTS',
            items: [
                { name: 'LMNIT Jaipur Hackathon', achievement: 'FINALIST', badge: 'FINALIST', category: 'Technology / Hackathon', description: 'Reached the finalist stage in a competitive national-level hackathon.', url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK' },
                { name: 'IIT Patna E-Summit', achievement: 'FINALIST', badge: 'FINALIST', institution: 'IIT Patna', category: 'Entrepreneurship / Innovation', description: 'Reached the finalist stage while exploring technology-driven entrepreneurial solutions.', url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK' },
                { name: 'National Hackathon', achievement: 'NATIONAL FINALIST', badge: 'NATIONAL FINALIST', category: 'Technology / Innovation', description: 'Reached the finalist stage in a national-level hackathon.', url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK' }
            ]
        },
        {
            sectionTitle: 'IIT / NATIONAL PARTICIPATIONS (90+)',
            items: [
                { name: 'Bharatiya Antariksh Hackathon — ISRO', achievement: 'PARTICIPANT', badge: 'ISRO • NATIONAL LEVEL', organizer: 'ISRO / Hack2Skill', category: 'Space Technology • Innovation', description: 'Participated in a national-level space technology innovation challenge.', url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK' },
                { name: "Xpecto'26 — IIT Mandi", achievement: 'HACKATHON PARTICIPANT', badge: 'HACKATHON PARTICIPANT', institution: 'IIT Mandi', project: 'FractureFusion AI', technologies: ['AI', 'ML', 'Deep Learning', 'Computer Vision'], description: 'Worked on an AI-driven fracture detection solution using advanced deep-learning approaches.', url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK' },
                { name: 'IIT Madras AI Hackathon', achievement: 'PARTICIPANT', badge: 'PARTICIPANT', institution: 'IIT Madras', category: 'Artificial Intelligence', description: 'Participated in an AI-focused hackathon focused on solving technology-driven challenges.', url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK' },
                { name: 'IIT Kharagpur Data Science Hackathon', achievement: 'PARTICIPANT', badge: 'PARTICIPANT', institution: 'IIT Kharagpur', category: 'Data Science • AI/ML', description: 'Applied data science and analytical problem-solving to real-world challenges.', url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK' },
                { name: 'IIM Lucknow', achievement: 'PARTICIPANT', badge: 'PARTICIPANT', institution: 'IIM Lucknow', category: 'Innovation / Competition', description: 'Participated in an innovation and competitive problem-solving ecosystem.', url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK' }
            ]
        },
        {
            sectionTitle: 'RANKED ACHIEVEMENT',
            items: [{ name: 'Zuup Far Away Hackathon', achievement: 'TOP 300 / 5,000+', highlightRank: 'TOP 300', highlightTotal: 'from 5,000+', isRankedHighlight: true, description: 'Ranked among the Top 300 out of 5,000+ participants/teams, demonstrating competitive problem-solving and innovation.', url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK' }]
        }
    ];

    const displayTitle = isProfile ? 'Sarthak Singhaniya' : (isHackathon ? (content.title || '90+ Hackathons & Competitions') : (isCertificate ? 'Awards & Certifications' : content.title));
    const displaySubtitle = isProfile ? 'AI/ML Developer • Software Developer • Founder @ TechNeekX' : (isHackathon ? (content.subtitle || 'Competing, building, judging, mentoring and organizing across 90+ hackathons in AI, tech & innovation.') : content.subtitle);
    const displayLabel = isProfile ? 'ECOSYSTEM' : (isHackathon ? 'COMPETITIONS' : (isCertificate ? 'CREDENTIALS' : label));

    return (
        <div
            className="global-overlay-wrapper"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 2000,
                pointerEvents: isOpen ? 'auto' : 'none',
            }}
            onClick={handleBackdropClick}
        >
            {/* 1. LAYER: BACKDROP */}
            <div
                className="global-overlay-backdrop-layer"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    opacity: isOpen ? 1 : 0,
                    transition: 'opacity 0.8s ease',
                    ...maskStyle
                }}
            />

            {/* 2. LAYER: CONTENT */}
            <div
                style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        padding: isMobile ? '1.2rem' : '2.2rem',
                        transition: transitionSpring,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.8rem',
                        fontFamily: "'Cabin Sketch', cursive",
                        pointerEvents: 'auto',
                        ...cardStyle,
                    }}
                    className="studio-paper-card"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* SVG Border Overlay for Torn Paper */}
                    <svg
                        className="studio-border-overlay"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none',
                            zIndex: 10
                        }}
                    >
                        <path
                            d="M 0 0 L 4 1 L 8 0 L 12 1 L 16 0 L 20 1 L 24 0 L 28 1 L 32 0 L 36 1 L 40 0 L 44 1 L 48 0 L 52 1 L 56 0 L 60 1 L 64 0 L 68 1 L 72 0 L 76 1 L 80 0 L 84 1 L 88 0 L 92 1 L 96 0 L 100 0 L 99 3 L 100 6 L 98 10 L 100 14 L 99 18 L 100 22 L 98 26 L 100 30 L 99 35 L 100 40 L 98 45 L 100 50 L 99 55 L 100 60 L 98 65 L 100 70 L 99 75 L 100 80 L 98 85 L 100 90 L 99 95 L 100 100 L 96 99 L 92 100 L 88 98 L 84 100 L 80 99 L 76 100 L 72 98 L 68 100 L 64 99 L 60 100 L 56 98 L 52 100 L 48 99 L 44 100 L 40 98 L 36 100 L 32 99 L 28 100 L 24 98 L 20 100 L 16 99 L 12 100 L 8 98 L 4 100 L 0 99 L 0.5 99.5 L 1 95 L 0 90 L 2 85 L 0 80 L 1 75 L 0 70 L 2 65 L 0 60 L 1 55 L 0 50 L 2 45 L 0 40 L 1 35 L 0 30 L 2 26 L 0 22 L 1 18 L 0 14 L 2 10 L 0 6 L 1 3 L 0 0 Z"
                            fill="none"
                            stroke="#1a1a1a"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                        />
                    </svg>

                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.2rem',
                        flexShrink: 0,
                        ...getStaggerStyle(100)
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <span style={{
                                textTransform: 'uppercase',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                letterSpacing: '1px',
                                color: '#666'
                            }}>
                                {displayLabel}
                            </span>
                            <h2 style={{
                                fontSize: isMobile ? '1.5rem' : '1.8rem',
                                margin: 0,
                                lineHeight: 1.1,
                                fontWeight: 800,
                                fontFamily: "'Rubik Scribble', cursive",
                            }}>
                                {displayTitle}
                            </h2>
                            {displaySubtitle && (
                                <p style={{
                                    margin: '0.2rem 0 0 0',
                                    fontSize: '0.95rem',
                                    color: '#555',
                                    fontWeight: 700,
                                    lineHeight: 1.3
                                }}>
                                    {displaySubtitle}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={onClose}
                            className="studio-close-btn"
                            aria-label="Close"
                        >
                            <svg viewBox="0 0 24 24">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* === 1. PROFILE VIEW === */}
                    {isProfile ? (
                        <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                            <div
                                ref={scrollContainerRef}
                                className="awards-scroll-container"
                                style={{
                                    height: '100%',
                                    overflowY: 'auto',
                                    overflowX: 'hidden',
                                    padding: '0.5rem 0.5rem 1.5rem 0.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1.2rem',
                                    ...getStaggerStyle(200)
                                }}
                            >
                                {/* Profile Cards Grid */}
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(290px, 1fr))',
                                    gap: '1rem',
                                }}>
                                    {(content.items && content.items.length > 0 ? content.items : defaultProfileItems).map((item, index) => {
                                        const hasValidUrl = item.url && item.url !== '#';
                                        return (
                                            <div
                                                key={index}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    backgroundColor: '#fafafa',
                                                    padding: '1.1rem',
                                                    border: '2px solid #1a1a1a',
                                                    boxShadow: '3px 3px 0px rgba(0,0,0,0.1)',
                                                    borderRadius: '2px 255px 3px 255px / 255px 5px 225px 3px',
                                                    gap: '0.6rem',
                                                    transition: 'all 0.2s ease',
                                                    justifyContent: 'space-between'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
                                                    <div style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '6px',
                                                        backgroundColor: '#1a1a1a',
                                                        color: '#ffffff',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}>
                                                        <PlatformIcon name={item.icon || item.name} size={18} />
                                                    </div>
                                                    <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, fontFamily: "'Cabin Sketch', cursive", color: '#1a1a1a' }}>
                                                        {item.name}
                                                    </h4>
                                                </div>

                                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#444', lineHeight: 1.35 }}>
                                                    {item.description}
                                                </p>

                                                <button
                                                    style={{
                                                        marginTop: '0.4rem',
                                                        padding: '0.45rem 0.8rem',
                                                        background: hasValidUrl ? '#ffffff' : '#f0f0f0',
                                                        border: '2px solid #1a1a1a',
                                                        borderRadius: '2px 255px 3px 255px / 255px 5px 225px 3px',
                                                        cursor: hasValidUrl ? 'pointer' : 'default',
                                                        fontFamily: "'Cabin Sketch', cursive",
                                                        fontWeight: 800,
                                                        fontSize: '0.95rem',
                                                        color: hasValidUrl ? '#1a1a1a' : '#888',
                                                        transition: 'all 0.15s ease',
                                                        textAlign: 'center'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        if (hasValidUrl) {
                                                            e.currentTarget.style.background = '#1a1a1a';
                                                            e.currentTarget.style.color = '#ffffff';
                                                        }
                                                    }}
                                                    onMouseOut={(e) => {
                                                        if (hasValidUrl) {
                                                            e.currentTarget.style.background = '#ffffff';
                                                            e.currentTarget.style.color = '#1a1a1a';
                                                        }
                                                    }}
                                                    onClick={() => {
                                                        if (hasValidUrl) {
                                                            window.open(item.url, '_blank', 'noopener,noreferrer');
                                                        }
                                                    }}
                                                >
                                                    {item.buttonText || 'Visit'} {hasValidUrl ? '↗' : ''}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Profile Footer */}
                                <div style={{
                                    marginTop: '0.5rem',
                                    padding: '1.2rem',
                                    borderTop: '2px dashed #1a1a1a',
                                    textAlign: 'center',
                                    backgroundColor: 'rgba(0,0,0,0.02)',
                                    borderRadius: '2px 255px 3px 255px / 255px 5px 225px 3px'
                                }}>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: "'Cabin Sketch', cursive", color: '#1a1a1a' }}>
                                        {content.footerTitle || 'Building. Learning. Leading.'}
                                    </div>
                                    <div style={{ fontSize: '0.95rem', color: '#555', marginTop: '0.2rem', fontWeight: 700 }}>
                                        {content.footerSubtitle || 'Turning ideas into technology, experiences and opportunities.'}
                                    </div>
                                </div>
                            </div>

                            {/* Custom torn-paper scrollbar */}
                            {showScrollbar && (
                                <div
                                    ref={trackRef}
                                    className="torn-scroll-track"
                                    onClick={handleTrackClick}
                                    style={{ pointerEvents: 'auto' }}
                                >
                                    <div className="torn-scroll-line" />
                                    <div
                                        ref={thumbRef}
                                        className="torn-scroll-thumb"
                                        style={{ top: `${scrollThumbTop}px` }}
                                        onMouseDown={handleThumbMouseDown}
                                    />
                                </div>
                            )}
                        </div>
                    ) : isCertificate ? (
                        /* === 2. CERTIFICATES / AWARDS VIEW === */
                        <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                            <div
                                ref={scrollContainerRef}
                                className="awards-scroll-container"
                                style={{
                                    height: '100%',
                                    overflowY: 'auto',
                                    overflowX: 'hidden',
                                    padding: isMobile ? '0.5rem 0.5rem 1.5rem 0.5rem' : '0.5rem 1.5rem 2rem 0.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1.5rem',
                                    ...getStaggerStyle(200)
                                }}
                            >
                                {(content.sections && content.sections.length > 0 ? content.sections : defaultCertificateSections).map((section, sIdx) => (
                                    <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                        {/* Section Header */}
                                        <div style={{
                                            fontSize: '1.25rem',
                                            fontWeight: 800,
                                            fontFamily: "'Cabin Sketch', cursive",
                                            borderBottom: '2px dashed #1a1a1a',
                                            paddingBottom: '0.3rem',
                                            color: '#1a1a1a',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {section.sectionTitle}
                                        </div>

                                        {/* Grid inside Section */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))',
                                            gap: '1rem'
                                        }}>
                                            {section.items.map((item, index) => (
                                                <div
                                                    key={index}
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        backgroundColor: '#f9f9f9',
                                                        padding: '1rem',
                                                        border: '2px solid #1a1a1a',
                                                        boxShadow: '3px 3px 0px rgba(0,0,0,0.1)',
                                                        borderRadius: '2px 255px 3px 255px / 255px 5px 225px 3px',
                                                        gap: '0.6rem',
                                                        transition: 'transform 0.2s ease',
                                                        justifyContent: 'space-between'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                                >
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                                        <h4 style={{
                                                            margin: 0,
                                                            fontSize: '1.2rem',
                                                            fontWeight: 800,
                                                            fontFamily: "'Cabin Sketch', cursive",
                                                            lineHeight: 1.2,
                                                            color: '#1a1a1a'
                                                        }}>
                                                            {item.name || item.label}
                                                        </h4>
                                                        
                                                        {item.issuer && (
                                                            <div style={{ fontSize: '0.88rem', color: '#666', fontWeight: 700 }}>
                                                                Issuer: <strong>{item.issuer}</strong>
                                                            </div>
                                                        )}

                                                        {item.category && (
                                                            <div style={{ fontSize: '0.85rem', color: '#444', fontWeight: 700 }}>
                                                                Category: {item.category}
                                                            </div>
                                                        )}

                                                        {item.recognition && (
                                                            <div style={{
                                                                display: 'inline-block',
                                                                alignSelf: 'flex-start',
                                                                fontSize: '0.8rem',
                                                                fontWeight: 800,
                                                                padding: '2px 6px',
                                                                backgroundColor: '#e6e6e6',
                                                                borderRadius: '4px',
                                                                color: '#222'
                                                            }}>
                                                                {item.recognition}
                                                            </div>
                                                        )}

                                                        {item.focus && (
                                                            <div style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.3, marginTop: '2px' }}>
                                                                {item.focus}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        style={{
                                                            marginTop: '0.6rem',
                                                            padding: '0.45rem 0.8rem',
                                                            background: '#fff',
                                                            border: '2px solid #1a1a1a',
                                                            borderRadius: '2px 255px 3px 255px / 255px 5px 225px 3px',
                                                            cursor: 'pointer',
                                                            fontFamily: "'Cabin Sketch', cursive",
                                                            fontWeight: 800,
                                                            fontSize: '0.9rem',
                                                            color: '#1a1a1a',
                                                            transition: 'all 0.15s ease'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.currentTarget.style.background = '#1a1a1a';
                                                            e.currentTarget.style.color = '#fff';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.style.background = '#fff';
                                                            e.currentTarget.style.color = '#1a1a1a';
                                                        }}
                                                        onClick={() => window.open(item.url || content.archiveUrl || 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK', '_blank', 'noopener,noreferrer')}
                                                    >
                                                        View Certificate ↗
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Archive Footer Button */}
                            <div style={{
                                paddingTop: '0.6rem',
                                marginTop: 'auto',
                                borderTop: '2px dashed #ccc',
                                ...getStaggerStyle(300)
                            }}>
                                <a
                                    href={content.archiveUrl || "https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="studio-action-button"
                                    style={{
                                        display: 'block',
                                        textAlign: 'center',
                                        fontSize: isMobile ? '1rem' : '1.15rem'
                                    }}
                                >
                                    VIEW COMPLETE CERTIFICATE ARCHIVE ↗
                                </a>
                            </div>

                            {/* Custom torn-paper scrollbar */}
                            {showScrollbar && (
                                <div
                                    ref={trackRef}
                                    className="torn-scroll-track"
                                    onClick={handleTrackClick}
                                    style={{ pointerEvents: 'auto' }}
                                >
                                    <div className="torn-scroll-line" />
                                    <div
                                        ref={thumbRef}
                                        className="torn-scroll-thumb"
                                        style={{ top: `${scrollThumbTop}px` }}
                                        onMouseDown={handleThumbMouseDown}
                                    />
                                </div>
                            )}
                        </div>
                    ) : isHackathon ? (
                        /* === 3. HACKATHONS VIEW === */
                        <div style={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                            <div
                                ref={scrollContainerRef}
                                className="awards-scroll-container"
                                style={{
                                    height: '100%',
                                    overflowY: 'auto',
                                    overflowX: 'hidden',
                                    padding: isMobile ? '0.5rem 0.5rem 1.5rem 0.5rem' : '0.5rem 1.5rem 2rem 0.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1.6rem',
                                    ...getStaggerStyle(200)
                                }}
                            >
                                {(content.sections && content.sections.length > 0 ? content.sections : defaultHackathonSections).map((section, sIdx) => (
                                    <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                        {/* Section Category Title */}
                                        <div style={{
                                            fontSize: '1.25rem',
                                            fontWeight: 800,
                                            fontFamily: "'Cabin Sketch', cursive",
                                            borderBottom: '2px dashed #1a1a1a',
                                            paddingBottom: '0.3rem',
                                            color: '#1a1a1a',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }}>
                                            {section.sectionTitle}
                                        </div>

                                        {/* Cards in Category */}
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: isMobile ? '1fr' : (section.sectionTitle === 'RANKED ACHIEVEMENT' || section.items.length === 1) ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
                                            gap: '1rem'
                                        }}>
                                            {section.items.map((item, index) => {
                                                if (item.isRankedHighlight) {
                                                    return (
                                                        /* Giant Ranked Highlight Card */
                                                        <div
                                                            key={index}
                                                            style={{
                                                                backgroundColor: '#fafafa',
                                                                padding: isMobile ? '1.2rem' : '1.8rem',
                                                                border: '3px solid #1a1a1a',
                                                                boxShadow: '5px 5px 0px rgba(0,0,0,0.1)',
                                                                borderRadius: '2px 255px 3px 255px / 255px 5px 225px 3px',
                                                                display: 'flex',
                                                                flexDirection: isMobile ? 'column' : 'row',
                                                                alignItems: isMobile ? 'flex-start' : 'center',
                                                                gap: '1.5rem',
                                                                transition: 'transform 0.2s'
                                                            }}
                                                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                                        >
                                                            <div style={{
                                                                padding: '1rem 1.5rem',
                                                                backgroundColor: '#1a1a1a',
                                                                color: '#ffffff',
                                                                borderRadius: '2px 255px 3px 255px / 255px 5px 225px 3px',
                                                                textAlign: 'center',
                                                                minWidth: isMobile ? '100%' : '180px',
                                                                boxSizing: 'border-box'
                                                            }}>
                                                                <div style={{
                                                                    fontSize: isMobile ? '2.4rem' : '2.8rem',
                                                                    fontWeight: 800,
                                                                    fontFamily: "'Rubik Scribble', cursive",
                                                                    lineHeight: 1
                                                                }}>
                                                                    {item.highlightRank || 'TOP 300'}
                                                                </div>
                                                                <div style={{
                                                                    fontSize: '1.1rem',
                                                                    fontFamily: "'Cabin Sketch', cursive",
                                                                    fontWeight: 700,
                                                                    letterSpacing: '1px',
                                                                    marginTop: '4px',
                                                                    opacity: 0.9
                                                                }}>
                                                                    {item.highlightTotal || 'from 5,000+'}
                                                                </div>
                                                            </div>

                                                            <div style={{ flex: 1 }}>
                                                                <h4 style={{
                                                                    margin: '0 0 0.4rem 0',
                                                                    fontSize: '1.4rem',
                                                                    fontWeight: 800,
                                                                    fontFamily: "'Cabin Sketch', cursive",
                                                                    color: '#1a1a1a'
                                                                }}>
                                                                    {item.name}
                                                                </h4>
                                                                <p style={{ margin: 0, fontSize: '0.95rem', color: '#444', lineHeight: 1.4 }}>
                                                                    {item.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div
                                                        key={index}
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            backgroundColor: item.isWinner ? '#fffef2' : '#f9f9f9',
                                                            padding: '1.1rem',
                                                            border: item.isWinner ? '2.5px solid #1a1a1a' : '2px solid #1a1a1a',
                                                            boxShadow: item.isWinner ? '4px 4px 0px rgba(0,0,0,0.15)' : '3px 3px 0px rgba(0,0,0,0.1)',
                                                            transition: 'transform 0.2s',
                                                            borderRadius: '2px 255px 3px 255px / 255px 5px 225px 3px',
                                                            gap: '0.5rem'
                                                        }}
                                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                                    >
                                                        {/* Status Badge */}
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                                                            <span style={{
                                                                fontSize: '0.8rem',
                                                                fontWeight: 800,
                                                                padding: '3px 8px',
                                                                backgroundColor: item.isWinner ? '#ffd700' : '#e4e4e4',
                                                                color: '#1a1a1a',
                                                                borderRadius: '4px',
                                                                border: '1px solid #1a1a1a'
                                                            }}>
                                                                {item.badge || item.achievement}
                                                            </span>
                                                            {item.category && (
                                                                <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: 700 }}>
                                                                    {item.category}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Name & Institution */}
                                                        <div>
                                                            <h4 style={{
                                                                margin: '0.2rem 0 0 0',
                                                                fontSize: '1.25rem',
                                                                fontWeight: 800,
                                                                fontFamily: "'Cabin Sketch', cursive",
                                                                color: '#1a1a1a',
                                                                lineHeight: 1.2
                                                            }}>
                                                                {item.name}
                                                            </h4>
                                                            {(item.institution || item.organizer) && (
                                                                <div style={{ fontSize: '0.85rem', color: '#666', fontWeight: 700 }}>
                                                                    {item.institution ? `Institution: ${item.institution}` : `Organizer: ${item.organizer}`}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Project info & Tech Chips */}
                                                        {item.project && (
                                                            <div style={{
                                                                padding: '0.4rem 0.6rem',
                                                                backgroundColor: 'rgba(0,0,0,0.03)',
                                                                borderRadius: '4px',
                                                                fontSize: '0.85rem',
                                                                fontWeight: 700
                                                            }}>
                                                                <div>Project: {item.project}</div>
                                                                {item.technologies && (
                                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                                                                        {item.technologies.map((t, ti) => (
                                                                            <span key={ti} style={{
                                                                                fontSize: '0.72rem',
                                                                                padding: '1px 5px',
                                                                                backgroundColor: '#ffffff',
                                                                                border: '1px solid #ccc',
                                                                                borderRadius: '3px',
                                                                                color: '#333'
                                                                            }}>
                                                                                {t}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Description */}
                                                        <p style={{ margin: 0, fontSize: '0.88rem', color: '#444', lineHeight: 1.35 }}>
                                                            {item.description}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Archive Footer Button */}
                            <div style={{
                                paddingTop: '0.6rem',
                                marginTop: 'auto',
                                borderTop: '2px dashed #ccc',
                                ...getStaggerStyle(300)
                            }}>
                                <a
                                    href={content.archiveUrl || "https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK"}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="studio-action-button"
                                    style={{
                                        display: 'block',
                                        textAlign: 'center',
                                        fontSize: isMobile ? '1rem' : '1.15rem'
                                    }}
                                >
                                    VIEW COMPLETE HACKATHON ARCHIVE ↗
                                </a>
                            </div>

                            {/* Custom torn-paper scrollbar */}
                            {showScrollbar && (
                                <div
                                    ref={trackRef}
                                    className="torn-scroll-track"
                                    onClick={handleTrackClick}
                                    style={{ pointerEvents: 'auto' }}
                                >
                                    <div className="torn-scroll-line" />
                                    <div
                                        ref={thumbRef}
                                        className="torn-scroll-thumb"
                                        style={{ top: `${scrollThumbTop}px` }}
                                        onMouseDown={handleThumbMouseDown}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        /* === DEFAULT STUDIO STYLE === */
                        <>
                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '1rem',
                                fontSize: '0.8rem',
                                color: '#666',
                                borderBottom: '1px dashed #ccc',
                                paddingBottom: '1rem',
                                ...getStaggerStyle(200)
                            }}>
                                <strong>{content.date}</strong>
                                {content.views && <span>{content.views} views</span>}
                            </div>

                            <p 
                                style={{
                                lineHeight: 1.6,
                                color: '#333',
                                fontSize: '0.95rem',
                                margin: 0,
                                minHeight: '80px',
                                ...getStaggerStyle(300)
                            }}>
                                {content.description}
                            </p>

                            <div style={{
                                marginTop: 'auto',
                                paddingTop: '1rem',
                                ...getStaggerStyle(400)
                            }}>
                                <a
                                    href={content.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="studio-action-button"
                                >
                                    Open Link ↗
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlobalOverlay;
