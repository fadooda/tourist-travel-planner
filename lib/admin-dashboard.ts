//lib/admin-dashboard.ts
import { getPrismaAuth } from "@/lib/prisma-auth";

const prisma = getPrismaAuth();

export type DashboardData = {
  totalRevenue: number;
  totalBookings: number;
  activeTours: number;
  totalUsers: number;
  statusDistribution: { status: string; count: number }[];
  revenueTrend: { month: string; revenue: number }[];
  topTours: { title: string; bookings: number }[];
  recentBookings: {
    id: string;
    customerName: string;
    customerEmail: string;
    tourTitle: string;
    status: string;
    amount: number;
    date: string;
  }[];
};

function startFromRange(range: string | undefined) {
  const now = new Date();
  const msDay = 24 * 60 * 60 * 1000;

  if (range === "30d") return new Date(now.getTime() - 30 * msDay);
  if (range === "90d") return new Date(now.getTime() - 90 * msDay);
  return new Date(now.getTime() - 7 * msDay); // default 7d
}

export async function getAdminDashboardData(range?: string): Promise<DashboardData> {
  const start = startFromRange(range);

  const [
    totalBookings,
    totalUsers,
    activeTours,
    revenueAgg,
    statusGroups,
    topTourGroups,
    recent,
    paidForTrend,
  ] = await Promise.all([
    prisma.booking.count({ where: { createdAt: { gte: start } } }),
    prisma.user.count(),
    prisma.tour.count({ where: { isActive: true } }),
    prisma.booking.aggregate({
      _sum: { amount: true },
      where: { createdAt: { gte: start } }, // add paymentStatus: "PAID" if you have it
    }),
    prisma.booking.groupBy({
      by: ["status"],
      _count: { _all: true },
      where: { createdAt: { gte: start } },
    }),
    prisma.booking.groupBy({
      by: ["tourId"],
      _count: { _all: true },
      where: { createdAt: { gte: start } },
      orderBy: { _count: { _all: "desc" } },
      take: 5,
    }),
    prisma.booking.findMany({
      where: { createdAt: { gte: start } },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: true, tour: true },
    }),
    prisma.booking.findMany({
      where: { createdAt: { gte: new Date(new Date().setMonth(new Date().getMonth() - 5)) } },
      select: { amount: true, createdAt: true },
    }),
  ]);

  const statusDistribution = statusGroups.map((g) => ({
    status: String(g.status),
    count: g._count._all,
  }));

  const tourIds = topTourGroups.map((g) => g.tourId);
  const tours = await prisma.tour.findMany({
    where: { id: { in: tourIds } },
    select: { id: true, title: true },
  });
  const titleById = new Map(tours.map((t) => [t.id, t.title]));

  const topTours = topTourGroups.map((g) => ({
    title: titleById.get(g.tourId) ?? "Unknown tour",
    bookings: g._count._all,
  }));

  // Revenue trend (last ~6 months) - JS aggregation
  const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const trendMap = new Map<string, number>();
  for (const b of paidForTrend) {
    const k = monthKey(b.createdAt);
    trendMap.set(k, (trendMap.get(k) ?? 0) + (b.amount ?? 0));
  }
  const revenueTrend = Array.from(trendMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, revenue]) => ({ month: k, revenue }));

  const recentBookings = recent.map((b) => ({
    id: b.id,
    customerName: b.user?.name ?? "Customer",
    customerEmail: b.user?.email ?? "",
    tourTitle: b.tour?.title ?? "Tour",
    status: String(b.status),
    amount: b.amount ?? 0,
    date: new Intl.DateTimeFormat("en-GB").format(b.createdAt),
  }));

  return {
    totalRevenue: revenueAgg._sum.amount ?? 0,
    totalBookings,
    activeTours,
    totalUsers,
    statusDistribution,
    revenueTrend,
    topTours,
    recentBookings,
  };
}
