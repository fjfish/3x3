import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PricingTable } from '@clerk/nextjs'

export default async function SubscribePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
            Subscription
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Manage your subscription and billing details.
          </p>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Using this software is always free. You can subscribe to support the development and keep the servers running. Thank you!
          </p>
        </div>

        <div className="rounded-2xl border border-indigo-100 bg-white p-8 shadow-sm">
          <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
            <PricingTable />
          </div>
        </div>

        <div className="flex justify-center">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}

