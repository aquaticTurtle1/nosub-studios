import { catalog, listSummaries } from "@/lib/catalog/registry";

export async function GET() {
  return Response.json({
    generatedAt: catalog.generatedAt,
    pricingFetchedAt: catalog.pricingFetchedAt,
    models: listSummaries(),
  });
}
