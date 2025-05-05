'use client';
import { FC } from 'react';

type Props = {
  downloadUrl: string;
};

const Result: FC<Props> = ({ downloadUrl }) => (
  <a
    href={downloadUrl}
    className="mt-6 inline-block bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
    download
  >
    Download Audio
  </a>
);

export default Result;
