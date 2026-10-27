import React from "react";
import { notFound } from "next/navigation";
import { guideStorage } from "@/lib/storage";
import { GuideView } from "@/components/GuideView";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const guide = guideStorage.getGuideByIdOrSlug(id);

  if (!guide) {
    return {
      title: "Shared Guide Not Found — OAuth Compass",
    };
  }

  return {
    title: `${guide.appName} OAuth 2.0 Setup Guide — OAuth Compass`,
    description: guide.shortDescription,
  };
}

export default async function SharedGuidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guide = guideStorage.getGuideByIdOrSlug(id);

  if (!guide) {
    notFound();
  }

  return <GuideView guide={guide} isPersistentShare={true} />;
}
