import type { Metadata } from "next";
import Link from "next/link";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "3 × 3 Goals",
  description: "Organise your goals from yearly vision to daily focus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased text-slate-800`}
        >
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <header className="border-b border-indigo-100 bg-white/90 shadow-sm backdrop-blur">
              <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-2xl">
                    🎯
                  </span>
                  <div>
                    <Link href="/" className="text-2xl font-bold text-slate-900">
                      Tiered Goals
                    </Link>
                    <p className="text-sm text-slate-500">
                      Align yearly vision with daily execution.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <SignedOut>
                    <div className="flex items-center gap-3">
                      <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                        <button className="rounded-full border border-blue-200 bg-white px-5 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50">
                          Sign in
                        </button>
                      </SignInButton>
                      <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                        <button className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                          Create account
                        </button>
                      </SignUpButton>
                    </div>
                  </SignedOut>
                  <SignedIn>
                    <div className="flex items-center gap-3">
                      <UserButton
                        appearance={{
                          elements: {
                            userButtonAvatarBox: "h-10 w-10",
                          },
                        }}
                      />
                    </div>
                  </SignedIn>
                </div>
              </div>
            </header>
            <div className="pb-16">{children}</div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
