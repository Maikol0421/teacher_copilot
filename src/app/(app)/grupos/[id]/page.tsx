import GroupDetailView from "@/features/groups/group-detail-view";
import { getGroupStaticParams } from "@/lib/static-params";

export const metadata = {
  title: "Grupo · GradeFlow",
};

export function generateStaticParams() {
  return getGroupStaticParams();
}

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GroupDetailView groupId={id} />;
}
