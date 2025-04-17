import React from "react";
import Link from "next/link";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { FaDiscord, FaGithub, FaTwitter, FaMedium, FaTelegram } from "react-icons/fa";
import { IdeaPulseLogo } from "~~/components/assets/IdeaPulseLogo";

/**
 * Ask Agent Button Component (Fixed Position)
 */
export const AskAgentButton = () => {
  return (
    <div className="fixed flex justify-end items-center w-full z-20 p-4 bottom-0 right-0 pointer-events-none">
    <div className={`relative pointer-events-auto group}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-accent/40 to-secondary/40 rounded-full blur-md opacity-50 group-hover:opacity-80 transition-all duration-300 animate-pulse"></div>
      <button className="btn bg-gradient-to-r from-accent to-secondary hover:from-secondary hover:to-accent text-white border-none rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium relative z-10 p-0 h-10 min-h-0 overflow-hidden">
        <div className="flex items-center justify-center gap-2 px-4 h-full">
          <ChatBubbleLeftRightIcon className="h-5 w-5 group-hover:animate-bounce flex-shrink-0" />
          <span className="relative inline-block leading-tight text-center">
            Ask Agent
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-white/70 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
          </span>
        </div>
      </button>
    </div>
  </div>
  );
};

/**
 * Site footer
 */
export const Footer = () => {
  return (
    <footer className="relative bg-base-200/50 backdrop-blur-sm border-t border-base-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <div className="flex flex-col items-center md:items-start">
              <IdeaPulseLogo className="w-16 h-16 mb-4" />
              <h3 className="text-lg font-bold mb-2">IdeaPulse</h3>
              <p className="text-sm opacity-70 text-center md:text-left">
                Build with AI, Grow with Community, Tokenize with DAO
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-4 text-center md:text-left">Quick Links</h3>
            <ul className="flex flex-col items-center md:items-start gap-2">
              <li>
                <Link href="/about" className="text-sm hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-sm hover:text-primary transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/community" className="text-sm hover:text-primary transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link href="/governance" className="text-sm hover:text-primary transition-colors">
                  Governance
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-4 text-center md:text-left">Resources</h3>
            <ul className="flex flex-col items-center md:items-start gap-2">
              <li>
                <Link href="/docs" className="text-sm hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/tutorials" className="text-sm hover:text-primary transition-colors">
                  Tutorials
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="text-sm hover:text-primary transition-colors">
                  Roadmap
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-bold mb-4 text-center md:text-left">Connect</h3>
            <div className="flex justify-center md:justify-start gap-4 mb-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <FaDiscord className="w-5 h-5" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <FaGithub className="w-5 h-5" />
              </a>
              <a href="https://medium.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <FaMedium className="w-5 h-5" />
              </a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <FaTelegram className="w-5 h-5" />
              </a>
            </div>
            <p className="text-sm opacity-70 text-center md:text-left">
              Subscribe to our newsletter for updates
            </p>
            <div className="mt-2 flex justify-center md:justify-start">
              <div className="relative flex">
                <input className="input input-sm rounded-l-full min-h-0 h-10" placeholder="Email" />
                <button className="btn btn-sm btn-primary rounded-r-full p-0 min-h-0 h-10">
                  <div className="flex items-center justify-center gap-2 px-4 h-full">
                    <span className="relative inline-block leading-tight text-center">
                      Subscribe
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-4 border-t border-base-300 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm opacity-70 mb-4 md:mb-0">
            © {new Date().getFullYear()} IdeaPulse. All rights reserved.
          </div>
          <div className="flex gap-4 text-sm">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};