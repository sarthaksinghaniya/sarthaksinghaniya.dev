import { useState, useRef, useMemo, useEffect } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { Text, PositionalAudio } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import SkyChunk, { CHUNK_LENGTH, ROOM_Z } from './SkyChunk';
import PaperAirplane from './PaperAirplane';
import { useScene } from '../../../../context/SceneContext';
import '../../shaders/RevealBasicMaterial'; // Registers brush-stroke reveal for BasicMaterial
import { isTouchDevice } from '../../../../utils/deviceDetect';
import { useAwards } from '../../../../hooks/useSanityData';

// Reusable Vector3 to avoid allocations in event handlers
const _tempVec3 = new THREE.Vector3();

/**
 * InfiniteSkyManager Component
 * 
 * Manages dynamic generation/removal of sky chunks for infinite scroll.
 * World group moves with scroll, chunks stay at fixed positions relative to group.
 * Includes Story Milestones that loop with the content!
 */

import { useAudio } from '../../../../context/AudioManager';

export const BALLOON_AUDIO_SETTINGS = {
    volume: 1.0,
    distance: 2,
    rolloff: 2
};

/**
 * Reusable Button Component with Hover Effect + Brush-Stroke Reveal
 */
const AwardButton = ({ onClick, texture, paintedTexture, width, height, position, onHoverChange, label = 'VIEW', fontSize = 0.25 }) => {
    const isTouch = isTouchDevice();
    const meshRef = useRef();
    const buttonRevealRef = useRef(); // RevealBasicMaterial ref for button sketch
    const paintedRef = useRef(); // Painted button mesh visibility
    const hideDelayRef = useRef(); // Track pending gsap.delayedCall
    const [hovered, setHovered] = useState(false);

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Smoothly lerp scale based on hover state
            const targetScale = hovered ? 1.05 : 1.0;
            const lerpFactor = 10 * delta;

            meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, lerpFactor);
            meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetScale, lerpFactor);
            meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, targetScale, lerpFactor);
        }
    });

    const handlePointerOver = () => {
        if (isTouch) return;
        setHovered(true);
        document.body.style.cursor = 'pointer';
        onHoverChange?.(true);

        // Brush-stroke reveal button
        if (buttonRevealRef.current) {
            gsap.to(buttonRevealRef.current, {
                uProgress: 1.0,
                duration: 0.8,
                ease: 'power2.out',
                overwrite: true
            });
        }
        if (hideDelayRef.current) hideDelayRef.current.kill();
        if (paintedRef.current) {
            paintedRef.current.visible = true;
            if (paintedRef.current.material) paintedRef.current.material.opacity = 1;
        }
    };

    const handlePointerOut = () => {
        if (isTouch) return;
        setHovered(false);
        document.body.style.cursor = 'auto';
        onHoverChange?.(false);

        // Reverse reveal
        if (buttonRevealRef.current) {
            gsap.to(buttonRevealRef.current, {
                uProgress: 0.0,
                duration: 0.5,
                ease: 'power2.out',
                overwrite: true
            });
        }
        hideDelayRef.current = gsap.delayedCall(0.55, () => {
            if (paintedRef.current && paintedRef.current.material) {
                paintedRef.current.material.opacity = 0;
            }
        });
    };

    return (
        <group ref={meshRef} position={position}>
            {/* Painted button (behind) - hidden until hover */}
            <mesh ref={paintedRef} position={[0, 0, -0.001]} visible={true}>
                <planeGeometry args={[width, height]} />
                <meshBasicMaterial color="#e0e0e0"
                    map={paintedTexture}
                    transparent
                    opacity={0}
                    side={THREE.DoubleSide}
                    alphaTest={0.5}
                    depthWrite={false}
                />
            </mesh>
            {/* Sketch button (front) with reveal */}
            <mesh
                onClick={onClick}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
            >
                <planeGeometry args={[width, height]} />
                <revealBasicMaterial
                    ref={buttonRevealRef}
                    map={texture}
                    transparent
                    side={THREE.DoubleSide}
                    alphaTest={0.1}
                    depthWrite={false}
                    uProgress={0.0}
                />
            </mesh>
            <Text
                position={[0, 0, 0.05]}
                fontSize={fontSize}
                color="#1a1a1a"
                anchorX="center"
                anchorY="middle"
                font="/fonts/CabinSketch-Bold.ttf"
            >
                {label}
            </Text>
        </group>
    );
};

// Story milestones configuration
// Each milestone appears once per "story cycle" (5 chunks = 200 units)
const STORY_CYCLE_LENGTH = 200;

// === TWARDA LINIA ZANIKANIA DLA MILESTONES (WORLD SPACE) ===
// Pokój About jest na Z = -25, więc -25 to drzwi pokoju
// -27 = 2 metry za drzwiami (w głąb pokoju) - musi matchować CORRIDOR_CLIP_Z w SkyChunk
const MILESTONE_CORRIDOR_CLIP_Z = -8.0;

const InfiniteSkyManager = ({ scrollProgressRef }) => {
    // PRE-CALCULATED FOR scrolProgress = 0
    // currentChunk = floor(0/40) = 0 -> [-1, 0, 1, 2, 3]
    const [activeChunks, setActiveChunks] = useState([-1, 0, 1, 2, 3]);
    // currentStoryCycle = floor(0/200) = 0 -> [-1, 0, 1]
    const [activeStoryCycles, setActiveStoryCycles] = useState([-1, 0, 1]);
    const worldRef = useRef();

    // Track current chunk for recycling
    const getCurrentChunk = (worldZ) => {
        return Math.floor(worldZ / CHUNK_LENGTH);
    };

    // Track current story cycle
    const getCurrentStoryCycle = (worldZ) => {
        return Math.floor(worldZ / STORY_CYCLE_LENGTH);
    };

    // Update chunks based on world position
    useFrame(() => {
        if (!worldRef.current) return;

        const scrollProgress = scrollProgressRef?.current || 0;

        // Move world directly
        worldRef.current.position.z = scrollProgress;

        // Figure out which chunk we're in
        const currentChunk = getCurrentChunk(scrollProgress);
        const shouldBeActiveChunks = [
            currentChunk - 1,
            currentChunk,
            currentChunk + 1,
            currentChunk + 2,
            currentChunk + 3,
        ];

        const chunksNeedUpdate = shouldBeActiveChunks.some(c => !activeChunks.includes(c)) ||
            activeChunks.some(c => !shouldBeActiveChunks.includes(c));

        if (chunksNeedUpdate) {
            setActiveChunks(shouldBeActiveChunks);
        }

        // Update story cycles
        const currentStoryCycle = getCurrentStoryCycle(scrollProgress);
        const shouldBeActiveCycles = [
            currentStoryCycle - 1,
            currentStoryCycle,
            currentStoryCycle + 1,
        ];

        const cyclesNeedUpdate = shouldBeActiveCycles.some(c => !activeStoryCycles.includes(c)) ||
            activeStoryCycles.some(c => !shouldBeActiveCycles.includes(c));

        if (cyclesNeedUpdate) {
            setActiveStoryCycles(shouldBeActiveCycles);
        }
    });

    return (
        <group ref={worldRef}>
            {/* === SKY CHUNKS WITH CLOUDS === */}
            {activeChunks.map((chunkIndex) => (
                <SkyChunk
                    key={`sky-chunk-${chunkIndex}`}
                    chunkIndex={chunkIndex}
                    seed={42}
                    scrollProgressRef={scrollProgressRef}
                />
            ))}

            {/* === STORY MILESTONES (loop every 200 units) === */}
            {activeStoryCycles.map((cycleIndex) => (
                <group key={`story-cycle-${cycleIndex}`}>
                    {/* === INTRO MILESTONE === */}
                    <IntroMilestone
                        z={-(cycleIndex * STORY_CYCLE_LENGTH + 15)}
                        scrollProgressRef={scrollProgressRef}
                    />

                    {/* === HACKATHONS MILESTONE (90+ BATTLES) === */}
                    <HackathonsMilestone
                        z={-(cycleIndex * STORY_CYCLE_LENGTH + 55)}
                        scrollProgressRef={scrollProgressRef}
                    />

                    {/* === AWARDS MILESTONE === */}
                    <AwardsMilestone
                        z={-(cycleIndex * STORY_CYCLE_LENGTH + 95)}
                        scrollProgressRef={scrollProgressRef}
                    />

                    {/* === JOURNEY MILESTONE === */}
                    <JourneyMilestone
                        z={-(cycleIndex * STORY_CYCLE_LENGTH + 135)}
                        scrollProgressRef={scrollProgressRef}
                    />

                    {/* === SKILLS MILESTONE === */}
                    <SkillsMilestone
                        z={-(cycleIndex * STORY_CYCLE_LENGTH + 175)}
                        scrollProgressRef={scrollProgressRef}
                    />
                </group>
            ))}
        </group>
    );
};

/**
 * INTRO Milestone - Special detailed layout
 * Elements spread apart as they approach camera
 */
