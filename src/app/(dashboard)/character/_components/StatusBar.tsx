import classNames from "classnames";

import { Typography } from "@/components/typography";

export default function StatusBar({
  title,
  icon,
  current,
  max,
  barColor,
}: {
  title: string;
  icon: React.ReactNode;
  current: number;
  max: number;
  barColor: string;
}) {
  const percentageCalculator = (current: number, max: number) => {
    return (current / max) * 100;
  };
  return (
    <div className="flex flex-col gap-2">
      <Typography.Small className="text-primary-300 shrink-0">
        {title}
      </Typography.Small>
      <div className="flex items-center gap-3 text-sm">
        {icon}
        <div className="flex-1 w-full bg-primary-800 rounded-full h-2 overflow-hidden border border-primary-700">
          <div
            className={classNames("h-4", barColor)}
            style={{
              width: `${percentageCalculator(current, max)}%`,
            }}
          />
        </div>
        <Typography.Small className="text-primary-300 shrink-0 w-full max-w-16 text-right">
          {current.toFixed(0)} / {max}
        </Typography.Small>
      </div>
    </div>
  );
}
