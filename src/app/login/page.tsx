'use client';

// ========================================================================
// src/app/login/page.tsx — ເຂົ້າສູ່ລະບົບ (ອີເມວ + ລະຫັດຜ່ານ ຫຼື Google) ຜ່ານ Supabase Auth
// Google: ຫຼັງ login ສຳເລັດ Supabase ສົ່ງກັບມາ '/' → ໜ້ານັ້ນສົ່ງຕໍ່ຕາມສິດ
// ========================================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { getMe } from '@/lib/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.42 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [gBusy, setGBusy] = useState(false);

  async function signInGoogle() {
    setGBusy(true); setErr('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    // ສຳເລັດ → browser ຖືກພາໄປ Google ເລີຍ; ຢູ່ນີ້ຕໍ່ ແມ່ນມີ error ເທົ່ານັ້ນ
    if (error) { setErr('ເຂົ້າດ້ວຍ Google ບໍ່ໄດ້: ' + error.message); setGBusy(false); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr('');
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setBusy(false);
    if (error) { setErr('ອີເມວ ຫຼື ລະຫັດຜ່ານ ບໍ່ຖືກຕ້ອງ'); return; }
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
              <Label htmlFor="email">ອີເມວ</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                autoComplete="email" placeholder="name@example.com" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">ລະຫັດຜ່ານ</Label>
              <div className="relative">
                <Input id="password" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password" placeholder="ລະຫັດຜ່ານ" className="pr-10" required />
                <Button type="button" variant="ghost" size="icon" onClick={() => setShowPw(v => !v)}
                  className="absolute top-1/2 right-1 size-7 -translate-y-1/2 text-muted-foreground"
                  aria-label={showPw ? 'ເຊື່ອງລະຫັດ' : 'ເປີດເບິ່ງລະຫັດ'} title={showPw ? 'ເຊື່ອງລະຫັດ' : 'ເປີດເບິ່ງລະຫັດ'}>
                  {showPw ? <EyeOff /> : <Eye />}
                </Button>
              </div>
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
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />ຫຼື<span className="h-px flex-1 bg-border" />
            </div>
            <Button type="button" variant="outline" size="lg" className="w-full" onClick={signInGoogle} disabled={gBusy || busy}>
              {gBusy ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
              ເຂົ້າສູ່ລະບົບດ້ວຍ Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
