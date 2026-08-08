import React, { useState, useEffect, useCallback } from 'react';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImageDown, Loader2, CheckSquare, Square, X, FileDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CodeCardData {
  id: string;
  code: string;
  type: 'full' | 'class';
  className?: string;
  isUsed: boolean;
}

/* ─── ألوان مميزة لكل صف — 16 لون متباين تماماً ─── */
const CLASS_COLORS: Array<{ from: string; to: string }> = [
  { from: '#c62828', to: '#7f0000' },   //  0 أحمر قاني
  { from: '#ad1457', to: '#560027' },   //  1 كبدي/عنابي
  { from: '#d81b9c', to: '#880e4f' },   //  2 زهري
  { from: '#e91e63', to: '#c2185b' },   //  3 وردي
  { from: '#f57c00', to: '#bf360c' },   //  4 برتقالي
  { from: '#f9a825', to: '#e65100' },   //  5 ذهبي-برتقالي
  { from: '#558b2f', to: '#1b5e20' },   //  6 أخضر ليموني
  { from: '#2e7d32', to: '#1b5e20' },   //  7 أخضر غامق
  { from: '#006064', to: '#004d40' },   //  8 تيل غامق
  { from: '#00838f', to: '#006064' },   //  9 فيروزي
  { from: '#0277bd', to: '#01579b' },   // 10 سماوي
  { from: '#1565c0', to: '#0d47a1' },   // 11 أزرق
  { from: '#283593', to: '#1a237e' },   // 12 كحلي
  { from: '#6a1b9a', to: '#38006b' },   // 13 بنفسجي
  { from: '#4527a0', to: '#1a0077' },   // 14 بنفسجي-نيلي
  { from: '#5d4037', to: '#3e2723' },   // 15 بني غامق
  { from: '#D4AC0D', to: '#9A7D0A' },   // 16 ذهبي
  { from: '#8B5E3C', to: '#5C3A1E' },   // 17 بني فاتح
  { from: '#E8630A', to: '#C0390B' },   // 18 برتقالي زاهي
  { from: '#B5835A', to: '#8B6040' },   // 19 بيج/كريمي
  { from: '#C0392B', to: '#922B21' },   // 20 أحمر متوسط
  { from: '#1A5276', to: '#0D2B3E' },   // 21 كحلي داكن
  { from: '#FF69B4', to: '#C2185B' },   // 22 زهري فاتح
  { from: '#117A65', to: '#0B5345' },   // 23 أخضر زمردي
  { from: '#7D3C98', to: '#4A235A' },   // 24 بنفسجي ملكي
  { from: '#D35400', to: '#A04000' },   // 25 بني-برتقالي
  { from: '#1F618D', to: '#154360' },   // 26 أزرق بترولي
  { from: '#B7950B', to: '#7D6608' },   // 27 ذهبي معدني
];

