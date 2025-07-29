"use client";
import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <div className="mt-10 flex justify-center">
      <SignIn
        appearance={{
          elements: {
            footerAction: { display: "none" },
          },
        }}
      />
    </div>
  );
};

export default SignInPage;
