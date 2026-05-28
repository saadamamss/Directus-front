import { Suspense } from "react";
import DataModelList from "@/components/collections/DataModelList";

export default function DataModelPage() {
  return (
    <Suspense fallback={<div className="flex flex-1" />}>
      <DataModelList />
    </Suspense>
  );
}
