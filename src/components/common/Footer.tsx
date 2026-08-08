import React, { useState } from 'react';
import { Phone, MessageCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const [openNumber, setOpenNumber] = useState<string | null>(null);

  const contactNumbers = [
    { number: '772772732', label: '772772732' },
    { number: '772772752', label: '772772752' }
  ];

  const handleAction = (type: 'whatsapp' | 'call', number: string) => {
    if (type === 'whatsapp') {
      window.open(`https://wa.me/967${number}`, '_blank');
    } else {
      window.location.href = `tel:${number}`;
    }
    setOpenNumber(null);
  };

  return (
    <footer className={cn("w-full py-4 px-4 mt-auto arabic-font", className)}>
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-4">
        {/* Copyright Pill */}
        <div className="bg-white/95 px-6 py-2.5 rounded-2xl border-2 border-primary/20 shadow-xl max-w-[92%] mx-auto">
          <p className="text-primary font-bold text-[11px] md:text-sm leading-relaxed text-center whitespace-normal break-words">
            جميع الحقوق محفوظة سندس للتجهيزات التعليمية (نهتم من أجلكم)
          </p>
        </div>

        {/* Support Label */}
        <div className="flex items-center gap-2 text-white/90 text-[10px] md:text-xs font-bold tracking-wide">
          <Phone className="h-3 w-3" />
          <span>للاستفسار والدعم الفني</span>
        </div>

        {/* Contact Buttons */}
        <div className="flex flex-row justify-center items-center gap-3 w-full max-w-sm">
          {contactNumbers.map((item) => (
            <Dialog key={item.number} open={openNumber === item.number} onOpenChange={(open) => !open && setOpenNumber(null)}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  onClick={() => setOpenNumber(item.number)}
                  className="flex-1 h-12 rounded-xl border-none bg-white/95 backdrop-blur-sm hover:bg-white text-primary font-black text-lg shadow-lg transition-all hover:scale-105 active:scale-95"
                >
                  {item.label}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[320px] rounded-[2rem] p-8 arabic-font border-none shadow-2xl">
                <DialogHeader>
                  <div className="mx-auto mb-4 h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Phone className="h-8 w-8" />
                  </div>
                  <DialogTitle className="text-center text-2xl font-black text-primary mb-2">
                    خيارات التواصل
                  </DialogTitle>
                  <p className="text-center text-muted-foreground text-sm mb-6">الرقم: {item.label}</p>
                </DialogHeader>
                <div className="grid grid-cols-1 gap-4">
                  <Button 
                    onClick={() => handleAction('whatsapp', item.number)}
                    className="h-16 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] border-none text-white gap-3 text-lg font-bold shadow-lg"
                  >
                    <MessageCircle className="h-7 w-7" />
                    مراسلة عبر واتساب
                  </Button>
                  <Button 
                    onClick={() => handleAction('call', item.number)}
                    className="h-16 rounded-2xl bg-primary hover:bg-primary/90 border-none text-white gap-3 text-lg font-bold shadow-lg"
                  >
                    <Phone className="h-7 w-7" />
                    اتصال هاتفي مباشر
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
        
        {/* Bottom Small Copyright */}
        <div className="pt-2 text-[9px] text-white/40 font-medium">
          © 2026 الوسيلة الذكية | جميع العلامات التجارية محفوظة
        </div>
      </div>
    </footer>
  );
};

export default Footer;
