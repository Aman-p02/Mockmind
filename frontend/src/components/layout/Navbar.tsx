"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";
import { useState } from "react";
import {
  Navbar as ResizableNavbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";

export function Navbar() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const publicNavItems: { name: string; link: string }[] = [];

  const privateNavItems = [
    { name: "Dashboard", link: "/dashboard" },
    { name: "Profile", link: "/profile" },
  ];

  const activeNavItems = user ? privateNavItems : publicNavItems;

  return (
    <ResizableNavbar>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={activeNavItems} />
        <div className="flex items-center gap-4">
          {user ? (
            <NavbarButton as="button" onClick={logout} variant="secondary" className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </NavbarButton>
          ) : (
            <>
              <NavbarButton as={Link} href="/login" variant="secondary" className="text-base">
                Login
              </NavbarButton>
              <NavbarButton as={Link} href="/register" variant="primary" className="text-base">
                Start Practicing Free
              </NavbarButton>
            </>
          )}
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {activeNavItems.map((item, idx) => (
            <Link
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative text-neutral-600 dark:text-neutral-300 w-full text-lg font-medium px-2 py-1"
            >
              <span className="block">{item.name}</span>
            </Link>
          ))}
          <div className="flex w-full flex-col gap-4 mt-4">
            {user ? (
              <NavbarButton
                as="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                variant="secondary"
                className="w-full flex justify-center items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </NavbarButton>
            ) : (
              <>
                <NavbarButton
                  as={Link}
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="dark"
                  className="w-full flex justify-center items-center gap-2 border border-white/20"
                >
                  Login
                </NavbarButton>
                <NavbarButton
                  as={Link}
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="primary"
                  className="w-full text-lg py-3"
                >
                  Start Practicing Free
                </NavbarButton>
              </>
            )}
          </div>
        </MobileNavMenu>
      </MobileNav>
    </ResizableNavbar>
  );
}
