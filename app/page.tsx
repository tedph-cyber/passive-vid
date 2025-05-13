"use client";

import { useState } from "react";
import Input from "../components/Input";
import Button from "../components/Button";
import Loader from "../components/Loader";
import Result from "../components/Result";

export default function Home() {
  const [videoUrl, setVideoUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConvert = async () => {
    setLoading(true);
    setError("");
    setDownloadUrl("");

    try {
      let response;

      if (file) {
        const formData = new FormData();
        formData.append("video", file);
        response = await fetch("http://localhost:5000/upload", {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
          body: formData,
        });
      } else {
        response = await fetch("http://localhost:5000/convert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoUrl }),
        });
      }

      const data = await response.json();

      if (data?.file) {
        setDownloadUrl(`http://localhost:5000${data.file}`);
      } else {
        setError("Conversion failed.");
      }
    } catch (err) {
      setError("Server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <h1 className="text-3xl font-bold mb-4">Video to Audio Converter</h1>

      <p className="mb-2 text-sm text-gray-500">
        Paste a video URL or upload a video file
      </p>

      <Input
        value={videoUrl}
        onChange={(value) => {
          setVideoUrl(value);
          setFile(null); // Clear file if URL is typed
        }}
        placeholder="Paste video URL"
      />

      <div className="mt-4">
        <input
          type="file"
          accept="video/*"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setVideoUrl(""); // Clear URL if file is selected
          }}
        />
      </div>

      <Button
        onClick={handleConvert}
        disabled={loading || (!videoUrl && !file)}
        loading={loading}
      >
        Convert
      </Button>

      {loading && <Loader />}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {downloadUrl && <Result downloadUrl={downloadUrl} />}
    </main>
  );
}
