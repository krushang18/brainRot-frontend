import SignupForm from '@/components/signup/SignupForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up | BrainRot',
  description: 'Create a new BrainRot account to get started.',
};

export default function SignupPage() {
  return (
    <div className="bg-alabaster-grey flex min-h-screen items-center justify-center p-4 md:p-8">
      <main className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="bg-granite flex h-12 items-center justify-center rounded-xl px-5 shadow-lg">
            <span className="text-xl font-bold tracking-wide text-white">BrainRot</span>
          </div>
        </div>
        <SignupForm />
      </main>
    </div>
  );
}
