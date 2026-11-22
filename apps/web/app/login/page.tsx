import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { CardSkeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Tizimga kirish — AutoChannel",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<CardSkeleton lines={6} />}>
      <LoginForm />
    </Suspense>
  );
}

