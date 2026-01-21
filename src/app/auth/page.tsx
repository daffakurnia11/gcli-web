import Image from "next/image";

import Login from "./_components/Login";

export default function AuthPage() {
  return (
    <main className="relative bg-primary-900 h-full min-h-dvh text-gray-dark flex items-center justify-center">
      {/* Background Image - Los Santos/City Style */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://i.pinimg.com/1200x/55/21/d9/5521d959336374299af9f8be9382ba47.jpg"
          width={0}
          height={0}
          sizes="100vw"
          alt="Los Santos Background"
          className="w-full h-full object-cover"
        />
        {/* Dark overlay to ensure text readability */}
        <div className="absolute inset-0 bg-primary-900/70" />
        <div className="absolute inset-0 bg-linear-to-t from-primary-900 via-transparent to-primary-900/60" />
        <div className="absolute inset-0 bg-linear-to-b from-primary-900/50 via-transparent to-primary-900" />
      </div>
      <Login />
    </main>
  );
}
