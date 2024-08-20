import { signIn } from "next-auth/react";
import { providerMap } from "@/auth";

const Provider = ({ provider }: { provider: string }) => {
  return (
    <div
      className="flex bg-gray-100 hover:bg-gray-300 p-3 rounded cursor-pointer
        transition-colors duration-300 ease-in-out shadow-md"
    >
      <button
        onClick={() => signIn(provider)}
        className="flex justify-center w-full"
      >
        Sign in with {provider}
      </button>
    </div>
  );
}

export default function Login() {
  return (
    <div className="flex items-center justify-center pt-5 flex-col bg-white">
      <img src="/trackit-logo.png" alt="Trackit logo" className="h-12 w-auto flex-center" />
      <span className="pb-5">
        <h1 className="text-2xl font-bold text-center pt-5">Sign in to Trackflix Live</h1>
      </span>
      <div className="bg-gray-50 p-5 rounded shadow-lg">
        <p className="text-center">Choose an account to sign in with</p>
        <div className="pt-5">
          {providerMap.map((provider) => (
            <Provider key={provider.id} provider={provider.id} />
          ))}
        </div>
      </div>
    </div>
  );
}
