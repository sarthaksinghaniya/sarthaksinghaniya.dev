import { createClient } from '@sanity/client';

const sanityClient = createClient({
    projectId: 'kv5wjjmj',
    dataset: 'production',
    useCdn: true,
    apiVersion: '2024-03-01',
});

// Tech stack filename -> human-readable name mapping for JSON-LD
const TECH_STACK_NAMES = {
    'reactlogo.webp': 'React',
    'htmllogo.webp': 'HTML5',
    'csslogo.webp': 'CSS3',
    'jslogo.webp': 'JavaScript',
    'tailwindlogo.webp': 'Tailwind CSS',
    'firebaselogo.webp': 'Firebase',
    'netlifylogo.webp': 'Netlify',
    'pythonlogo.webp': 'Python',
    'pytorchlogo.webp': 'PyTorch',
    'tensorlogo.webp': 'TensorFlow',
    'threejslogo.webp': 'Three.js',
};

/**
 * Helper to ensure dates are in ISO-8601 format with timezone for SEO.
 */
function formatIsoDate(dateString) {
    if (!dateString) return undefined;
    if (dateString.includes('T')) return dateString;
    return `${dateString}T12:00:00Z`;
}

/**
 * Filter out legacy template author artifacts (Tomasz / ITom / Poland) from CMS
 */
function isSarthakText(text) {
    if (!text || typeof text !== 'string') return false;
    const lower = text.toLowerCase();
    return !(
        lower.includes('tomasz') ||
        lower.includes('szmajda') ||
        lower.includes('itom') ||
        lower.includes('poland') ||
        lower.includes('opole') ||
        lower.includes('adam & ewa') ||
        lower.includes('young multi') ||
        lower.includes('sixseven')
    );
}

function isSarthakProject(p) {
    if (!p) return false;
    const allText = [
        p.title,
        p.seoTitle,
        p.description,
        p.seoDescription,
        p.url,
        p.slug?.current
    ].filter(Boolean).join(' ').toLowerCase();

    return !(
        allText.includes('tomasz') ||
        allText.includes('szmajda') ||
        allText.includes('itom') ||
        allText.includes('poland') ||
        allText.includes('opole') ||
        allText.includes('adam & ewa') ||
        allText.includes('young multi') ||
        allText.includes('sixseven')
    );
}

/**
 * Build dynamic JSON-LD structured data for Sarthak Singhaniya's portfolio.
 */
