import { cookies } from "next/headers";
import { DashboardSidebar } from "@/features/dashboard/components/Sidebar";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const cookieStore = await cookies();
	const sidebarState = cookieStore.get("sidebar_state")?.value;
	const defaultOpen =
		sidebarState === undefined ? true : sidebarState === "true";

	return (
		<DashboardSidebar defaultOpen={defaultOpen}>{children}</DashboardSidebar>
	);
}
