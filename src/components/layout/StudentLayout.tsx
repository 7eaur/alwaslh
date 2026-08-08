import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAccess } from '@/context/AccessContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Home, 
  BookOpen, 
  FileText, 
  BarChart3, 
  Bell, 
  ChevronLeft,
  Phone,
  MessageCircle,
  KeyRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Footer from '@/components/common/Footer';
import Onboarding from '@/components/common/Onboarding';
import { RefreshButton } from '@/components/common/RefreshButton';
import { OfflineIndicator } from '@/components/OfflineIndicator';

interface StudentLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
}

const ContactNumber = React.memo(({ number }: { number: string }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <button className="hover:text-primary transition-all cursor-pointer outline-none focus:text-primary active:scale-95">
        {number}
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="center" className="rounded-2xl p-2 border-2 border-primary/10 bg-white shadow-xl animate-fade-in z-[100]">
      <DropdownMenuItem className="rounded-xl flex items-center gap-3 cursor-pointer p-3 focus:bg-primary/5 font-bold text-slate-700" onClick={() => window.open(`tel:${number}`)}>
        <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center">
          <Phone className="h-4 w-4 text-green-600" />
        </div>
        <span>اتصال هاتفي</span>
      </DropdownMenuItem>
      <DropdownMenuItem className="rounded-xl flex items-center gap-3 cursor-pointer p-3 focus:bg-primary/5 font-bold text-slate-700" onClick={() => window.open(`https://wa.me/${number}`)}>
        <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
          <MessageCircle className="h-4 w-4 text-emerald-600" />
        </div>
        <span>مراسلة واتساب</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
));

const StudentLayout: React.FC<StudentLayoutProps> = ({ children, title, showBack }) => {
  const { hasFullAccess, activatedClasses } = useAccess();
  const navigate = useNavigate();

  const navItems = React.useMemo(() => [
    { icon: Home, label: 'الرئيسية', path: '/student/dashboard' },
    { icon: BookOpen, label: 'قائمه الدروس', path: '/student/lessons' },
    { icon: FileText, label: 'ملاحظاتي', path: '/student/notes' },
    { icon: BarChart3, label: 'إحصائيات', path: '/student/statistics' },
    { icon: KeyRound, label: 'تفعيل كود', path: '/student/activate' },
  ], []);

  return (
    <div className="flex min-h-screen flex-col bg-background arabic-font pb-24 md:pb-0 md:pr-64">
      <Onboarding type="student" />
      <OfflineIndicator />
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex min-h-[5rem] h-auto items-center justify-between border-b bg-white/95 backdrop-blur-md px-4 md:px-8 shadow-sm py-2">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {showBack && (
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-primary hover:bg-primary/10 rounded-2xl h-12 w-12 border border-primary/5 shrink-0">
              <ChevronLeft className="h-7 w-7" />
            </Button>
          )}
          <div className="flex items-center gap-3 min-w-0 flex-1">
             <div className="h-10 w-10 rounded-xl overflow-hidden shadow-md border border-primary/5 bg-white shrink-0">
                <img src="https://miaoda-conversation-file.s3cdn.medo.dev/user-9wofituwhou8/conv-a8tauoehdn9c/20260315/file-a9l4g2jirr40.jpg" alt="Logo" className="w-full h-full object-cover" />
             </div>
             <div className="min-w-0 flex-1">
                <h1 className="text-base md:text-lg font-black text-primary line-clamp-2 leading-tight break-words">
                  {title || "الوسيلة الذكية"}
                </h1>
                {!title && <p className="text-[10px] text-muted-foreground font-bold">المنصة التعليمية الأولى</p>}
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          <RefreshButton />

          <NavLink to="/student/notifications" className="relative group p-2 rounded-xl hover:bg-muted transition-colors">
            <Bell className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
            <span className="absolute top-2 left-2 h-2 w-2 rounded-full bg-secondary border-2 border-white" />
          </NavLink>

          <div className="hidden md:flex items-center gap-3 mr-4 border-r pr-4">
             <div className="text-right">
               <p className="text-sm font-bold text-primary leading-none mb-1">
                 {hasFullAccess ? 'وصول كامل' : `${activatedClasses.length} صف مفعّل`}
               </p>
               <p className="text-[10px] text-muted-foreground">طالب مستخدم</p>
             </div>
             <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner">
               <KeyRound className="h-5 w-5" />
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 animate-fade-in overflow-x-hidden flex flex-col">
        <div className="flex-1">
          {children}
        </div>
        
        <footer className="mt-16 py-10 border-t border-dashed text-center space-y-4 animate-fade-in">
          <div className="inline-flex flex-col items-center px-6 py-4 rounded-3xl bg-primary/5 border border-primary/10 shadow-sm">
            <p className="text-[11px] md:text-[13px] font-black text-primary leading-relaxed mb-2">
              جميع الحقوق محفوظة سندس للتجهيزات التعليمية (نهتم من أجلكم)
            </p>
            <div className="h-px w-20 bg-primary/20 mb-3" />
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">للاستفسار والدعم الفني</p>
            <div className="flex items-center gap-2 text-[15px] font-black text-secondary tracking-widest tabular-nums drop-shadow-sm">
              <ContactNumber number="772772732" />
              <span className="text-muted-foreground/50 mx-1">،</span>
              <ContactNumber number="772772752" />
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground/40 font-bold">2026 © الوسيلة الذكية</p>
        </footer>
      </main>

      {/* Mobile Bottom Navigation (Screenshot 1) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-20 items-center justify-around border-t bg-white/95 backdrop-blur-md px-2 pb-safe md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all",
                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-primary/70"
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  "p-2 rounded-xl transition-colors",
                  isActive ? "bg-primary/10" : ""
                )}>
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
                {isActive && <div className="h-1 w-4 rounded-full bg-primary mt-0.5" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Desktop Sidebar */}
      <aside className="fixed right-0 top-0 bottom-0 z-50 hidden w-64 flex-col border-l bg-white md:flex p-6">
        <div className="mb-10 flex items-center gap-3 bg-primary/5 p-4 rounded-3xl border border-primary/10">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-md overflow-hidden border border-primary/5 shrink-0">
            <img src="https://miaoda-conversation-file.s3cdn.medo.dev/user-9wofituwhou8/conv-a8tauoehdn9c/20260315/file-a9l4g2jirr40.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="font-black text-primary leading-tight text-lg">الوسيلة الذكية</h2>
            <p className="text-[9px] text-muted-foreground font-bold tracking-widest uppercase">منصتك الذكية</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
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
              <ChevronLeft className={cn(
                "h-4 w-4 ml-auto opacity-0 transition-all",
                "group-hover:opacity-100"
              )} />
            </NavLink>
          ))}
        </nav>

      </aside>
    </div>
  );
};

export default StudentLayout;