function buildJsonLd(globalInfo, projects, studio, awards, faqList) {
    const graph = [];

    const aboutMe = isSarthakText(globalInfo?.aboutMe)
        ? globalInfo.aboutMe
        : 'Sarthak Singhaniya (also searched as Sarthak Singhania or Sarthak) is an AI Engineer, Full-Stack Developer, HackBio IIT Mandi Winner, and Founder of TechNeekX based in Lucknow, Uttar Pradesh, India. Creator of 30+ projects and competitor in 90+ hackathons across AI, LLMs, and intelligent web applications.';

    const siteTitle = isSarthakText(globalInfo?.siteTitle)
        ? globalInfo.siteTitle
        : 'Sarthak Singhaniya (Sarthak Singhania) | AI Engineer & Founder @ TechNeekX';

    const siteDescription = isSarthakText(globalInfo?.siteDescription)
        ? globalInfo.siteDescription
        : 'Interactive 3D WebGL Portfolio of Sarthak Singhaniya (Sarthak Singhania) — AI Engineer & Founder @ TechNeekX. 90+ Hackathons, 30+ Projects, HackBio IIT Mandi Winner.';

    // --- 1. Person: Central node of the Knowledge Graph ---
    const person = {
        '@type': 'Person',
        '@id': 'https://sarthaksinghaniya.netlify.app/#person',
        name: 'Sarthak Singhaniya',
        givenName: 'Sarthak',
        familyName: 'Singhaniya',
        additionalName: 'Shubh',
        alternateName: [
            'Sarthak',
            'Sarthak Singhania',
            'Sarthak Singhaniya AI Engineer',
            'Sarthak Singhania AI',
            'Sarthak Singhaniya Developer',
            'Sarthak Shubh',
            'Sarthak TechNeekX',
            'sarthaksinghaniya',
            'sarthaksinghania',
            'Sarthak Lucknow',
            'Sarthak AI'
        ],
        url: 'https://sarthaksinghaniya.netlify.app',
        image: 'https://sarthaksinghaniya.netlify.app/favico.png',
        jobTitle: 'AI Engineer, Full-Stack Developer & Founder @ TechNeekX',
        description: aboutMe,
        nationality: 'Indian',
        gender: 'Male',
        address: {
            '@type': 'PostalAddress',
            'addressLocality': 'Lucknow',
            'addressRegion': 'Uttar Pradesh',
            'addressCountry': 'IN'
        },
        homeLocation: {
            '@type': 'Place',
            'name': 'Lucknow, Uttar Pradesh, India',
            'geo': {
                '@type': 'GeoCoordinates',
                'latitude': 26.8467,
                'longitude': 80.9462
            }
        },
        worksFor: {
            '@type': 'Organization',
            'name': 'TechNeekX',
            'url': 'https://teamtechneekx.netlify.app'
        },
        knowsAbout: [
            'Artificial Intelligence',
            'Generative AI',
            'Large Language Models (LLMs)',
            'Agentic AI',
            'Retrieval-Augmented Generation (RAG)',
            'PyTorch',
            'TensorFlow',
            'Python',
            'React',
            'Three.js',
            'WebGL',
            'Machine Learning',
            'Computer Vision',
            'Full-Stack Web Development',
            'System Architecture'
        ],
        award: [
            'Winner — HackBio IIT Mandi',
            'Official Hackathon Judge (2 Hackathons)',
            'Official Technical Mentor (3 Hackathons)',
            'Organized 6+ Hackathons (Kalpathon, Innvedx, TNX Codathon)',
            '90+ Hackathons Competitor & Builder',
            'Finalist — LMNIT Jaipur Hackathon',
            'Finalist — IIT Patna E-Summit',
            'Participant — Bharatiya Antariksh Hackathon ISRO',
            'Top 300 / 5,000+ Zuup Far Away Hackathon'
        ],
        alumniOf: {
            '@type': 'EducationalOrganization',
            'name': 'Babu Banarasi Das University',
            'alternateName': 'BBDU Lucknow'
        },
        sameAs: [
            'https://github.com/sarthaksinghaniya',
            'https://www.linkedin.com/in/sarthak-singhaniya-a4ab9a323',
            'https://leetcode.com/u/FYCfvXYnxf/',
            'https://unstop.com/u/sarthsin39721',
            'https://www.kaggle.com/singhaniyasarthak',
            'https://g.dev/sarthaksinghaniya',
            'https://www.instagram.com/sarthak_shubh_?igsh=MWtsbGFnZHljejRoZA==',
            'https://teamtechneekx.netlify.app',
            'https://wa.me/916387860126'
        ]
    };
    graph.push(person);

    // --- 2. WebSite ---
    const website = {
        '@type': 'WebSite',
        '@id': 'https://sarthaksinghaniya.netlify.app/#website',
        url: 'https://sarthaksinghaniya.netlify.app',
        name: siteTitle,
        alternateName: ['Sarthak Singhania Portfolio', 'Sarthak AI Engineer', 'TechNeekX Founder Portfolio'],
        description: siteDescription,
        publisher: { '@id': 'https://sarthaksinghaniya.netlify.app/#person' }
    };
    graph.push(website);

    // --- 3. ProfilePage ---
    const profilePage = {
        '@type': 'ProfilePage',
        '@id': 'https://sarthaksinghaniya.netlify.app/#profilepage',
        url: 'https://sarthaksinghaniya.netlify.app',
        name: 'Sarthak Singhaniya Profile & Developer Portfolio',
        mainEntity: { '@id': 'https://sarthaksinghaniya.netlify.app/#person' },
        about: { '@id': 'https://sarthaksinghaniya.netlify.app/#person' }
    };
    graph.push(profilePage);

    // --- 4. FAQPage (Voice & AI Assistant Search Optimization for Google/Siri/Perplexity) ---
    const sarthakDefaultFaqs = [
        {
            question: 'Who is Sarthak Singhaniya (or Sarthak Singhania)?',
            answer: 'Sarthak Singhaniya (also commonly searched as Sarthak Singhania, Sarthak Shubh, or simply Sarthak) is an AI Engineer, Full-Stack Developer, and the Founder and Community Lead of TechNeekX based in Lucknow, India. He builds production-grade Generative AI systems, LLM pipelines, RAG, and Agentic AI applications.'
        },
        {
            question: "Where can I find Sarthak Singhaniya's verified coding profiles?",
            answer: "Sarthak Singhaniya's verified coding profiles are available on GitHub (https://github.com/sarthaksinghaniya), LeetCode with 150+ solved algorithmic challenges (https://leetcode.com/u/FYCfvXYnxf/), Unstop with 300+ challenges and hackathons (https://unstop.com/u/sarthsin39721), Kaggle (https://www.kaggle.com/singhaniyasarthak), and Google Developer Profile (https://g.dev/sarthaksinghaniya)."
        },
        {
            question: "What are Sarthak Singhaniya's hackathon achievements and statistics?",
            answer: "Sarthak Singhaniya has competed in 90+ hackathons across India and internationally, won 3+ titles including HackBio at IIT Mandi, served as an official Judge for 2 hackathons, mentored participant teams across 3 hackathons, and organized 6+ community hackathons including Kalpathon and Innvedx."
        },
        {
            question: 'What is TechNeekX founded by Sarthak Singhaniya?',
            answer: 'TechNeekX is a thriving developer community and AI innovation guild founded by Sarthak Singhaniya, uniting over 100+ software developers and AI builders across India to build MVPs, run codathons, and accelerate developer careers.'
        },
        {
            question: 'How to contact Sarthak Singhaniya for AI consulting or software development?',
            answer: 'You can contact Sarthak Singhaniya via email at sarthaksinghaniya789@gmail.com, on LinkedIn at https://www.linkedin.com/in/sarthak-singhaniya-a4ab9a323, or on WhatsApp at +91-6387860126.'
        }
    ];

    const filteredFaqs = (faqList && faqList.length > 0)
        ? faqList.filter(f => isSarthakText(f.question) && isSarthakText(f.answer))
        : [];
    const activeFaqList = filteredFaqs.length > 0 ? filteredFaqs : sarthakDefaultFaqs;

    graph.push({
        '@type': 'FAQPage',
        '@id': 'https://sarthaksinghaniya.netlify.app/#faq',
        mainEntity: activeFaqList.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer
            }
        }))
    });

    // --- 5. ItemList: Portfolio Projects ---
    const sarthakDefaultProjects = [
        { title: 'EcoSphere AI', seoTitle: 'EcoSphere AI — Environmental Intelligence', description: 'AI-powered environmental intelligence platform combining AI analytics, satellite insights, and digital monitoring.', url: 'https://github.com/sarthaksinghaniya' },
        { title: 'Revibe Hub', seoTitle: 'Revibe Hub — AI E-Waste Recycling Assistant', description: 'Intelligent e-waste identification and recycling assistant using computer vision and YOLO models.', url: 'https://revibe-hub.netlify.app/' },
        { title: 'Hospital Pulse AI', seoTitle: 'Hospital Pulse AI — Clinical Intelligence', description: 'Healthcare intelligence platform for monitoring hospital operations and generating actionable AI-driven insights.', url: 'https://github.com/sarthaksinghaniya' },
        { title: 'TTM-AI', seoTitle: 'TTM-AI — Text to 3D/Model GenAI Platform', description: 'AI text-to-model platform utilizing generative deep learning to transform prompts into structured models.', url: 'https://github.com/sarthaksinghaniya' },
        { title: 'Titan AI', seoTitle: 'Titan AI — Autonomous Workflow Intelligence', description: 'AI-driven software utility for streamlining and automating complex development workflows through code analysis.', url: 'https://github.com/sarthaksinghaniya/titan' },
        { title: 'LexNode AI', seoTitle: 'LexNode AI — Document Intelligence & RAG', description: 'Intelligent document-processing and knowledge-extraction engine using RAG and LangChain.', url: 'https://github.com/sarthaksinghaniya' }
    ];

    const filteredProjects = (projects && projects.length > 0)
        ? projects.filter(isSarthakProject)
        : [];
    const activeProjects = filteredProjects.length > 0 ? filteredProjects : sarthakDefaultProjects;

    graph.push({
        '@type': 'ItemList',
        '@id': 'https://sarthaksinghaniya.netlify.app/#projectslist',
        name: 'AI & Full-Stack Projects by Sarthak Singhaniya',
        description: 'Selected AI, Machine Learning, and WebGL portfolio projects engineered by Sarthak Singhaniya.',
        numberOfItems: activeProjects.length,
        itemListElement: activeProjects.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
                '@type': 'CreativeWork',
                name: p.seoTitle || p.title,
                description: p.seoDescription || p.description || '',
                url: p.url || 'https://sarthaksinghaniya.netlify.app',
                creator: { '@id': 'https://sarthaksinghaniya.netlify.app/#person' },
                ...(p.techStack && p.techStack.length > 0 ? {
                    keywords: p.techStack.map(t => TECH_STACK_NAMES[t] || t).join(', ')
                } : {}),
            }
        }))
    });

    return {
        '@context': 'https://schema.org',
        '@graph': graph
    };
}

