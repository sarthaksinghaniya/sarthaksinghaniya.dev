/**
 * Studio Content Data
 * 
 * This file contains all content items for the Studio monitor tower.
 * Each item will be displayed on a monitor in the tower.
 * 
 * Platforms: 'youtube', 'blog', 'tiktok'
 */

export const PLATFORM_CONFIG = {
    youtube: {
        color: '#FF0000',
        accentColor: '#cc0000',
        icon: '▶',
        label: 'YouTube',
        shape: 'tv', // Wide CRT style
    },
    blog: {
        color: '#4A90D9',
        accentColor: '#2d6cb5',
        icon: '📝',
        label: 'Blog',
        shape: 'monitor', // Thin desktop monitor
    },
    tiktok: {
        color: '#00F2EA',
        accentColor: '#FF0050',
        icon: '🎵',
        label: 'TikTok',
        shape: 'phone', // Vertical phone
    },
    instagram: {
        color: '#E1306C',
        accentColor: '#C13584',
        icon: '📷',
        label: 'Instagram',
        shape: 'phone',
    },
    x: {
        color: '#000000',
        accentColor: '#14171A',
        icon: '𝕏',
        label: 'X (Twitter)',
        shape: 'monitor',
    },
    linkedin: {
        color: '#0077B5',
        accentColor: '#005E93',
        icon: 'in',
        label: 'LinkedIn',
        shape: 'monitor',
    },
    codrops: {
        color: '#0099FF',
        accentColor: '#0077CC',
        icon: '💧',
        label: 'Codrops',
        shape: 'monitor',
    },
};

// Studio content data - Sarthak Singhaniya AI Wizard & Founder portfolio
const RAW_CONTENT_DATA = [
    // ============ LinkedIn Highlights & Campus Flexes ============
    {
        id: 'li-ecell',
        platform: 'linkedin',
        title: 'E-Cell IIT Bombay — Campus Ambassador 🏛️✨',
        description: 'Selected as Campus Ambassador @ E-Cell IIT Bombay! Building connections around entrepreneurship, innovation & student leadership. Main character ecosystem energy.',
        thumbnail: null,
        url: 'https://www.linkedin.com/posts/sarthak-singhaniya-a4ab9a323_iitbombay-ecelliitb-campusambassador-activity-7477686356656226306-9Sr6',
        date: '2026-08-20',
        readTime: '3 min',
    },
    {
        id: 'li-offer',
        platform: 'linkedin',
        title: 'Offer Letter Secured: Locked & Loaded 📜🔥',
        description: 'Turned late-night grind sessions into another offer letter! Converting skills into real-world industry impact. We cookin\' non-stop.',
        thumbnail: null,
        url: 'https://www.linkedin.com/posts/sarthak-singhaniya-a4ab9a323_offer-letter-activity-7477665826507067392-5I0r',
        date: '2026-08-15',
        readTime: '2 min',
    },
    {
        id: 'li-git',
        platform: 'linkedin',
        title: 'Girls in TechNeekX (GIT): Women in Tech 💖🚀',
        description: 'Launched GIT to empower women to learn, build & lead in tech! A community initiative where inclusive innovation meets zero cap builder energy.',
        thumbnail: null,
        url: 'https://www.linkedin.com/posts/sarthak-singhaniya-a4ab9a323_womeninstem-girlsintech-techneekx-activity-7477635668249333760-mcI0',
        date: '2026-08-10',
        readTime: '3 min',
    },
    {
        id: 'li-govtech',
        platform: 'linkedin',
        title: 'AI-Powered GovTech Grievance System 🤖⚙️',
        description: 'Engineered a smart GovTech grievance platform featuring automated AI intent classification, SLA escalation & priority prediction. Applying AI to real civic problems.',
        thumbnail: null,
        url: 'https://www.linkedin.com/posts/sarthak-singhaniya-a4ab9a323_ai-govtech-systemdesign-activity-7475539297937444864-eY1o',
        date: '2026-08-01',
        readTime: '4 min',
    },
    {
        id: 'li-internshala',
        platform: 'linkedin',
        title: 'Internshala Speedrun: Converting Skills To Impact 💼⚡',
        description: 'Exploring high-impact internships & industry ops through continuous building. Turning raw passion into shipping software products.',
        thumbnail: null,
        url: 'https://www.linkedin.com/in/sarthak-singhaniya-a4ab9a323',
        date: '2026-07-25',
        readTime: '2 min',
    },
    {
        id: 'li-python',
        platform: 'linkedin',
        title: 'Python Developer Internship: Backend Engine 🐍⚡',
        description: 'Practical Python backend exposure! Built REST APIs, automation pipelines & backend microservices. Learning by shipping, debugging & solving real problems.',
        thumbnail: null,
        url: 'https://www.linkedin.com/posts/sarthak-singhaniya-a4ab9a323_python-internship-softwaredevelopment-activity-7458142524507942912-ZWfs',
        date: '2026-07-15',
        readTime: '3 min',
    },
    {
        id: 'li-iitmandi',
        platform: 'linkedin',
        title: 'TechNeekX × IIT Mandi (Xpecto\'26) 🏔️🏆',
        description: 'Represented TechNeekX at IIT Mandi\'s Xpecto\'26 ecosystem! Participated in innovation challenges and opened new doors for student builders.',
        thumbnail: null,
        url: 'https://www.linkedin.com/posts/techneekx_techneekx-iitmandi-xpecto26-ugcPost-7450531604587810816-fJ5Y',
        date: '2026-07-01',
        readTime: '3 min',
    },

    // ============ Hackathons Led & Organized ============
    {
        id: 'hack-kalpathon',
        platform: 'x',
        title: 'Kalpathon Hackathon: Led & Organized 🏆🔥',
        description: 'Led & organized Kalpathon! Spearheading national builder events, high-octane coding challenges, and open-source project showcases on GitHub.',
        thumbnail: null,
        url: 'https://github.com/topics/kalpathonhackathon',
        date: '2026-06-28',
        readTime: 'Led Hackathon',
    },
    {
        id: 'hack-innvedx',
        platform: 'x',
        title: 'Innvedx Hackathon: Led & Organized 🚀⚡',
        description: 'Directed & hosted the Innvedx Hackathon ecosystem! Bringing together top student builders, AI innovators, and rapid MVP shipping challenges.',
        thumbnail: null,
        url: 'https://github.com/topics/innvedxhackathon',
        date: '2026-06-25',
        readTime: 'Led Hackathon',
    },

    // ============ Coding Profiles & DSA Grind ============
    {
        id: 'blog-leetcode',
        platform: 'blog',
        title: 'LeetCode Grind: Master Of DSA & Algorithms 🧠⚡',
        description: 'Practicing DSA, graph theory & competitive problem solving daily. Strengthening algorithmic thinking to crush complex system design.',
        frontTexture: '/textures/studio/monitorfront_postnafbdoublewinner.webp',
        paintedFrontTexture: '/textures/studio/monitorfront_postnafbdoublewinner_painted.webp',
        thumbnail: null,
        url: 'https://leetcode.com/u/FYCfvXYnxf/',
        date: '2026-06-20',
        readTime: 'Daily Grind',
    },
    {
        id: 'blog-kaggle',
        platform: 'blog',
        title: 'Kaggle Arena: Data Science & AI Research 📊🤖',
        description: 'Exploring AI/ML, PyTorch models & real-world datasets. Experimenting with computer vision, NLP transformers and statistical model building.',
        thumbnail: null,
        url: 'https://github.com/sarthaksinghaniya',
        date: '2026-06-10',
        readTime: 'AI Research',
    },

    // ============ Social & Community Content ============
    {
        id: 'tt-insta',
        platform: 'instagram',
        title: 'Instagram: Life Beyond Code 📸✨',
        description: 'Sharing the journey in public — tech events, hackathon chaos, creative design, student leadership & personal expression. Code. Create. Connect.',
        frontTexture: '/textures/studio/phonefront_followmeontiktok.webp',
        paintedFrontTexture: '/textures/studio/phonefront_followmeontiktok_painted.webp',
        thumbnail: null,
        url: 'https://www.instagram.com/thetechneekx?igsh=MXZ6Yjgyd3VnN250NA==',
        date: '2026-06-01',
        views: '42.5K',
        likes: '5.8K',
    },
    {
        id: 'yt-tnx',
        platform: 'youtube',
        title: 'TechNeekX YouTube: Learn → Build → Connect → Grow 🎥⚡',
        description: 'TechNeekX\'s official hub for hackathons, workshops, AI builds & student community streams. Helping builders turn ideas into reality!',
        frontTexture: '/textures/studio/tvfront_filmikprojektdlamultiego.webp',
        paintedFrontTexture: '/textures/studio/tvfront_filmikprojektdlamultiego_painted.webp',
        thumbnail: null,
        url: 'https://www.youtube.com/@TechNeekX',
        date: '2026-05-15',
        views: '18.2K',
        duration: 'Official Channel',
    },
];

