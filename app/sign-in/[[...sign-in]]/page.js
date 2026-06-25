import { SignIn } from "@clerk/nextjs";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Sign In",
  description: "Sign in to Letterly to generate AI cover letters and application materials.",
  path: "/sign-in",
  noIndex: true,
});

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <SignIn />
    </div>
  );
}
