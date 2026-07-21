'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import Button from '@/components/ui/Button';

type NavUser = {
  email: string;
  fullName: string;
  phoneNumber?: string;
};

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/upload', label: 'Upload' },
  { href: '/matches', label: 'Matches' },
];

function getInitials(name: string, email: string) {
  const source = name.trim() || email.trim();
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2) || 'SP';
}

const Navbar = () => {
  const [user, setUser] = useState<NavUser | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = getSupabaseClient();
    let isMounted = true;

    const syncUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!isMounted) return;

      const authUser = data.user;
      if (!authUser) {
        setUser(null);
        return;
      }

      setUser({
        email: authUser.email ?? '',
        fullName: String(authUser.user_metadata?.full_name ?? '').trim(),
        phoneNumber: String(authUser.user_metadata?.phone_number ?? '').trim() || undefined,
      });
    };

    void syncUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      const authUser = session?.user;
      if (!authUser) {
        setUser(null);
        return;
      }

      setUser({
        email: authUser.email ?? '',
        fullName: String(authUser.user_metadata?.full_name ?? '').trim(),
        phoneNumber: String(authUser.user_metadata?.phone_number ?? '').trim() || undefined,
      });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const displayName = useMemo(() => {
    if (!user) return '';
    return user.fullName || user.email.split('@')[0] || 'Member';
  }, [user]);

  const handleSignOut = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.replace('/');
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-900 text-sm font-semibold tracking-wide text-white">
            SP
          </div>
          <div className="leading-tight">
            <div className="text-base font-semibold text-slate-900">Skills Pathfinder</div>
            <div className="text-sm text-slate-500">Career matching workspace</div>
          </div>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold uppercase tracking-wide text-white">
                {getInitials(displayName, user.email)}
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                <p className="max-w-[220px] truncate text-xs text-slate-500">{user.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
