import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import {
  Instagram,
  Youtube,
  Twitter,
  Github,
  Facebook,
  Linkedin,
  Mail,
} from "lucide-react";

import { visibleSocials } from "@/config/socials";

export default function Footer() {
  const links = {
    explore: [
      { label: "Browse All", href: "/browse" },
      { label: "Popular", href: "/browse?sort=popular" },
      { label: "New Releases", href: "/browse?sort=latest" },
      { label: "Genres", href: "/browse" },
    ],
    creators: [
      { label: "Creator Studio", href: "/creator" },
      { label: "Creator Guidelines", href: "#" },
      { label: "Monetization", href: "#" },
      { label: "Resources", href: "#" },
    ],
    company: [
      { label: "About Us", href: "#" },
      { label: "Contact", href: "#" },
    ],
    legal: [
      { label: "Terms of Service", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Content Policy", href: "#" },
      { label: "DMCA", href: "#" },
    ],
  };

  // Icon mapping (centralized + explicit)
  const iconMap: Record<string, any> = {
    instagram: Instagram,
    youtube: Youtube,
    x: Twitter,
    twitter: Twitter,
    github: Github,
    facebook: Facebook,
    linkedin: Linkedin,
    email: Mail,
  };

  const socials = visibleSocials();

  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">HadithiTube</span>
            </Link>

            <p className="text-sm text-muted-foreground mb-4">
              A modern platform for discovering, publishing, and sharing African
              and global web stories.
            </p>

            {/* Socials */}
            <div className="flex gap-3">
              {socials.map((social) => {
                const Icon = iconMap[social.key];
                if (!Icon) return null;

                return (
                  <a
                    key={social.key}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center
                               text-muted-foreground hover:text-primary hover:bg-secondary/80 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold mb-4">Explore</h4>
            <ul className="space-y-2">
              {links.explore.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Creators */}
          <div>
            <h4 className="font-semibold mb-4">Creators</h4>
            <ul className="space-y-2">
              {links.creators.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {links.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {links.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 HadithiTube. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built for creators. Powered by stories.
          </p>
        </div>
      </div>
    </footer>
  );
}