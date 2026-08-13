import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import QRCode from "qrcode";

const QRCodeDisplay = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const generateNewQRCode = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const code = `DEMO-${today}-${Math.random().toString(36).substring(7)}`;

      const url = await QRCode.toDataURL(code, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1e40af',
          light: '#ffffff'
        }
      });

      setQrCodeUrl(url);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  // Utilisation de useEffect pour générer le QR code initial
  useEffect(() => {
    if (!qrCodeUrl) {
      generateNewQRCode();
    }
  }, []); 

  return (
    <Card className="transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lift">
      <CardHeader>
        <CardTitle>QR Code du Jour</CardTitle>
        <CardDescription>
          Les employés doivent scanner ce code pour pointer
        </CardDescription>
      </CardHeader>
      <CardContent className="h-96 flex flex-col items-center space-y-4">
        {qrCodeUrl ? (
          <div className="p-4 bg-white rounded-lg">
            <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />
          </div>
        ) : (
          <div className="w-64 h-64 bg-muted rounded-lg animate-pulse" />
        )}
        <Button
          onClick={generateNewQRCode}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Générer un nouveau QR Code
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Valide jusqu'à 23h59 aujourd'hui
        </p>
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;