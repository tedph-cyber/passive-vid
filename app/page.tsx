'use client';

import { useState } from 'react';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Loader from '@/components/Loader';
import Result from '@/components/Result';

export default function Home() {
  const [videoUrl, setVideoUrl] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConvert = async () => {
    setLoading(true);
    setError('');
    setDownloadUrl('');

    try {
      const res = await fetch('https://your-backend.onrender.com/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl }),
      });

      const data = await res.json();
      if (data?.file) {
        setDownloadUrl(`https://your-backend.onrender.com${data.file}`);
      } else {
        setError('Conversion failed.');
      }
    } catch (err) {
      setError('Server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <h1 className="text-4xl font-bold mb-6 text-center">YouTube to MP3 Converter</h1>

      <Input value={videoUrl} onChange={setVideoUrl} placeholder="Enter YouTube URL" />
      <Button onClick={handleConvert} disabled={loading || !videoUrl} loading={loading}>
        Convert
      </Button>

      {loading && <Loader />}
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {downloadUrl && <Result downloadUrl={downloadUrl} />}
    </main>
  );
}
