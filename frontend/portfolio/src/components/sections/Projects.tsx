import { motion } from "framer-motion";
import { Star, ExternalLink, Github, Globe } from "lucide-react";
import { DynamicIcon, iconNames, type IconName } from "lucide-react/dynamic";
import { useListProjects } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

function ProjectIcon({ iconKey, className }: { iconKey: string; className?: string }) {
  if ((iconNames as readonly string[]).includes(iconKey)) {
    return <DynamicIcon name={iconKey as IconName} className={className} />;
  }
  return <Globe className={className} />;
}

const PROJ_COLORS: Record<string, string> = {
  blue: "bg-blue-900/20 text-blue-500",
  amber: "bg-amber-900/20 text-amber-500",
  emerald: "bg-emerald-900/20 text-emerald-500",
  violet: "bg-violet-900/20 text-violet-500",
  rose: "bg-rose-900/20 text-rose-500",
};

export function Projects() {
  const { data: projects, isLoading } = useListProjects();

  // Sort by id descending (higher id = more recently added)
  const sorted = React.useMemo(
    () => (Array.isArray(projects) ? [...projects] : []).sort((a, b) => b.id - a.id),
    [projects],
  );

  return (
    <section id="projects" className="py-24 relative bg-card/20 border-y border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Projects</h2>
          <p className="text-muted-foreground font-mono text-sm">/ Selected open-source work</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex flex-col bg-background border border-border h-full">
                <div className="h-48 border-b border-border bg-muted/30 relative flex items-center justify-center p-6">
                  <Skeleton className="h-10 w-3/4" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="w-8 h-8 rounded-sm" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <div className="flex flex-col gap-2 mb-6">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="flex items-center gap-4 pt-4 border-t border-border mt-auto">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            sorted.map((project, index) => {
              const colorClass = PROJ_COLORS[project.colorKey] ?? "bg-muted text-foreground";
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex flex-col bg-background border border-border group hover:border-primary/50 transition-colors h-full"
                >
                  {/* Image / Placeholder Area */}
                  <div className="h-48 border-b border-border bg-muted/30 relative flex items-center justify-center overflow-hidden">
                    {project.imageUrl ? (
                      <img
                        src={project.imageUrl}
                        alt={`${project.name} preview`}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <>
                        {/* Subtle pattern */}
                        <div className="absolute inset-0 p-6 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), repeating-linear-gradient(45deg, #000 25%, #fff 25%, #fff 75%, #000 75%, #000)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }} />

                        <h3 className="text-3xl font-bold text-muted-foreground/20 uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis w-full text-center relative z-10 px-6">
                          {project.name}
                        </h3>
                      </>
                    )}

                    <div className="absolute top-4 right-4 bg-background border border-border px-2 py-1 flex items-center gap-1.5 z-20">
                      <Star className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs font-mono text-muted-foreground">{project.stars}</span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-1.5 rounded-sm ${colorClass}`}>
                        <ProjectIcon iconKey={project.iconKey} className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-lg">{project.name}</h4>
                    </div>
                    
                    <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-grow">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.tech?.map(tech => (
                        <span key={tech} className="text-xs font-mono text-muted-foreground px-2 py-1 bg-card border border-border">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 pt-4 border-t border-border mt-auto">
                      <a href={project.liveUrl} className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Live Demo
                      </a>
                      <a href={project.githubUrl} className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                        <Github className="w-3.5 h-3.5" />
                        Source Code
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
