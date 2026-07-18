import { motion } from "framer-motion";
import { CheckCircle2, Shield, Cloud, Server, Database, Lock, Box, Terminal, Monitor } from "lucide-react";
import { useListCertifications } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

const CERT_ICONS: Record<string, React.ElementType> = {
  cloud: Cloud, box: Box, server: Server, database: Database,
  shield: Shield, lock: Lock, monitor: Monitor, terminal: Terminal,
};

function parseCertYear(date: string | undefined): number {
  if (!date) return 0;
  const year = parseInt(date.trim(), 10);
  return isNaN(year) ? 0 : year;
}

export function Certifications() {
  const { data: certs, isLoading } = useListCertifications();

  const sorted = React.useMemo(
    () => (Array.isArray(certs) ? [...certs] : []).sort(
      (a, b) => parseCertYear(b.date) - parseCertYear(a.date)
    ),
    [certs],
  );

  return (
    <section id="certifications" className="py-24 bg-card/20 border-y border-border relative">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Certifications</h2>
          <p className="text-muted-foreground font-mono text-sm">/ Verified credentials</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-background border border-border p-5">
                <div className="flex justify-between items-start mb-6">
                  <Skeleton className="w-10 h-10" />
                  <Skeleton className="w-4 h-4 rounded-full" />
                </div>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-10" />
                </div>
              </div>
            ))
          ) : (
            sorted.map((cert, index) => {
              const Icon = CERT_ICONS[cert.iconKey] ?? Cloud;
              return (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="bg-background border border-border p-5 hover:border-primary/50 transition-colors group relative"
                >
                  <div className="absolute top-4 right-4">
                    <CheckCircle2 className="w-4 h-4 text-green-500/70" />
                  </div>
                  
                  <div className="w-10 h-10 border border-border flex items-center justify-center mb-6 group-hover:border-primary/30 transition-colors">
                    <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  
                  <h3 className="font-bold text-sm text-foreground mb-1 pr-6">{cert.name}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{cert.org}</p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                    <span className="text-[10px] font-mono text-muted-foreground">{cert.credentialId}</span>
                    <span className="text-[10px] font-mono text-foreground">{cert.date}</span>
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
