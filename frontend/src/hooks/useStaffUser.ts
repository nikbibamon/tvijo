'use client';

import { useEffect, useState } from 'react';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api/v1').replace(/\/+$/, '');

interface StaffUserResponse {
  is_staff?: boolean | string;
  is_superuser?: boolean | string;
}

function isTruthyFlag(value: boolean | string | undefined): boolean {
  return value === true || value === 'true';
}

export function useStaffUser(): boolean {
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    let active = true;

    const checkStaff = () => {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setIsStaff(false);
        return;
      }

      fetch(`${API_BASE}/auth/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((user: StaffUserResponse | null) => {
          if (!active) return;
          setIsStaff(!!user && (isTruthyFlag(user.is_staff) || isTruthyFlag(user.is_superuser)));
        })
        .catch(() => {
          if (active) setIsStaff(false);
        });
    };

    checkStaff();
    window.addEventListener('tvijo-auth-changed', checkStaff);

    return () => {
      active = false;
      window.removeEventListener('tvijo-auth-changed', checkStaff);
    };
  }, []);

  return isStaff;
}