const IntroMilestone = ({ z, scrollProgressRef }) => {
    // Load avatar texture
    const avatarTexture = useLoader(THREE.TextureLoader, '/textures/about/awatarnachmurce.webp');
    const { camera, viewport } = useThree();
    const isTouch = isTouchDevice();

    // Refs for all animated elements
    const groupRef = useRef();
    const titleRef = useRef();
    const brandRef = useRef();
    const avatarRef = useRef();
    const motto1Ref = useRef();
    const motto2Ref = useRef();

    // Base positions
    const baseY = 2;

    // Calculate aspect ratio
    // LEGACY FIX: Use original dimensions (2816x1536) to prevent stretching
    const legacyAspectRatio = 2816 / 1536; 
    const avatarWidth = 6; // Zwiększony rozmiar awatara na chmurce
    const avatarHeight = avatarWidth / legacyAspectRatio;

    // Animation: floating + spread apart when close
    useFrame((state) => {
        if (!groupRef.current) return;

        const time = state.clock.elapsedTime;

        // === TWARDA LINIA CLIP (RĘCZNE OBLICZENIE WORLD Z) ===
        // worldZ = pokój(-25) + scrollProgress + lokalna pozycja milestone
        const scrollProgress = scrollProgressRef?.current || 0;
        const worldZ = ROOM_Z + scrollProgress + z;
        groupRef.current.visible = worldZ < MILESTONE_CORRIDOR_CLIP_Z;

        // Skip rest if not visible
        if (!groupRef.current.visible) return;

        // FIX: Use consistent distance based on scrollProgress + offset
        // This ensures animations work IDENTICALLY regardless of chunk/camera position
        // Base Start Z (-15) + Scroll (0) - Offset (55) = -70 (Matches "Working" Chunk 0 feel)
        const distanceZ = z + scrollProgress - 55;

        // Spread effect: starts at z = -25, full spread at z = -5
        // This makes elements spread BEFORE they reach the camera
        // === EDYTUJ TUTAJ (INTRO) ===
        // Zwiększ różnicę między Start a End, żeby animacja była wolniejsza
        const spreadStart = -70; // Startuje wcześniej
        const spreadEnd = -50;   // Kończy później
        let spreadFactor = 0;

        if (distanceZ > spreadStart && distanceZ < spreadEnd) {
            // Calculate spread: 0 at spreadStart, 1 at spreadEnd
            spreadFactor = (distanceZ - spreadStart) / (spreadEnd - spreadStart);
            spreadFactor = Math.min(1, Math.max(0, spreadFactor));
            // Ease out for smoother animation
            spreadFactor = spreadFactor * spreadFactor;
        } else if (distanceZ >= spreadEnd) {
            spreadFactor = 1;
        }

        // Apply spread to elements (move left/right) - MORE AGGRESSIVE
        const maxSpread = 15; // How far elements spread (increased!)

        if (titleRef.current) {
            titleRef.current.position.x = -spreadFactor * maxSpread * 0.8;
        }
        if (brandRef.current) {
            brandRef.current.position.x = spreadFactor * maxSpread * 0.6;
        }
        if (avatarRef.current) {
            // Avatar: floating + spread upward
            avatarRef.current.position.y = baseY + Math.sin(time * 0.8) * 0.15 + spreadFactor * 3;
            avatarRef.current.position.x = -spreadFactor * maxSpread * 0.3;
        }
        if (motto1Ref.current) {
            motto1Ref.current.position.x = spreadFactor * maxSpread * 0.7;
        }
        if (motto2Ref.current) {
            motto2Ref.current.position.x = -spreadFactor * maxSpread * 0.5;
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, z]}>
            {/* Main title - Name (spreads left) */}
            <Text
                ref={titleRef}
                position={[0, 5, 0.1]}
                fontSize={0.7}
                color="#1a1a1a"
                anchorX="center"
                anchorY="middle"
                font="/fonts/RubikScribble-Regular.ttf"
            >
                SARTHAK SINGHANIYA
            </Text>

            {/* Subtitle - Brand (spreads right) */}
            <Text
                ref={brandRef}
                position={[0, 4.3, 0.1]}
                fontSize={0.4}
                color="#4a4a4a"
                anchorX="center"
                anchorY="middle"
                font="/fonts/CabinSketch-Regular.ttf"
            >
                (AI WIZARD x TECHNEEKX BOSS ⚡)
            </Text>

            {/* Avatar on cloud - floating + spreads up-left */}
            <mesh ref={avatarRef} position={[0, baseY, 0]}>
                <planeGeometry args={[avatarWidth, avatarHeight]} />
                <meshBasicMaterial color="#e0e0e0"
                    map={avatarTexture}
                    transparent
                    side={THREE.DoubleSide}
                    depthWrite={false}
                />
            </mesh>

            {/* Motto - Line 1 (spreads right) */}
            <Text
                ref={motto1Ref}
                position={[0, 0, 0.1]}
                fontSize={0.32}
                color="#555555"
                anchorX="center"
                anchorY="middle"
                font="/fonts/CabinSketch-Regular.ttf"
                fontStyle="italic"
            >
                "Shipping cracked AI agents &
            </Text>

            {/* Motto - Line 2 (spreads left) */}
            <Text
                ref={motto2Ref}
                position={[0, -0.5, 0]}
                fontSize={0.32}
                color="#555555"
                anchorX="center"
                anchorY="middle"
                font="/fonts/CabinSketch-Regular.ttf"
                fontStyle="italic"
            >
                cooking wild MVPs at 3 AM 🔥"
            </Text>
        </group>
    );
};

/**
 * MOCK DATA FOR AWARDS
 */