/* كلمات مفتاحية → فهرس اللون الثابت لكل مادة/صف */
const KEYWORD_COLOR_MAP: Array<{ keywords: string[]; idx: number }> = [
  { keywords: ['رياض', 'math'],                           idx: 7  }, // أخضر غامق
  { keywords: ['احياء', 'أحياء', 'bio'],                  idx: 23 }, // أخضر زمردي
  { keywords: ['كيمياء', 'كيميا', 'chem'],                idx: 13 }, // بنفسجي
  { keywords: ['فيزياء', 'فيزيا', 'phys'],                idx: 10 }, // سماوي
  { keywords: ['عربي', 'العربي', 'arabic'],               idx: 0  }, // أحمر
  { keywords: ['انجليزي', 'إنجليزي', 'english'],          idx: 11 }, // أزرق
  { keywords: ['اسلام', 'إسلام', 'دين', 'قرآن'],         idx: 8  }, // تيل غامق
  { keywords: ['تاريخ', 'histor'],                         idx: 15 }, // بني غامق
  { keywords: ['جغراف', 'geo'],                           idx: 9  }, // فيروزي
  { keywords: ['فلسف', 'منطق', 'phil'],                   idx: 14 }, // بنفسجي-نيلي
  { keywords: ['حاسب', 'تقني', 'computer'],               idx: 21 }, // كحلي داكن
  { keywords: ['فن', 'رسم', 'art'],                       idx: 22 }, // زهري فاتح
  { keywords: ['تربي', 'وطني'],                           idx: 18 }, // برتقالي زاهي
  { keywords: ['اقتصاد', 'محاسب'],                        idx: 16 }, // ذهبي
  { keywords: ['اول', 'أول', 'الأول', 'الاول', '1'],    idx: 7  }, // أخضر
  { keywords: ['ثاني', 'الثاني', '2'],                    idx: 11 }, // أزرق
  { keywords: ['ثالث', 'الثالث', '3'],                    idx: 4  }, // برتقالي
  { keywords: ['رابع', 'الرابع', '4'],                    idx: 24 }, // بنفسجي ملكي
  { keywords: ['خامس', 'الخامس', '5'],                    idx: 0  }, // أحمر
  { keywords: ['سادس', 'السادس', '6'],                    idx: 26 }, // أزرق بترولي
  { keywords: ['مجتمع', 'اجتماع'],                        idx: 25 }, // بني-برتقالي
  { keywords: ['علوم'],                                   idx: 6  }, // أخضر ليموني
  { keywords: ['ابتدائي', 'متوسط', 'ثانوي'],             idx: 27 }, // ذهبي معدني
  { keywords: ['احجر', 'أحجر', 'حجر'],                   idx: 17 }, // بني فاتح
  { keywords: ['ادبي', 'أدبي', 'أدب'],                   idx: 2  }, // زهري
  { keywords: ['علمي', 'علم'],                            idx: 9  }, // فيروزي
  { keywords: ['تجاري', 'تجارة'],                         idx: 19 }, // بيج
  { keywords: ['صحي', 'صحة', 'تمريض'],                   idx: 3  }, // وردي
  { keywords: ['ذهبي', 'golden'],                         idx: 16 }, // ذهبي
  { keywords: ['بني', 'brown'],                           idx: 17 }, // بني فاتح
  { keywords: ['برتق', 'orange'],                         idx: 18 }, // برتقالي
  { keywords: ['بيج', 'beige', 'كريم'],                  idx: 19 }, // بيج
  { keywords: ['كحلي', 'navy'],                           idx: 12 }, // كحلي
  { keywords: ['زهري', 'pink'],                           idx: 22 }, // زهري
];

function getClassColor(key: string): { from: string; to: string } {
  const lower = key.toLowerCase();
  for (const entry of KEYWORD_COLOR_MAP) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return CLASS_COLORS[entry.idx];
    }
  }
  // fallback: hash على الكلمة الأولى فقط لتقليل التكرار
  const firstWord = key.trim().split(/\s+/)[0] || key;
  let hash = 0;
  for (let i = 0; i < firstWord.length; i++) hash = (hash * 97 + firstWord.charCodeAt(i)) >>> 0;
  return CLASS_COLORS[hash % CLASS_COLORS.length];
}

/* ─── رسم زاوية مستديرة ─── */
function rRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/* ─── رابط شعار التطبيق (الصورة الحقيقية من المستخدم) ─── */
const LOGO_URL =
  'https://miaoda-conversation-file.s3cdn.medo.dev/user-9wofituwhou8/app-a8tauoehdn9d/20260519/Screenshot_%D9%A2%D9%A0%D9%A2%D9%A6%D9%A0%D9%A5%D9%A1%D9%A5-%D9%A2%D9%A1%D9%A5%D9%A3%D9%A0%D9%A5_Chrome-03.jpeg';

// كاش الصورة لتجنب إعادة التحميل
let _cachedLogo: HTMLImageElement | null = null;
let _logoLoading = false;
const _logoCallbacks: Array<(img: HTMLImageElement | null) => void> = [];

function loadLogoImage(): Promise<HTMLImageElement | null> {
  return new Promise(resolve => {
    if (_cachedLogo) { resolve(_cachedLogo); return; }
    _logoCallbacks.push(resolve);
    if (_logoLoading) return;
    _logoLoading = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => { _cachedLogo = img; _logoCallbacks.forEach(cb => cb(img)); _logoCallbacks.length = 0; };
    img.onerror = () => { _logoCallbacks.forEach(cb => cb(null)); _logoCallbacks.length = 0; };
    img.src = LOGO_URL;
  });
}

