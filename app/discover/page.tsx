import Image from "next/image";
import Link from "next/link";
import { getPrisma } from "@/lib/prisma";

export default async function DiscoverPage() {
  const prisma = getPrisma();
  const attractions = await prisma.attraction.findMany({
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 24,
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Discover</h1>
          <p className="mt-2 text-slate-600">
            Find attractions and add them to your trip plan.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {attractions.map((a) => (
          <Link
            key={a.id}
            href={`/attractions/${a.slug}`}
            className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden">
              <Image
                src={a.heroImage || "/images/egypt/giza-hero.jpg"}
                alt={a.title}
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
              />
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">{a.title}</h2>
                {a.featured && (
                  <span className="rounded-full bg-slate-900 px-2 py-1 text-xs text-white">
                    Featured
                  </span>
                )}
              </div>

              <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                {a.description}
              </p>

              <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                <span>{a.location}</span>
                <span>{a.type}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
