import { absoluteUrl, getSiteUrl } from "@/lib/seo";

export default function sitemap() {
  const lastModified = new Date();

  return [
    {
      url: getSiteUrl(),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/pricing"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
