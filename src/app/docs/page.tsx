import Link from "next/link";

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <section className="space-y-8">

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
            Explainer Video
          </h1>
        </div>


        <div style={{ position: "relative", paddingBottom: "56.25%", height: "0" }}>
          <iframe src="https://www.loom.com/embed/7329cb8363e54d58a543d71458b13dfc" allowFullScreen={true}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>

          </iframe>
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

