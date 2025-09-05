"use client";
import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <div className="mt-10 flex justify-center">
      <SignIn
        signUpUrl="/sign-up"
        signInUrl="/sign-in"
      />
    </div>
  );
};


export default SignInPage;
