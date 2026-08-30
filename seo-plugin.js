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
 * Build dynamic JSON-LD structured data for Sarthak Singhaniya's portfolio.
 */
function buildJsonLd(globalInfo, projects, studio, awards, faqList) {
    const graph = [];

    // --- 1. Person: Central node of the Knowledge Graph ---
    const person = {
        '@type': 'Person',
        '@id': 'https://sarthaksinghaniya.netlify.app/#person',
        name: 'Sarthak Singhaniya',
        alternateName: ['Sarthak Singhaniya AI Engineer', 'Sarthak TechNeekX', 'Sarthak Shubh'],
        url: 'https://sarthaksinghaniya.netlify.app',
        jobTitle: 'AI Engineer, Full-Stack Developer & Founder @ TechNeekX',
        description: globalInfo?.aboutMe || 'Driven AI Engineer and Full-Stack Developer specializing in Generative AI, LLM applications, RAG, Agentic AI, and rapid startup product development.',
        knowsAbout: [
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
            'Full-Stack Web Development'
        ],
        alumniOf: {
            '@type': 'EducationalOrganization',
            name: 'Babu Banarasi Das University'
        },
        sameAs: [
            'https://www.linkedin.com/in/sarthak-singhaniya-a4ab9a323',
            'https://github.com/sarthaksinghaniya',
            'https://www.instagram.com/sarthak_shubh_?igsh=MWtsbGFnZHljejRoZA==',
            'https://leetcode.com/u/FYCfvXYnxf/',
            'https://unstop.com/u/sarthsin39721',
            'https://www.kaggle.com/singhaniyasarthak',
            'https://g.dev/sarthaksinghaniya',
            'https://teamtechneekx.netlify.app'
        ].filter(Boolean)
    };
    graph.push(person);

    // --- 2. WebSite ---
    const website = {
        '@type': 'WebSite',
        '@id': 'https://sarthaksinghaniya.netlify.app/#website',
        url: 'https://sarthaksinghaniya.netlify.app',
        name: globalInfo?.siteTitle || 'Sarthak Singhaniya | AI Engineer & Founder @ TechNeekX',
        description: globalInfo?.siteDescription || 'Interactive 3D WebGL Portfolio of Sarthak Singhaniya — AI Engineer & Founder @ TechNeekX.',
        publisher: { '@id': 'https://sarthaksinghaniya.netlify.app/#person' }
    };
    graph.push(website);

    // --- 3. ProfilePage ---
    const profilePage = {
        '@type': 'ProfilePage',
        '@id': 'https://sarthaksinghaniya.netlify.app/#profilepage',
        url: 'https://sarthaksinghaniya.netlify.app',
        mainEntity: { '@id': 'https://sarthaksinghaniya.netlify.app/#person' },
        about: { '@id': 'https://sarthaksinghaniya.netlify.app/#person' }
    };
    graph.push(profilePage);

    // --- 4. FAQPage ---
    if (faqList && faqList.length > 0) {
        const faqPage = {
            '@type': 'FAQPage',
            '@id': 'https://sarthaksinghaniya.netlify.app/#faq',
            mainEntity: faqList.map(item => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: item.answer
                }
            }))
        };
        graph.push(faqPage);
    }

    // --- 5. ItemList: Portfolio Projects ---
    const activeProjects = (projects && projects.length > 0) ? projects : [
        { title: 'EcoSphere AI', seoTitle: 'EcoSphere AI — Environmental Intelligence', description: 'AI-powered environmental intelligence platform combining AI analytics, satellite insights, and digital monitoring.', url: 'https://github.com/sarthaksinghaniya' },
        { title: 'Revibe Hub', seoTitle: 'Revibe Hub — AI E-Waste Recycling Assistant', description: 'Intelligent e-waste identification and recycling assistant using computer vision and YOLO models.', url: 'https://revibe-hub.netlify.app/' },
        { title: 'Hospital Pulse AI', seoTitle: 'Hospital Pulse AI — Clinical Intelligence', description: 'Healthcare intelligence platform for monitoring hospital operations and generating actionable AI-driven insights.', url: 'https://github.com/sarthaksinghaniya' },
        { title: 'TTM-AI', seoTitle: 'TTM-AI — Text to 3D/Model GenAI Platform', description: 'AI text-to-model platform utilizing generative deep learning to transform prompts into structured models.', url: 'https://github.com/sarthaksinghaniya' },
        { title: 'Titan AI', seoTitle: 'Titan AI — Autonomous Workflow Intelligence', description: 'AI-driven software utility for streamlining and automating complex development workflows through code analysis.', url: 'https://github.com/sarthaksinghaniya/titan' },
        { title: 'LexNode AI', seoTitle: 'LexNode AI — Document Intelligence & RAG', description: 'Intelligent document-processing and knowledge-extraction engine using RAG and LangChain.', url: 'https://github.com/sarthaksinghaniya' }
    ];

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

