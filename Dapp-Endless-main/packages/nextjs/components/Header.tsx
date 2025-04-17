"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { IdeaPulseLogo } from "~~/components/assets/IdeaPulseLogo";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { EndlessWalletSelector } from "./wallet/EndlessWalletSelector";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
    icon: <span className="material-icons text-sm flex items-center">home</span>,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: <span className="material-icons text-sm flex items-center">apps</span>,
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <span className="material-icons text-sm flex items-center">dashboard</span>,
  },
  {
    label: "About",
    href: "/about",
    icon: <span className="material-icons text-sm flex items-center">help_outline</span>,
  },
];

export const HeaderMenuLinks = () => {
  const pathname = usePathname();

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <li key={href}>
            <Link
              href={href}
              passHref
              className={`${
                isActive 
                  ? "font-medium bg-primary/20 text-primary dark:bg-primary/30 dark:text-white" 
                  : "dark:text-gray-200"
              } hover:bg-primary/10 dark:hover:bg-primary/20 hover:shadow-md focus:!bg-primary/20 active:!text-neutral py-2 px-5 text-sm rounded-md flex items-center gap-2 transition-all duration-200`}
            >
              {icon}
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (burgerMenuRef.current && !burgerMenuRef.current.contains(event.target as Node)) {
        setIsDrawerOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [burgerMenuRef]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Projects", href: "/projects" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "About", href: "/about" },
  ];

  return (
    <div className="sticky top-0 z-50 transition-all duration-200">
      <div className={`absolute inset-0 bg-base-100/70 backdrop-blur-md shadow-md transition-opacity duration-300 ${isScrolled ? 'opacity-100' : 'opacity-0'}`}></div>
      <div className="relative z-10 flex justify-between items-center gap-4 p-4 max-w-7xl xl:mx-auto">
        <div className="flex gap-4 items-center">
          <Link href="/" passHref className="flex items-center gap-1">
            <IdeaPulseLogo />
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight">BuidlLand</span>
            </div>
          </Link>
          <div className="hidden sm:flex items-center gap-4 ml-6">
            {navLinks.map((navLink) => (
              <Link
                href={navLink.href}
                key={navLink.href}
                passHref
                className={`py-2 px-3 transition-all hover:text-primary ${
                  pathname === navLink.href
                    ? "font-semibold text-primary"
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                {navLink.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <SwitchTheme />
          <EndlessWalletSelector />
          <div className="sm:hidden dropdown dropdown-end" ref={burgerMenuRef}>
            <label
              tabIndex={0}
              className={`ml-1 btn btn-ghost ${isDrawerOpen ? "text-primary" : ""}`}
              onClick={() => {
                setIsDrawerOpen(!isDrawerOpen);
              }}
            >
              <Bars3Icon className="h-6 w-6" />
            </label>
            {isDrawerOpen && (
              <ul
                tabIndex={0}
                className="p-2 mt-2 shadow menu menu-compact dropdown-content bg-base-200 rounded-md w-52 animate-fade-in"
              >
                {navLinks.map((navLink) => (
                  <li key={navLink.href}>
                    <Link
                      href={navLink.href}
                      passHref
                      className={`${
                        pathname === navLink.href ? "font-semibold text-primary" : ""
                      }`}
                      onClick={() => {
                        setIsDrawerOpen(false);
                      }}
                    >
                      {navLink.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};