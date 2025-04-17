// This is a Server Component (no "use client" directive)
import { ProjectDetailsClient } from "./ProjectDetailsClient";

// Add generateStaticParams for static site generation with App Router
export async function generateStaticParams() {
  // Static project IDs for pre-rendering
  return [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }, { id: "5" }];
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  return <ProjectDetailsClient projectId={params.id} />;
}
