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

function fingerprintValue(req: TLSRequest) {
  return req.ja4_fingerprint || req.ja3_hash;
}

export function TopThreats() {
  const { data, isLoading } = useSWR<TLSRequest[]>(
    "/api/requests/top-threats",
    fetcher,
    { refreshInterval: 10000 }
  );

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Top Threats</CardTitle>
        <CardDescription>
          Highest threat scores detected in the last 24 hours
        </CardDescription>
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
                <TableHead className="text-muted-foreground">Score</TableHead>
                <TableHead className="text-muted-foreground">
                  Signature
                </TableHead>
                <TableHead className="text-muted-foreground">Source</TableHead>
                <TableHead className="text-muted-foreground">
                  JA4 Hash
                </TableHead>
                <TableHead className="text-right text-muted-foreground">
                  Verdict
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((req) => (
                <TableRow key={req.id} className="border-border/50">
                  <TableCell>
                    <span className="font-mono text-sm font-bold text-red-400">
                      {req.threat_score}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {req.matched_signature ?? "Unknown"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {req.source_ip}
                  </TableCell>
                  <TableCell
                    className="max-w-40 truncate font-mono text-xs text-muted-foreground"
                    title={fingerprintValue(req)}
                  >
                    {fingerprintValue(req)}
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
