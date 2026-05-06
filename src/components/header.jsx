"use client";

import { useUser, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { LayoutDashboard, PenBox } from "lucide-react";

const Header = () => {
  const { isSignedIn } = useUser();

  return (
    <div className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b ">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href='/'>
          <Image src={"/logo.png"} alt="site logo" height={60} width={200}
            className="h-12 w-auto object-contain"
            priority
          />
        </Link>
        {/* Added flex and gap here to keep Dashboard and UserButton spaced correctly */}
        <div className="flex items-center gap-4">
          {isSignedIn && (
            <div className="flex items-center gap-2">
              {/* Dashboard Link */}
              <Link href={"/dashboard"}>
                <Button variant="outline" className="flex items-center gap-2">
                  <LayoutDashboard size={18} />
                  <span className="hidden md:inline">Dashboard</span>
                </Button>
              </Link>

              {/* Create Transaction Link */}
              <Link href={"/transaction/create"}>
                <Button className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white ">
                  <PenBox size={18} />
                  <span className="hidden md:inline">Add Transaction</span>
                </Button>
              </Link>
            </div>
          )}
          {!isSignedIn ? (
            <SignInButton forceRedirectUrl="/dashboard">
              <Button variant ="outline">Login</Button>
            </SignInButton>
          ) : (
            <UserButton appearance={{
              elements :{
                avatarBox : "w-10 h-10",
              }
            }} />
          )}
        </div>
    </nav>
  </div>
  );
};

export default Header;