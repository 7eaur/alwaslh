import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Layers, 
  BookOpen, 
  Key, 
  Bell, 
  LogOut,
  Menu,
  X,
  UserCheck,
  FileQuestion,
  ChevronLeft,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Footer from '@/components/common/Footer';
import Onboarding from '@/components/common/Onboarding';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const SidebarContent = React.memo(({ navItems, profile, logout, navigate }: any) => (
  <div className="flex flex-col h-full p-6">
    <div className="mb-10 flex items-center gap-3 bg-primary/5 p-4 rounded-2xl border border-primary/10">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md overflow-hidden border border-primary/10">
        <img src="https://miaoda-conversation-file.s3cdn.medo.dev/user-9wofituwhou8/conv-a8tauoehdn9c/20260315/file-a9l4g2jirr40.jpg" alt="Logo" className="w-full h-full object-cover" />
      </div>
      <div>
        <h2 className="font-bold text-primary leading-tight text-lg">لوحة المدير</h2>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">الوسيلة الذكية</p>
      </div>
    </div>

    <nav className="flex-1 space-y-2">
      {navItems.map((item: any) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all group",
              isActive 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "text-muted-foreground hover:bg-muted hover:text-primary"
            )
          }
        >
          <item.icon className="h-5 w-5" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>

    <div className="mt-auto pt-6 border-t">
      <div className="mb-4 flex items-center gap-3 px-4">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-primary font-bold shadow-inner border-2 border-primary/20">
          {profile?.username ? (String(profile.username).substring(0, 1).toUpperCase() as React.ReactNode) : 'A'}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-bold truncate">{(profile?.username as string) || 'مدير'}</p>
          <p className="text-xs text-muted-foreground truncate">مدير النظام</p>
        </div>
      </div>
      <div className="mt-8 px-4">
        <Button 
          variant="outline" 
          className="w-full justify-between gap-3 rounded-2xl px-5 py-4 text-destructive border-2 border-destructive/20 bg-destructive/5 hover:bg-destructive/10 hover:border-destructive transition-all font-black group shadow-sm shadow-destructive/5"
          onClick={logout}
        >
          <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive text-white shadow-lg shadow-destructive/20 group-hover:scale-110 transition-transform">
               <LogOut className="h-5 w-5" />
             </div>
             <span className="text-base tracking-tight">تسجيل الخروج</span>
          </div>
          <ChevronLeft className="h-5 w-5 opacity-50 group-hover:translate-x-[-4px] transition-transform" />
        </Button>
      </div>
    </div>
  </div>
));

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { logout, profile } = useAuth();
  const navigate = useNavigate();

  const navItems = React.useMemo(() => [
    { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/admin/dashboard' },
    { icon: Layers, label: 'الصفوف والمواد', path: '/admin/classes' },
    { icon: BookOpen, label: 'إدارة الدروس', path: '/admin/lessons' },
    { icon: FileQuestion, label: 'الاختبارات التفاعلية', path: '/admin/quizzes' },
    { icon: Key, label: 'أكواد التفعيل', path: '/admin/codes' },
    { icon: Key, label: 'أكواد الصفوف', path: '/admin/class-codes' },
    { icon: Users, label: 'إدارة الحسابات', path: '/admin/accounts' },
    { icon: Bell, label: 'الإشعارات', path: '/admin/notifications' },
  ], []);

  const sidebarProps = { navItems, profile, logout, navigate };

  return (
    <div className="flex min-h-screen bg-muted/20 arabic-font">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 bottom-0 right-0 w-72 flex-col border-l bg-white shadow-xl">
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pr-72">
        <header className="sticky top-0 z-30 h-16 border-b bg-white/80 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-xl">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 w-72">
                <SidebarContent {...sidebarProps} />
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-bold text-primary">{title}</h1>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary border border-primary/10">
               <Bell className="h-5 w-5" />
             </div>
             
             <Button 
               variant="ghost" 
               size="icon" 
               onClick={logout}
               className="lg:hidden text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl h-10 w-10 border-2 border-rose-200 bg-rose-50/50 shadow-sm transition-all active:scale-90"
               title="تسجيل الخروج"
             >
               <LogOut className="h-5 w-5" />
             </Button>

             <Button 
               variant="outline" 
               className="border-primary/20 text-primary hover:bg-primary/5 rounded-xl hidden sm:flex"
               onClick={() => navigate('/')}
             >
               زيارة الموقع
             </Button>
          </div>
        </header>

        <main className="p-4 lg:p-8 animate-fade-in flex-1">
          {children}
        </main>
        <Footer />
        <Onboarding type="admin" />
      </div>
    </div>
  );
};

export default AdminLayout;
