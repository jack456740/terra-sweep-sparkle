import { DASHBOARD_QUICK_STATS } from "@/features/dashboard/quickStats";

export function DashboardQuickStats(): JSX.Element {
  return (
    <div className="mt-8 glass rounded-2xl p-6 shadow-card">
      <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
        Quick Stats
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {DASHBOARD_QUICK_STATS.map((stat) => (
          <div key={stat.label} className="text-center p-4 bg-secondary/50 rounded-xl">
            <p className={`font-heading text-2xl font-bold ${stat.valueClassName}`}>
              {stat.value}
            </p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
