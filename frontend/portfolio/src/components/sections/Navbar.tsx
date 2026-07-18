import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Download, Briefcase, Award, Code, Layers, GraduationCap, Mail } from "lucide-react";
import { useGetProfile } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: profile, isLoading } = useGetProfile();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { name: "Experience", href: "#experience", icon: Briefcase },
    { name: "Certifications", href: "#certifications", icon: Award },
    { name: "Skills", href: "#skills", icon: Code },
    { name: "Projects", href: "#projects", icon: Layers },
    { name: "Education", href: "#education", icon: GraduationCap },
    { name: "Contact", href: "#contact", icon: Mail },
  ];

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b border-transparent ${
        isScrolled ? "bg-background/80 backdrop-blur-md border-border py-3" : "py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2 group">
          <div className="h-8 w-8 bg-muted flex items-center justify-center border border-border group-hover:border-primary/50 transition-colors">
            {isLoading ? (
              <Skeleton className="h-4 w-4" />
            ) : (
              <span className="font-mono text-xs font-bold text-primary">{profile?.initials}</span>
            )}
          </div>
          {isLoading ? (
            <Skeleton className="h-4 w-20" />
          ) : (
            <span className="font-medium tracking-tight text-foreground group-hover:text-primary transition-colors">
              {profile?.name}
            </span>
          )}
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-5 text-sm">
            {links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <link.icon className="w-3.5 h-3.5" />
                <span>{link.name}</span>
              </a>
            ))}
          </div>
          <div className="h-4 w-[1px] bg-border" />
          <a
            href="/api/portfolio/resume"
            target="_blank"
            rel="noreferrer"
            download="resume.pdf"
            className="text-xs font-medium px-4 py-2 border border-border hover:border-primary/50 text-foreground hover:text-primary transition-colors flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            Resume
          </a>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-muted-foreground hover:text-foreground"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border flex flex-col px-6 pt-5 pb-8"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-muted flex items-center justify-center border border-border">
                  {isLoading ? (
                    <Skeleton className="h-4 w-4" />
                  ) : (
                    <span className="font-mono text-xs font-bold text-primary">{profile?.initials}</span>
                  )}
                </div>
              </div>
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex flex-col gap-6">
              {links.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xl font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-3"
                >
                  <link.icon className="w-5 h-5" />
                  {link.name}
                </a>
              ))}
              <div className="h-[1px] w-full bg-border my-2" />
              <a
                href="/api/portfolio/resume"
                target="_blank"
                rel="noreferrer"
                download="resume.pdf"
                className="text-sm font-medium p-4 border border-border text-center text-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Resume
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
