import { Github, Linkedin, Twitter } from "lucide-react";
import { useGetProfile } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { data: profile, isLoading } = useGetProfile();
  
  return (
    <footer className="border-t border-border bg-background py-8">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="text-xs font-mono text-muted-foreground flex items-center gap-2">
          &copy; {currentYear}{" "}
          {isLoading ? <Skeleton className="inline-block h-3 w-20 align-middle" /> : profile?.name}. All rights reserved.
        </span>
        
        <div className="flex items-center gap-4">
          {isLoading ? (
            <>
              <Skeleton className="w-4 h-4" />
              <Skeleton className="w-4 h-4" />
              <Skeleton className="w-4 h-4" />
            </>
          ) : profile?.socialLinks && (
            <>
              <a href={profile.socialLinks.github} className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="w-4 h-4" />
                <span className="sr-only">GitHub</span>
              </a>
              <a href={profile.socialLinks.linkedin} className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="w-4 h-4" />
                <span className="sr-only">LinkedIn</span>
              </a>
              <a href={profile.socialLinks.twitter} className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="w-4 h-4" />
                <span className="sr-only">Twitter</span>
              </a>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
