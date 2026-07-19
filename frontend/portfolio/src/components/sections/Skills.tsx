import { motion } from "framer-motion";
import { Wrench } from "lucide-react";
import { ResolvedIcon } from "@/lib/icon-utils";
import { useGetSkills } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Skills() {
  const { data, isLoading } = useGetSkills();

  return (
    <section id="skills" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-16 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Capabilities</h2>
            <p className="text-muted-foreground font-mono text-sm">/ Technical arsenal</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="border border-border bg-card/30 p-6">
                <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border/50">
                  <Skeleton className="w-5 h-5 rounded-full" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="flex flex-col gap-6">
                  {Array.from({ length: 4 }).map((_, sIdx) => (
                    <div key={sIdx}>
                      <div className="flex justify-between mb-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-8" />
                      </div>
                      <Skeleton className="h-1 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            (Array.isArray(data?.categories) ? data!.categories : []).map((category, idx) => {
              return (
                <motion.div 
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="border border-border bg-card/30 p-6"
                >
                  <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border/50">
                    <ResolvedIcon iconKey={category.iconKey} fallback={Wrench} className="w-5 h-5 text-primary" />
                    <h3 className="font-bold">{category.title}</h3>
                  </div>

                  <div className="flex flex-col gap-6">
                    {category.skills?.map((skill) => (
                      <div key={skill.name}>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="font-medium text-foreground">{skill.name}</span>
                          <span className="font-mono text-muted-foreground">{skill.level}%</span>
                        </div>
                        <div className="h-1 w-full bg-muted overflow-hidden relative">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.level}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                            className="absolute top-0 left-0 h-full bg-primary"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Secondary Skills Pill Cloud */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto"
        >
          {isLoading ? (
            Array.from({ length: 15 }).map((_, idx) => (
              <Skeleton key={idx} className="h-8 w-20" />
            ))
          ) : (
            (Array.isArray(data?.secondary) ? data!.secondary : []).map((skill) => (
              <span 
                key={skill}
                className="text-xs text-muted-foreground border border-border/50 px-3 py-1.5 hover:border-primary/30 hover:text-foreground transition-colors cursor-default"
              >
                {skill}
              </span>
            ))
          )}
        </motion.div>
      </div>
    </section>
  );
}