/* ─── رسم الشعار: الصورة الحقيقية أو fallback مرسوم ─── */
function drawFallbackLogo(
  ctx: CanvasRenderingContext2D,
  cx: number, topY: number, S: number
) {
  // المربع التيل الخارجي (كالصورة المرسلة)
  const R = S * 0.24;
  const grd = ctx.createLinearGradient(cx - S/2, topY, cx + S/2, topY + S);
  grd.addColorStop(0, '#14b8a6');
  grd.addColorStop(1, '#0d9488');

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 8;
  rRect(ctx, cx - S/2, topY, S, S, R);
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.restore();

  // حد أبيض خارجي
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.90)';
  ctx.lineWidth = S * 0.04;
  rRect(ctx, cx - S/2 + S*0.02, topY + S*0.02, S - S*0.04, S - S*0.04, R - S*0.02);
  ctx.stroke();
  ctx.restore();

  // المربع الداخلي الشفاف
  const p = S * 0.15;
  const iS = S - p*2, iX = cx - S/2 + p, iY = topY + p, iR = R * 0.55;
  ctx.save();
  ctx.globalAlpha = 0.28;
  ctx.fillStyle = '#ffffff';
  rRect(ctx, iX, iY, iS, iS, iR);
  ctx.fill();
  ctx.restore();

  // أيقونة الكتاب المفتوح (بسيطة ومميزة)
  const bCx = cx, bCy = topY + S * 0.52;
  const bW = iS * 0.60, bH = iS * 0.46;
  const bX = bCx - bW/2, bY = bCy - bH/2;

  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.fillStyle   = 'rgba(255,255,255,0.95)';
  ctx.lineWidth   = S * 0.036;
  ctx.lineCap     = 'round';
  ctx.lineJoin    = 'round';

  // غلاف الكتاب
  ctx.beginPath();
  ctx.roundRect(bX, bY, bW, bH, S * 0.04);
  ctx.stroke();

  // الخط الفاصل
  ctx.beginPath();
  ctx.moveTo(bCx, bY + bH*0.08);
  ctx.lineTo(bCx, bY + bH*0.92);
  ctx.stroke();

  // خطوط الصفحات (3 في كل جانب)
  for (let i = 0; i < 3; i++) {
    const ly = bY + bH * (0.25 + i * 0.22);
    const lh = S * 0.022;
    const lw = bW * 0.32;
    ctx.globalAlpha = 0.80;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.roundRect(bX + bW*0.07, ly, lw, lh, lh/2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(bCx + bW*0.09, ly, lw, lh, lh/2); ctx.fill();
  }
  ctx.restore();
}

async function drawAppLogo(
  ctx: CanvasRenderingContext2D,
  cx: number, topY: number, S: number
): Promise<void> {
  const logoImg = await loadLogoImage();
  if (logoImg) {
    // رسم الصورة الحقيقية داخل مربع مستدير مع ظل
    const R = S * 0.24;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 8;
    rRect(ctx, cx - S/2, topY, S, S, R);
    ctx.clip();
    ctx.shadowBlur = 0;
    ctx.drawImage(logoImg, cx - S/2, topY, S, S);
    ctx.restore();
  } else {
    drawFallbackLogo(ctx, cx, topY, S);
  }
}