// Helper to generate the llms.txt content in clean Markdown
function buildLlmsTxt(globalInfo, projects, studio, awards, faqList) {
    const siteTitle = globalInfo?.siteTitle || 'Sarthak Singhaniya | AI Engineer & Founder @ TechNeekX';
    const siteDescription = globalInfo?.siteDescription || 'Interactive 3D WebGL Portfolio of Sarthak Singhaniya';
    const aboutMe = globalInfo?.aboutMe || 'Sarthak Singhaniya is an AI Engineer and Full-Stack Developer specializing in Generative AI, LLM applications, RAG, Agentic AI, machine learning, and rapid startup product development with 75+ hackathons under his belt.';

    let content = `# ${siteTitle}\n`;
    content += `> ${siteDescription}\n\n`;

    content += `## Biography / About Sarthak Singhaniya\n`;
    content += `${aboutMe}\n\n`;

    content += `## Core Technologies & AI Stack\n`;
    content += `- **AI / ML**: Generative AI, Large Language Models (LLMs), Agentic AI Systems, RAG, LangChain, PyTorch, TensorFlow, Computer Vision, YOLO, Scikit-learn, Vector Databases.\n`;
    content += `- **Frontend & 3D**: React 19, Three.js, React Three Fiber (R3F), GSAP, Next.js, Tailwind CSS, WebGL.\n`;
    content += `- **Backend & Cloud**: Python, FastAPI, Node.js, Express, Flask, MongoDB, PostgreSQL, Docker, AWS, Netlify.\n\n`;

    content += `## Community & Leadership\n`;
    content += `- **Founder & Community Lead @ TechNeekX**: Scaling an ecosystem of 100+ developers and AI builders, organizing TNX Codathon and technical workshops.\n`;
    content += `- **Hackathons**: 75+ hackathons battled; Winner @ HackBio IIT Mandi, ISRO Space Challenge participant, IIT Madras & IIT Patna finalist.\n\n`;

    content += `## Featured Projects\n`;
    content += `- **EcoSphere AI**: AI-powered environmental intelligence platform combining satellite insights and computer vision.\n`;
    content += `- **Revibe Hub**: Intelligent e-waste identification & recycling assistant using YOLO & TensorFlow.\n`;
    content += `- **Hospital Pulse AI**: Real-time healthcare operations intelligence platform.\n`;
    content += `- **TTM-AI**: Text-to-model GenAI platform with PyTorch and FastAPI.\n`;
    content += `- **Titan**: Autonomous AI software utility for automating complex developer workflows.\n`;
    content += `- **LexNode AI**: RAG & LangChain document-processing and semantic search engine.\n\n`;

    content += `## Contact & Verification Links\n`;
    content += `- **Portfolio**: https://sarthaksinghaniya.netlify.app\n`;
    content += `- **GitHub**: https://github.com/sarthaksinghaniya\n`;
    content += `- **LinkedIn**: https://www.linkedin.com/in/sarthak-singhaniya-a4ab9a323\n`;
    content += `- **Email**: sarthaksinghaniya789@gmail.com\n`;

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

                const siteTitle = globalInfo?.siteTitle || 'Sarthak Singhaniya | AI Engineer & Founder @ TechNeekX';
                const siteDescription = globalInfo?.siteDescription || 'Interactive 3D WebGL Portfolio of Sarthak Singhaniya — AI Engineer, Full-Stack Developer & Founder @ TechNeekX.';

                cachedLlmsContent = buildLlmsTxt(globalInfo, projects, studio, awards, faqList);

                // Build dynamic JSON-LD
                const jsonLdSchemas = buildJsonLd(globalInfo, projects, studio, awards, faqList);
                const jsonLdScript = `\n  <!-- Dynamic Structured Data (JSON-LD) -->\n  <script type="application/ld+json">\n${JSON.stringify(jsonLdSchemas, null, 2)}\n  </script>\n`;

                let transformedHtml = html;
                transformedHtml = transformedHtml.replace('</head>', `${jsonLdScript}</head>`);

                return transformedHtml;
            } catch (error) {
                return html;
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
