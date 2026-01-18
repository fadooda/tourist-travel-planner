import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import { getPrisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function AttractionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const prisma = getPrisma();
  const a = await prisma.attraction.findUnique({
    where: { slug },
    include: { tours: true },
  });

  if (!a) return notFound();

  return (
    <main>
      {/* HERO */}
      <section className="relative h-[420px] w-full overflow-hidden">
        <Image
          src={a.heroImage || "/images/egypt/giza-hero.jpg"}
          alt={a.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10" />

        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-4 pb-12">
          <div className="mb-3 inline-flex items-center gap-2 text-sm text-white/90">
            <MapPin className="h-4 w-4" />
            <span>{a.location}</span>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            {a.title}
          </h1>

          <p className="mt-3 max-w-2xl text-white/80">{a.description}</p>

          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/85">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              Type: {a.type}
            </span>

            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
              {a.tours.length} Tours Available
            </span>

            {a.featured && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1">
                <Star className="h-4 w-4" />
                Featured Attraction
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">
              About {a.title}
            </h2>
            <p className="mt-3 text-slate-600">{a.description}</p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-medium text-slate-900">Location</div>
                <div className="mt-2 text-slate-600">{a.location}</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-medium text-slate-900">Type</div>
                <div className="mt-2 text-slate-600">{a.type}</div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={a.aboutImage || "/images/egypt/giza-about.jpg"}
                alt={`${a.title} image`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
