export default function Result({ downloadUrl }: { downloadUrl: string }) {
  return (
    <div className="mt-4">
      <p className="text-green-600 font-semibold">Conversion successful!</p>
      <a
        href={downloadUrl}
        download
        className="text-blue-500 underline mt-2 block"
      >
        Click here to download the audio
      </a>
    </div>
  );
}
