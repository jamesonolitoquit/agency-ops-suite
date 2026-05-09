'use client';

import Link from 'next/link';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

type ClientAsset = {
  id: string;
  file_name: string;
  mime_type: string | null;
  file_size: number;
  public_url: string | null;
  created_at: string;
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ClientAssetsPage() {
  const [assets, setAssets] = useState<ClientAsset[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/client/assets');
      if (!res.ok) throw new Error('Failed to load files');
      const json = await res.json();
      setAssets(json.assets ?? []);
    } catch (err: any) {
      setError(err.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAssets();
  }, []);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/client/assets', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.message || json.error || 'Upload failed');
      }

      setFile(null);
      await loadAssets();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <Link href="/client/dashboard" style={{ color: '#2563eb', textDecoration: 'none' }}>
        ← Back to Dashboard
      </Link>

      <h1 style={{ marginTop: 16, marginBottom: 20 }}>Assets</h1>

      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Upload File</h2>
        <form onSubmit={handleUpload}>
          <input type="file" onChange={onFileChange} />
          <button
            type="submit"
            disabled={!file || uploading}
            style={{
              marginLeft: 10,
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 14px',
              cursor: 'pointer',
              opacity: !file || uploading ? 0.7 : 1,
            }}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
        <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 0 }}>
          Max upload size: 10 MB
        </p>
      </section>

      <section style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Uploaded Files</h2>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: '#b91c1c' }}>{error}</p>}

        {!loading && !error && assets.length === 0 && <p>No files uploaded yet.</p>}

        {!loading && !error && assets.length > 0 && (
          <div style={{ display: 'grid', gap: 10 }}>
            {assets.map((asset) => (
              <article key={asset.id} style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <strong>{asset.file_name}</strong>
                  <span style={{ color: '#6b7280', fontSize: 12 }}>
                    {new Date(asset.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ margin: '8px 0', fontSize: 13, color: '#4b5563' }}>
                  {asset.mime_type || 'Unknown type'} | {formatSize(asset.file_size)}
                </p>
                {asset.public_url && (
                  <a href={asset.public_url} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>
                    Open file
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