const AWARDS_DATA = {
    featured: {
        id: 'award-featured',
        layout: 'hackathons_grid',
        title: '90+ Hackathons & Competitions',
        subtitle: 'Competing, building, judging, mentoring and organizing across 90+ hackathons in AI, tech & innovation.',
        count: '90+',
        platformConfig: {
            label: 'ACHIEVEMENTS',
            color: '#1a1a1a'
        }
    },
    // CERTIFICATES / AWARDS (Card 1 - SOTD)
    sotd: {
        id: 'award-certificates',
        layout: 'certificates_grid',
        title: 'Awards & Certifications',
        count: '10+',
        archiveUrl: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK',
        sections: [
            {
                sectionTitle: 'Featured Recognition',
                items: [
                    {
                        name: 'INMUN High Commendation',
                        category: 'Leadership & Communication',
                        recognition: 'High Commendation',
                        issuer: 'Ryan INMUN',
                        url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK'
                    }
                ]
            },
            {
                sectionTitle: 'AI / Machine Learning',
                items: [
                    {
                        name: 'Google Cloud — Intro to Gen AI Studio',
                        issuer: 'Google',
                        focus: 'Generative AI • Google Cloud • AI Development',
                        image: '/textures/about/SOTDAYYOUNGMULTICSSWINNER.webp',
                        url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK'
                    },
                    {
                        name: 'Kaggle Engineering AI',
                        issuer: 'Kaggle',
                        focus: 'AI Engineering • Machine Learning • Data Science',
                        image: '/textures/about/SOTDAYYOUNGMULTIORPETRON.webp',
                        url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK'
                    },
                    {
                        name: 'Machine Learning Using Python',
                        issuer: 'Tech',
                        focus: 'Machine Learning • Python • Model Development',
                        image: '/textures/about/SOTDAYYOUNGMULTIGSAP.webp',
                        url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK'
                    },
                    {
                        name: 'AI/ML Fundamentals',
                        issuer: 'Tech',
                        focus: 'Artificial Intelligence • Machine Learning',
                        url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK'
                    }
                ]
            },
            {
                sectionTitle: 'Development',
                items: [
                    {
                        name: 'ChatGPT-4 for Developers',
                        issuer: 'OpenAI',
                        focus: 'AI-assisted development • Developer productivity • LLMs',
                        image: '/textures/about/SOTDAYYOUNGMULTIDESIGNNOMINESS.webp',
                        url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK'
                    }
                ]
            },
            {
                sectionTitle: 'Data & Analytics',
                items: [
                    {
                        name: 'Data Visualization with Python',
                        issuer: 'Tech',
                        focus: 'Python • Data Visualization • Analytics',
                        url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK'
                    },
                    {
                        name: 'Business Analytics with Excel',
                        issuer: 'Tech',
                        focus: 'Business Analytics • Excel • Data Analysis',
                        url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK'
                    }
                ]
            }
        ],
        platformConfig: {
            label: 'CREDENTIALS',
            color: '#1a1a1a'
        }
    },
    // HACKATHONS (Card 2 - SOTM)
    sotm: {
        id: 'award-hackathons',
        layout: 'hackathons_grid',
        title: '90+ Hackathons & Competitions',
        subtitle: 'Competing, building, judging, mentoring and organizing across 90+ hackathons in AI, tech & innovation.',
        count: '90+',
        archiveUrl: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK',
        sections: [
            {
                sectionTitle: 'WINNERS (3+)',
                items: [
                    {
                        name: 'HackBio — IIT Mandi',
                        achievement: 'WINNER',
                        badge: 'WINNER',
                        institution: 'IIT Mandi',
                        category: 'Hackathon / Innovation',
                        isWinner: true,
                        description: 'Winner at HackBio, demonstrating technical problem-solving, innovation and rapid product development.',
                        url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK'
                    }
                ]
            },
            {
                sectionTitle: 'ORGANIZED & LED (6+)',
                items: [
                    {
                        name: 'Kalpathon Hackathon',
                        achievement: 'ORGANIZER & LEAD',
                        badge: 'LEAD ORGANIZER',
                        organizer: 'Kalpathon / TechNeekX',
                        category: 'National Hackathon',
                        description: 'Led and organized Kalpathon! Spearheading national builder challenges, live hacking, and open-source project showcases.',
                        url: 'https://github.com/topics/kalpathonhackathon'
                    },
                    {
                        name: 'Innvedx Hackathon',
                        achievement: 'HOST & DIRECTOR',
                        badge: 'DIRECTOR',
                        organizer: 'Innvedx Ecosystem',
                        category: 'Innovation Hackathon',
                        description: 'Directed and hosted the Innvedx Hackathon ecosystem, uniting student builders, AI innovators, and rapid shipping sprints.',
                        url: 'https://github.com/topics/innvedxhackathon'
                    },
                    {
                        name: 'TNX Codathon & Workshops',
                        achievement: 'FOUNDER & HOST',
                        badge: 'FOUNDER',
                        organizer: 'TechNeekX Community',
                        category: 'Community Hackathons',
                        description: 'Organized internal coding marathons, AI build sprints, and startup ideation challenges for 100+ developer community members.',
                        url: 'https://teamtechneekx.netlify.app'
                    }
                ]
            },
            {
                sectionTitle: 'JUDGING & MENTORSHIP',
                items: [
                    {
                        name: 'Official Hackathon Judge (2 Hackathons)',
                        achievement: 'OFFICIAL JURY (2x)',
                        badge: 'OFFICIAL JURY',
                        category: 'Hackathon Jury / Evaluation',
                        description: 'Served as an official Judge across 2 major hackathons, evaluating 100+ AI agents, system architectures, UI/UX, and live pitch demos.',
                        url: 'https://www.linkedin.com/in/sarthak-singhaniya-a4ab9a323'
                    },
                    {
                        name: 'Technical Mentor (3 Hackathons)',
                        achievement: 'TECHNICAL MENTOR (3x)',
                        badge: 'OFFICIAL MENTOR',
                        category: 'Engineering Mentorship',
                        description: 'Mentored participant teams across 3 hackathons, guiding builders through rapid MVP prototyping, AI/ML pipeline debugging, and pitch preparation.',
                        url: 'https://www.linkedin.com/in/sarthak-singhaniya-a4ab9a323'
                    }
                ]
            },
            {
                sectionTitle: 'FINALISTS',
                items: [
                    {
                        name: 'LMNIT Jaipur Hackathon',
                        achievement: 'FINALIST',
                        badge: 'FINALIST',
                        category: 'Technology / Hackathon',
                        description: 'Reached the finalist stage in a competitive national-level hackathon.',
                        url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK'
                    },
                    {
                        name: 'IIT Patna E-Summit',
                        achievement: 'FINALIST',
                        badge: 'FINALIST',
                        institution: 'IIT Patna',
                        category: 'Entrepreneurship / Innovation',
                        description: 'Reached the finalist stage while exploring technology-driven entrepreneurial solutions.',
                        url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK'
                    },
                    {
                        name: 'National Hackathon',
                        achievement: 'NATIONAL FINALIST',
                        badge: 'NATIONAL FINALIST',
                        category: 'Technology / Innovation',
                        description: 'Reached the finalist stage in a national-level hackathon.',
                        url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK'
                    }
                ]
            },
            {
                sectionTitle: 'IIT / NATIONAL PARTICIPATIONS (90+)',
                items: [
                    {
                        name: 'Bharatiya Antariksh Hackathon — ISRO',
                        achievement: 'PARTICIPANT',
                        badge: 'ISRO • NATIONAL LEVEL',
                        organizer: 'ISRO / Hack2Skill',
                        category: 'Space Technology • Innovation',
                        description: 'Participated in a national-level space technology innovation challenge.',
                        url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK'
                    },
                    {
                        name: "Xpecto'26 — IIT Mandi",
                        achievement: 'HACKATHON PARTICIPANT',
                        badge: 'HACKATHON PARTICIPANT',
                        institution: 'IIT Mandi',
                        project: 'FractureFusion AI',
                        technologies: ['AI', 'ML', 'Deep Learning', 'Computer Vision'],
                        description: 'Worked on an AI-driven fracture detection solution using advanced deep-learning approaches.',
                        url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK'
                    },
                    {
                        name: 'IIT Madras AI Hackathon',
                        achievement: 'PARTICIPANT',
                        badge: 'PARTICIPANT',
                        institution: 'IIT Madras',
                        category: 'Artificial Intelligence',
                        description: 'Participated in an AI-focused hackathon focused on solving technology-driven challenges.',
                        url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK'
                    },
                    {
                        name: 'IIT Kharagpur Data Science Hackathon',
                        achievement: 'PARTICIPANT',
                        badge: 'PARTICIPANT',
                        institution: 'IIT Kharagpur',
                        category: 'Data Science • AI/ML',
                        description: 'Applied data science and analytical problem-solving to real-world challenges.',
                        url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK'
                    },
                    {
                        name: 'IIM Lucknow',
                        achievement: 'PARTICIPANT',
                        badge: 'PARTICIPANT',
                        institution: 'IIM Lucknow',
                        category: 'Innovation / Competition',
                        description: 'Participated in an innovation and competitive problem-solving ecosystem.',
                        url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK'
                    }
                ]
            },
            {
                sectionTitle: 'RANKED ACHIEVEMENT',
                items: [
                    {
                        name: 'Zuup Far Away Hackathon',
                        achievement: 'TOP 300 / 5,000+',
                        highlightRank: 'TOP 300',
                        highlightTotal: 'from 5,000+',
                        isRankedHighlight: true,
                        description: 'Ranked among the Top 300 out of 5,000+ participants/teams, demonstrating competitive problem-solving and innovation.',
                        url: 'https://drive.google.com/drive/u/0/folders/1CBeJ9os9s92ZQOpbHguHTmKQ0fOCLsYK'
                    }
                ]
            }
        ],
        platformConfig: {
            label: 'COMPETITIONS',
            color: '#1a1a1a'
        }
    },
    // PROFILES (Card 3 - SOTY)
    other: {
        id: 'award-profiles',
        layout: 'profiles_grid',
        title: 'Sarthak Singhaniya',
        subtitle: 'AI/ML Developer • Software Developer • Founder @ TechNeekX',
        count: '8+',
        avatar: '/textures/about/awatarnachmurce.webp',
        footerTitle: 'Building. Learning. Leading.',
        footerSubtitle: 'Turning ideas into technology, experiences and opportunities.',
        items: [
            {
                name: 'LinkedIn',
                url: 'https://www.linkedin.com/in/sarthak-singhaniya-a4ab9a323',
                icon: 'linkedin',
                description: 'Professional journey, internships, achievements, leadership & projects.',
                buttonText: 'Visit LinkedIn'
            },
            {
                name: 'GitHub',
                url: 'https://github.com/sarthaksinghaniya',
                icon: 'github',
                description: 'Open-source projects, AI/ML implementations, development work & experiments.',
                buttonText: 'Visit GitHub'
            },
            {
                name: 'TechNeekX',
                url: 'https://techneekx.in',
                icon: 'techneekx',
                description: 'Founder & Head — technology community focused on AI, development, hackathons and student opportunities.',
                buttonText: 'Visit TechNeekX'
            },
            {
                name: 'LeetCode',
                url: 'https://leetcode.com/u/FYCfvXYnxf/',
                icon: 'leetcode',
                description: '100+ problems solved • DSA • Algorithms • Problem Solving',
                buttonText: 'View LeetCode'
            },
            {
                name: 'Kaggle',
                url: 'https://www.kaggle.com/singhaniyasarthak',
                icon: 'kaggle',
                description: 'AI/ML • Data Science • Engineering AI • Notebooks & datasets',
                buttonText: 'View Kaggle'
            },
            {
                name: 'Google Developer Profile',
                url: 'https://g.dev/sarthaksinghaniya',
                icon: 'google',
                description: 'Google technologies • Generative AI • Developer learning & achievements',
                buttonText: 'View Profile'
            },
            {
                name: 'Unstop',
                url: 'https://unstop.com/u/sarthsin39721',
                icon: 'unstop',
                description: 'Hackathons • Competitions • Challenges • Internships • Achievements',
                buttonText: 'View Unstop'
            },
            {
                name: 'Instagram',
                url: 'https://www.instagram.com/sarthak_shubh_/',
                icon: 'instagram',
                description: 'Technology • Events • Creativity • Personal journey',
                buttonText: 'Follow'
            },
            {
                name: 'TechNeekX YouTube',
                url: 'https://www.youtube.com/@TechNeekX',
                icon: 'youtube',
                description: 'Hackathons • Workshops • Tech events • Community content',
                buttonText: 'Watch Channel'
            },
            {
                name: 'TechNeekX Community',
                url: 'https://teamtechneekx.netlify.app',
                icon: 'community',
                description: 'Student community for learning, building, networking and innovation.',
                buttonText: 'Explore Community'
            }
        ],
        platformConfig: {
            label: 'ECOSYSTEM',
            color: '#1a1a1a'
        }
    }
};

/**
 * HACKATHONS STAT CARDS DATA
 * 5 Creative Battle Nodes:
 * - Participated: 90+
 * - Won: 3+
 * - Organised: 6+
 * - Mentored: 3+
 * - Judged: 2+
 */
const HACKATHON_CARDS_DATA = [
    {
        id: 'participated',
        stat: '90+',
        label: 'PARTICIPATED',
        badge: '⚡ ALL-NIGHTER BEAST',
        tagline: '90+ hackathons across India & global stages',
        color: '#FFB800',
        bg: '#FFFDF0',
        x: 0,
        y: 1.45,
        z: 0.3,
        width: 3.2,
        height: 2.2,
        phase: 0,
        subtext: 'ISRO, IIT Mandi, IIT Madras, IIT Kharagpur...',
        isMaster: true
    },
    {
        id: 'won',
        stat: '3+',
        label: 'WON PODIUM',
        badge: '🏆 CHAMPION',
        tagline: 'Winner at top hackathons & tech cups',
        color: '#FF6B35',
        bg: '#FFF9F5',
        x: -4.3,
        y: 2.2,
        z: -0.2,
        width: 2.7,
        height: 2.1,
        phase: 1.5,
        subtext: 'HackBio IIT Mandi & high-stakes coding arenas'
    },
    {
        id: 'organised',
        stat: '6+',
        label: 'ORGANISED',
        badge: '🚀 HOST & LEAD',
        tagline: 'Spearheading national builder ecosystems',
        color: '#00B4D8',
        bg: '#F0FBFF',
        x: 4.3,
        y: 2.2,
        z: -0.2,
        width: 2.7,
        height: 2.1,
        phase: 3.0,
        subtext: 'Kalpathon, Innvedx & TNX Codathon challenges'
    },
    {
        id: 'mentored',
        stat: '3+',
        label: 'MENTORED',
        badge: '🧠 TECH GUIDE',
        tagline: 'Guiding 30+ teams to ship winning solutions',
        color: '#2EC4B6',
        bg: '#F0FDF8',
        x: -2.8,
        y: -1.2,
        z: 0.1,
        width: 2.7,
        height: 2.0,
        phase: 4.5,
        subtext: 'AI/ML debugging & demo pitch architecture'
    },
    {
        id: 'judged',
        stat: '2+',
        label: 'JUDGED',
        badge: '⚖️ OFFICIAL JURY',
        tagline: 'Evaluating 100+ project submissions & code',
        color: '#E63946',
        bg: '#FFF5F5',
        x: 2.8,
        y: -1.2,
        z: 0.1,
        width: 2.7,
        height: 2.0,
        phase: 6.0,
        subtext: 'Assessing architecture, UX, and technical execution'
    },
];

