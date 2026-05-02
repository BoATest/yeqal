import { Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

export type CameraMode = "object" | "text";

interface CameraResult {
  mode: CameraMode;
  detectedText?: string;
  objectLabel?: string;
}

interface Props {
  onClose: () => void;
  onResult: (result: CameraResult) => void;
}

export function CameraOverlay({ onClose, onResult }: Props) {
  const colors = useColors();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<CameraMode>("object");
  const [cameraReady, setCameraReady] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    if (Platform.OS !== "web" || typeof navigator === "undefined") return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraReady(true);
      }
    } catch {
      setPermissionDenied(true);
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [startCamera]);

  const captureFrame = (): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
  };

  const handleCapture = async () => {
    setIsCapturing(true);
    setError(null);
    try {
      const base64 = captureFrame();
      if (!base64) throw new Error("Could not capture image");

      const apiKey = (typeof process !== "undefined" && process.env?.EXPO_PUBLIC_GOOGLE_VISION_KEY) ?? "";

      if (!apiKey) {
        if (mode === "object") {
          setError("Camera identification needs a Google Vision API key. Coming soon!");
        } else {
          setError("Text reading needs a Google Vision API key. For now, type your homework text manually.");
        }
        setIsCapturing(false);
        return;
      }

      const featureType = mode === "object" ? "OBJECT_LOCALIZATION" : "TEXT_DETECTION";
      const res = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [
              {
                image: { content: base64 },
                features: [{ type: featureType, maxResults: 3 }],
              },
            ],
          }),
        }
      );

      if (!res.ok) throw new Error("Vision API error");
      const data = await res.json();
      const annotation = data.responses?.[0];

      if (mode === "object") {
        const label =
          annotation?.localizedObjectAnnotations?.[0]?.name ?? null;
        if (!label) {
          setError("Could not identify any object. Try pointing at a clearer object.");
          return;
        }
        onResult({ mode: "object", objectLabel: label.toLowerCase() });
      } else {
        const text = annotation?.textAnnotations?.[0]?.description ?? null;
        if (!text) {
          setError("Could not read any text. Make sure the text is clear and well-lit.");
          return;
        }
        onResult({ mode: "text", detectedText: text });
      }
    } catch {
      setError("Camera identification not available right now. Try typing the word instead.");
    } finally {
      setIsCapturing(false);
    }
  };

  if (Platform.OS !== "web") {
    return (
      <View style={[styles.overlay, { backgroundColor: "#000" }]}>
        <View style={[styles.errorState, { backgroundColor: colors.card }]}>
          <Feather name="camera-off" size={32} color={colors.mutedForeground} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>
            Camera available in the mobile app
          </Text>
          <Text style={[styles.errorDesc, { color: colors.mutedForeground }]}>
            Type your homework text in the box above.
          </Text>
          <Pressable
            onPress={onClose}
            style={[styles.closeErrorBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.closeErrorBtnText}>Close</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      {/* Live camera video (web only) */}
      {Platform.OS === "web" && (
        <>
          <video
            ref={videoRef as any}
            style={webStyles.video}
            playsInline
            muted
          />
          <canvas ref={canvasRef as any} style={webStyles.canvas} />
        </>
      )}

      {/* Dark overlay UI */}
      <View style={styles.ui}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.modeRow}>
            {(["object", "text"] as CameraMode[]).map((m) => (
              <Pressable
                key={m}
                onPress={() => { setMode(m); setError(null); }}
                style={[
                  styles.modeBtn,
                  { backgroundColor: mode === m ? "#FFFFFF" : "#FFFFFF30" },
                ]}
              >
                <Text style={[styles.modeBtnText, { color: mode === m ? "#1C1C28" : "#FFFFFF" }]}>
                  {m === "object" ? "📷 Learn Object" : "📖 Read Text"}
                </Text>
              </Pressable>
            ))}
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={24} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* States */}
        {permissionDenied && (
          <View style={[styles.stateCard, { backgroundColor: "#00000099" }]}>
            <Feather name="camera-off" size={28} color="#FFFFFF" />
            <Text style={styles.stateTitle}>Camera access denied</Text>
            <Text style={styles.stateDesc}>
              We need camera access to identify objects. Please allow camera in your browser settings.
            </Text>
          </View>
        )}

        {error && (
          <View style={[styles.stateCard, { backgroundColor: "#00000099" }]}>
            <Feather name="alert-circle" size={28} color="#F59E0B" />
            <Text style={styles.stateTitle}>{error}</Text>
            <Pressable onPress={() => setError(null)} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>Try again</Text>
            </Pressable>
          </View>
        )}

        {/* Capture button */}
        {!permissionDenied && !error && (
          <View style={styles.captureRow}>
            {isCapturing ? (
              <View style={styles.capturingState}>
                <ActivityIndicator color="#FFFFFF" size="large" />
                <Text style={styles.capturingText}>
                  {mode === "object" ? "Identifying object..." : "Reading text..."}
                </Text>
              </View>
            ) : (
              <Pressable
                onPress={handleCapture}
                disabled={!cameraReady}
                style={[styles.captureBtn, { opacity: cameraReady ? 1 : 0.5 }]}
              >
                <View style={styles.captureBtnInner} />
              </Pressable>
            )}
          </View>
        )}

        {/* Guide text */}
        {!error && !permissionDenied && !isCapturing && (
          <Text style={styles.guideText}>
            {mode === "object"
              ? "Point at an object and tap the button"
              : "Point at homework text and tap the button"}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute" as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    zIndex: 999,
  },
  ui: {
    position: "absolute" as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modeRow: { flexDirection: "row", gap: 8 },
  modeBtn: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  modeBtnText: { fontSize: 13, fontWeight: "600" },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF22",
    alignItems: "center",
    justifyContent: "center",
  },
  stateCard: {
    margin: 20,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  stateTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  stateDesc: {
    color: "#FFFFFFAA",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  retryBtn: {
    backgroundColor: "#FFFFFF22",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  retryBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  captureRow: {
    alignItems: "center",
    justifyContent: "center",
    height: 100,
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  captureBtnInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
  },
  capturingState: { alignItems: "center", gap: 12 },
  capturingText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  guideText: {
    color: "#FFFFFFAA",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  errorState: {
    margin: 40,
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    gap: 12,
  },
  errorTitle: { fontSize: 16, fontWeight: "700", textAlign: "center" },
  errorDesc: { fontSize: 13, textAlign: "center", lineHeight: 19 },
  closeErrorBtn: {
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  closeErrorBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});

const webStyles = {
  video: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
  },
  canvas: {
    display: "none" as const,
  },
};
