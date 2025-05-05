'use client';
import { FC } from 'react';

type Props = {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
};

const Button: FC<Props> = ({ onClick, disabled, loading, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
  >
    {loading ? 'Converting...' : children}
  </button>
);

export default Button;
