"use client";
import { SignUp } from "@clerk/nextjs";


const SignUpPage = () => {

  return (
    <div className="mt-10 flex justify-center">
      <SignUp  />
    </div>
  );
};

export default SignUpPage;
