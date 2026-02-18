// Statistics Card
export const StatCard = ({
  value,
  label,
  color = "text-gray-900",
}: {
  value: number;
  label: string;
  color?: string;
}) => (
  <div className="rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    <div className="text-xs text-gray-500 sm:text-sm">{label}</div>
  </div>
);