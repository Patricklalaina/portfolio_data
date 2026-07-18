import { useGetAdminStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Inbox, LayoutTemplate, Activity } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: stats, isLoading, error } = useGetAdminStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 border border-destructive/20 bg-destructive/5 rounded-lg text-destructive">
        <h2 className="text-lg font-bold mb-2 flex items-center"><Activity className="mr-2 h-5 w-5" /> System Error</h2>
        <p>Failed to retrieve dashboard statistics. Ensure API is reachable.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground font-mono text-sm">System overview and portfolio metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-mono uppercase tracking-wider">
              Total Messages
            </CardTitle>
            <Inbox className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-mono">{stats?.totalMessages || 0}</div>
            <p className="text-xs text-muted-foreground mt-2 font-mono">
              {stats?.lastMessageAt ? `Last: ${format(new Date(stats.lastMessageAt), 'MMM d, yyyy HH:mm')}` : 'No messages'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground font-mono uppercase tracking-wider">
              Active Sections
            </CardTitle>
            <LayoutTemplate className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-mono">{stats?.sections.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-2 font-mono">Managed content blocks</p>
          </CardContent>
        </Card>

        <Card className="bg-primary text-primary-foreground border-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground/80 font-mono uppercase tracking-wider">
              System Status
            </CardTitle>
            <Activity className="h-4 w-4 text-primary-foreground/80" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold font-mono">OK</div>
            <p className="text-xs text-primary-foreground/80 mt-2 font-mono">All services operational</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Content Blocks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats?.sections.map((sec) => (
            <Link key={sec.section} href={`/sections/${sec.section}`}>
              <Card className="cursor-pointer hover:border-primary/50 transition-colors group">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg capitalize group-hover:text-primary transition-colors">{sec.section}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground font-mono">
                    Updated: {format(new Date(sec.updatedAt), 'yyyy-MM-dd HH:mm:ss')}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
