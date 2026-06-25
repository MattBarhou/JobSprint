import { SignUp } from "@clerk/nextjs";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Sign Up",
  description: "Create a free Letterly account and generate AI cover letters for internships and tech jobs.",
  path: "/sign-up",
  noIndex: true,
});

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <SignUp />
    </div>
  );
}
