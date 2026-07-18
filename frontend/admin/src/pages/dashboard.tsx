import { useGetAdminStats, useListAdminMessages } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format, subDays, isSameDay, differenceInCalendarDays } from "date-fns";
import { Inbox, LayoutTemplate, Activity, TrendingUp, Clock3 } from "lucide-react";
import { Link } from "wouter";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  LabelList,
} from "recharts";

const messagesChartConfig = {
  count: {
    label: "Messages",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const freshnessChartConfig = {
  days: {
    label: "Days since update",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function Dashboard() {
  const { data: stats, isLoading, error } = useGetAdminStats();
  const { data: messages, isLoading: messagesLoading } = useListAdminMessages();

  const messagesByDay = (() => {
    const days = Array.from({ length: 14 }).map((_, i) => subDays(new Date(), 13 - i));
    return days.map((day) => ({
      date: format(day, "MMM d"),
      count: (messages || []).filter((m) => isSameDay(new Date(m.createdAt), day)).length,
    }));
  })();

  const sectionFreshness = (stats?.sections || [])
    .map((sec) => ({
      section: sec.section.charAt(0).toUpperCase() + sec.section.slice(1),
      days: Math.max(0, differenceInCalendarDays(new Date(), new Date(sec.updatedAt))),
    }))
    .sort((a, b) => a.days - b.days);

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Messages — Last 14 Days
            </CardTitle>
            <CardDescription className="font-mono text-xs">Contact form submissions over time</CardDescription>
          </CardHeader>
          <CardContent>
            {messagesLoading ? (
              <Skeleton className="h-[220px] w-full" />
            ) : (
              <ChartContainer config={messagesChartConfig} className="h-[220px] w-full">
                <AreaChart data={messagesByDay} margin={{ left: -20, right: 12, top: 8 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval={1}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} width={30} />
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                  <Area
                    dataKey="count"
                    type="monotone"
                    fill="var(--color-count)"
                    fillOpacity={0.2}
                    stroke="var(--color-count)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-primary" />
              Content Freshness
            </CardTitle>
            <CardDescription className="font-mono text-xs">Days since each section was last edited</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[220px] w-full" />
            ) : sectionFreshness.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground font-mono">
                No sections yet
              </div>
            ) : (
              <ChartContainer config={freshnessChartConfig} className="h-[220px] w-full">
                <BarChart
                  data={sectionFreshness}
                  layout="vertical"
                  margin={{ left: 0, right: 24, top: 4, bottom: 4 }}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" dataKey="days" tickLine={false} axisLine={false} allowDecimals={false} hide />
                  <YAxis
                    type="category"
                    dataKey="section"
                    tickLine={false}
                    axisLine={false}
                    width={90}
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" hideLabel />}
                  />
                  <Bar dataKey="days" fill="var(--color-days)" radius={[0, 4, 4, 0]}>
                    <LabelList
                      dataKey="days"
                      position="right"
                      className="fill-foreground"
                      fontSize={11}
                      formatter={(v: number) => `${v}d`}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
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
