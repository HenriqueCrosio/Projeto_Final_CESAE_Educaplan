import { Button } from "../ui/button"

export const LoginButton = () => {
  return (
      <Button variant={"ghost"}>
      <a className="" href="/api/auth/login">
        Log In
      </a>
      </Button>
    );
  };