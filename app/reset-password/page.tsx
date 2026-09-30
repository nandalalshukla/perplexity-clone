import { Suspense } from "react";
import ResetPasswordForm from "@/app/components/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#141414]" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