const HackathonStatCard = ({ config, onClick, isTouch, revealFactorRef, spreadFactorRef, timeRef }) => {
    const outerGroupRef = useRef();
    const innerGroupRef = useRef();
    const [hovered, setHovered] = useState(false);

    const targetScale = useRef(1.0);
    const currentScale = useRef(1.0);
    const targetMagnet = useRef({ x: 0, y: 0 });
    const currentMagnet = useRef({ x: 0, y: 0 });

    const positionScale = isTouch ? 0.65 : 1.0;
    const sizeScale = isTouch ? 0.85 : 1.0;
    const spreadScale = isTouch ? 0.5 : 1.0;

    const baseX = config.x * positionScale;
    const baseWidth = config.width * sizeScale;
    const baseHeight = config.height * sizeScale;

    const handlePointerOver = (e) => {
        if (isTouch) return;
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
    };

    const handlePointerOut = (e) => {
        if (isTouch) return;
        e.stopPropagation();
        setHovered(false);
        document.body.style.cursor = 'auto';
    };

    useFrame((state, delta) => {
        if (!outerGroupRef.current) return;

        const time = timeRef.current;
        const revealFactor = revealFactorRef.current;
        const spreadFactor = spreadFactorRef.current;

        const hoverScale = (hovered && !isTouch) ? 1.08 : 1.0;
        targetScale.current = Math.max(targetScale.current, hoverScale);
        currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale.current, 10 * delta);
        if (targetScale.current > hoverScale) {
            targetScale.current = THREE.MathUtils.lerp(targetScale.current, hoverScale, 6 * delta);
        }

        currentMagnet.current.x = THREE.MathUtils.lerp(currentMagnet.current.x, targetMagnet.current.x, 8 * delta);
        currentMagnet.current.y = THREE.MathUtils.lerp(currentMagnet.current.y, targetMagnet.current.y, 8 * delta);

        const floatY = Math.sin(time * 0.7 + config.phase) * 0.15;
        const tiltZ = Math.sin(time * 0.5 + config.phase) * 0.04;

        const startY = config.y - 7;
        const endY = config.y;
        const currentY = startY + revealFactor * (endY - startY) + floatY;

        const maxSpread = 12 * spreadScale;
        let spreadX = 0;
        if (config.x < -0.5) {
            spreadX = -spreadFactor * maxSpread * (0.6 + Math.abs(config.x) / 5);
        } else if (config.x > 0.5) {
            spreadX = spreadFactor * maxSpread * (0.6 + Math.abs(config.x) / 5);
        } else {
            spreadX = 0;
        }

        const spreadY = config.isMaster ? spreadFactor * 2.5 : (config.y < 0 ? -spreadFactor * 2.0 : spreadFactor * 1.5);

        outerGroupRef.current.position.set(baseX + spreadX, currentY + spreadY, config.z);
        outerGroupRef.current.rotation.z = tiltZ;
        const s = Math.max(0.001, revealFactor * sizeScale * currentScale.current);
        outerGroupRef.current.scale.set(s, s, s);

        if (innerGroupRef.current) {
            innerGroupRef.current.position.set(currentMagnet.current.x, currentMagnet.current.y, 0);
        }
    });

    const triggerClick = (e) => {
        targetScale.current = 1.2;
        onClick(e);
    };

    return (
        <group ref={outerGroupRef} position={[baseX, config.y - 7, config.z]}>
            <group
                ref={innerGroupRef}
                onClick={triggerClick}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
                onPointerMove={(e) => {
                    if (hovered && outerGroupRef.current) {
                        outerGroupRef.current.getWorldPosition(_tempVec3);
                        targetMagnet.current.x = (e.point.x - _tempVec3.x) * 0.15;
                        targetMagnet.current.y = (e.point.y - _tempVec3.y) * 0.15;
                    }
                }}
            >
                {/* Sketch border shadow */}
                <mesh position={[0.04, -0.04, -0.002]}>
                    <planeGeometry args={[baseWidth + 0.1, baseHeight + 0.1]} />
                    <meshBasicMaterial color="#1a1a1a" transparent opacity={0.25} side={THREE.DoubleSide} />
                </mesh>

                {/* Hand-drawn sketch border */}
                <mesh position={[0, 0, -0.001]}>
                    <planeGeometry args={[baseWidth + 0.08, baseHeight + 0.08]} />
                    <meshBasicMaterial color={hovered ? config.color : (config.isMaster ? '#E6A200' : '#1a1a1a')} side={THREE.DoubleSide} />
                </mesh>

                {/* Card face */}
                <mesh position={[0, 0, 0]}>
                    <planeGeometry args={[baseWidth, baseHeight]} />
                    <meshBasicMaterial color={hovered ? '#FFFFFF' : config.bg} side={THREE.DoubleSide} />
                </mesh>

                {/* Badge ribbon */}
                <Text
                    position={[0, baseHeight / 2 - 0.28, 0.02]}
                    fontSize={baseHeight * 0.095}
                    color={config.color}
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/CabinSketch-Bold.ttf"
                >
                    {config.badge}
                </Text>

                {/* Stat number */}
                <Text
                    position={[0, 0.16, 0.02]}
                    fontSize={config.isMaster ? baseHeight * 0.38 : baseHeight * 0.34}
                    color="#1a1a1a"
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/RubikScribble-Regular.ttf"
                >
                    {config.stat}
                </Text>

                {/* Label */}
                <Text
                    position={[0, -0.28, 0.02]}
                    fontSize={baseHeight * 0.125}
                    color="#1a1a1a"
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/CabinSketch-Bold.ttf"
                >
                    {config.label}
                </Text>

                {/* Tagline */}
                <Text
                    position={[0, -0.56, 0.02]}
                    fontSize={baseHeight * 0.075}
                    color="#555555"
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/CabinSketch-Regular.ttf"
                >
                    {config.tagline}
                </Text>

                {/* Subtext */}
                <Text
                    position={[0, -baseHeight / 2 + 0.22, 0.02]}
                    fontSize={baseHeight * 0.068}
                    color={hovered ? config.color : '#888888'}
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/CabinSketch-Bold.ttf"
                >
                    {hovered ? "CLICK TO EXPLORE ↗" : config.subtext}
                </Text>
            </group>
        </group>
    );
};

/**
 * HACKATHONS Milestone - The Battle Arena in the Clouds
 */
const HackathonsMilestone = ({ z, scrollProgressRef }) => {
    const isTouch = isTouchDevice();
    const { openOverlay } = useScene();
    const groupRef = useRef();
    const coffeeRef = useRef();
    const ideaRef = useRef();

    const revealFactorRef = useRef(0);
    const spreadFactorRef = useRef(0);
    const timeRef = useRef(0);

    const buttonTexture = useLoader(THREE.TextureLoader, '/textures/about/button.webp');
    const buttonPaintedTexture = useLoader(THREE.TextureLoader, isTouch ? '/textures/about/button.webp' : '/textures/about/button_painted.webp');
    const coffeeTexture = useLoader(THREE.TextureLoader, '/textures/corridor/decorations/coffee_cup.webp');
    const ideaTexture = useLoader(THREE.TextureLoader, '/textures/corridor/decorations/idea_process.webp');

    buttonTexture.colorSpace = THREE.SRGBColorSpace;
    buttonPaintedTexture.colorSpace = THREE.SRGBColorSpace;
    coffeeTexture.colorSpace = THREE.SRGBColorSpace;
    ideaTexture.colorSpace = THREE.SRGBColorSpace;

    const buttonLegacyAspect = 894 / 208;
    const buttonHeight = 0.38;
    const buttonWidth = buttonHeight * buttonLegacyAspect;

    const audioRef = useRef();
    const { globalVolume, isMuted } = useAudio();

    const playClickSound = () => {
        if (audioRef.current) {
            const vol = isMuted ? 0 : BALLOON_AUDIO_SETTINGS.volume * globalVolume;
            audioRef.current.setVolume(vol);
            if (audioRef.current.isPlaying) audioRef.current.stop();
            audioRef.current.play();
        }
    };

    const handleCardClick = (e) => {
        e.stopPropagation();
        playClickSound();
        openOverlay(AWARDS_DATA.sotm);
    };

    useFrame((state) => {
        if (!groupRef.current) return;

        const scrollProgress = scrollProgressRef?.current || 0;
        const worldZ = ROOM_Z + scrollProgress + z;
        groupRef.current.visible = worldZ < MILESTONE_CORRIDOR_CLIP_Z;
        if (!groupRef.current.visible) return;

        const time = state.clock.elapsedTime;
        timeRef.current = time;

        const distanceZ = z + scrollProgress - 55;

        // Reveal
        const revealStart = -110;
        const revealEnd = -30;
        let newReveal = 0;
        if (distanceZ > revealStart && distanceZ < revealEnd) {
            newReveal = (distanceZ - revealStart) / (revealEnd - revealStart);
            newReveal = Math.min(1, Math.max(0, newReveal));
            newReveal = 1 - Math.pow(1 - newReveal, 2.5);
        } else if (distanceZ >= revealEnd) {
            newReveal = 1;
        }
        revealFactorRef.current = newReveal;

        // Spread
        const spreadStart = -70;
        const spreadEnd = -45;
        let newSpread = 0;
        if (distanceZ > spreadStart && distanceZ < spreadEnd) {
            newSpread = (distanceZ - spreadStart) / (spreadEnd - spreadStart);
            newSpread = Math.min(1, Math.max(0, newSpread));
            newSpread = newSpread * newSpread;
        } else if (distanceZ >= spreadEnd) {
            newSpread = 1;
        }
        spreadFactorRef.current = newSpread;

        if (coffeeRef.current) {
            coffeeRef.current.position.y = 0.4 + Math.sin(time * 0.8) * 0.2;
            coffeeRef.current.rotation.z = Math.sin(time * 0.5) * 0.08;
        }
        if (ideaRef.current) {
            ideaRef.current.position.y = 0.6 + Math.sin(time * 0.7 + 1.5) * 0.2;
            ideaRef.current.rotation.z = Math.sin(time * 0.4 + 1) * -0.08;
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, z]}>
            {/* Title */}
            <Text
                position={[0, 4.2, 0.2]}
                fontSize={1.25}
                color="#1a1a1a"
                anchorX="center"
                anchorY="middle"
                font="/fonts/RubikScribble-Regular.ttf"
            >
                HACKATHONS
            </Text>

            {/* Subtitle */}
            <Text
                position={[0, 3.45, 0.2]}
                fontSize={0.36}
                color="#333333"
                anchorX="center"
                anchorY="middle"
                font="/fonts/CabinSketch-Bold.ttf"
            >
                THE BATTLEGROUND • 90+ ALL-NIGHTERS & MVPS
            </Text>

            {/* Motto */}
            <Text
                position={[0, 2.95, 0.2]}
                fontSize={0.26}
                color="#666666"
                anchorX="center"
                anchorY="middle"
                font="/fonts/CabinSketch-Regular.ttf"
                fontStyle="italic"
            >
                "Eat. Sleep. Code. Ship. Repeat. 🔥"
            </Text>

            {/* Overhead Paper Airplane */}
            <group position={[0, 4.9, 0.3]} rotation={[0.08, -0.35, 0.05]}>
                <PaperAirplane scale={0.65} color="#ffffff" />
            </group>

            {/* Floating Coffee Cup doodle on left */}
            <group ref={coffeeRef} position={[-5.0, 0.4, 0.1]}>
                <mesh>
                    <planeGeometry args={[1.3, 1.3]} />
                    <meshBasicMaterial map={coffeeTexture} transparent side={THREE.DoubleSide} />
                </mesh>
                <Text
                    position={[0, -0.75, 0.05]}
                    fontSize={0.22}
                    color="#2a2a2a"
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/CabinSketch-Bold.ttf"
                >
                    3 AM COFFEE ☕
                </Text>
            </group>

            {/* Floating Idea Process lightbulb doodle on right */}
            <group ref={ideaRef} position={[5.0, 0.6, 0.1]}>
                <mesh>
                    <planeGeometry args={[1.4, 1.4]} />
                    <meshBasicMaterial map={ideaTexture} transparent side={THREE.DoubleSide} />
                </mesh>
                <Text
                    position={[0, -0.75, 0.05]}
                    fontSize={0.22}
                    color="#2a2a2a"
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/CabinSketch-Bold.ttf"
                >
                    MVP SHIPPING 💡
                </Text>
            </group>

            {/* 5 Interactive Stat Cards */}
            {HACKATHON_CARDS_DATA.map((card) => (
                <HackathonStatCard
                    key={card.id}
                    config={card}
                    onClick={handleCardClick}
                    isTouch={isTouch}
                    revealFactorRef={revealFactorRef}
                    spreadFactorRef={spreadFactorRef}
                    timeRef={timeRef}
                />
            ))}

            {/* Central Action Button */}
            <group position={[0, -2.6, 0.15]}>
                <AwardButton
                    onClick={handleCardClick}
                    texture={buttonTexture}
                    paintedTexture={buttonPaintedTexture}
                    width={buttonWidth * 1.55}
                    height={buttonHeight * 1.25}
                    position={[0, 0, 0]}
                    label="EXPLORE HACKATHONS ↗"
                    fontSize={0.21}
                />
            </group>

            {/* Audio */}
            <PositionalAudio
                ref={audioRef}
                url="/sounds/baloonpoop.mp3"
                distanceModel="exponential"
                rolloffFactor={BALLOON_AUDIO_SETTINGS.rolloff}
                refDistance={BALLOON_AUDIO_SETTINGS.distance}
                loop={false}
            />
        </group>
    );
};

