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
import { Progress } from "@/components/ui/progress";
import { fetcher } from "@/lib/api";
import type { FingerprintEntry } from "@/lib/types";

function fingerprintValue(fp: FingerprintEntry) {
  return fp.ja4_fingerprint || fp.ja3_hash;
}

export function CommonFingerprints() {
  const { data, isLoading } = useSWR<FingerprintEntry[]>(
    "/api/fingerprints/top-common",
    fetcher,
    { refreshInterval: 10000 }
  );

  const maxCount = data ? Math.max(...data.map((d) => d.count)) : 1;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Common Fingerprints</CardTitle>
        <CardDescription>
          Most frequently observed JA4 fingerprints
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
                <TableHead className="text-muted-foreground">Label</TableHead>
                <TableHead className="text-muted-foreground">
                  JA4 Hash
                </TableHead>
                <TableHead className="text-muted-foreground">
                  Frequency
                </TableHead>
                <TableHead className="text-right text-muted-foreground">
                  Avg Score
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((fp) => (
                <TableRow key={fingerprintValue(fp)} className="border-border/50">
                  <TableCell className="font-medium">{fp.label}</TableCell>
                  <TableCell
                    className="max-w-40 truncate font-mono text-xs text-muted-foreground"
                    title={fingerprintValue(fp)}
                  >
                    {fingerprintValue(fp)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Progress
                        value={(fp.count / maxCount) * 100}
                        className="h-2 w-24 bg-muted"
                      />
                      <span className="font-mono text-xs text-muted-foreground">
                        {fp.count.toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <ScorePill score={fp.avg_threat_score} />
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

function ScorePill({ score }: { score: number }) {
  let color = "text-emerald-400";
  if (score >= 70) color = "text-red-400";
  else if (score >= 40) color = "text-amber-400";

  return <span className={`font-mono text-sm font-semibold ${color}`}>{score}</span>;
}
