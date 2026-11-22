import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { CardSkeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Tizimga kirish — AutoChannel",
};

export default function LoginPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <Suspense fallback={<CardSkeleton lines={6} />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
