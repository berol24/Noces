"use client";

import { useParams } from "next/navigation";
import { Album } from "@/components/Album";

export default function PhotosPage() {
  const params = useParams<{ slug: string }>();
  return <Album slug={params.slug} />;
}