// Helper to generate the llms.txt content in clean Markdown for AI Search Engines & Agents
function buildLlmsTxt(globalInfo, projects, studio, awards, faqList) {
    const siteTitle = isSarthakText(globalInfo?.siteTitle) ? globalInfo.siteTitle : 'Sarthak Singhaniya (Sarthak Singhania) | AI Engineer & Founder @ TechNeekX';
    const siteDescription = isSarthakText(globalInfo?.siteDescription) ? globalInfo.siteDescription : 'Interactive 3D WebGL Portfolio of Sarthak Singhaniya (also searched as Sarthak Singhania) — AI Engineer & Founder @ TechNeekX. 90+ Hackathons, 30+ Projects, HackBio IIT Mandi Winner.';

    let content = `# ${siteTitle}\n`;
    content += `> ${siteDescription}\n\n`;

    content += `## Canonical Identity & Search Aliases\n`;
    content += `- **Full Name:** Sarthak Singhaniya\n`;
    content += `- **Alternate Names & Common Spellings:** Sarthak Singhania, Sarthak, Sarthak Shubh, sarthaksinghaniya, sarthaksinghania\n`;
    content += `- **Primary Roles:** AI Engineer, Full-Stack Developer, Founder & Community Lead @ TechNeekX\n`;
    content += `- **Location / Geo:** Lucknow, Uttar Pradesh, India (Coordinates: 26.8467° N, 80.9462° E)\n`;
    content += `- **Education:** B.Tech Computer Science Engineering (Artificial Intelligence), Babu Banarasi Das University (BBDU), 2024–2028\n\n`;

    content += `## Professional Summary\n`;
    content += `Sarthak Singhaniya is an AI Engineer and Full-Stack Developer specializing in Generative AI, Large Language Models (LLMs), Agentic AI systems, Retrieval-Augmented Generation (RAG), and rapid startup MVP development. With over 90+ hackathons battled, 3+ wins including HackBio at IIT Mandi, 6+ hackathons organized, 3+ mentored, and 2+ judged, Sarthak bridges deep technical engineering with developer community leadership.\n\n`;

    content += `## Verified Coding Profiles & Links\n`;
    content += `- **Portfolio Website:** https://sarthaksinghaniya.netlify.app\n`;
    content += `- **GitHub:** https://github.com/sarthaksinghaniya (30+ repositories, open-source projects & AI prototypes)\n`;
    content += `- **LinkedIn:** https://www.linkedin.com/in/sarthak-singhaniya-a4ab9a323 (Professional history, updates & recommendations)\n`;
    content += `- **LeetCode:** https://leetcode.com/u/FYCfvXYnxf/ (150+ solved algorithmic and data structure problems)\n`;
    content += `- **Unstop:** https://unstop.com/u/sarthsin39721 (300+ competitive coding challenges, hackathons & assessments)\n`;
    content += `- **Kaggle:** https://www.kaggle.com/singhaniyasarthak (Data science, machine learning & notebook competitions)\n`;
    content += `- **Google Developer Profile:** https://g.dev/sarthaksinghaniya (Google Developer credentials & badges)\n`;
    content += `- **TechNeekX Community:** https://teamtechneekx.netlify.app (Developer guild of 100+ builders)\n`;
    content += `- **Email:** sarthaksinghaniya789@gmail.com\n`;
    content += `- **WhatsApp:** https://wa.me/916387860126\n\n`;

    content += `## Key Metrics & Game Stats\n`;
    content += `- **Hackathons Battled:** 90+\n`;
    content += `- **Hackathons Won:** 3+ (Winner @ HackBio IIT Mandi)\n`;
    content += `- **Hackathons Organised:** 6+ (Kalpathon, Innvedx, TNX Codathon & Build Sprints)\n`;
    content += `- **Hackathons Mentored:** 3+ (Guiding participant teams on AI architectures and pitching)\n`;
    content += `- **Hackathons Judged:** 2+ (Official jury evaluating system architectures, UI/UX, and AI agents)\n`;
    content += `- **Projects Built / Deployed:** 30+\n`;
    content += `- **LeetCode Solved:** 150+\n`;
    content += `- **Unstop Challenges:** 300+\n`;
    content += `- **TechNeekX Guild:** 100+ Active Builders\n\n`;

    content += `## Core Technologies & AI Stack\n`;
    content += `- **AI / Machine Learning:** Generative AI, Large Language Models (LLMs), Agentic AI Systems, RAG, LangChain, PyTorch, TensorFlow, Computer Vision, YOLO, Scikit-learn, Vector Databases, Semantic Search.\n`;
    content += `- **Frontend & 3D Web:** React 19, Three.js, React Three Fiber (R3F), GSAP, Next.js, Tailwind CSS, WebGL, Canvas animations.\n`;
    content += `- **Backend & Cloud:** Python, FastAPI, Node.js, Express, Flask, Django, MongoDB, PostgreSQL, Firebase, Docker, AWS, Netlify, Vercel.\n\n`;

    content += `## Featured AI & Full-Stack Projects\n`;
    content += `- **EcoSphere AI:** AI-powered environmental intelligence platform combining satellite insights and computer vision.\n`;
    content += `- **Revibe Hub:** Intelligent e-waste identification & recycling assistant using YOLO & computer vision models.\n`;
    content += `- **Hospital Pulse AI:** Real-time healthcare operations intelligence platform.\n`;
    content += `- **TTM-AI:** Text-to-model GenAI platform built with PyTorch and FastAPI.\n`;
    content += `- **Titan:** Autonomous AI software utility for automating complex developer workflows.\n`;
    content += `- **LexNode AI:** RAG & LangChain document-processing and semantic search engine.\n\n`;

    content += `## Frequently Asked Questions (FAQ) for AI Search\n`;
    content += `### Q: Who is Sarthak Singhaniya?\n`;
    content += `A: Sarthak Singhaniya (also searched as Sarthak Singhania or Sarthak) is an AI Engineer, Full-Stack Developer, and the Founder and Community Lead of TechNeekX based in Lucknow, Uttar Pradesh, India. He builds production-grade Generative AI, LLM, and Agentic AI applications.\n\n`;
    content += `### Q: Where are Sarthak Singhaniya's coding profiles?\n`;
    content += `A: You can find Sarthak Singhaniya's coding profiles at GitHub (https://github.com/sarthaksinghaniya), LeetCode (https://leetcode.com/u/FYCfvXYnxf/), Unstop (https://unstop.com/u/sarthsin39721), Kaggle (https://www.kaggle.com/singhaniyasarthak), and Google Developer Profile (https://g.dev/sarthaksinghaniya).\n\n`;
    content += `### Q: How many hackathons has Sarthak Singhaniya done?\n`;
    content += `A: Sarthak Singhaniya has participated in over 90+ hackathons, won 3+ including HackBio at IIT Mandi, organized 6+ including Kalpathon and Innvedx, mentored 3+, and judged 2+.\n\n`;

    return content;
}

