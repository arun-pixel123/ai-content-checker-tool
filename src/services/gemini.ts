import { OptimizationSettings, OptimizedContent } from "../types";

export async function optimizeContent(content: string, settings: OptimizationSettings): Promise<OptimizedContent> {
  const response = await fetch("/api/optimize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content, settings }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with ${response.status}`);
  }

  return response.json();
}
