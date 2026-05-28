import { ReactQueryProvider } from "@/lib/query/providers";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReactQueryProvider>{children}</ReactQueryProvider>;
}
