import { useCallback, useLayoutEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { ScanBarcode, Camera, Keyboard, CheckCircle2, XCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import apiService from "@/services/api.service";

const stopStream = (stream: MediaStream | null) => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
};

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

let audioCtx: AudioContext | null = null;

const getAudioCtx = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!audioCtx) audioCtx = new AC();
  if (audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
};

const playTone = (
  ctx: AudioContext,
  frequency: number,
  delay: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.3,
) => {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(ctx.currentTime + delay);
  oscillator.stop(ctx.currentTime + delay + duration);
};

const playBeep = (success: boolean) => {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (success) {
      playTone(ctx, 880, 0, 0.13);
      playTone(ctx, 1320, 0.16, 0.22);
    } else {
      playTone(ctx, 220, 0, 0.18, "square", 0.22);
      playTone(ctx, 180, 0.22, 0.28, "square", 0.22);
    }
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanLoopRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const decodingRef = useRef(false);

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

  const scanFrame = useCallback(() => {
    const video = videoRef.current;
    if (!scanLoopRef.current || !video) return;
    if (video.readyState < 2) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;
    if (!ctxRef.current) {
      ctxRef.current = canvas.getContext("2d", { willReadFrequently: true });
    }
    const ctx = ctxRef.current;
    if (!ctx) {
      rafRef.current = requestAnimationFrame(scanFrame);
      return;
    }
    const width = video.videoWidth || 320;
    const height = video.videoHeight || 240;
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
    ctx.drawImage(video, 0, 0, width, height);
    if (!decodingRef.current) {
      decodingRef.current = true;
      try {
        const imageData = ctx.getImageData(0, 0, width, height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        if (code?.data) {
          handleScanPayload(code.data);
        }
      } catch {
        // erreur de décodage ignorée (l'image est peut-être en cours de changement)
      } finally {
        decodingRef.current = false;
      }
    }
    rafRef.current = requestAnimationFrame(scanFrame);
  }, [handleScanPayload]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stopStream(stream);
        throw new Error("Aucun élément vidéo");
      }
      video.srcObject = stream;
      await video.play();
      setScanning(true);
      scanLoopRef.current = true;
      rafRef.current = requestAnimationFrame(scanFrame);
    } catch (error) {
      stopStream(streamRef.current);
      streamRef.current = null;
      setScanning(false);
      setCameraError(
        "Impossible d'accéder à la caméra. Vérifiez les permissions ou utilisez la saisie manuelle.",
      );
    }
  }, [scanFrame]);

  const stopCamera = useCallback(() => {
    scanLoopRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    const video = videoRef.current;
    if (video) {
      video.srcObject = null;
    }
    stopStream(streamRef.current);
    streamRef.current = null;
    setScanning(false);
  }, []);

  useLayoutEffect(() => {
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
    <AppLayout>
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

            <div className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-950 ${scanning ? "" : "hidden"}`}>
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={`h-full w-full object-contain ${scanning ? "" : "hidden"}`}
              />

              {scanning && (
                <div className="pointer-events-none absolute inset-0">
                  <div
                    className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 sm:h-60 sm:w-60"
                    style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)" }}
                  >
                    <span className="absolute -left-1 -top-1 h-9 w-9 rounded-tl-lg border-l-4 border-t-4 border-emerald-400" />
                    <span className="absolute -right-1 -top-1 h-9 w-9 rounded-tr-lg border-r-4 border-t-4 border-emerald-400" />
                    <span className="absolute -bottom-1 -left-1 h-9 w-9 rounded-bl-lg border-b-4 border-l-4 border-emerald-400" />
                    <span className="absolute -bottom-1 -right-1 h-9 w-9 rounded-br-lg border-b-4 border-r-4 border-emerald-400" />
                    <div
                      className="scan-line absolute left-1 right-1 h-0.5 rounded-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
                      style={{ boxShadow: "0 0 14px 2px rgba(52,211,153,0.7)" }}
                    />
                  </div>

                  <div className="absolute bottom-3 left-0 right-0 flex justify-center px-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-emerald-300 backdrop-blur">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                      Scannez le badge QR dans le cadre
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant={scanning ? "outline" : "default"}
                onClick={scanning ? stopCamera : startCamera}
              >
                <Camera className="mr-2 h-4 w-4" />
                {scanning ? "Désactiver la caméra" : "Activer la caméra"}
              </Button>
            </div>

            {cameraError && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {cameraError}
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <Keyboard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Saisie manuelle</span>
            </div>
            <form onSubmit={handleManualSubmit} className="flex flex-col gap-2 sm:flex-row">
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
    </AppLayout>
  );
};

export default Scan;