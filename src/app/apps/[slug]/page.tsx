import React from "react";
import { notFound } from "next/navigation";
import { guideStorage } from "@/lib/storage";
import { GuideView } from "@/components/GuideView";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideStorage.getGuideByIdOrSlug(slug);

  if (!guide) {
    return {
      title: "App Guide Not Found — OAuth Compass",
    };
  }

  return {
    title: `${guide.appName} OAuth 2.0 Setup Guide — OAuth Compass`,
    description: guide.shortDescription,
  };
}

export default async function AppGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = guideStorage.getGuideByIdOrSlug(slug);

  if (!guide) {
    notFound();
  }

  return <GuideView guide={guide} />;
}
