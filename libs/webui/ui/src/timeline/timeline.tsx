import {  CircleCheck } from 'lucide-react';
import  './timeline.css';

type TimelineProps = {
  steps: {
    text: string;
    loading?: boolean;
    completed?: boolean;
  }[];
}

export function Timeline({steps}: TimelineProps) {
  return (
    <div className="timeline-container timeline-left-aligned">
      <ul className="timeline timeline-vertical not-prose ">
      {steps.map((step, index) => (
        <li key={index}>
          {index > 0 && <hr className={`${step.completed ? 'bg-primary' : ''}`}/>}
          <div className="timeline-middle">
          <CircleCheck className={`${step.completed ? 'text-primary' : ''}`}  />
          </div>
          <div className="timeline-end timeline-box flex items-center">
            {step.text}
            {step.loading && <span className="loading loading-spinner loading-xs ml-2 text-primary"></span>
            }

          </div>
          {index < steps.length - 1 && <hr className={`${step.completed  ? 'bg-primary' : ''}`} />}
        </li>
      ))}
      </ul>
    </div>
  );
}

export default Timeline;
