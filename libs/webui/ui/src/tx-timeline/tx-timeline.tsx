import { DateTime } from 'luxon';
import { useState, useEffect } from 'react';

type Step = {
  title: string;
  datetime?: string;
}

interface TxTimelineProps {
  steps: Step[];
}

function formatDateTime(datetime?: string): string {
  if (!datetime) return '--';
  const dt = DateTime.fromISO(datetime);
  return dt.isValid 
    ? dt.toFormat('hh:mm:ss a\nMM/dd/yyyy')
    : '--';
}

function TxTimelineStep({ step, percentage }: { step: Step, percentage: number }) {
  return (
    <div 
      className="absolute flex flex-col items-center" 
      style={{
        left: `${percentage}%`, 
        top: '-34px',
        transform: 'translateX(-50%)'
      }}>
      {/* Title above the line */}
      <div className="text-center h-[28px] font-bold text-base-content">{step.title}</div>
      
      {/* Vertical line - hidden for first and last steps */}
      <div className={`w-[2px] h-[28px] ${percentage === 0 || percentage === 100 ? 'bg-transparent' : 'bg-base-content'}`}></div>
      
      {/* Datetime below the line */}
      <div className="text-xs mt-1 text-center whitespace-pre text-base-content">{formatDateTime(step.datetime)}</div>
    </div>
  );
}

function calculateProgress(steps: Step[]): number {
  const now = DateTime.now();
  
  // Process steps to get valid datetimes
  const processedSteps = steps.map((step, index) => {
    if (step.datetime) return DateTime.fromISO(step.datetime);
    if (index === 0) return now.minus({ minutes: 30 });
    return DateTime.fromISO(steps[index - 1].datetime || '').plus({ minutes: 30 });
  });

  // Find which segment we're in
  for (let i = 0; i < processedSteps.length - 1; i++) {
    const currentPhaseTime = processedSteps[i];
    const nextPhaseTime = processedSteps[i + 1];
    
    if (now >= currentPhaseTime && now <= nextPhaseTime) {
      // Calculate progress within this segment
      const segmentDuration = nextPhaseTime.diff(currentPhaseTime, 'milliseconds').milliseconds;
      const currentDuration = now.diff(currentPhaseTime, 'milliseconds').milliseconds;
      const segmentProgress = (currentDuration / segmentDuration);
      
      // Convert segment progress to overall progress
      const segmentSize = 100 / (steps.length - 1);
      return (i * segmentSize) + (segmentProgress * segmentSize);
    }
  }

  // If we're before the first step
  if (now < processedSteps[0]) return 0;
  // If we're after the last step
  return 100;
}

export function TxTimeline({ steps }: TxTimelineProps) {
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    // Initial calculation
    setProgress(calculateProgress(steps));

    // Update every second
    const interval = setInterval(() => {
      setProgress(calculateProgress(steps));
    }, 50);

    return () => clearInterval(interval);
  }, [steps]);

  return (
    <div className="relative h-[16px] flex items-center">
      {/* Progress bar */}
      <progress 
        className="progress progress-primary w-full h-[16px] absolute top-0 left-0 m-0" 
        value={progress} 
        max="100"
      />
      
      {/* Steps */}
      {steps.map((step, index) => (
        <TxTimelineStep 
          key={index} 
          step={step} 
          percentage={index === 0 ? 0 : index === steps.length - 1 ? 100 : (index / (steps.length - 1)) * 100} 
        />
      ))}
    </div>
  );
}

export default TxTimeline;
