import { useMemo } from 'react';
import { VideoPlayerAds } from '@trackflix-live/ui';

export function LiveView() {
  const videoUrl = import.meta.env.VITE_TRACKIT_TV_LIVE || 'https://d2cg1811dvxahw.cloudfront.net/v1/master/5c6fd5e91d8ce30fe55ce2e06b2844b19691f50c/trackittv-mathis/index.m3u8';
  
  // MediaTailor configuration for client-side tracking (memoized to prevent re-renders)
  const mediaTailorConfig = useMemo(() => ({
    endpoint: import.meta.env.VITE_MEDIATAILOR_ENDPOINT,
    accountId: import.meta.env.VITE_MEDIATAILOR_ACCOUNT_ID,
    configName: import.meta.env.VITE_MEDIATAILOR_CONFIG_NAME,
    enableTracking: import.meta.env.VITE_MEDIATAILOR_TRACKING_ENABLED === 'true'
  }), []);

  // MediaTailor session URL construction (memoized)
  const sessionInitUrl = useMemo(() => {
    return mediaTailorConfig.enableTracking && 
      mediaTailorConfig.endpoint && 
      mediaTailorConfig.accountId && 
      mediaTailorConfig.configName
      ? `${mediaTailorConfig.endpoint}/v1/session/${mediaTailorConfig.accountId}/${mediaTailorConfig.configName}/index.m3u8`
      : undefined;
  }, [mediaTailorConfig]);

  return (
    <div
      className={
        'flex justify-center  w-screen h-full relative md:p-8 md:pt-16 p-2 pt-8'
      }
    >
      <div className={'w-full container max-w-[1000px]'}>
        <div className={'flex-grow w-full'}>
          {!videoUrl ? (
            <div className="text-center text-red-500 p-4">
              <p>No video URL configured</p>
              <p className="text-sm">Please set VITE_TRACKIT_TV_LIVE in your .env file</p>
            </div>
          ) : (
            <VideoPlayerAds
              src={videoUrl}
              enableMediaTailorTracking={true}
              mediaTailorSessionInitUrl={sessionInitUrl}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveView;
