"use client";

import useSWR from "swr";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { fetcher } from "@/lib/api";
import type { TimeseriesEntry } from "@/lib/types";

function formatLocalHour(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatLocalDateTime(timestamp: string) {
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const chartConfig = {
  clean: {
    label: "Clean",
    color: "#34d399",
  },
  suspicious: {
    label: "Suspicious",
    color: "#fbbf24",
  },
  malicious: {
    label: "Malicious",
    color: "#f87171",
  },
};

export function TimeseriesChart() {
  const { data, isLoading } = useSWR<TimeseriesEntry[]>(
    "/api/stats/timeseries",
    fetcher,
    { refreshInterval: 10000 }
  );

  const chartData = (data ?? [])
    .slice()
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map((point) => ({
      ...point,
      localHour: formatLocalHour(point.timestamp),
    }));

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Request Volume</CardTitle>
        <CardDescription>
          TLS handshake requests over the last 24 hours
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-75 animate-pulse rounded bg-muted" />
        ) : (
          <ChartContainer config={chartConfig} className="h-75 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(220, 14%, 14%)"
                  vertical={false}
                />
                <XAxis
                  dataKey="localHour"
                  tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(220, 14%, 14%)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <ChartTooltip
                  labelFormatter={(_, payload) => {
                    const raw = payload?.[0]?.payload?.timestamp;
                    return raw ? formatLocalDateTime(raw) : "";
                  }}
                  content={<ChartTooltipContent />}
                />
                <Area
                  type="monotone"
                  dataKey="clean"
                  stackId="1"
                  stroke="#34d399"
                  fill="#34d399"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="suspicious"
                  stackId="1"
                  stroke="#fbbf24"
                  fill="#fbbf24"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="malicious"
                  stackId="1"
                  stroke="#f87171"
                  fill="#f87171"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
