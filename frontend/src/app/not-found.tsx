'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Custom404 = () => {
  const router = useRouter();
  const to = '/dashboard';
  const delay = 0;

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace(to);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [router]);

  return null;
};

export default Custom404;
