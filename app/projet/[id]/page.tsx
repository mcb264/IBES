"use client";

import { useParams } from "next/navigation";
import CustomProjectConsole from "@/components/CustomProjectConsole";

export default function CustomProjectPage() {
  const params = useParams<{ id: string }>();
  return <CustomProjectConsole id={params.id} />;
}
