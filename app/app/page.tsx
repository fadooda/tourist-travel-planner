import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AppHome() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold">My Dashboard</h1>
      <p className="mt-2 text-slate-600">
        Welcome back{session.user.name ? `, ${session.user.name}` : ""}.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <a
          href="/app/trips"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md"
        >
          <h2 className="text-lg font-semibold">My Trips</h2>
          <p className="mt-2 text-slate-600">View bookings and saved trips.</p>
        </a>

        <a
          href="/app/planner"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md"
        >
          <h2 className="text-lg font-semibold">Planner</h2>
          <p className="mt-2 text-slate-600">
            Build or edit your itinerary (manual + AI).
          </p>
        </a>
      </div>
    </main>
  );
}
