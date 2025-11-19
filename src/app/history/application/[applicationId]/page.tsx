"use client";

import * as React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Loading from "@/app/loading";
import HistoryApplicationViewer from "@/features/history/components/HistoryApplicationViewer";

export default function HistoryApplicationPage({
  params,
}: {
  readonly params: Promise<{ applicationId: string }>;
}) {
  const { applicationId } = React.use(params);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (status === "authenticated" && session?.isRegistered === false) {
      router.push("/cpsk-register");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <Loading />;
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="bg-background min-h-screen">
      <HistoryApplicationViewer applicationId={applicationId} />
    </div>
  );
}
