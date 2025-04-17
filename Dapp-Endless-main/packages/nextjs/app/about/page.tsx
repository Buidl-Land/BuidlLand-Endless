"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { ParticlesBackground } from "../../components/particles/ParticlesBackground";

const AboutPage = () => {
  const { resolvedTheme } = useTheme();

  return (
    <div className="relative min-h-screen">
      {/* Particles Background */}
      <ParticlesBackground />
      
      {/* Geometric SVG Background */}
      <div className="absolute inset-0 z-0 opacity-10 overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hexagonPattern" width="56" height="100" patternUnits="userSpaceOnUse">
              <path
                d="M28,0 L56,16.6 L56,49.8 L28,66.4 L0,49.8 L0,16.6 Z M28,100 L0,83.4 L0,50.2 L28,33.6 L56,50.2 L56,83.4 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
            <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
              <stop offset="50%" stopColor="var(--color-secondary)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.3" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#hexagonPattern)" />
          <rect width="100%" height="100%" fill="url(#glowGradient)" />
        </svg>
      </div>
      
      <div className="container mx-auto px-6 pt-24 pb-16 max-w-5xl relative z-10">
        {/* Page Title Section */}
        <div className="text-center mb-16 animate-fadeIn">
          <div className="inline-block p-2 px-4 mb-4 bg-primary/10 rounded-full backdrop-blur-sm">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
              🚀 IdeaPulse
            </h1>
          </div>
          <p className="text-xl italic mb-6 text-base-content/80 dark:text-gray-300">
            Build with AI, Grow with Community, Tokenize with DAO
          </p>
          <div className="h-1 w-24 bg-gradient-to-r from-primary to-secondary rounded-full mx-auto"></div>
        </div>

        {/* Main Content Area */}
        <div className="prose prose-lg dark:prose-invert mx-auto max-w-4xl">
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-xl p-8 mb-12 transform transition-all hover:shadow-2xl backdrop-blur-sm">
            <p className="text-lg leading-relaxed">
              A Web3 innovation incubation platform based on pre-issuance token crowdfunding and community DAO governance, 
              enabling AI and token holders to jointly support project idea incubation, development, and implementation.
            </p>
          </div>

          {/* Project Overview Section */}
          <section className="mb-16">
            <div className="flex items-center mb-6">
              <div className="h-10 w-2 bg-primary rounded-full mr-4"></div>
              <h2 className="text-3xl font-bold text-base-content">📋 Project Overview</h2>
            </div>
            
            <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-semibold mb-4 text-base-content">Vision and Core Values</h3>
              <p className="mb-4">
                IdeaPulse is committed to breaking the centralized monopoly of traditional VCs, exploring new paths for innovative 
                projects through community-driven, fully transparent processes. We&apos;re building a &quot;Product Hunt+DAO&quot; model where:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-base-100/90 dark:bg-gray-700/90 p-4 rounded-lg shadow-md hover:shadow-lg transition-all backdrop-blur-sm">
                  <h4 className="font-bold mb-2 flex items-center">
                    <span className="material-icons text-primary mr-2">people</span>
                    Co-creating an Equal Community
                  </h4>
                  <p className="text-sm">Anyone can participate equally in project building, with trusted AI Agents distributing rewards based on contributions</p>
                </div>
                <div className="bg-base-100/90 dark:bg-gray-700/90 p-4 rounded-lg shadow-md hover:shadow-lg transition-all backdrop-blur-sm">
                  <h4 className="font-bold mb-2 flex items-center">
                    <span className="material-icons text-primary mr-2">account_balance</span>
                    Blockchain Ecosystem Support
                  </h4>
                  <p className="text-sm">Projects in different blockchain ecosystems increase transaction volume and bring innovation</p>
                </div>
                <div className="bg-base-100/90 dark:bg-gray-700/90 p-4 rounded-lg shadow-md hover:shadow-lg transition-all backdrop-blur-sm">
                  <h4 className="font-bold mb-2 flex items-center">
                    <span className="material-icons text-primary mr-2">smart_toy</span>
                    Customized Agent Services
                  </h4>
                  <p className="text-sm">Different AI Agents for each public chain provide tailored solutions</p>
                </div>
                <div className="bg-base-100/90 dark:bg-gray-700/90 p-4 rounded-lg shadow-md hover:shadow-lg transition-all backdrop-blur-sm">
                  <h4 className="font-bold mb-2 flex items-center">
                    <span className="material-icons text-primary mr-2">workspace_premium</span>
                    Work Paradigm Innovation
                  </h4>
                  <p className="text-sm">A revolutionary DAO allowing participants to maximize value in projects they&apos;re passionate about</p>
                </div>
              </div>

              <h3 className="text-2xl font-semibold mb-4 text-base-content">Core Project Objectives</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="material-icons text-secondary mr-3 mt-1">check_circle</span>
                  <div>
                    <strong>Social Creative Entry Point</strong>: Submit ideas by @AI Agent (Farcaster/Twitter), with AI generating structured proposals
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="material-icons text-secondary mr-3 mt-1">check_circle</span>
                  <div>
                    <strong>Dynamic Staking Crowdfunding</strong>: Stake project tokens to join development, unlock stakes after task completion
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="material-icons text-secondary mr-3 mt-1">check_circle</span>
                  <div>
                    <strong>Project Token Economic Design</strong>: AI Agent reserves 15-30% of tokens for ecosystem building
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="material-icons text-secondary mr-3 mt-1">check_circle</span>
                  <div>
                    <strong>Pre-issuance Token Crowdfunding</strong>: Fund projects at the no-product stage through AI-generated prototypes
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="material-icons text-secondary mr-3 mt-1">check_circle</span>
                  <div>
                    <strong>AI+Community Co-governance</strong>: Token holders and AI Agents jointly participate in voting decisions
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="material-icons text-secondary mr-3 mt-1">check_circle</span>
                  <div>
                    <strong>Anti-VC Centralization Design</strong>: Ensuring open and transparent decision-making processes
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="material-icons text-secondary mr-3 mt-1">check_circle</span>
                  <div>
                    <strong>SocialFi Integration</strong>: Building a vibrant community through social media channels
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Core Problems Solved Section */}
          <section className="mb-16">
            <div className="flex items-center mb-6">
              <div className="h-10 w-2 bg-secondary rounded-full mr-4"></div>
              <h2 className="text-3xl font-bold text-base-content">🔍 Core Problems Solved</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-3">1</div>
                  <h3 className="text-xl font-bold text-base-content">Preventing Post-Token Issuance Stagnation</h3>
                </div>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>Dynamic staking mechanism ensures continuous development</li>
                  <li>Pre-issuance token crowdfunding with clear fund usage</li>
                  <li>AI+Community co-governance maintains development momentum</li>
                </ul>
              </div>
              
              <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-3">2</div>
                  <h3 className="text-xl font-bold text-base-content">Increasing Participation Opportunities</h3>
                </div>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>Low barrier idea submission through AI agents</li>
                  <li>Task staking mechanism for deep community involvement</li>
                  <li>Economic incentives for active governance participants</li>
                </ul>
              </div>
              
              <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-3">3</div>
                  <h3 className="text-xl font-bold text-base-content">Empowering Communities Through Tokens</h3>
                </div>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>Multi-level token ecosystem with governance rights</li>
                  <li>Token reservation for long-term ecosystem building</li>
                  <li>SocialFi integration enhancing community engagement</li>
                </ul>
              </div>
              
              <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-3">4</div>
                  <h3 className="text-xl font-bold text-base-content">Solving Centralization and Transparency Issues</h3>
                </div>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>Open fund allocation and governance processes</li>
                  <li>AI-assisted decision-making enhancing decentralization</li>
                </ul>
              </div>
              
              <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-3">5</div>
                  <h3 className="text-xl font-bold text-base-content">Lowering Entry Barriers for New Projects</h3>
                </div>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>Support for projects at the idea stage</li>
                  <li>Token staking system for development funding</li>
                </ul>
              </div>
              
              <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold mr-3">6</div>
                  <h3 className="text-xl font-bold text-base-content">Improving Project Management Efficiency</h3>
                </div>
                <ul className="list-disc pl-6 space-y-2 text-sm">
                  <li>AI for idea generation, proposal structuring, and task auditing</li>
                  <li>Automated qualification verification and milestone tracking</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Project Flowchart Section */}
          <section className="mb-16">
            <div className="flex items-center mb-6">
              <div className="h-10 w-2 bg-primary rounded-full mr-4"></div>
              <h2 className="text-3xl font-bold text-base-content">🔄 Project Flowchart</h2>
            </div>
            
            <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-xl p-6 mb-8 backdrop-blur-sm">
              <div className="flex justify-center">
                <Image 
                  src={resolvedTheme === 'dark' 
                    ? "https://www.mermaidchart.com/raw/937f4abc-fd01-4ca4-9bbc-e1d9ae619597?theme=dark&version=v0.1&format=svg"
                    : "https://www.mermaidchart.com/raw/fa1e92a8-4188-4d36-a8a3-fb42acf5345d?theme=light&version=v0.1&format=svg"
                  }
                  alt="Project Workflow Diagram" 
                  width={1200}
                  height={800}
                  className="w-full max-w-4xl rounded-lg shadow-md hover:shadow-lg transition-all"
                />
              </div>
            </div>
          </section>

          {/* Development Roadmap Section */}
          <section>
            <div className="flex items-center mb-6">
              <div className="h-10 w-2 bg-secondary rounded-full mr-4"></div>
              <h2 className="text-3xl font-bold text-base-content">🛣️ Development Roadmap</h2>
            </div>
            
            <div className="space-y-8">
              {/* Phase 1 */}
              <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-6 backdrop-blur-sm border-l-4 border-primary">
                <h3 className="text-2xl font-semibold mb-4 text-base-content">Phase 1: AI Collaborative Creation</h3>
                <div className="space-y-6">
                  <div className="bg-base-100/90 dark:bg-gray-700/90 p-4 rounded-lg shadow-md backdrop-blur-sm">
                    <h4 className="font-bold mb-2 flex items-center">
                      <span className="material-icons text-primary mr-2">smart_toy</span>
                      M1: AI Core Protocol
                    </h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Natural language processing for project proposal generation</li>
                      <li>Technical solution feasibility analysis</li>
                    </ul>
                  </div>
                  
                  <div className="bg-base-100/90 dark:bg-gray-700/90 p-4 rounded-lg shadow-md backdrop-blur-sm">
                    <h4 className="font-bold mb-2 flex items-center">
                      <span className="material-icons text-primary mr-2">savings</span>
                      M2: Dynamic Staking Crowdfunding
                    </h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Project token fundraising</li>
                      <li>Smart contract fund locking</li>
                    </ul>
                  </div>
                  
                  <div className="bg-base-100/90 dark:bg-gray-700/90 p-4 rounded-lg shadow-md backdrop-blur-sm">
                    <h4 className="font-bold mb-2 flex items-center">
                      <span className="material-icons text-primary mr-2">shopping_cart</span>
                      M3: Task Market 1.0
                    </h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Automated task publishing</li>
                      <li>Tokenized reward distribution</li>
                      <li>Social media bot integration</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Phase 2 */}
              <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-6 backdrop-blur-sm border-l-4 border-secondary">
                <h3 className="text-2xl font-semibold mb-4 text-base-content">Phase 2: Community Governance</h3>
                <div className="space-y-6">
                  <div className="bg-base-100/90 dark:bg-gray-700/90 p-4 rounded-lg shadow-md backdrop-blur-sm">
                    <h4 className="font-bold mb-2 flex items-center">
                      <span className="material-icons text-secondary mr-2">forum</span>
                      M4: Decentralized Forum
                    </h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Proposal discussion protocols</li>
                      <li>Agent participation in discussions</li>
                      <li>Snapshot voting integration</li>
                    </ul>
                  </div>
                  
                  <div className="bg-base-100/90 dark:bg-gray-700/90 p-4 rounded-lg shadow-md backdrop-blur-sm">
                    <h4 className="font-bold mb-2 flex items-center">
                      <span className="material-icons text-secondary mr-2">settings</span>
                      M5: Project Self-governance Protocol
                    </h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Independent AI Agents for each project</li>
                      <li>Agent management dashboard</li>
                    </ul>
                  </div>
                  
                  <div className="bg-base-100/90 dark:bg-gray-700/90 p-4 rounded-lg shadow-md backdrop-blur-sm">
                    <h4 className="font-bold mb-2 flex items-center">
                      <span className="material-icons text-secondary mr-2">how_to_vote</span>
                      M6: Governance Mechanism 1.0
                    </h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Task qualification review</li>
                      <li>Dynamic staking voting</li>
                      <li>Anti-fraud detection</li>
                      <li>Basic reputation system</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Phase 3 */}
              <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-6 backdrop-blur-sm border-l-4 border-primary">
                <h3 className="text-2xl font-semibold mb-4 text-base-content">Phase 3: Token Economy Deepening</h3>
                <div className="space-y-6">
                  <div className="bg-base-100/90 dark:bg-gray-700/90 p-4 rounded-lg shadow-md backdrop-blur-sm">
                    <h4 className="font-bold mb-2 flex items-center">
                      <span className="material-icons text-primary mr-2">trending_up</span>
                      M7: Proposal-Driven Development
                    </h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Community proposals → automated tasks</li>
                      <li>Dual-token staking pools</li>
                      <li>Customized reward distribution</li>
                    </ul>
                  </div>
                  
                  <div className="bg-base-100/90 dark:bg-gray-700/90 p-4 rounded-lg shadow-md backdrop-blur-sm">
                    <h4 className="font-bold mb-2 flex items-center">
                      <span className="material-icons text-primary mr-2">currency_exchange</span>
                      M8: Token Economic Model
                    </h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Yield aggregators</li>
                      <li>Cross-project token swap protocols</li>
                      <li>Token leverage staking</li>
                    </ul>
                  </div>
                  
                  <div className="bg-base-100/90 dark:bg-gray-700/90 p-4 rounded-lg shadow-md backdrop-blur-sm">
                    <h4 className="font-bold mb-2 flex items-center">
                      <span className="material-icons text-primary mr-2">share</span>
                      M9: SocialFi Integration
                    </h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Social media progress synchronization</li>
                      <li>Governance data visualization</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Phase 4 */}
              <div className="bg-white/70 dark:bg-gray-800/70 rounded-xl p-6 backdrop-blur-sm border-l-4 border-secondary">
                <h3 className="text-2xl font-semibold mb-4 text-base-content">Phase 4: Ecosystem Optimization</h3>
                <div className="space-y-6">
                  <div className="bg-base-100/90 dark:bg-gray-700/90 p-4 rounded-lg shadow-md backdrop-blur-sm">
                    <h4 className="font-bold mb-2 flex items-center">
                      <span className="material-icons text-secondary mr-2">hub</span>
                      M10: Multi-chain Collaboration Protocol
                    </h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>Cross-chain communication via LayerZero</li>
                      <li>Multi-chain collaborative development</li>
                      <li>Cross-chain token exchange gateway</li>
                    </ul>
                  </div>
                  
                  <div className="bg-base-100/90 dark:bg-gray-700/90 p-4 rounded-lg shadow-md backdrop-blur-sm">
                    <h4 className="font-bold mb-2 flex items-center">
                      <span className="material-icons text-secondary mr-2">gavel</span>
                      M11: Governance Mechanism 2.0
                    </h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>AI+Community dual voting</li>
                      <li>Reputation-weighted system with POAP integration</li>
                      <li>Governance-development automation</li>
                    </ul>
                  </div>
                  
                  <div className="bg-base-100/90 dark:bg-gray-700/90 p-4 rounded-lg shadow-md backdrop-blur-sm">
                    <h4 className="font-bold mb-2 flex items-center">
                      <span className="material-icons text-secondary mr-2">auto_graph</span>
                      M12: Ecosystem Optimization
                    </h4>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li>AI effect evaluation</li>
                      <li>Multi-language promotion generator</li>
                      <li>On-chain ecosystem auditing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage; 