/**
 * AWARDS Milestone - Floating Cards
 * SOTY (center), SOTD, SOTM, Featured (behind)
 */
const AwardsMilestone = ({ z, scrollProgressRef }) => {
    const awardsData = AWARDS_DATA;

    const { camera, viewport } = useThree();
    const isTouch = isTouchDevice();
    const { openOverlay } = useScene();
    const groupRef = useRef();
    const sotyRef = useRef();
    const sotdRef = useRef();
    const sotmRef = useRef();

    // Card reveal refs (driven by button hover)
    const sotdCardRevealRef = useRef();
    const sotdCardPaintedRef = useRef();
    const sotdHideDelayRef = useRef();
    const sotmCardRevealRef = useRef();
    const sotmCardPaintedRef = useRef();
    const sotmHideDelayRef = useRef();
    const sotyCardRevealRef = useRef();
    const sotyCardPaintedRef = useRef();
    const sotyHideDelayRef = useRef();

    // Load textures
    const sotyTexture = useLoader(THREE.TextureLoader, '/textures/about/SOTY.webp');
    const sotdTexture = useLoader(THREE.TextureLoader, '/textures/about/SOTD.webp');
    const sotmTexture = useLoader(THREE.TextureLoader, '/textures/about/SOTM.webp');
    const sotyPaintedTexture = useLoader(THREE.TextureLoader, isTouch ? '/textures/about/SOTY.webp' : '/textures/about/SOTY_painted.webp');
    const sotdPaintedTexture = useLoader(THREE.TextureLoader, isTouch ? '/textures/about/SOTD.webp' : '/textures/about/SOTD_painted.webp');
    const sotmPaintedTexture = useLoader(THREE.TextureLoader, isTouch ? '/textures/about/SOTM.webp' : '/textures/about/SOTM_painted.webp');
    const buttonTexture = useLoader(THREE.TextureLoader, '/textures/about/button.webp');
    const buttonPaintedTexture = useLoader(THREE.TextureLoader, isTouch ? '/textures/about/button.webp' : '/textures/about/button_painted.webp');

    // Color space fix
    sotyTexture.colorSpace = THREE.SRGBColorSpace;
    sotdTexture.colorSpace = THREE.SRGBColorSpace;
    sotmTexture.colorSpace = THREE.SRGBColorSpace;
    sotyPaintedTexture.colorSpace = THREE.SRGBColorSpace;
    sotdPaintedTexture.colorSpace = THREE.SRGBColorSpace;
    sotmPaintedTexture.colorSpace = THREE.SRGBColorSpace;
    buttonTexture.colorSpace = THREE.SRGBColorSpace;
    buttonPaintedTexture.colorSpace = THREE.SRGBColorSpace;

    // Calculate aspect ratios
    // LEGACY FIX: Use original dimensions for cards (2400x1760) and buttons (894x208)
    const cardLegacyAspect = 2400 / 1760;
    const buttonLegacyAspect = 894 / 208;

    // Base height for cards
    const cardHeight = 2.5;

    // Button dimensions
    const buttonHeight = 0.35;
    const buttonWidth = buttonHeight * buttonLegacyAspect;
    const buttonY = -cardHeight / 2 - buttonHeight / 2 + 0.5;

    // Card hover handler factory
    const makeCardHoverHandler = (revealRef, paintedRef, hideDelayRef) => (isHovered) => {
        if (isTouch) return;
        if (isHovered) {
            if (revealRef.current) {
                gsap.to(revealRef.current, {
                    uProgress: 1.0,
                    duration: 0.8,
                    ease: 'power2.out',
                    overwrite: true
                });
            }
            if (hideDelayRef.current) hideDelayRef.current.kill();
            if (paintedRef.current) {
                paintedRef.current.visible = true;
                if (paintedRef.current.material) paintedRef.current.material.opacity = 1;
            }
        } else {
            if (revealRef.current) {
                gsap.to(revealRef.current, {
                    uProgress: 0.0,
                    duration: 0.5,
                    ease: 'power2.out',
                    overwrite: true
                });
            }
            hideDelayRef.current = gsap.delayedCall(0.55, () => {
                if (paintedRef.current && paintedRef.current.material) {
                    paintedRef.current.material.opacity = 0;
                }
            });
        }
    };

    useFrame((state) => {
        if (!groupRef.current) return;

        const scrollProgress = scrollProgressRef?.current || 0;
        const worldZ = ROOM_Z + scrollProgress + z;
        groupRef.current.visible = worldZ < MILESTONE_CORRIDOR_CLIP_Z;
        if (!groupRef.current.visible) return;

        const distanceZ = z + scrollProgress - 55;

        const revealStart = -120;
        const revealEnd = -50;
        let revealFactor = 0;

        if (distanceZ > revealStart && distanceZ < revealEnd) {
            revealFactor = (distanceZ - revealStart) / (revealEnd - revealStart);
            revealFactor = Math.min(1, Math.max(0, revealFactor));
            revealFactor = revealFactor * revealFactor;
        } else if (distanceZ >= revealEnd) {
            revealFactor = 1;
        }

        const sotyStart = -80;
        const sotyEnd = -20;
        let sotyFactor = 0;

        if (distanceZ > sotyStart && distanceZ < sotyEnd) {
            sotyFactor = (distanceZ - sotyStart) / (sotyEnd - sotyStart);
            sotyFactor = Math.min(1, Math.max(0, sotyFactor));
            sotyFactor = 1 - Math.pow(1 - sotyFactor, 2);
        } else if (distanceZ >= sotyEnd) {
            sotyFactor = 1;
        }

        const spreadX = 5;

        if (sotdRef.current) {
            sotdRef.current.position.x = -revealFactor * spreadX;
        }
        if (sotmRef.current) {
            sotmRef.current.position.x = revealFactor * spreadX;
        }

        if (sotyRef.current) {
            sotyRef.current.position.y = 0.5 + sotyFactor * 2.5;
        }
    });

    return (
        <group ref={groupRef} position={[0, 2, z]}>
            {/* Title */}
            <Text
                position={[0, 4, 0]}
                fontSize={1.2}
                color="#1a1a1a"
                anchorX="center"
                anchorY="middle"
                font="/fonts/RubikScribble-Regular.ttf"
            >
                AWARDS
            </Text>

            {/* === SOTD (behind SOTY, rendered second) === */}
            <group ref={sotdRef} position={[0, 0.5, -0.5]}>
                {/* Painted card (behind) - hidden until button hover */}
                <mesh ref={sotdCardPaintedRef} position={[0, 0, -0.001]} visible={true}>
                    <planeGeometry args={[cardHeight * cardLegacyAspect, cardHeight]} />
                    <meshBasicMaterial color="#e0e0e0"
                        map={sotdPaintedTexture}
                        transparent
                        opacity={0}
                        side={THREE.DoubleSide}
                        alphaTest={0.5}
                    />
                </mesh>
                {/* Sketch card (front) with reveal */}
                <mesh>
                    <planeGeometry args={[cardHeight * cardLegacyAspect, cardHeight]} />
                    <revealBasicMaterial
                        ref={sotdCardRevealRef}
                        map={sotdTexture}
                        transparent
                        side={THREE.DoubleSide}
                        uProgress={0.0}
                    />
                </mesh>
                {/* BUTTON */}
                <AwardButton
                    onClick={(e) => {
                        e.stopPropagation();
                        openOverlay(awardsData.sotd);
                    }}
                    texture={buttonTexture}
                    paintedTexture={buttonPaintedTexture}
                    width={buttonWidth}
                    height={buttonHeight}
                    position={[0, buttonY, 0.05]}
                    onHoverChange={makeCardHoverHandler(sotdCardRevealRef, sotdCardPaintedRef, sotdHideDelayRef)}
                />
                {/* AWARD LABEL */}
                <Text
                    position={[0, 0.95, 0.01]}
                    fontSize={0.35}
                    color="#1a1a1a"
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/CabinSketch-Bold.ttf"
                >
                    CERTIFICATES
                </Text>
                {/* AWARD COUNT */}
                <Text
                    position={[-0.05, 0, 0.01]}
                    fontSize={0.8}
                    color="#1a1a1a"
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/CabinSketch-Bold.ttf"
                >
                    {awardsData.sotd.count || '10+'}
                </Text>
            </group>

            {/* === SOTM (behind SOTY, rendered third) === */}
            <group ref={sotmRef} position={[0, 0.5, -0.2]}>
                {/* Painted card (behind) - hidden until button hover */}
                <mesh ref={sotmCardPaintedRef} position={[0, 0, -0.001]} visible={true}>
                    <planeGeometry args={[cardHeight * cardLegacyAspect, cardHeight]} />
                    <meshBasicMaterial color="#e0e0e0"
                        map={sotmPaintedTexture}
                        transparent
                        opacity={0}
                        side={THREE.DoubleSide}
                        alphaTest={0.5}
                    />
                </mesh>
                {/* Sketch card (front) with reveal */}
                <mesh>
                    <planeGeometry args={[cardHeight * cardLegacyAspect, cardHeight]} />
                    <revealBasicMaterial
                        ref={sotmCardRevealRef}
                        map={sotmTexture}
                        transparent
                        side={THREE.DoubleSide}
                        uProgress={0.0}
                    />
                </mesh>
                {/* BUTTON */}
                <AwardButton
                    onClick={(e) => {
                        e.stopPropagation();
                        openOverlay(awardsData.sotm);
                    }}
                    texture={buttonTexture}
                    paintedTexture={buttonPaintedTexture}
                    width={buttonWidth}
                    height={buttonHeight}
                    position={[0, buttonY, 0.05]}
                    onHoverChange={makeCardHoverHandler(sotmCardRevealRef, sotmCardPaintedRef, sotmHideDelayRef)}
                />
                {/* AWARD LABEL */}
                <Text
                    position={[0, 0.95, 0.01]}
                    fontSize={0.38}
                    color="#1a1a1a"
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/CabinSketch-Bold.ttf"
                >
                    HACKATHONS
                </Text>
                {/* AWARD COUNT */}
                <Text
                    position={[-0.05, 0, 0.01]}
                    fontSize={0.8}
                    color="#1a1a1a"
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/CabinSketch-Bold.ttf"
                >
                    {awardsData.sotm.count || '90+'}
                </Text>
            </group>

            {/* === SOTY (front, center, rendered LAST = always on top) === */}
            <group ref={sotyRef} position={[0, 0.5, 0]}>
                {/* Painted card (behind) - hidden until button hover */}
                <mesh ref={sotyCardPaintedRef} position={[0, 0, -0.001]} visible={true}>
                    <planeGeometry args={[cardHeight * cardLegacyAspect, cardHeight]} />
                    <meshBasicMaterial color="#e0e0e0"
                        map={sotyPaintedTexture}
                        transparent
                        opacity={0}
                        side={THREE.DoubleSide}
                        alphaTest={0.5}
                    />
                </mesh>
                {/* Sketch card (front) with reveal */}
                <mesh>
                    <planeGeometry args={[cardHeight * cardLegacyAspect, cardHeight]} />
                    <revealBasicMaterial
                        ref={sotyCardRevealRef}
                        map={sotyTexture}
                        transparent
                        side={THREE.DoubleSide}
                    />
                </mesh>
                {/* BUTTON */}
                <AwardButton
                    onClick={(e) => {
                        e.stopPropagation();
                        openOverlay(awardsData.other);
                    }}
                    texture={buttonTexture}
                    paintedTexture={buttonPaintedTexture}
                    width={buttonWidth}
                    height={buttonHeight}
                    position={[0, buttonY, 0.05]}
                    onHoverChange={makeCardHoverHandler(sotyCardRevealRef, sotyCardPaintedRef, sotyHideDelayRef)}
                />
                {/* AWARD LABEL */}
                <Text
                    position={[0, 0.95, 0.01]}
                    fontSize={0.45}
                    color="#1a1a1a"
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/CabinSketch-Bold.ttf"
                >
                    PROFILES
                </Text>
                {/* AWARD COUNT */}
                <Text
                    position={[-0.05, 0, 0.01]}
                    fontSize={0.8}
                    color="#1a1a1a"
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/CabinSketch-Bold.ttf"
                >
                    {awardsData.other.count || '8+'}
                </Text>
            </group>
        </group>
    );
};

