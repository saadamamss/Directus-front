import { useQuery } from "@tanstack/react-query";
import { fetchRelations } from "@/lib/api/relations";

export function useRelations() {
  return useQuery({
    queryKey: ["relations"],
    queryFn: fetchRelations,
  });
}
