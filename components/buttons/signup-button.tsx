import { Button } from "../ui/button"

export const SignupButton = () => {
  return (
      <Button variant={"outline"}>
      <a className="" href="/api/auth/signup">
        Sign Up
      </a>
      </Button>
    );
  };