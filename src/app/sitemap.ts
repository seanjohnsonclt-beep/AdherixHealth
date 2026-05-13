import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://adherixhealth.com"
  return [
    { url: base,               lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: base + "/about",    lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: base + "/platform", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: base + "/roi",      lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: base + "/pilot",    lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: base + "/privacy",  lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: base + "/terms",    lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: base + "/security", lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ]
}
