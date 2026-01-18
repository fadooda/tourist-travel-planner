import "dotenv/config";
import { Pool } from "@/node_modules/@types/pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.attraction.upsert({
    where: { slug: "giza-pyramids" },
    update: {},
    create: {
      slug: "giza-pyramids",
      title: "Pyramids of Giza",
      description: "Iconic ancient pyramids on the Giza Plateau.",
      location: "Giza, Egypt",
      type: "Historical",
      featured: true,
      heroImage: "/images/egypt/giza-hero.jpg",
      aboutImage: "/images/egypt/giza-about.jpg",
      tours: {
        create: [
          { title: "Sunrise Pyramids Tour", priceUSD: 45, durationMins: 180 },
          { title: "Pyramids + Sphinx Tour", priceUSD: 60, durationMins: 240 }
        ],
      },
    },
  });

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
