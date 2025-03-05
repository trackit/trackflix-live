import { EventStatus } from '@trackflix-live/types';
import { CloudCog, Play, Check, CheckCheck } from 'lucide-react';

type StatusBadgeProps = {
  status: EventStatus;
  size?: 'sm' | 'default';
};

export function StatusBadge({ status, size = 'default' }: StatusBadgeProps) {
  const getStatusColorClass = (status: EventStatus | undefined) => {
    switch (status) {
      case 'PRE-TX':
        return 'border-info text-info';
      case 'TX':
        return 'border-error text-error';
      case 'POST-TX':
      case 'ENDED':
        return 'border-success text-success';
      default:
        return 'border-gray-500 text-gray-500';
    }
  };

  const getStatusIcon = (status: EventStatus | undefined) => {
    switch (status) {
      case 'PRE-TX':
        return <CloudCog className="w-4 h-4" />;
      case 'TX':
        return <Play className="w-4 h-4" />;
      case 'POST-TX':
        return <Check className="w-4 h-4" />;
      case 'ENDED':
        return <CheckCheck className="w-4 h-4" />;
    }
  };

  return (
    <div
      className={`flex bg-base-100 items-center gap-2 text-center  border rounded-lg ${
        size === 'sm'
          ? 'p-1 px-2 text-xs font-bold'
          : 'p-2 text-sm font-extrabold'
      } ${getStatusColorClass(status)}`}
    >
      {getStatusIcon(status)}
      {status === 'TX' ? 'ON AIR (TX)' : status}
    </div>
  );
}

export default StatusBadge;