/**
 * JOURNEY Milestone - Floating Islands
 * UO Island (left) and Freelance Island (right) floating in clouds
 */
const JourneyMilestone = ({ z, scrollProgressRef }) => {
    const { camera, viewport } = useThree();
    const isTouch = isTouchDevice();
    const groupRef = useRef();
    const uoRef = useRef();
    const freelanceRef = useRef();

    // Load textures
    const uoTexture = useLoader(THREE.TextureLoader, '/textures/about/uowyspa.webp');
    const freelanceTexture = useLoader(THREE.TextureLoader, '/textures/about/freelancewyspa.webp');

    // Texture settings
    uoTexture.colorSpace = THREE.SRGBColorSpace;
    freelanceTexture.colorSpace = THREE.SRGBColorSpace;

    // Calculate aspect ratios to keep images 1:1 (not stretched)
    // LEGACY FIX: Use original dimensions (2816x1536)
    const islandLegacyAspect = 2816 / 1536;
    const uoAspect = islandLegacyAspect;
    const freelanceAspect = islandLegacyAspect;

    // Base height for islands - width will adjust automatically
    const islandHeight = 4.5;

    useFrame((state) => {
        if (!groupRef.current) return;

        // === TWARDA LINIA CLIP (RĘCZNE OBLICZENIE WORLD Z) ===
        const scrollProgress = scrollProgressRef?.current || 0;
        const worldZ = ROOM_Z + scrollProgress + z;
        groupRef.current.visible = worldZ < MILESTONE_CORRIDOR_CLIP_Z;
        if (!groupRef.current.visible) return;

        const time = state.clock.elapsedTime;

        // FIX: Use consistent distance based on scrollProgress + offset
        const distanceZ = z + scrollProgress - 55;

        // Reveal effect (islands float up from below clouds)
        // === EDYTUJ TUTAJ (JOURNEY) ===
        const revealStart = -100; // Wcześniejszy start
        const revealEnd = -20;
        let revealFactor = 0;

        if (distanceZ > revealStart && distanceZ < revealEnd) {
            revealFactor = (distanceZ - revealStart) / (revealEnd - revealStart);
            revealFactor = Math.min(1, Math.max(0, revealFactor));
            revealFactor = 1 - Math.pow(1 - revealFactor, 2);
        } else if (distanceZ >= revealEnd) {
            revealFactor = 1;
        }

        // Floating animation (bobbing)
        // UO Island (Left)
        if (uoRef.current) {
            // === EDYTUJ POZYCJE TUTAJ (UO) ===
            const startY = -2;
            const endY = 1.5;

            const currentBaseY = startY + revealFactor * (endY - startY);
            uoRef.current.position.y = currentBaseY + Math.sin(time * 0.5) * 0.2;
            uoRef.current.rotation.z = Math.sin(time * 0.3) * 0.05;
        }

        // Freelance Island (Right)
        if (freelanceRef.current) {
            // === EDYTUJ POZYCJE TUTAJ (Freelance) ===
            const startY = -1;
            const endY = 2.5;

            const currentBaseY = startY + revealFactor * (endY - startY);
            freelanceRef.current.position.y = currentBaseY + Math.sin(time * 0.4 + 2) * 0.25;
            freelanceRef.current.rotation.z = Math.sin(time * 0.2 + 1) * -0.05;
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, z]}>
            {/* Title */}
            <Text
                position={[0, 5, 0.3]}
                fontSize={1.2}
                color="#1a1a1a"
                anchorX="center"
                anchorY="middle"
                font="/fonts/RubikScribble-Regular.ttf"
            >
                JOURNEY
            </Text>

            {/* Subtitle */}
            <Text
                position={[0, 4.2, 0.3]}
                fontSize={0.35}
                color="#555555"
                anchorX="center"
                anchorY="middle"
                font="/fonts/CabinSketch-Regular.ttf"
            >
                My path so far...
            </Text>

            {/* === UO ISLAND (Left) === */}
            <group ref={uoRef} position={[-3.5, -1, 0]}>
                <mesh>
                    <planeGeometry args={[islandHeight * uoAspect, islandHeight]} />
                    <meshBasicMaterial color="#e0e0e0"
                        map={uoTexture}
                        transparent
                        side={THREE.DoubleSide}
                    />
                </mesh>
                {/* NAPIS NA WYSPIE (UO) - EDYTUJ TUTAJ */}
                <Text
                    position={[0.1, -0.85, 0.1]} // POZYCJA (X, Y, Z)
                    fontSize={0.4}           // WIELKOŚĆ
                    color="#1a1a1a"
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/CabinSketch-Bold.ttf"
                >
                    B.Tech AI (2024-2028)
                </Text>
            </group>

            {/* === FREELANCE ISLAND (Right) === */}
            <group ref={freelanceRef} position={[3.5, -2, 0.5]}>
                <mesh>
                    <planeGeometry args={[islandHeight * freelanceAspect, islandHeight]} />
                    <meshBasicMaterial color="#e0e0e0"
                        map={freelanceTexture}
                        transparent
                        side={THREE.DoubleSide}
                    />
                </mesh>
                {/* NAPIS NA WYSPIE (Freelance) - EDYTUJ TUTAJ */}
                <Text
                    position={[0, -0.65, 0.1]} // POZYCJA (X, Y, Z)
                    fontSize={0.45}          // WIELKOŚĆ
                    color="#1a1a1a"
                    anchorX="center"
                    anchorY="middle"
                    font="/fonts/CabinSketch-Bold.ttf"
                >
                    TechNeekX (2025-NOW)
                </Text>
            </group>
        </group>
    );
};

