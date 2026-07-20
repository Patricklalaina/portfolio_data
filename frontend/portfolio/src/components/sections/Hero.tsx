import { motion } from "framer-motion";
import { ChevronDown, MapPin, Briefcase, FolderGit2, Award, Link as LinkIcon } from "lucide-react";
import { ResolvedIcon } from "@/lib/icon-utils";
import { computeYearsOfExperience } from "@/lib/date-utils";
import { useGetProfile, useListExperience, useListProjects, useListCertifications } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Hero() {
  const { data: profile, isLoading } = useGetProfile();
  const { data: experiences } = useListExperience();
  const { data: projects } = useListProjects();
  const { data: certifications } = useListCertifications();

  const stats = [
    { icon: Briefcase, value: `${computeYearsOfExperience(experiences)}+`, label: "Years Experience" },
    { icon: FolderGit2, value: String(projects?.length ?? 0), label: "Projects Shipped" },
    { icon: Award, value: String(certifications?.length ?? 0), label: "Certifications" },
  ];

  return (
    <section className="relative min-h-[100dvh] flex items-center pt-20 overflow-hidden">
      {/* Subtle Dot Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle at center, hsl(var(--muted-foreground)) 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />
      
      <div className="max-w-6xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-16 items-center relative z-10">
        
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3 mb-6">
            {isLoading ? (
              <Skeleton className="h-7 w-32" />
            ) : profile?.availableForWork ? (
              <div className="px-3 py-1.5 border border-border bg-card/50 backdrop-blur text-xs font-mono text-muted-foreground flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Available for work
              </div>
            ) : null}

            {isLoading ? (
              <Skeleton className="h-7 w-40" />
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground border border-border px-3 py-1.5 bg-card/50 backdrop-blur">
                <MapPin className="w-3 h-3" />
                <span>{profile?.location}</span>
              </div>
            )}
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            {isLoading ? (
              <>
                <Skeleton className="h-14 md:h-16 lg:h-20 w-3/4 mb-2" />
                <Skeleton className="h-10 md:h-12 lg:h-16 w-1/2 mb-2" />
                <Skeleton className="h-8 md:h-10 lg:h-12 w-2/3 mt-4" />
              </>
            ) : (
              <>
                <span className="block text-foreground">{profile?.name}.</span>
                <span className="block text-muted-foreground font-medium mt-2">{profile?.role}.</span>
                <span className="block text-primary/70 font-normal text-3xl md:text-4xl lg:text-5xl mt-2">{profile?.tagline}.</span>
              </>
            )}
          </h1>

          {isLoading ? (
            <div className="mb-10 flex flex-col gap-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-6 w-4/6" />
            </div>
          ) : (
            <p className="text-muted-foreground text-lg max-w-xl mb-10 leading-relaxed">
              {profile?.bio}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 mb-12">
            <a href="#projects" className="bg-primary text-primary-foreground px-6 py-3 font-medium text-sm hover:bg-primary/90 transition-colors border border-transparent">
              View Projects
            </a>
            <a href="#contact" className="bg-transparent text-foreground border border-border px-6 py-3 font-medium text-sm hover:border-primary/50 hover:text-primary transition-colors">
              Get in Touch
            </a>
          </div>

          <div className="flex items-center gap-5">
            {isLoading ? (
              <>
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </>
            ) : (
              (Array.isArray(profile?.socialLinks) ? profile.socialLinks : []).map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={social.platform}
                >
                  <ResolvedIcon iconKey={social.iconKey} fallback={LinkIcon} className="w-5 h-5" />
                </a>
              ))
            )}
          </div>
        </motion.div>

        {/* Right Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="relative lg:ml-auto w-full max-w-md mx-auto lg:mx-0"
        >
          {/* Stats Grid — computed automatically from Experience, Projects & Certifications */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card border border-border p-4 flex flex-col gap-2">
                  <Skeleton className="w-4 h-4 mb-1" />
                  <Skeleton className="h-6 w-10" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))
            ) : (
              stats.map((stat, i) => (
                <div key={i} className="bg-card border border-border p-4 flex flex-col gap-1.5 hover:border-primary/30 transition-colors">
                  <stat.icon className="w-4 h-4 text-primary mb-1" />
                  <span className="text-2xl font-bold text-foreground leading-none">{stat.value}</span>
                  <span className="text-[11px] font-mono text-muted-foreground leading-tight">{stat.label}</span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <span className="text-[10px] font-mono tracking-widest uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </div>
    </section>
  );
}
