'use client';

// ========================================================================
// src/app/login/page.tsx — ເຂົ້າສູ່ລະບົບ (ຢູເຊີ + ລະຫັດຜ່ານ)
// ໃຊ້ Supabase Auth. ຢູເຊີຖືກແປງເປັນ email ພາຍໃນ: <username>@ssmi.local
// ========================================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { usernameToEmail, getMe } from '@/lib/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr('');
    const { error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username.trim()),
      password,
    });
    setBusy(false);
    if (error) { setErr('ຢູເຊີ ຫຼື ລະຫັດຜ່ານ ບໍ່ຖືກຕ້ອງ'); return; }
    // admin → ໜ້າຈັດການ ; ພະນັກງານແຂວງ → ໜ້າປະເມີນ
    const me = await getMe();
    router.push(me?.isAdmin ? '/admin' : '/staff');
  }

  return (
    <main className="grid min-h-svh place-items-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <img src="/icon.svg" alt="" className="mx-auto mb-2 size-14 rounded-xl" />
          <CardTitle className="text-xl">ເຂົ້າສູ່ລະບົບ</CardTitle>
          <CardDescription>ລະບົບປະເມີນວົງເງິນປ່ອຍກູ້</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">ຢູເຊີ</Label>
              <Input id="username" value={username} onChange={e => setUsername(e.target.value)}
                autoComplete="username" placeholder="ຊື່ຜູ້ໃຊ້" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">ລະຫັດຜ່ານ</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                autoComplete="current-password" placeholder="ລະຫັດຜ່ານ" required />
            </div>
            {err && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{err}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />}
              {busy ? 'ກຳລັງເຂົ້າ…' : 'ເຂົ້າສູ່ລະບົບ'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
