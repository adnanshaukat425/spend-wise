import * as Haptics from "expo-haptics";
import { useRouter, type Href } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated } from "react-native";

import { useParseVoiceExpense } from "../api";

type VoiceState = "idle" | "listening" | "done" | "parsing" | "error";

interface SpeechRecognitionStartOptions {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
}

interface SpeechRecognitionResultEvent {
  results: Array<{ transcript: string }>;
  isFinal?: boolean;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface ExpoSpeechRecognitionModuleType {
  start: (options: SpeechRecognitionStartOptions) => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionEventName = "start" | "end" | "result" | "error";

type UseSpeechRecognitionEvent = (
  event: SpeechRecognitionEventName,
  handler: (event?: SpeechRecognitionResultEvent | SpeechRecognitionErrorEvent) => void,
) => void;

let ExpoSpeechRecognitionModule: ExpoSpeechRecognitionModuleType | null = null;
let useSpeechRecognitionEvent: UseSpeechRecognitionEvent = () => {};

try {
  const speechModule = require("expo-speech-recognition") as {
    ExpoSpeechRecognitionModule: ExpoSpeechRecognitionModuleType;
    useSpeechRecognitionEvent: UseSpeechRecognitionEvent;
  };
  ExpoSpeechRecognitionModule = speechModule.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = speechModule.useSpeechRecognitionEvent;
} catch {
  // Native module not available — voice features will be disabled
}

/** True only when the speech-recognition native module is linked (i.e. dev/prod build, not Expo Go) */
export const isSpeechRecognitionAvailable = ExpoSpeechRecognitionModule !== null;

export function useVoiceExpense(onClose: () => void, visible: boolean) {
  const router = useRouter();
  const parseVoice = useParseVoiceExpense();

  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);
  const ringAnim = useRef(new Animated.Value(0)).current;
  const ringLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (voiceState === "listening") {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseLoop.current.start();

      ringLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(ringAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(ringAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );
      ringLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      ringLoop.current?.stop();
      pulseAnim.setValue(1);
      ringAnim.setValue(0);
    }
  }, [voiceState, pulseAnim, ringAnim]);

  useEffect(() => {
    if (!visible) {
      setVoiceState("idle");
      setTranscript("");
      setErrorMsg("");
    }
  }, [visible]);

  useSpeechRecognitionEvent("start", () => {
    setVoiceState("listening");
  });

  useSpeechRecognitionEvent("end", () => {
    setVoiceState((prev) => (prev === "listening" ? "done" : prev));
  });

  useSpeechRecognitionEvent("result", (event) => {
    const resultEvent = event as SpeechRecognitionResultEvent | undefined;
    const best = resultEvent?.results[0]?.transcript ?? "";
    setTranscript(best);
    if (resultEvent?.isFinal) {
      setVoiceState("done");
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    const errorEvent = event as SpeechRecognitionErrorEvent | undefined;
    if (errorEvent?.error === "aborted") return;
    setErrorMsg(
      errorEvent?.message && errorEvent.message.length > 0
        ? errorEvent.message
        : "Speech recognition failed. Please try again.",
    );
    setVoiceState("error");
  });

  const startListening = useCallback(() => {
    if (!ExpoSpeechRecognitionModule) {
      setErrorMsg("Voice recognition is not available on this device.");
      setVoiceState("error");
      return;
    }
    setTranscript("");
    setErrorMsg("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      maxAlternatives: 1,
      continuous: false,
    });
  }, []);

  const stopListening = useCallback(() => {
    ExpoSpeechRecognitionModule?.stop();
  }, []);

  const handleAnalyse = useCallback(async () => {
    if (!transcript.trim()) return;
    setVoiceState("parsing");
    try {
      const result = await parseVoice.mutateAsync(transcript.trim());
      onClose();

      const params = new URLSearchParams();
      if (result.amount !== null && result.amount !== undefined) {
        params.set("prefillAmount", String(result.amount));
      }
      if (result.categorySlug) {
        params.set("prefillCategory", result.categorySlug);
      }
      if (result.note) {
        params.set("prefillNote", result.note);
      }

      const qs = params.toString();
      const href: Href = qs ? `/add-expense?${qs}` : "/add-expense";
      router.push(href);
    } catch {
      setErrorMsg("Could not extract expense details. Please try again.");
      setVoiceState("error");
    }
  }, [transcript, parseVoice, onClose, router]);

  const handleClose = useCallback(() => {
    if (voiceState === "listening") {
      ExpoSpeechRecognitionModule?.abort();
    }
    setVoiceState("idle");
    setTranscript("");
    setErrorMsg("");
    onClose();
  }, [voiceState, onClose]);

  const handleRetry = useCallback(() => {
    setTranscript("");
    setErrorMsg("");
    setVoiceState("idle");
  }, []);

  const ringScale = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.6],
  });
  const ringOpacity = ringAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 0.15, 0],
  });

  return {
    voiceState,
    transcript,
    errorMsg,
    pulseAnim,
    ringScale,
    ringOpacity,
    isListening: voiceState === "listening",
    isDone: voiceState === "done",
    isParsing: voiceState === "parsing",
    isError: voiceState === "error",
    isIdle: voiceState === "idle",
    startListening,
    stopListening,
    handleAnalyse,
    handleClose,
    handleRetry,
  };
}
