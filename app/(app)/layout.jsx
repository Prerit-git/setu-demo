import Sidebar from "@/components/Sidebar";import Toasts from "@/components/Toasts";
export default function AppLayout({children}){return <div className="flex"><Sidebar/><Toasts/><main className="min-h-screen flex-1 p-8">{children}</main></div>}
