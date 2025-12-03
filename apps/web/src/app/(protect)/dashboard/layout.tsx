import { DashboardSidebar } from "@/features/dashboard/components/Sidebar";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <DashboardSidebar>{children}</DashboardSidebar>;
}
