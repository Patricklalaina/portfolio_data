import { Link as LinkIcon } from "lucide-react";
import { ResolvedIcon } from "@/lib/icon-utils";
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
          ) : (
            (Array.isArray(profile?.socialLinks) ? profile.socialLinks : []).map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ResolvedIcon iconKey={social.iconKey} fallback={LinkIcon} className="w-4 h-4" />
                <span className="sr-only">{social.platform}</span>
              </a>
            ))
          )}
        </div>
      </div>
    </footer>
  );
}
