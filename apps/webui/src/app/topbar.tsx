import { ThemeSwitcher } from '@trackflix-live/ui';
import { signOut, getCurrentUser } from 'aws-amplify/auth';
import { User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const Topbar = () => {
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        setUsername(user.signInDetails?.loginId || '');
      })
      .catch(console.error);
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  return (
    <div className="w-full h-16 flex items-center justify-between">
      <h1 className="text-2xl font-bold tracking-widest text-black dark:text-white ml-8">
        Trackflix Live
      </h1>
      <div className="flex items-center gap-4 mr-8">
        <ThemeSwitcher />

        <div className="dropdown dropdown-end">
          <button className="btn btn-outline btn-sm">
            <User className="w-4 h-4" />
            {username}
          </button>
          <ul
            tabIndex={0}
            className="dropdown-content z-[1] menu shadow bg-base-100 rounded-box shadow"
          >
            <li>
              <button className="btn btn-link" onClick={handleSignOut}>
                Sign out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
