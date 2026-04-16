import prisma from "../config/db";

interface ScrapedAd {
  headline?: string;
  primaryText?: string;
  ctaText?: string;
  imageUrl?: string;
  platform: string;
  adUrl?: string;
}

// Simulated ad templates based on common patterns
const adTemplates = [
  {
    headlines: [
      "Save Big This Season",
      "Limited Time Offer",
      "New Arrivals Just Dropped",
      "Exclusive Deal Inside",
      "Don't Miss Out",
    ],
    primaryTexts: [
      "Shop now and get up to 50% off on selected items. Free shipping on orders over $50.",
      "Discover our latest collection. Premium quality at unbeatable prices.",
      "Join millions of satisfied customers. See why everyone is switching.",
      "Limited stock available. Order now before it's gone!",
      "Transform your experience with our award-winning products.",
    ],
    ctas: ["Shop Now", "Learn More", "Get Started", "Sign Up", "Buy Now"],
  },
];

const generateAdsForCompetitor = (
  domain: string,
  competitorName: string,
): ScrapedAd[] => {
  const template = adTemplates[0];
  const numAds = Math.floor(Math.random() * 5) + 3; // 3-7 ads
  const ads: ScrapedAd[] = [];

  for (let i = 0; i < numAds; i++) {
    const headline =
      template.headlines[Math.floor(Math.random() * template.headlines.length)];
    const primaryText =
      template.primaryTexts[
        Math.floor(Math.random() * template.primaryTexts.length)
      ];
    const cta = template.ctas[Math.floor(Math.random() * template.ctas.length)];

    ads.push({
      headline: `${competitorName}: ${headline}`,
      primaryText: primaryText,
      ctaText: cta,
      platform: Math.random() > 0.5 ? "meta" : "google",
      imageUrl: `https://via.placeholder.com/400x300?text=${encodeURIComponent(competitorName)}`,
    });
  }

  return ads;
};

export const scrapeMetaAds = async (
  competitorId: string,
  domain: string,
): Promise<ScrapedAd[]> => {
  const competitor = await prisma.competitor.findUnique({
    where: { id: competitorId },
  });

  const competitorName = competitor?.name || domain.split(".")[0];
  const ads: ScrapedAd[] = [];

  try {
    // Generate simulated ads
    const scrapedAds = generateAdsForCompetitor(domain, competitorName);

    // Save ads to database
    for (const adData of scrapedAds) {
      await prisma.ad.create({
        data: {
          competitorId,
          platform: adData.platform,
          headline: adData.headline,
          primaryText: adData.primaryText,
          ctaText: adData.ctaText,
          imageUrl: adData.imageUrl,
          status: "active",
        },
      });
      ads.push(adData);
    }

    console.log(`Generated ${ads.length} sample ads for ${domain}`);
  } catch (error) {
    console.error("Ad generation error:", error);
  }

  return ads;
};

export const scrapeCompetitorAds = async (
  competitorId: string,
): Promise<ScrapedAd[]> => {
  const competitor = await prisma.competitor.findUnique({
    where: { id: competitorId },
  });

  if (!competitor) {
    throw new Error("Competitor not found");
  }

  // Clear old ads before generating new ones
  await prisma.ad.deleteMany({
    where: { competitorId },
  });

  return scrapeMetaAds(competitorId, competitor.domain);
};
