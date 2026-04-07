export interface QuickStat {
  label: string;
  value: string;
  valueClassName: string;
}

export const DASHBOARD_QUICK_STATS: QuickStat[] = [
  { label: "Total Runs", value: "127", valueClassName: "text-primary" },
  { label: "Efficiency", value: "98%", valueClassName: "text-success" },
  { label: "m² Cleaned", value: "3.2k", valueClassName: "text-foreground" },
  { label: "Total Runtime", value: "48h", valueClassName: "text-foreground" },
];
