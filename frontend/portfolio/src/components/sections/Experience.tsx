import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { useListExperience } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateRange, endYearForSort } from "@/lib/date-utils";
import React from "react";

export function Experience() {
  const { data: experiences, isLoading } = useListExperience();

  const sorted = React.useMemo(
    () => (Array.isArray(experiences) ? [...experiences] : []).sort(
      (a, b) => endYearForSort(b.startDate, b.endDate) - endYearForSort(a.startDate, a.endDate)
    ),
    [experiences],
  );

  return (
    <section id="experience" className="py-24 relative">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Experience</h2>
          <p className="text-muted-foreground font-mono text-sm">/ My professional journey</p>
        </div>

        <div className="relative border-l border-border ml-3 md:ml-0">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="mb-12 relative pl-8 md:pl-12 last:mb-0">
                <div className="absolute left-[-5px] top-1 h-2.5 w-2.5 bg-background border-2 border-primary rounded-full shadow-[0_0_8px_rgba(217,155,88,0.5)]" />
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <Skeleton className="w-8 h-8 rounded-sm" />
                      <Skeleton className="h-6 w-48" />
                    </div>
                    <Skeleton className="h-4 w-32 ml-10" />
                  </div>
                  <div className="flex items-center gap-3 ml-10 md:ml-0">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
                <div className="ml-10 md:ml-12">
                  <div className="flex flex-col gap-2 mb-5">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-14" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            sorted.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="mb-12 relative pl-8 md:pl-12 last:mb-0"
              >
                {/* Timeline Dot */}
                <div className="absolute left-[-5px] top-1 h-2.5 w-2.5 bg-background border-2 border-primary rounded-full shadow-[0_0_8px_rgba(217,155,88,0.5)]" />

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <div className="p-1.5 bg-card border border-border rounded-sm">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">{exp.role}</h3>
                    </div>
                    <div className="text-primary font-medium text-sm ml-10">
                      {exp.company}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-10 md:ml-0">
                    <span className="text-xs font-mono text-muted-foreground border border-border px-2 py-1 bg-card/50">
                      {formatDateRange(exp.startDate, exp.endDate)}
                    </span>
                    <span className="text-xs font-mono text-foreground border border-border px-2 py-1 bg-muted/50">
                      {exp.employmentType}
                    </span>
                  </div>
                </div>

                <div className="ml-10 md:ml-12">
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                    {exp.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {exp.tech?.map(tech => (
                      <span 
                        key={tech} 
                        className="text-xs font-mono text-muted-foreground px-2 py-1 border border-border hover:border-primary/30 transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
