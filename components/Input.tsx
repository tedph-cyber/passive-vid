'use client';
import { FC } from 'react';

type Props = {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
};

const Input: FC<Props> = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full max-w-md p-3 rounded border border-gray-300 focus:outline-none focus:ring focus:ring-blue-400"
  />
);

export default Input;
