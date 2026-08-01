'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useAuthContext } from '@/context/AuthContext';
import type { Certificate } from '@/types';

export function useCertificates() {
  const { user } = useAuthContext();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tablesExist, setTablesExist] = useState<boolean | null>(null);

  const fetchCertificates = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setCertificates([]);
      return;
    }
    
    // Skip API calls if we know tables don't exist
    if (tablesExist === false) {
      setLoading(false);
      setCertificates([]);
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/certificates?userId=${user.id}`);
      const data = await response.json();
      if (!response.ok) {
        // If it's a 500 error, assume table doesn't exist and skip future calls
        if (response.status === 500) {
          console.log('Certificates table may not exist yet, skipping future calls');
          setTablesExist(false);
          setCertificates([]);
          return;
        }
        throw new Error(data.error || 'Failed to fetch certificates');
      }
      setTablesExist(true);
      setCertificates(data.certificates || []);
    } catch (err) {
      // Silently handle errors - don't show error state for missing tables
      console.error('Certificate fetch error:', err);
      setTablesExist(false);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  }, [user, tablesExist]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const uploadCertificate = useCallback(async (
    file: File,
    metadata: {
      title: string;
      issuer?: string;
      issueDate?: string;
      expiryDate?: string;
      credentialId?: string;
      verificationUrl?: string;
    },
    extractedText?: string
  ) => {
    if (!user) {
      setError('You must be logged in to upload certificates.');
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', user.id);
      formData.append('title', metadata.title);
      if (metadata.issuer) formData.append('issuer', metadata.issuer);
      if (metadata.issueDate) formData.append('issueDate', metadata.issueDate);
      if (metadata.expiryDate) formData.append('expiryDate', metadata.expiryDate);
      if (metadata.credentialId) formData.append('credentialId', metadata.credentialId);
      if (metadata.verificationUrl) formData.append('verificationUrl', metadata.verificationUrl);
      if (extractedText) formData.append('extractedText', extractedText);

      const response = await fetch('/api/certificates', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to upload certificate');

      await fetchCertificates();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload certificate');
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, fetchCertificates]);

  const deleteCertificate = useCallback(async (certificateId: string) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/certificates?certificateId=${certificateId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete certificate');
      await fetchCertificates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete certificate');
    } finally {
      setLoading(false);
    }
  }, [user, fetchCertificates]);

  return { certificates, loading, error, uploadCertificate, deleteCertificate, refetch: fetchCertificates };
}
