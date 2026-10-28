import { notFound } from "next/navigation";
import { Suspense } from "react";
import { GenerationPage } from "@/components/app/generation/generation-page";
import { TOOLS, toolById } from "@/lib/catalog/tools";

export function generateStaticParams() {
  return TOOLS.map((t) => ({ tool: t.id }));
}

export async function generateMetadata({ params }: PageProps<"/tools/[tool]">) {
  const t = toolById((await params).tool);
  return { title: `${t?.name ?? "Tool"} · Studio` };
}

// The tool id is URL data: it resolves behind Suspense so the page shell stays instant.
export default function Page({ params }: PageProps<"/tools/[tool]">) {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <Tool params={params} />
    </Suspense>
  );
}

async function Tool({ params }: { params: PageProps<"/tools/[tool]">["params"] }) {
  const { tool } = await params;
  if (!toolById(tool)) notFound();
  return <GenerationPage modeId="tools" toolId={tool} />;
}
