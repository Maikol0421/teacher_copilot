import StudentProfileView from "@/features/students/student-profile-view";
import { getStudentStaticParams } from "@/lib/static-params";

export const metadata = {
  title: "Alumno · GradeFlow",
};

export function generateStaticParams() {
  return getStudentStaticParams();
}

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <StudentProfileView studentId={id} />;
}
