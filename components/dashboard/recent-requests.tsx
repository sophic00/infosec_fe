"use client";

import useSWR from "swr";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ThreatBadge } from "@/components/dashboard/threat-badge";
import { fetcher } from "@/lib/api";
import type { TLSRequest } from "@/lib/types";

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function fingerprintValue(req: TLSRequest) {
  return req.ja4_fingerprint || req.ja3_hash;
}

export function RecentRequests() {
  const { data, isLoading } = useSWR<TLSRequest[]>(
    "/api/requests/recent",
    fetcher,
    { refreshInterval: 5000 }
  );

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Recent Requests</CardTitle>
        <CardDescription>Last 10 captured TLS handshakes</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-muted" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-muted-foreground">Time</TableHead>
                <TableHead className="text-muted-foreground">Source</TableHead>
                <TableHead className="text-muted-foreground">JA4 Hash</TableHead>
                <TableHead className="text-right text-muted-foreground">
                  Score
                </TableHead>
                <TableHead className="text-right text-muted-foreground">
                  Verdict
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((req) => (
                <TableRow key={req.id} className="border-border/50">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatTime(req.timestamp)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {req.source_ip}
                  </TableCell>
                  <TableCell
                    className="max-w-45 truncate font-mono text-xs text-muted-foreground"
                    title={fingerprintValue(req)}
                  >
                    {fingerprintValue(req)}
                  </TableCell>
                  <TableCell className="text-right">
                    <ThreatScore score={req.threat_score} />
                  </TableCell>
                  <TableCell className="text-right">
                    <ThreatBadge verdict={req.verdict} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function ThreatScore({ score }: { score: number }) {
  let color = "text-emerald-400";
  if (score >= 70) color = "text-red-400";
  else if (score >= 40) color = "text-amber-400";

  return <span className={`font-mono text-sm font-semibold ${color}`}>{score}</span>;
}
