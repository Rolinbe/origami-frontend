import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ScanBarcode, Camera, Keyboard, CheckCircle2, XCircle } from "lucide-react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import apiService from "@/services/api.service";

const SCAN_READER_ID = "scan-qr-reader";

type ScanResult = {
  success: boolean;
  message: string;
  isLate?: boolean;
  duplicate?: boolean;
  user?: {
    firstName: string;
    lastName: string;
    service?: string | null;
    employeeType?: string;
  };
  attendance?: {
    date: string;
    checkInTime?: string;
    checkOutTime?: string;
    status?: string;
    durationText?: string;
  };
};

const extractBadgeId = (qrCodeData: string): string | null => {
  const trimmed = qrCodeData.trim();
  try {
    const parsed = JSON.parse(trimmed);
    return parsed.badgeId || null;
  } catch {
    return trimmed || null;
  }
};

const playBeep = (success: boolean) => {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = success ? 880 : 220;
    oscillator.type = "sine";
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.25);
  } catch {
    // audio non disponible (permission, navigateur)
  }
};

const Scan = () => {
  const [scanType, setScanType] = useState<"check_in" | "check_out">("check_in");
  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const handleScanPayload = useCallback(
    async (qrCodeData: string) => {
      if (isProcessing) return;
      const badgeId = extractBadgeId(qrCodeData);
      if (!badgeId) {
        setResult({ success: false, message: "QR code invalide" });
        playBeep(false);
        return;
      }

      if (lastResult === badgeId) return;

      setIsProcessing(true);
      setResult(null);
      try {
        const response = await apiService.post<{ success?: boolean; message: string; isLate?: boolean; duplicate?: boolean; user?: ScanResult["user"]; attendance?: ScanResult["attendance"] }>(
          "/scan/badge",
          {
            qrCodeData,
            scanType,
            deviceId: "web-admin-scan",
            deviceName: "Poste de pointage web",
          },
        );
        const data = response.data;
        const ok = data.success !== false;
        setResult({
          success: ok,
          message: data.message,
          isLate: data.isLate,
          duplicate: data.duplicate,
          user: data.user,
          attendance: data.attendance,
        });
        setLastResult(badgeId);
        playBeep(ok);
      } catch (error) {
        const message =
          (error as { response?: { data?: { message?: string } } }).response?.data?.message ??
          "Erreur lors du scan";
        setResult({ success: false, message });
        playBeep(false);
      } finally {
        setTimeout(() => setIsProcessing(false), 1500);
        setTimeout(() => {
          setResult(null);
          setLastResult(null);
        }, 6000);
      }
    },
    [isProcessing, lastResult, scanType],
  );

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setResult(null);
    try {
      const scanner = new Html5Qrcode(SCAN_READER_ID);
      scannerRef.current = scanner;
      setScanning(true);
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleScanPayload(decodedText);
        },
        () => undefined,
      );
    } catch (error) {
      setScanning(false);
      setCameraError(
        "Impossible d'accéder à la caméra. Vérifiez les permissions ou utilisez la saisie manuelle.",
      );
    }
  }, [handleScanPayload]);

  const stopCamera = useCallback(async () => {
    setScanning(false);
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // ignore
      }
      try {
        scannerRef.current.clear();
      } catch {
        // ignore
      }
      scannerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleManualSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!manualCode.trim()) return;
    handleScanPayload(manualCode.trim());
    setManualCode("");
  };

  const toggleScanType = (type: "check_in" | "check_out") => {
    setScanType(type);
    setResult(null);
    setLastResult(null);
  };

  return (
    <div className="min-h-screen bg-app flex">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-auto h-screen">
        <main className="container mx-auto px-4 py-8 space-y-6">
          <PageHeader
            icon={ScanBarcode}
            title="Poste de pointage"
            description="Scannez le badge QR code d'un employé pour enregistrer son entrée ou sa sortie."
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Scanner le badge</CardTitle>
                <CardDescription>
                  Choisissez le type de pointage puis scannez ou saisissez le badge.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex rounded-lg border p-1 w-fit">
                  <button
                    type="button"
                    onClick={() => toggleScanType("check_in")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      scanType === "check_in"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Entrée
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleScanType("check_out")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      scanType === "check_out"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    Sortie
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {!scanning ? (
                    <Button onClick={startCamera}>
                      <Camera className="mr-2 h-4 w-4" />
                      Activer la caméra
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={stopCamera}>
                      Désactiver la caméra
                    </Button>
                  )}
                </div>

                <div
                  id={SCAN_READER_ID}
                  className={`rounded-lg overflow-hidden bg-muted ${scanning ? "" : "hidden"}`}
                />

                {cameraError && (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                    {cameraError}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Keyboard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Saisie manuelle</span>
                </div>
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <Input
                    value={manualCode}
                    onChange={(event) => setManualCode(event.currentTarget.value)}
                    placeholder="ID du badge ou contenu du QR code"
                  />
                  <Button type="submit" disabled={!manualCode.trim() || isProcessing}>
                    Pointer
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Confirmation</CardTitle>
                <CardDescription>Résultat du dernier scan</CardDescription>
              </CardHeader>
              <CardContent>
                {!result ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <ScanBarcode className="h-12 w-12 mb-3 opacity-40" />
                    <p className="text-sm">En attente d'un scan…</p>
                  </div>
                ) : result.success ? (
                  <div className="rounded-lg border border-success/30 bg-success/10 p-4">
                    <div className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="h-5 w-5" />
                      <p className="font-medium">{result.message}</p>
                    </div>
                    {result.user && (
                      <div className="mt-3 text-sm">
                        <p className="font-semibold text-foreground">
                          {result.user.firstName} {result.user.lastName}
                        </p>
                        <p className="text-muted-foreground">
                          {result.user.service ?? "Non assigné"}
                          {result.user.employeeType === "intern" ? " · Stagiaire" : ""}
                        </p>
                      </div>
                    )}
                    {result.attendance && (
                      <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                        <p>Date : {result.attendance.date}</p>
                        {result.attendance.checkInTime && (
                          <p>Entrée : {result.attendance.checkInTime}</p>
                        )}
                        {result.attendance.checkOutTime && (
                          <p>Sortie : {result.attendance.checkOutTime}</p>
                        )}
                        {result.attendance.durationText && (
                          <p>Durée : {result.attendance.durationText}</p>
                        )}
                        {result.isLate && (
                          <p className="text-warning font-medium">⚠ Retard</p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                    <div className="flex items-center gap-2 text-destructive">
                      <XCircle className="h-5 w-5" />
                      <p className="font-medium">{result.message}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Scan;