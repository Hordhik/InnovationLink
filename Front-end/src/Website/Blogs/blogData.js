import img1 from '../../assets/Blogs/img1.jpg';

export const blogData = [
    {
        id: 1,
        img: img1,
        title: "This Founder Built a B2B SaaS with Zero Code — Here's How",
        date: "March 26, 2025",
        user: "Chandra Sekhar",
        description: "One of India's most prestigious startup events, organized by AICRA, bringing together startups, investors, and industry leaders to foster innovation and growth. This expo is a game-changer, showcasing over 350 startup companies, innovative technologies, and revolutionary business ideas.",
        fullContent: "In today's fast-paced digital world, the traditional approach to building software applications is being revolutionized. No longer do entrepreneurs need extensive coding knowledge to bring their ideas to life. This is the story of how one visionary founder leveraged no-code platforms to build a successful B2B SaaS company that now serves thousands of businesses worldwide.\n\nThe journey began with a simple observation: small businesses were struggling with manual processes that could easily be automated. Instead of spending months learning to code or hiring expensive developers, our founder discovered the power of no-code platforms.\n\nUsing tools like Bubble, Zapier, and Airtable, they were able to create a comprehensive business management solution in just 6 weeks. The platform integrated customer relationship management, inventory tracking, and automated billing - all without writing a single line of code.\n\nThe key to their success was understanding that technology should serve the business, not the other way around. By focusing on solving real problems for their target market, they were able to build a product that customers actually wanted."
    },
    {
        id: 2,
        img: null,
        title: "Building a Startup Without Funding: A Complete Guide",
        date: "March 25, 2025",
        user: "Chandra Sekhar",
        description: "One of India's most prestigious startup events, organized by AICRA, bringing together startups, investors, and industry leaders to foster innovation and growth. This expo is a game-changer, showcasing over 350 startup companies, innovative technologies, and revolutionary business ideas.",
        fullContent: "Building a startup without external funding might seem impossible in today's venture capital-driven ecosystem, but it's more achievable than you think. This comprehensive guide will show you exactly how to bootstrap your way to success.\n\nThe first step is validating your idea before spending any money. Use free tools like Google Forms to survey potential customers, create landing pages with free website builders, and leverage social media to gauge interest. Many successful entrepreneurs started with nothing more than a laptop and determination.\n\nFocus on generating revenue from day one. Instead of building a perfect product, create a minimum viable product (MVP) that solves a real problem. Charge customers early and use that revenue to fund further development. This approach forces you to build something people actually want to pay for.\n\nNetworking is crucial when you don't have funding. Attend free meetups, join online communities, and build relationships with other entrepreneurs. These connections can lead to partnerships, customers, and even informal mentorship that's more valuable than money."
    },
    {
        id: 3,
        img: null,
        title: "The Future of AI in Startup Ecosystem",
        date: "March 24, 2025",
        user: "Chandra Sekhar",
        description: "Exploring how artificial intelligence is reshaping the startup landscape and creating new opportunities for entrepreneurs worldwide.",
        fullContent: "Artificial Intelligence is no longer a futuristic concept—it's reshaping how startups operate, compete, and scale. From automating customer service to predicting market trends, AI is becoming the backbone of modern entrepreneurship.\n\nStartups are leveraging AI in unprecedented ways. Customer service chatbots handle inquiries 24/7, predictive analytics help optimize inventory, and machine learning algorithms personalize user experiences. What once required large teams can now be accomplished with smart automation.\n\nThe democratization of AI tools means that even small startups can access powerful technologies. Platforms like OpenAI, Google Cloud AI, and AWS provide sophisticated AI capabilities through simple APIs. This levels the playing field, allowing startups to compete with larger corporations.\n\nHowever, with great power comes great responsibility. Startups must consider ethical AI implementation, data privacy, and the potential impact on employment. The future belongs to those who can harness AI's power while maintaining human values and connections."
    }
];

export const getBlogById = (id) => {
    return blogData.find(blog => blog.id === parseInt(id));
};
