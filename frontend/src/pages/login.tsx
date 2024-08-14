import '@/styles/globals.css'
import { signIn } from "next-auth/react";

export default function SignInComponent() {
  return (
    // <div className="flex h-screen">
    //     <button className="flex" onClick={() => signIn('cognito')}>
    //       Sign In
    //     </button>
    // </div>
    <div>
      <div className="h-screen flex items-center justify-center text-red-50">
          <span className="text-red-50">Horizontally and Vertically Centered Element</span>
      </div>
  </div>
  );
}
