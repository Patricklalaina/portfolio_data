import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";
import { ResolvedIcon } from "@/lib/icon-utils";
import { formatDateRange, endYearForSort } from "@/lib/date-utils";
import { useListEducation } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export function Education() {
  const { data: education, isLoading } = useListEducation();

  const sorted = React.useMemo(
    () => (Array.isArray(education) ? [...education] : []).sort(
      (a, b) => endYearForSort(b.startDate, b.endDate) - endYearForSort(a.startDate, a.endDate)
    ),
    [education],
  );

  return (
    <section id="education" className="py-24 relative">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Education</h2>
          <p className="text-muted-foreground font-mono text-sm">/ Academic background</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="border border-border bg-card/30 p-8 flex flex-col items-start">
                <Skeleton className="w-12 h-12 mb-6" />
                <Skeleton className="h-6 w-48 mb-1" />
                <Skeleton className="h-4 w-40 mb-4" />
                <div className="flex items-center gap-3 mb-6">
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="w-full mt-auto border-t border-border pt-4">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))
          ) : (
            sorted.map((edu, i) => {
              return (
                <motion.div
                  key={edu.id}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="border border-border bg-card/30 p-8 flex flex-col items-start hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 border border-border bg-background flex items-center justify-center mb-6">
                    <ResolvedIcon iconKey={edu.iconKey} fallback={GraduationCap} className="w-6 h-6 text-primary" />
                  </div>
                  
                  <h3 className="text-xl font-bold mb-1">{edu.degree}</h3>
                  <p className="text-primary font-medium text-sm mb-4">{edu.institution}</p>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-mono text-muted-foreground border border-border px-2 py-1 bg-background">
                      {formatDateRange(edu.startDate, edu.endDate)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed mt-auto border-t border-border pt-4 w-full">
                    {edu.focus}
                  </p>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
