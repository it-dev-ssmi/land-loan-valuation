'use client';

// ========================================================================
// src/components/app-header.tsx — ແຖບເທິງ: ໂລໂກ້/ຊື່ສະຖາບັນ + ຜູ້ໃຊ້ + ລິ້ງ + ອອກ
// ========================================================================

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { signOut, type Me } from '@/lib/auth';
import { Loader } from '@/components/loader';

interface Props {
  me: Me;
  logoUrl?: string;
  instName?: string;
  title: string;
  nav?: { href: string; label: string; icon?: React.ReactNode };
}

export function AppHeader({ me, logoUrl, instName, title, nav }: Props) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur noprint">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        {logoUrl
          ? <img src={logoUrl} alt="" className="h-9 w-auto max-w-32 rounded-md object-contain" />
          : <img src="/icon.svg" alt="" className="size-9 rounded-md" />}
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold leading-tight">{instName || 'ລະບົບປະເມີນຫຼັກຊັບ'}</div>
          <div className="truncate text-xs text-muted-foreground">{title}</div>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-sm font-medium">{me.full_name || me.username}</span>
          <Badge variant={me.isAdmin ? 'default' : 'secondary'}>{me.isAdmin ? 'ແອັດມິນ' : 'ພະນັກງານ'}</Badge>
        </div>
        {nav && (
          <Button variant="outline" size="sm" asChild>
            <Link href={nav.href}>{nav.icon}{nav.label}</Link>
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={async () => { await signOut(); router.replace('/login'); }}>
          <LogOut />
          <span className="hidden sm:inline">ອອກ</span>
        </Button>
      </div>
    </header>
  );
}

export function PageLoading() {
  return (
    <main className="grid min-h-svh place-items-center"><Loader /></main>
  );
}