const ytTextures = ['/textures/studio/tvfront_filmikprojektdlamultiego.webp', '/textures/studio/tvfront_filmikedytowaniezdjec.webp'];
const ytPaintedTextures = ['/textures/studio/tvfront_filmikprojektdlamultiego_painted.webp', '/textures/studio/tvfront_filmikedytowaniezdjec_painted.webp'];
const blogTextures = ['/textures/studio/monitorfront_postnafbdoublewinner.webp'];
const blogPaintedTextures = ['/textures/studio/monitorfront_postnafbdoublewinner_painted.webp'];
const ttTextures = ['/textures/studio/phonefront_followmeontiktok.webp'];
const ttPaintedTextures = ['/textures/studio/phonefront_followmeontiktok_painted.webp'];

let ytIdx = 0, blogIdx = 0, ttIdx = 0;
let ytPIdx = 0, blogPIdx = 0, ttPIdx = 0;

export const CONTENT_DATA = RAW_CONTENT_DATA.map((item) => {
    return {
        ...item,
        frontTexture: item.frontTexture || (
            item.platform === 'youtube' ? ytTextures[ytIdx++ % ytTextures.length] :
                item.platform === 'blog' ? blogTextures[blogIdx++ % blogTextures.length] :
                    ttTextures[ttIdx++ % ttTextures.length]
        ),
        paintedFrontTexture: item.paintedFrontTexture || (
            item.platform === 'youtube' ? ytPaintedTextures[ytPIdx++ % ytPaintedTextures.length] :
                item.platform === 'blog' ? blogPaintedTextures[blogPIdx++ % blogPaintedTextures.length] :
                    ttPaintedTextures[ttPIdx++ % ttPaintedTextures.length]
        )
    };
});

// Helper to get content by platform
export const getContentByPlatform = (platform) => {
    if (platform === 'all') return CONTENT_DATA;
    return CONTENT_DATA.filter(item => item.platform === platform);
};

// Get latest content (for "On Air" indicator)
export const getLatestContent = () => {
    return [...CONTENT_DATA].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
};
