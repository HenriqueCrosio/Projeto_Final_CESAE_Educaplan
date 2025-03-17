import React from "react";
import Link from "next/link";
import Image from "next/image";

export const NavBarBrand: React.FC = () => {
  return (
    <div className="flex items-center ml-[6px]">
      <Link href="/">
        <Image
          className="h-8 w-8"
          src="https://cdn.auth0.com/blog/hub/code-samples/hello-world/auth0-logo.svg"
          alt="Auth0 shield logo"
          width={32}
          height={32}
        />
      </Link>
    </div>
  );
};