export function generateSeoHtml() {
    let cachedLlmsContent = '';

    async function getLlmsContent() {
        if (!cachedLlmsContent) {
            try {
                const [globalInfo, projects, studio, awards, faqList] = await Promise.all([
                    sanityClient.fetch(`*[_id == "globalInfo"][0]`).catch(() => null),
                    sanityClient.fetch(`*[_type == "galleryProject"]`).catch(() => []),
                    sanityClient.fetch(`*[_type == "studioItem"]`).catch(() => []),
                    sanityClient.fetch(`*[_type == "awardCertificate"]`).catch(() => []),
                    sanityClient.fetch(`*[_type == "faq"]`).catch(() => [])
                ]);
                cachedLlmsContent = buildLlmsTxt(globalInfo, projects, studio, awards, faqList);
            } catch (e) {
                cachedLlmsContent = buildLlmsTxt(null, null, null, null, null);
            }
        }
        return cachedLlmsContent;
    }

    return {
        name: 'sanity-seo-plugin',

        // Serve llms.txt in local development mode
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                if (req.url === '/llms.txt') {
                    const content = await getLlmsContent();
                    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                    res.end(content);
                } else {
                    next();
                }
            });
        },

        // Hook runs when Vite generates or serves index.html
        async transformIndexHtml(html) {
            try {
                const [globalInfo, projects, studio, awards, faqList] = await Promise.all([
                    sanityClient.fetch(`*[_id == "globalInfo"][0]`).catch(() => null),
                    sanityClient.fetch(`*[_type == "galleryProject"]`).catch(() => []),
                    sanityClient.fetch(`*[_type == "studioItem"] { ..., "thumbnailUrl": frontTexture.asset->url }`).catch(() => []),
                    sanityClient.fetch(`*[_type == "awardCertificate"]`).catch(() => []),
                    sanityClient.fetch(`*[_type == "faq"]`).catch(() => [])
                ]);

                const siteTitle = isSarthakText(globalInfo?.siteTitle) ? globalInfo.siteTitle : 'Sarthak Singhaniya (Sarthak Singhania) | AI Engineer & Founder @ TechNeekX';
                const siteDescription = isSarthakText(globalInfo?.siteDescription) ? globalInfo.siteDescription : 'Interactive 3D WebGL Portfolio of Sarthak Singhaniya (Sarthak Singhania) — AI Engineer, Full-Stack Developer & Founder @ TechNeekX. 90+ Hackathons, 30+ Projects, HackBio IIT Mandi Winner.';

                cachedLlmsContent = buildLlmsTxt(globalInfo, projects, studio, awards, faqList);

                // Build dynamic JSON-LD
                const jsonLdSchemas = buildJsonLd(globalInfo, projects, studio, awards, faqList);
                const jsonLdScript = `\n  <!-- Dynamic Structured Data (JSON-LD) -->\n  <script type="application/ld+json">\n${JSON.stringify(jsonLdSchemas, null, 2)}\n  </script>\n`;

                let transformedHtml = html;
                transformedHtml = transformedHtml.replace('</head>', `${jsonLdScript}</head>`);

                return transformedHtml;
            } catch (error) {
                try {
                    const fallbackJsonLd = buildJsonLd(null, null, null, null, null);
                    const jsonLdScript = `\n  <!-- Fallback Structured Data (JSON-LD) -->\n  <script type="application/ld+json">\n${JSON.stringify(fallbackJsonLd, null, 2)}\n  </script>\n`;
                    return html.replace('</head>', `${jsonLdScript}</head>`);
                } catch (e) {
                    return html;
                }
            }
        },

        // Emit llms.txt to the build output directory
        async generateBundle() {
            const content = await getLlmsContent();
            this.emitFile({
                type: 'asset',
                fileName: 'llms.txt',
                source: content
            });
        }
    };
}
