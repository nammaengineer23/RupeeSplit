import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QrCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
  altText?: string;
}

export const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({
  value,
  size = 200,
  className = '',
  altText = 'QR Code',
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      width: size * 2, // 2x for retina sharpness
      margin: 2,
      color: {
        dark: '#0f172a', // slate-900
        light: '#ffffff',
      },
    })
      .then((url) => {
        setDataUrl(url);
        setError(false);
      })
      .catch((err) => {
        console.error('QR code generation error:', err);
        setError(true);
      });
  }, [value, size]);

  if (error || !dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500 ${className}`}
      >
        <span>Generating QR...</span>
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt={altText}
      width={size}
      height={size}
      className={`rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 bg-white p-1.5 ${className}`}
      referrerPolicy="no-referrer"
    />
  );
};