/**
 * SKILLS Milestone - Floating Balloons
 * Colorful balloons floating upward, each representing a skill
 */

// Balloon configuration: size category, texture path, position offset
const BALLOON_CONFIG = [
    // Large balloons (main skills) - front and center
    { texture: '/textures/about/reactduzybalon.webp', paintedTexture: '/textures/about/reactduzybalon_painted.webp', label: 'Generative AI', size: 'large', x: -2.5, y: 2, z: 0.3, phase: 0 },
    { texture: '/textures/about/threejsduzybalon.webp', paintedTexture: '/textures/about/threejsduzybalon_painted.webp', label: 'Agentic AI', size: 'large', x: 2.5, y: 2.5, z: 0.2, phase: 1.5 },
    { texture: '/textures/about/GSAPduzybalon.webp', paintedTexture: '/textures/about/GSAPduzybalon_painted.webp', label: 'PyTorch / RAG', size: 'large', x: 0, y: 3, z: 0.5, phase: 3 },

    // Medium balloons - scattered around
    { texture: '/textures/about/JSSREDNIBALON.webp', paintedTexture: '/textures/about/JSSREDNIBALON_painted.webp', label: 'Python', size: 'medium', x: -4, y: 1, z: -0.3, phase: 0.8 },
    { texture: '/textures/about/csssrednibalon.webp', paintedTexture: '/textures/about/csssrednibalon_painted.webp', label: 'React / Next.js', size: 'medium', x: 4, y: 1.5, z: -0.2, phase: 2.2 },
    { texture: '/textures/about/nextjssrednibalon.webp', paintedTexture: '/textures/about/nextjssrednibalon_painted.webp', label: 'FastAPI / Node.js', size: 'medium', x: 0, y: 0.5, z: -0.4, phase: 4 },

    // Small balloons - background accents
    { texture: '/textures/about/htmlmalybalon.webp', paintedTexture: '/textures/about/htmlmalybalon_painted.webp', label: 'LangChain', size: 'small', x: -5.5, y: 2.5, z: -0.8, phase: 1.2 },
    { texture: '/textures/about/gitmalybalon.webp', paintedTexture: '/textures/about/gitmalybalon_painted.webp', label: 'Docker / AWS', size: 'small', x: 5.5, y: 3, z: -0.7, phase: 2.8 },
    { texture: '/textures/about/figmamalybalon.webp', paintedTexture: '/textures/about/figmamalybalon_painted.webp', label: 'Computer Vision', size: 'small', x: -3, y: 4.5, z: -0.5, phase: 3.5 },
    { texture: '/textures/about/firebasemalybalon.webp', paintedTexture: '/textures/about/firebasemalybalon_painted.webp', label: 'MongoDB', size: 'small', x: 3.5, y: 4, z: -0.6, phase: 4.5 },
];

// Size multipliers for balloon categories
const SIZE_MULTIPLIERS = {
    large: 3.0,
    medium: 2.2,
    small: 1.6,
};

