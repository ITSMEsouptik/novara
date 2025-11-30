import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white px-4">
      <div className="text-center space-y-8 max-w-2xl">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          Turn your website link into a{' '}
          <span className="text-[var(--color-primary)]">month of video ads.</span>
        </h1>
        
        <p className="text-xl text-[var(--color-text-secondary)]">
          Your autonomous creative team engineering ads that turn clicks into customers.
        </p>

        <div className="pt-4">
          <Link
            href="/create"
            className="inline-block bg-[var(--color-primary)] text-black font-bold rounded-full px-8 py-4 hover:scale-105 transition-transform duration-200 shadow-[0_0_20px_rgba(0,229,153,0.3)]"
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}