/* ─── رسم البطاقة كاملة (القياسي) ─── */
export async function drawCard(
  canvas: HTMLCanvasElement,
  item: CodeCardData,
  appName: string,
  slogan: string,
  contactPhone = '772772732',
  width  = 480,
  height = 640,
): Promise<void> {
  canvas.width  = width;
  canvas.height = height;
  const W = width, H = height;
  const ctx = canvas.getContext('2d')!;

  // تحديد اللون بحسب اسم الصف
  const colorKey = item.className || item.id;
  const color    = getClassColor(colorKey);

  const grd = ctx.createLinearGradient(0, 0, W * 0.7, H);
  grd.addColorStop(0, color.from);
  grd.addColorStop(1, color.to);

  // خلفية البطاقة
  rRect(ctx, 0, 0, W, H, 40);
  ctx.fillStyle = grd;
  ctx.fill();

  // دوائر زخرفية
  ctx.save();
  ctx.globalAlpha = 0.10;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(-30, -30, 160, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(W + 20, H + 20, 130, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  /* ── شعار التطبيق (صورة حقيقية مع fallback) ── */
  const logoS = 110;
  const logoTop = 28;
  await drawAppLogo(ctx, W / 2, logoTop, logoS);

  /* ── اسم التطبيق ── */
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold 30px Arial, Helvetica, sans-serif`;
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 6;
  ctx.fillText(appName, W / 2, logoTop + logoS + 44);
  ctx.shadowBlur = 0;

  /* ── الشعار الفرعي ── */
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = `600 16px Arial, Helvetica, sans-serif`;
  ctx.fillText(slogan, W / 2, logoTop + logoS + 68);

  /* ── البطاقة الداخلية ── */
  const innerX = 26, innerY = logoTop + logoS + 86;
  const innerW = W - 52, innerH = H - innerY - 58;

  ctx.save();
  ctx.globalAlpha = 0.18;
  rRect(ctx, innerX, innerY, innerW, innerH, 28);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 1.2;
  rRect(ctx, innerX, innerY, innerW, innerH, 28);
  ctx.stroke();
  ctx.restore();

  let curY = innerY + 26;

  /* ── اسم الصف (بدون بادئة) ── */
  if (item.className) {
    const tW = innerW - 36, tH = 40;
    const tX = innerX + 18;
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#ffffff';
    rRect(ctx, tX, curY, tW, tH, 12);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 17px Arial, Helvetica, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(item.className, W / 2, curY + 27);
    curY += tH + 14;
  }

  /* ── تسمية: رمز كود الدخول والتفعيل ── */
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.font = `700 14px Arial, Helvetica, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('رمز كود الدخول والتفعيل', W / 2, curY + 20);
  curY += 38;

  /* ── الكود الرقمي ── */
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 60px Arial, Helvetica, monospace`;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 10;
  ctx.fillText(item.code, W / 2, curY + 58);
  ctx.restore();
  curY += 76;

  /* ── شارة نوع الكود (جديد / مستخدم) ── */
  const badgeLabel = item.isUsed ? 'مستخدم' : 'جديد';
  const badgeBg    = item.isUsed ? 'rgba(239,68,68,0.85)' : 'rgba(34,197,94,0.85)';
  const badgeW = 100, badgeH = 28;
  const badgeX = W / 2 - badgeW / 2;

  ctx.save();
  ctx.fillStyle = badgeBg;
  rRect(ctx, badgeX, curY, badgeW, badgeH, badgeH / 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 13px Arial, Helvetica, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(badgeLabel, W / 2, curY + 19);
  ctx.restore();
  curY += badgeH + 10;

  /* ── مربع معلومات التواصل ── */
  const boxW = innerW - 36, boxH = 114;
  const boxX = innerX + 18;

  ctx.save();
  ctx.globalAlpha = 0.20;
  ctx.fillStyle = '#ffffff';
  rRect(ctx, boxX, curY, boxW, boxH, 18);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1.5;
  rRect(ctx, boxX, curY, boxW, boxH, 18);
  ctx.stroke();
  ctx.restore();

  // نص التواصل
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = `600 14px Arial, Helvetica, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('للاستفسار أو المساعدة', W / 2, curY + 40);

  ctx.fillStyle = '#ffffff';
  ctx.font = `900 30px Arial, Helvetica, monospace`;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 6;
  ctx.fillText(contactPhone, W / 2, curY + 84);
  ctx.shadowBlur = 0;

  /* ── تذييل ── */
  const footerY = H - 30;
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(26, footerY - 12, W - 52, 1);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = `600 11px Arial, Helvetica, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText(`تطبيق ${appName}`, W - 32, footerY + 8);
  ctx.textAlign = 'left';
  ctx.fillText('© 2026 جميع الحقوق محفوظة', 32, footerY + 8);
}

/* ─── تفاف النص العربي RTL في Canvas ─── */
function drawWrappedRTL(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line.trimEnd(), x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trimEnd(), x, currentY);
  return currentY + lineHeight;
}

/* ─── رسم البطاقة A4 - 4.5سم × 14سم (8 كروت/صفحة) ─── */
export async function drawCardA4(
  canvas: HTMLCanvasElement,
  item: CodeCardData,
  appName: string,
  slogan: string,
  contactPhone = '772772732',
  width = 450,
  height = 1400,
): Promise<void> {
  canvas.width  = width;
  canvas.height = height;
  const W = width, H = height;
  const ctx = canvas.getContext('2d')!;

  const colorKey = item.className || item.id;
  const color    = getClassColor(colorKey);

  const grd = ctx.createLinearGradient(0, 0, W * 0.7, H);
  grd.addColorStop(0, color.from);
  grd.addColorStop(1, color.to);

  // خلفية البطاقة
  rRect(ctx, 0, 0, W, H, W * 0.055);
  ctx.fillStyle = grd;
  ctx.fill();

  // دوائر زخرفية
  ctx.save();
  ctx.globalAlpha = 0.10;
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(-W*0.06, -W*0.06, W*0.33, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(W + W*0.04, H + W*0.04, W*0.27, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  /* ── شعار التطبيق ── */
  const logoS = W * 0.28;
  const logoTop = H * 0.025;
  await drawAppLogo(ctx, W / 2, logoTop, logoS);

  /* ── اسم التطبيق ── */
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${W * 0.075}px Arial, Helvetica, sans-serif`;
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 6;
  ctx.fillText(appName, W / 2, logoTop + logoS + W * 0.11);
  ctx.shadowBlur = 0;

  /* ── الشعار الفرعي ── */
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = `600 ${W * 0.04}px Arial, Helvetica, sans-serif`;
  ctx.fillText(slogan, W / 2, logoTop + logoS + W * 0.155);

  /* ── البطاقة الداخلية ── */
  const innerX = W * 0.054;
  const innerY = logoTop + logoS + W * 0.19;
  const innerW = W - innerX * 2;
  const innerH = H - innerY - W * 0.12;

  ctx.save();
  ctx.globalAlpha = 0.18;
  rRect(ctx, innerX, innerY, innerW, innerH, W * 0.04);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 1.2;
  rRect(ctx, innerX, innerY, innerW, innerH, W * 0.04);
  ctx.stroke();
  ctx.restore();

  let curY = innerY + W * 0.06;

  /* ── اسم الصف ── */
  if (item.className) {
    const tW = innerW - W * 0.075, tH = W * 0.095;
    const tX = innerX + W * 0.037;
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#ffffff';
    rRect(ctx, tX, curY, tW, tH, W * 0.028);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = '#ffffff';
    ctx.font = `800 ${W * 0.04}px Arial, Helvetica, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(item.className, W / 2, curY + tH * 0.67);
    curY += tH + W * 0.035;
  }

  /* ── تسمية: رمز كود الدخول والتفعيل ── */
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.font = `700 ${W * 0.035}px Arial, Helvetica, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('رمز كود الدخول والتفعيل', W / 2, curY + W * 0.05);
  curY += W * 0.095;

  /* ── الكود الرقمي ── */
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${W * 0.145}px Arial, Helvetica, monospace`;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 10;
  ctx.fillText(item.code, W / 2, curY + W * 0.14);
  ctx.restore();
  curY += W * 0.18;

  /* ── شارة نوع الكود ── */
  const badgeLabel = item.isUsed ? 'مستخدم' : 'جديد';
  const badgeBg    = item.isUsed ? 'rgba(239,68,68,0.85)' : 'rgba(34,197,94,0.85)';
  const badgeW = W * 0.23, badgeH = W * 0.065;
  const badgeX = W / 2 - badgeW / 2;

  ctx.save();
  ctx.fillStyle = badgeBg;
  rRect(ctx, badgeX, curY, badgeW, badgeH, badgeH / 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${W * 0.03}px Arial, Helvetica, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(badgeLabel, W / 2, curY + badgeH * 0.67);
  ctx.restore();
  curY += badgeH + W * 0.02;

  /* ── مربع معلومات التواصل ── */
  const boxW = innerW - W * 0.075;
  const boxH = W * 0.27;
  const boxX = innerX + W * 0.037;

  ctx.save();
  ctx.globalAlpha = 0.20;
  ctx.fillStyle = '#ffffff';
  rRect(ctx, boxX, curY, boxW, boxH, W * 0.045);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 1.5;
  rRect(ctx, boxX, curY, boxW, boxH, W * 0.045);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = `600 ${W * 0.035}px Arial, Helvetica, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('للاستفسار أو المساعدة', W / 2, curY + boxH * 0.35);

  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${W * 0.075}px Arial, Helvetica, monospace`;
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 6;
  ctx.fillText(contactPhone, W / 2, curY + boxH * 0.73);
  ctx.shadowBlur = 0;
  curY += boxH + W * 0.04;

  /* ── تعليمات التفعيل (منسقة RTL بشكل صحيح) ── */
  const instPad = W * 0.045;
  const instMaxW = innerW - instPad * 2;
  const instX = innerX + instPad;
  const lineH = W * 0.055;

  // عنوان التعليمات
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(instX, curY, instMaxW, 1);
  curY += W * 0.03;

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${W * 0.038}px Arial, Helvetica, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('تعليمات التفعيل', W / 2, curY + W * 0.035);
  curY += W * 0.075;

  // النقاط بمحاذاة RTL
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = `${W * 0.032}px Arial, Helvetica, sans-serif`;

  const instructions = [
    '- قم بتحميل وتثبيت تطبيق الوسيلة الذكية من إدارة المدرسة أو المعلم أو التواصل بنا للمساعدة',
    '- قم بإدراج كود التفعيل بشكل صحيح في المكان المخصص له والنقر على مربع (التفعيل)',
    '- فترة صلاحية استخدام كود التفعيل سنه من تاريخ التفعيل وفي جوال واحد فقط',
    '- قائمة الدروس والشروحات يضم التطبيق جميع المواد الدراسية، بحيث تُعرض صفحات كل مادة على حدة، بالإضافة إلى أسئلة تفاعلية لمراجعة محتوى ومعلومات الدروس.',
    '- الاختبارات التفاعلية يتضمن قسم "الاختبارات الوزارية" بنكاً من الأسئلة الوزارية التفاعلية، مع عرض صورة النموذج الوزاري الأصلي لكل سؤال، مع توضيح طريقة الحل والشرح بالتفصيل خطوة بخطوة.',
    '- الإحصائيات والتقارير يوفر التطبيق تقارير دورية تعرض أداء الطالب ومستوى تقدمه في الدروس والاختبارات التفاعلي.',
    '- الملاحظات الشخصية أُضيفت ميزة "ملاحظاتي" لتمكين الطالب من تدوين ملاحظاته الشخصية وحفظها في التطبيق.',
    '- أشرف على إعداده ومراجعته نخبة من الموجهين والأكاديميين المتخصصين.',
  ];

  instructions.forEach((line) => {
    const finalY = drawWrappedRTL(ctx, line, W - instX, curY, instMaxW, lineH);
    curY = finalY + W * 0.012;
  });

  /* ── تذييل ── */
  const footerY = H - W * 0.065;
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(innerX, footerY - W * 0.025, innerW, 1);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = `600 ${W * 0.028}px Arial, Helvetica, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillText(`تطبيق ${appName}`, W - innerX, footerY + W * 0.02);
  ctx.textAlign = 'left';
  ctx.fillText('© 2026 جميع الحقوق محفوظة', innerX, footerY + W * 0.02);
}

/* ─── مكوّن معاينة بطاقة ─── */
interface PreviewCardProps {
  item: CodeCardData;
  appName: string;
  slogan: string;
  selected: boolean;
  onToggle: () => void;
}

const PreviewCard: React.FC<PreviewCardProps> = ({ item, appName, slogan, selected, onToggle }) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) drawCard(ref.current, item, appName, slogan);
  }, [item, appName, slogan]);

  return (
    <div
      className={cn(
        "relative cursor-pointer rounded-3xl transition-all duration-200 inline-block",
        selected
          ? "ring-4 ring-primary shadow-2xl shadow-primary/30 scale-[1.01]"
          : "opacity-80 hover:opacity-100 hover:ring-2 hover:ring-primary/30"
      )}
      onClick={onToggle}
    >
      <div className="absolute top-3 left-3 z-10" onClick={e => { e.stopPropagation(); onToggle(); }}>
        <div className={cn(
          "h-8 w-8 rounded-xl flex items-center justify-center shadow-lg border-2 transition-all select-none",
          selected ? "bg-primary border-primary text-white" : "bg-white/90 border-white/60"
        )}>
          {selected && <span className="text-sm font-black">✓</span>}
        </div>
      </div>
      <canvas ref={ref} style={{ display: 'block', borderRadius: 24, maxWidth: '100%' }} />
    </div>
  );
};

