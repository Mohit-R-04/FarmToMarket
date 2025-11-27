import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QRCodeDisplayProps {
  qrValue: string;
  productName: string;
}

export function QRCodeDisplay({ qrValue, productName }: QRCodeDisplayProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    // Create a canvas element to download QR code
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `${productName}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product QR Code</CardTitle>
        <CardDescription>Scan this QR code to view product details</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div ref={qrRef} className="p-4 bg-white rounded-lg">
          <QRCodeSVG value={qrValue} size={200} level="H" />
        </div>
        <Button onClick={handleDownload} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download QR Code
        </Button>
        <p className="text-xs text-muted-foreground text-center max-w-xs">
          {qrValue}
        </p>
      </CardContent>
    </Card>
  );
}

