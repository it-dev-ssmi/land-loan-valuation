'use client';

// ========================================================================
// src/app/page.tsx — ໜ້າເລີ່ມຕົ້ນ: ສົ່ງໄປໜ້າທີ່ຖືກຕາມສິດ
//   ຍັງບໍ່ login → /login ; admin → /admin ; staff → /staff
// ========================================================================

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMe } from '@/lib/auth';
import { PageLoading } from '@/components/app-header';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    getMe().then(m => {
      if (!m) router.replace('/login');
      else router.replace(m.isAdmin ? '/admin' : '/staff');
    });
  }, [router]);

  return <PageLoading />;
}
