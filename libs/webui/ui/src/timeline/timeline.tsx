import { Check, CircleCheck, CircleMinus } from 'lucide-react';
import './timeline.css';
import { DateTime } from 'luxon';

export type TimelineStep = {
  text: string;
  datetime?: string;
  loading?: boolean;
  completed?: boolean;
};

export type TimelineProps = {
  steps: TimelineStep[];
};

export function Timeline({ steps }: TimelineProps) {
  return (
    <div className="timeline-container timeline-left-aligned">
      <ul className="timeline timeline-vertical not-prose ">
        {steps.map((step, index) => (
          <li key={index}>
            {index > 0 && (
              <hr className={`${step.completed ? 'bg-primary' : ''}`} />
            )}
            <div className="timeline-middle">
              {step.completed && !step.loading && (
                <CircleCheck
                  className={`${step.completed ? 'text-primary' : ''}`}
                />
              )}
              {step.loading && (
                <div className="loading loading-ring loading-md mt-1"></div>
              )}
              {!step.completed && !step.loading && (
                <CircleMinus className="text-base-content/30" />
              )}
            </div>
            <div className="timeline-end timeline-box flex items-center border-none shadow-none">
              <span
                className={`${
                  step.completed || step.loading
                    ? 'text-base-content'
                    : 'text-base-content/50'
                }`}
              >
                {step.text}
                {step.datetime && (
                  <>
                    <br />
                    <div className="text-xs text-base-content/50 flex items-center gap-2">
                      {DateTime.fromISO(step.datetime).toLocaleString(
                        DateTime.TIME_WITH_SECONDS
                      )}
                    </div>
                  </>
                )}
              </span>
              {/* {step.loading && (
                <span className="loading loading-spinner loading-xs ml-2 text-primary"></span>
              )} */}
            </div>
            {index < steps.length - 1 && (
              <hr className={`${step.completed ? 'bg-primary' : ''}`} />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Timeline;