// Individual balloon component
const SkillBalloon = ({ config, revealFactorRef, spreadFactorRef, timeRef }) => {
    const { viewport } = useThree();
    const isTouch = isTouchDevice();
    const texture = useLoader(THREE.TextureLoader, config.texture);
    const paintedTextureUrl = isTouch ? config.texture : config.paintedTexture;
    const paintedTexture = useLoader(THREE.TextureLoader, paintedTextureUrl);
    texture.colorSpace = THREE.SRGBColorSpace;
    paintedTexture.colorSpace = THREE.SRGBColorSpace;

    const [isPopping, setIsPopping] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [isFadingOutText, setIsFadingOutText] = useState(false);
    const popRef = useRef(0);
    const textFadeRef = useRef(1); // 1 = fully visible, 0 = hidden
    const respawnOffsetRef = useRef(0); // For floating back up after respawn
    const balloonMatRef = useRef();
    const balloonRevealRef = useRef(); // RevealBasicMaterial ref for sketch
    const paintedMeshRef = useRef(); // Painted balloon mesh visibility
    const paintedMatRef = useRef(); // Painted balloon material opacity control
    const hideDelayRef = useRef(); // Track pending gsap.delayedCall
    const textRef = useRef();

    // Audio Ref
    const balloonAudioRef = useRef();
    const { globalVolume, isMuted } = useAudio();

    const playBalloonSound = () => {
        if (balloonAudioRef.current) {
            const vol = isMuted ? 0 : BALLOON_AUDIO_SETTINGS.volume * globalVolume;
            balloonAudioRef.current.setVolume(vol);
            if (balloonAudioRef.current.isPlaying) balloonAudioRef.current.stop();
            balloonAudioRef.current.play();
        }
    };

    // LEGACY FIX: Use original aspect ratios from BALLOON_CONFIG or hardcoded for categories
    const legacyAspects = {
        'reactduzybalon.webp': 736 / 1447,
        'threejsduzybalon.webp': 1141 / 1964,
        'GSAPduzybalon.webp': 1.0, // GSAP balloon is square
        'default_small_medium': 631 / 1482 // Common ratio for others
    };
    
    const filename = config.texture.split('/').pop();
    const aspect = legacyAspects[filename] || legacyAspects['default_small_medium'];
    const baseHeight = SIZE_MULTIPLIERS[config.size];

    const outerGroupRef = useRef();
    const innerGroupRef = useRef();
    const targetScale = useRef(1.0);
    const currentScale = useRef(1.0);
    const targetMagnet = useRef({ x: 0, y: 0 });
    const currentMagnet = useRef({ x: 0, y: 0 });

    // === RESPONSYWNOŚĆ ===
    // Na mobile (wąski viewport) balony są bliżej środka
    const positionScale = isTouch ? 0.5 : 1; // Jak bardzo ściskamy pozycje na mobile
    const spreadScale = isTouch ? 0.4 : 1;   // Jak bardzo zmniejszamy spread na mobile
    const sizeScale = isTouch ? 0.85 : 1;    // Trochę mniejsze balony na mobile

    // Cursor handling
    useEffect(() => {
        if (hovered && !isPopping) {
            document.body.style.cursor = 'pointer';
        } else {
            document.body.style.cursor = 'auto';
        }
    }, [hovered, isPopping]);

    // Handle text fade out timer
    useEffect(() => {
        if (isPopping) {
            // Start fading out text after 3 seconds
            const timer = setTimeout(() => {
                setIsFadingOutText(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isPopping]);

    // Hover handlers for brush-stroke reveal
    const handlePointerOver = (e) => {
        if (isTouch) return;
        e.stopPropagation();
        if (!isPopping) setHovered(true);

        // Brush-stroke reveal: show painted balloon
        if (balloonRevealRef.current) {
            gsap.to(balloonRevealRef.current, {
                uProgress: 1.0,
                duration: 0.8,
                ease: 'power2.out',
                overwrite: true
            });
        }
        if (hideDelayRef.current) hideDelayRef.current.kill();
        if (paintedMeshRef.current) paintedMeshRef.current.visible = true;
        if (paintedMatRef.current) paintedMatRef.current.opacity = 1;
    };

    const handlePointerOut = (e) => {
        if (isTouch) return;
        e.stopPropagation();
        setHovered(false);

        // Reverse reveal
        if (balloonRevealRef.current) {
            gsap.to(balloonRevealRef.current, {
                uProgress: 0.0,
                duration: 0.5,
                ease: 'power2.out',
                overwrite: true
            });
        }
        hideDelayRef.current = gsap.delayedCall(0.55, () => {
            if (paintedMatRef.current) paintedMatRef.current.opacity = 0;
        });
    };

    // Animation update loop
    useFrame((state, delta) => {
        if (hovered && !isPopping) {
            targetScale.current = 1.05; // lekkie powiększenie
        } else {
            targetScale.current = 1.0;
            targetMagnet.current.x = 0;
            targetMagnet.current.y = 0;
        }

        currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale.current, 8 * delta);
        currentMagnet.current.x = THREE.MathUtils.lerp(currentMagnet.current.x, targetMagnet.current.x, 8 * delta);
        currentMagnet.current.y = THREE.MathUtils.lerp(currentMagnet.current.y, targetMagnet.current.y, 8 * delta);

        if (isPopping) {
            // Smooth, slow pop animation
            popRef.current = THREE.MathUtils.lerp(popRef.current, 1, 2.5 * delta);

            // Also hide painted mesh during pop (kill any pending reveals)
            if (hideDelayRef.current) hideDelayRef.current.kill();
            if (balloonRevealRef.current) {
                balloonRevealRef.current.uProgress = 0;
            }
        }

        if (isFadingOutText) {
            // Fade out the text slowly
            textFadeRef.current = THREE.MathUtils.lerp(textFadeRef.current, 0, 2 * delta);

            // Once fully faded, respawn the balloon from below
            if (textFadeRef.current < 0.05) {
                setIsPopping(false);
                setHovered(false);
                setIsFadingOutText(false);
                popRef.current = 0;
                textFadeRef.current = 1;
                respawnOffsetRef.current = -12; // Teleport below to float up again

                // Immediately teleport the mesh to prevent pointer events at the old location
                if (outerGroupRef.current) {
                    outerGroupRef.current.position.y -= 12;
                }

                // Immediately reset opacities to prevent flashing
                if (balloonRevealRef.current) balloonRevealRef.current.opacity = 1;
                if (textRef.current) textRef.current.fillOpacity = 0;
                // Reset reveal state on respawn
                if (balloonRevealRef.current) balloonRevealRef.current.uProgress = 0;
                if (paintedMatRef.current) paintedMatRef.current.opacity = 0;
                if (paintedMeshRef.current) paintedMeshRef.current.visible = false;
            }
        }

        // Float back up if respawning
        if (respawnOffsetRef.current < -0.01) {
            respawnOffsetRef.current = THREE.MathUtils.lerp(respawnOffsetRef.current, 0, 1.5 * delta);
        }

        // Apply opacities if not fully respawned
        if (balloonRevealRef.current && isPopping) {
            balloonRevealRef.current.opacity = 1 - popRef.current;
        }
        if (paintedMatRef.current && isPopping) {
            paintedMatRef.current.opacity = 1 - popRef.current;
        }
        if (textRef.current && isPopping) {
            // Combine pop-in and fade-out opacities
            textRef.current.fillOpacity = popRef.current * textFadeRef.current;
            textRef.current.outlineOpacity = popRef.current * textFadeRef.current;
        }
    });

    // Floating animation with unique phase — now computed inside useFrame
    // Moved from render body to avoid re-renders

    // Bazowa pozycja X (skalowana na mobile)
    const baseX = config.x * positionScale;

    // P2: Compute position/scale/rotation imperatively inside useFrame
    useFrame(() => {
        if (!outerGroupRef.current) return;

        const time = timeRef.current;
        const revealFactor = revealFactorRef.current;
        const spreadFactor = spreadFactorRef.current;

        // Floating animation with unique phase
        const floatY = Math.sin(time * 0.6 + config.phase) * 0.3;
        const floatX = Math.sin(time * 0.4 + config.phase * 0.7) * 0.15;
        const rotation = Math.sin(time * 0.3 + config.phase) * 0.08;

        // Reveal: balloons float up from below, including respawn offset
        const startY = config.y - 8;
        const endY = config.y;
        const currentY = startY + revealFactor * (endY - startY) + floatY + respawnOffsetRef.current;

        // Scale up as they reveal
        let scale = revealFactor * sizeScale;
        const popScaleEffect = currentScale.current + popRef.current * 0.4;
        scale *= popScaleEffect;

        // === SPREAD EFFECT (ROZSUWANIE) ===
        const maxSpread = 15 * spreadScale;
        let spreadX = 0;

        if (config.x < -0.5) {
            spreadX = -spreadFactor * maxSpread * (0.5 + Math.abs(config.x) / 6);
        } else if (config.x > 0.5) {
            spreadX = spreadFactor * maxSpread * (0.5 + Math.abs(config.x) / 6);
        } else {
            spreadX = config.phase > 3.5
                ? spreadFactor * maxSpread * 0.8
                : -spreadFactor * maxSpread * 0.8;
        }

        // Apply imperatively
        outerGroupRef.current.position.set(baseX + floatX + spreadX, currentY, config.z);
        outerGroupRef.current.rotation.z = rotation;
        const s = Math.max(0.001, scale); // Avoid zero scale
        outerGroupRef.current.scale.set(s, s, s);

        // Update magnet position on inner group imperatively
        if (innerGroupRef.current) {
            innerGroupRef.current.position.set(currentMagnet.current.x, currentMagnet.current.y, 0);
        }
    });

    return (
        <group
            ref={outerGroupRef}
            position={[baseX, config.y - 8, config.z]}
        >
            <group ref={innerGroupRef}>
                {/* Painted balloon (behind) - hidden until hover */}
                <mesh ref={paintedMeshRef} visible={true}>
                    <planeGeometry args={[baseHeight * aspect, baseHeight]} />
                    <meshBasicMaterial color="#e0e0e0"
                        ref={paintedMatRef}
                        map={paintedTexture}
                        transparent
                        opacity={0}
                        side={THREE.DoubleSide}
                        alphaTest={0.5}
                        depthWrite={false}
                    />
                </mesh>

                {/* Sketch balloon (front) with brush-stroke reveal */}
                <mesh
                    position={[0, 0, 0.001]}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isPopping) {
                            setIsPopping(true);
                            playBalloonSound();
                        }
                    }}
                    onPointerOver={handlePointerOver}
                    onPointerOut={handlePointerOut}
                    onPointerMove={(e) => {
                        if (hovered && !isPopping && outerGroupRef.current) {
                            outerGroupRef.current.getWorldPosition(_tempVec3);
                            // Reduced magnetic pull from 0.5 to 0.15 for gentler effect
                            targetMagnet.current.x = (e.point.x - _tempVec3.x) * 0.15;
                            targetMagnet.current.y = (e.point.y - _tempVec3.y) * 0.15;
                        }
                    }}
                    visible={popRef.current < 0.99}
                >
                    <planeGeometry args={[baseHeight * aspect, baseHeight]} />
                    <revealBasicMaterial
                        ref={balloonRevealRef}
                        map={texture}
                        transparent
                        side={THREE.DoubleSide}
                        depthWrite={false}
                        uProgress={0.0}
                    />
                </mesh>

                {/* Stack Name Text that fades in then out */}
                {isPopping && textFadeRef.current > 0.01 && (
                    <Text
                        ref={textRef}
                        position={[0, 0, 0.1]}
                        fontSize={baseHeight * 0.4}
                        color="#1a1a1a"
                        anchorX="center"
                        anchorY="middle"
                        font="/fonts/RubikScribble-Regular.ttf"
                        fillOpacity={0}
                        outlineWidth={0.02}
                        outlineColor="#fff"
                        outlineOpacity={0}
                    >
                        {config.label}
                    </Text>
                )}

                <PositionalAudio
                    ref={balloonAudioRef}
                    url="/sounds/baloonpoop.mp3"
                    distanceModel="exponential"
                    rolloffFactor={BALLOON_AUDIO_SETTINGS.rolloff}
                    refDistance={BALLOON_AUDIO_SETTINGS.distance}
                    loop={false}
                />
            </group>
        </group>
    );
};

const SkillsMilestone = ({ z, scrollProgressRef }) => {
    const { camera, viewport } = useThree();
    const isTouch = isTouchDevice();
    const groupRef = useRef();
    // P2: Use refs instead of state to avoid 60 re-renders/sec inside useFrame
    const revealFactorRef = useRef(0);
    const spreadFactorRef = useRef(0);
    const timeRef = useRef(0);

    useFrame((state) => {
        if (!groupRef.current) return;

        // === TWARDA LINIA CLIP (RĘCZNE OBLICZENIE WORLD Z) ===
        const scrollProgress = scrollProgressRef?.current || 0;
        const worldZ = ROOM_Z + scrollProgress + z;
        groupRef.current.visible = worldZ < MILESTONE_CORRIDOR_CLIP_Z;
        if (!groupRef.current.visible) return;

        timeRef.current = state.clock.elapsedTime;

        // FIX: Use consistent distance based on scrollProgress + offset
        const distanceZ = z + scrollProgress - 55;

        // Reveal effect (balloons float up)
        // === EDYTUJ TUTAJ (SKILLS REVEAL) ===
        const revealStart = -100;
        const revealEnd = -25;
        let newRevealFactor = 0;

        if (distanceZ > revealStart && distanceZ < revealEnd) {
            newRevealFactor = (distanceZ - revealStart) / (revealEnd - revealStart);
            newRevealFactor = Math.min(1, Math.max(0, newRevealFactor));
            newRevealFactor = 1 - Math.pow(1 - newRevealFactor, 3); // ease out cubic
        } else if (distanceZ >= revealEnd) {
            newRevealFactor = 1;
        }

        revealFactorRef.current = newRevealFactor;

        // === SPREAD EFFECT (EDYTUJ TUTAJ SKILLS SPREAD) ===
        // Im bliżej kamery, tym bardziej balony się rozsuwają
        // Większy zakres = dłuższa, bardziej widoczna animacja
        const spreadStart = -70; // Kiedy animacja SIĘ ZACZYNA (Wcześniej)
        const spreadEnd = -40;    // Kiedy animacja jest PEŁNA (Później)
        let newSpreadFactor = 0;

        if (distanceZ > spreadStart && distanceZ < spreadEnd) {
            newSpreadFactor = (distanceZ - spreadStart) / (spreadEnd - spreadStart);
            newSpreadFactor = Math.min(1, Math.max(0, newSpreadFactor));
            newSpreadFactor = newSpreadFactor * newSpreadFactor; // ease in
        } else if (distanceZ >= spreadEnd) {
            newSpreadFactor = 1;
        }

        spreadFactorRef.current = newSpreadFactor;
    });

    return (
        <group ref={groupRef} position={[0, 0, z]}>
            {/* Title */}
            <Text
                position={[0, 6, 0.5]}
                fontSize={1.2}
                color="#1a1a1a"
                anchorX="center"
                anchorY="middle"
                font="/fonts/RubikScribble-Regular.ttf"
            >
                SKILLS
            </Text>

            {/* Subtitle */}
            <Text
                position={[0, 5.2, 0.5]}
                fontSize={0.35}
                color="#555555"
                anchorX="center"
                anchorY="middle"
                font="/fonts/CabinSketch-Regular.ttf"
            >
                Technologies I love working with
            </Text>

            {/* === FLOATING BALLOONS === */}
            {BALLOON_CONFIG.map((config, index) => (
                <SkillBalloon
                    key={index}
                    config={config}
                    revealFactorRef={revealFactorRef}
                    spreadFactorRef={spreadFactorRef}
                    timeRef={timeRef}
                />
            ))}
        </group>
    );
};

// =========================================
// NOTE: Use this component inside the loop!
// =========================================

export default InfiniteSkyManager;