/* ─── المكوّن الرئيسي ─── */
interface CodeCardExportProps {
  codes: CodeCardData[];
  appName?: string;
  slogan?: string;
  triggerLabel?: string;
  onOpen?: () => void;
  /** وضع التحكم الخارجي: إذا مُرِّر open يُعمَل controlled mode */
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}

const CodeCardExport: React.FC<CodeCardExportProps> = ({
  codes,
  appName = 'الوسيلة الذكية',
  slogan  = 'سلسلة وسائل أجيالنا',
  triggerLabel,
  onOpen,
  open: openProp,
  onOpenChange,
}) => {
  const [openInternal, setOpenInternal] = useState(false);
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState<'png' | 'pdf' | 'pdf-a4' | null>(null);

  // إذا مُرِّر open من الخارج نعمل controlled mode، وإلا نعمل uncontrolled
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : openInternal;
  const setOpen = (v: boolean) => {
    if (isControlled) { onOpenChange?.(v); }
    else { setOpenInternal(v); }
  };

  const toggle    = (id: string) => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectAll = () => setSelected(new Set(codes.map(c => c.id)));
  const clearAll  = () => setSelected(new Set());
  const selected$ = useCallback(() => codes.filter(c => selected.has(c.id)), [codes, selected]);

  /* ── PNG ── */
  const handlePng = async () => {
    const items = selected$();
    if (!items.length) return;
    setExporting('png');
    try {
      for (const item of items) {
        const cv = document.createElement('canvas');
        await drawCard(cv, item, appName, slogan);
        const a = document.createElement('a');
        a.download = `كود_${item.code}${item.className ? '_' + item.className : ''}.png`;
        a.href = cv.toDataURL('image/png');
        a.click();
        await new Promise(r => setTimeout(r, 350));
      }
    } finally { setExporting(null); }
  };

  /* ── PDF (القياسي — 4.5سم × 6سم — 16 كرت/صفحة) ── */
  const handlePdf = async () => {
    const items = selected$();
    if (!items.length) return;
    setExporting('pdf');
    try {
      const CW = 45, CH = 60;
      const COLS = 4, ROWS = 4;
      const CARDS_PER_PAGE = COLS * ROWS;
      const MX = (210 - COLS * CW) / 2;
      const MY = (297 - ROWS * CH) / 2;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      for (let i = 0; i < items.length; i++) {
        const posIdx  = i % CARDS_PER_PAGE;
        if (posIdx === 0 && i > 0) pdf.addPage();
        const col = posIdx % COLS;
        const row = Math.floor(posIdx / COLS);

        const cv = document.createElement('canvas');
        cv.width = 450; cv.height = 600;
        await drawCard(cv, items[i], appName, slogan, '772772732', 450, 600);

        const x = MX + col * CW;
        const y = MY + row * CH;
        pdf.addImage(cv.toDataURL('image/png'), 'PNG', x, y, CW, CH);
      }

      pdf.save(`أكواد_${new Date().toLocaleDateString('ar-SA').replace(/\//g, '-')}.pdf`);
    } finally { setExporting(null); }
  };

  /* ── PDF A4 عمودي — 4.5سم × 14سم — 8 كروت/صفحة (4×2) ── */
  const handlePdfA4 = async () => {
    const items = selected$();
    if (!items.length) return;
    setExporting('pdf-a4');
    try {
      const CW = 45, CH = 140;
      const COLS = 4, ROWS = 2;
      const CARDS_PER_PAGE = COLS * ROWS;
      const MX = (210 - COLS * CW) / 2;
      const MY = (297 - ROWS * CH) / 2;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      for (let i = 0; i < items.length; i++) {
        const posIdx = i % CARDS_PER_PAGE;
        if (posIdx === 0 && i > 0) pdf.addPage();
        const col = posIdx % COLS;
        const row = Math.floor(posIdx / COLS);

        const cv = document.createElement('canvas');
        cv.width = 450; cv.height = 1400;
        await drawCardA4(cv, items[i], appName, slogan, '772772732', 450, 1400);

        const x = MX + col * CW;
        const y = MY + row * CH;
        pdf.addImage(cv.toDataURL('image/png'), 'PNG', x, y, CW, CH);
      }

      pdf.save(`أكواد_A4_${new Date().toLocaleDateString('ar-SA').replace(/\//g, '-')}.pdf`);
    } finally { setExporting(null); }
  };

  return (
    <>
      {/* زر الـ trigger يظهر فقط في الـ uncontrolled mode */}
      {!isControlled && (
        <Button variant="outline" className="gap-2 rounded-xl"
          onClick={() => { setOpen(true); setSelected(new Set()); if (onOpen) onOpen(); }}>
          <ImageDown className="h-4 w-4" />
          {triggerLabel || 'تصدير كصور'}
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-2xl rounded-2xl p-0 overflow-hidden">
          <DialogHeader className="px-5 pt-5 pb-4 border-b bg-background">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-black text-primary">تصدير الأكواد</DialogTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Button variant="outline" size="sm" className="gap-1 rounded-lg h-8 text-xs" onClick={selectAll}>
                <CheckSquare className="h-3.5 w-3.5" /> تحديد الكل ({codes.length})
              </Button>
              <Button variant="outline" size="sm" className="gap-1 rounded-lg h-8 text-xs" onClick={clearAll}>
                <Square className="h-3.5 w-3.5" /> إلغاء الكل
              </Button>
              <Badge variant="secondary" className="font-bold px-2.5">{selected.size} محدد</Badge>
              <div className="mr-auto flex gap-2 flex-wrap">
                <Button variant="outline" size="sm" className="gap-1.5 rounded-xl h-9 text-xs"
                  onClick={handlePng} disabled={selected.size === 0 || !!exporting}>
                  {exporting === 'png' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImageDown className="h-3.5 w-3.5" />}
                  PNG ({selected.size})
                </Button>
                <Button size="sm" className="gap-1.5 rounded-xl h-9 text-xs"
                  onClick={handlePdf} disabled={selected.size === 0 || !!exporting}>
                  {exporting === 'pdf' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
                  PDF - 16 كرت
                </Button>
                <Button size="sm" variant="secondary" className="gap-1.5 rounded-xl h-9 text-xs"
                  onClick={handlePdfA4} disabled={selected.size === 0 || !!exporting}>
                  {exporting === 'pdf-a4' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" />}
                  PDF - A4 (8 كروت)
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              PDF الأول: 16 كرت/صفحة (4.5×6سم) &nbsp;|&nbsp; PDF الثاني: 8 كروت/صفحة A4 (4.5×14سم)
            </p>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[65vh] p-5 bg-muted/30">
            {codes.length === 0
              ? <div className="text-center py-16 text-muted-foreground">لا توجد أكواد للتصدير</div>
              : (
                <div className="flex flex-col gap-5 items-center">
                  {codes.map(item => (
                    <PreviewCard key={item.id} item={item} appName={appName} slogan={slogan}
                      selected={selected.has(item.id)} onToggle={() => toggle(item.id)} />
                  ))}
                </div>
              )
            }
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CodeCardExport;
