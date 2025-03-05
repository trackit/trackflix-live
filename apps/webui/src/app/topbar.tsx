import { ThemeSwitcher, Clock } from '@trackflix-live/ui';
import { signOut, getCurrentUser } from 'aws-amplify/auth';
import { User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';

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
      <Link to="/">
        <div className="flex items-center gap-2 ml-8">
          <svg
            className="fill-[#DA3E38] dark:fill-white w-10 h-10"
            viewBox="0 0 53 38"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M30.1822 0.0100455C28.0922 0.171117 26.3126 0.638617 24.7255 1.45183C23.0205 2.32397 21.5787 3.58897 20.2312 5.40005C19.2451 6.72397 18.4908 8.33076 18.0626 9.99255C18.0312 10.1183 17.9997 10.1615 17.9447 10.1615C17.9015 10.1615 17.6147 10.1065 17.3083 10.0397C14.8844 9.52505 12.5626 9.5879 10.3155 10.2322C5.94295 11.4933 2.41903 14.9268 0.839741 19.4722C0.207241 21.2833 -0.0874022 23.3379 0.0225978 25.1215C0.0893835 26.1429 0.242598 27.1408 0.466526 27.9658L0.505812 28.115L6.36724 28.1072C12.2247 28.0954 12.2287 28.0954 12.4055 28.0129C12.7669 27.844 13.093 27.4158 13.643 26.3865C14.0555 25.6125 14.2794 25.2983 14.743 24.8308C15.0612 24.5086 15.1947 24.4065 15.458 24.2768C16.4126 23.7975 17.2612 24.0647 17.7365 24.9918C18.1294 25.7658 18.2944 26.5868 18.4751 28.724C18.6165 30.3779 18.6794 30.7275 18.864 30.9004C19.029 31.0575 19.139 30.9436 19.2569 30.4918C19.3944 29.9615 19.4808 29.1875 19.7126 26.3865C19.8776 24.4104 20.0112 23.1061 20.1487 22.1633C20.3451 20.7804 20.6555 19.5822 20.958 19.044C21.398 18.2543 22.2505 17.8654 23.0715 18.0815C24.1637 18.3643 24.918 19.6843 25.2715 21.9236C25.3776 22.6033 26.2262 26.8225 26.6269 28.665C27.4322 32.3658 27.7505 33.4108 28.0726 33.3715C28.3044 33.344 28.4694 32.8961 28.7287 31.5918C29.0862 29.8043 29.4005 27.734 29.9072 23.8368C30.194 21.6447 30.2097 21.519 30.3237 20.7883C30.7283 18.1797 31.2744 16.7379 32.119 16.07C32.6337 15.6654 33.278 15.4572 33.8044 15.5318C34.5547 15.6418 35.2147 16.1997 35.5565 17.0208C35.9337 17.9165 36.1615 19.5822 36.2519 22.0258C36.3265 24.0883 36.4483 24.9683 36.7783 25.8915C36.9826 26.469 37.2026 26.8265 37.5876 27.2154C38.1337 27.7654 38.6994 27.9933 39.7208 28.0758C40.0665 28.1033 42.3333 28.115 46.4662 28.1072L52.689 28.0954L52.7165 27.9579C52.8815 27.1761 52.9247 25.4908 52.8108 24.5204C52.5751 22.5247 51.8837 20.6783 50.7601 19.0518C49.283 16.9108 47.1026 15.2765 44.6394 14.4593L44.0894 14.2786V13.1511C44.0894 11.949 44.0462 11.4972 43.8458 10.5347C43.3351 8.06362 42.1801 5.87933 40.4358 4.07612C39.2533 2.85826 38.1926 2.07647 36.743 1.36147C35.3405 0.670046 33.9615 0.261474 32.4215 0.0846884C31.9187 0.0257598 30.5633 -0.0213831 30.1822 0.0100455Z" />
            <path d="M22.5097 21.6997C22.2897 22.5208 22.1601 23.3811 21.9715 25.2472C21.6847 28.119 21.4647 29.6433 21.1662 30.8297C20.734 32.5504 20.2076 33.3558 19.3158 33.6583C19.1076 33.725 19.0054 33.7368 18.7187 33.7211C18.0115 33.6818 17.5362 33.3125 17.1394 32.5033C16.7308 31.6625 16.5147 30.6333 16.2751 28.3665C16.1729 27.3725 16.1179 27.0975 16.0276 27.0622C15.9372 27.0308 15.8508 27.1604 15.4815 27.8911C14.9276 28.9872 14.4719 29.5883 13.8904 29.989C13.3444 30.3661 12.9004 30.5429 12.1815 30.6686C11.7612 30.7433 11.5451 30.7472 6.65402 30.7472H1.56259L1.76688 31.0929C2.72152 32.7193 4.06116 34.1808 5.63259 35.3122C6.98795 36.2904 8.47295 37.0486 9.62009 37.3472C10.5983 37.5986 9.20366 37.5829 27.1179 37.5829C41.8776 37.5868 43.4569 37.5829 43.7751 37.524C44.5647 37.3865 45.374 37.1075 46.2108 36.6872C48.5169 35.5361 50.3829 33.6858 51.5615 31.3915L51.8915 30.7472H46.1637C40.2983 30.7472 39.5205 30.7315 38.8133 30.594C37.7487 30.3858 36.8569 29.9065 35.969 29.0618C34.6529 27.8125 34.0362 26.1861 33.9144 23.6561C33.879 22.8822 33.9772 22.9686 33.1365 22.9686H32.4176L32.3272 23.7425C31.8204 28.1504 31.4904 30.2561 31.019 32.1025C30.359 34.6993 29.5222 35.9604 28.2965 36.2079C27.8329 36.3022 27.2554 36.1725 26.8037 35.87C26.399 35.6029 26.1004 35.2297 25.8019 34.6168C24.9965 32.9825 24.0144 28.9086 22.934 22.7722C22.7179 21.5425 22.6944 21.4286 22.6315 21.409C22.6079 21.4011 22.5529 21.5308 22.5097 21.6997Z" />
          </svg>
          <h1 className="text-2xl font-bold tracking-widest text-black dark:text-white">
            Trackflix Live
          </h1>
        </div>
      </Link>
      <div className="flex items-center gap-4 mr-8">
        <ThemeSwitcher />

        <div className="dropdown dropdown-end">
          <button className="btn btn-link btn-sm text-black dark:text-white">
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
        <Clock />
      </div>
    </div>
  );
};

export default Topbar;
