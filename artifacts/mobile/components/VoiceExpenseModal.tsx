import { Ionicons } from "@expo/vector-icons";

// expo-speech-recognition requires native module linking — guard against missing native module
let ExpoSpeechRecognitionModule: any = null;
let useSpeechRecognitionEvent: ((event: string, handler: (e: any) => void) => void) = () => {};
try {
  const speechModule = require("expo-speech-recognition");
  ExpoSpeechRecognitionModule = speechModule.ExpoSpeechRecognitionModule;
  useSpeechRecognitionEvent = speechModule.useSpeechRecognitionEvent;
} catch {
  // Native module not available — voice features will be disabled
}

/** True only when the speech-recognition native module is linked (i.e. dev/prod build, not Expo Go) */
export const isSpeechRecognitionAvailable = ExpoSpeechRecognitionModule !== null;
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useParseVoiceExpense } from "@/hooks/api";
import { useColors } from "@/hooks/useColors";

type VoiceState = "idle" | "listening" | "done" | "parsing" | "error";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function VoiceExpenseModal({ visible, onClose }: Props) {
  const colors = useColors();
  const router = useRouter();
  const parseVoice = useParseVoiceExpense();

  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);
  const ringAnim = useRef(new Animated.Value(0)).current;
  const ringLoop = useRef<Animated.CompositeAnimation | null>(null);

  // Pulsing mic scale + ring expand when listening
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

  // Reset state when modal closes
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
    const best = event.results[0]?.transcript ?? "";
    setTranscript(best);
    if (event.isFinal) {
      setVoiceState("done");
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    if (event.error === "aborted") return;
    setErrorMsg(
      event.message?.length > 0
        ? event.message
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
      router.push(qs ? (`/add-expense?${qs}` as any) : "/add-expense");
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

  const isListening = voiceState === "listening";
  const isDone = voiceState === "done";
  const isParsing = voiceState === "parsing";
  const isError = voiceState === "error";
  const isIdle = voiceState === "idle";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.card },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Voice Expense
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeBtn}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={22} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* Mic area */}
          <View style={styles.micArea}>
            {/* Expanding ring */}
            {isListening && (
              <Animated.View
                style={[
                  styles.ring,
                  { borderColor: colors.primary },
                  {
                    transform: [{ scale: ringScale }],
                    opacity: ringOpacity,
                  },
                ]}
              />
            )}

            {/* Mic button */}
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                onPress={isListening ? stopListening : startListening}
                activeOpacity={0.8}
                disabled={isParsing}
                style={[
                  styles.micBtn,
                  {
                    backgroundColor: isListening
                      ? colors.destructive
                      : isParsing
                        ? colors.muted
                        : colors.primary,
                  },
                ]}
                accessibilityLabel={isListening ? "Stop recording" : "Start recording"}
                accessibilityRole="button"
              >
                {isParsing ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Ionicons
                    name={isListening ? "stop" : "mic"}
                    size={32}
                    color="#FFFFFF"
                  />
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Status label */}
            <Text
              style={[styles.statusText, { color: colors.mutedForeground }]}
            >
              {isIdle && "Tap the mic to start speaking"}
              {isListening && "Listening… tap to stop"}
              {isDone && "Done — review and confirm"}
              {isParsing && "Extracting expense details…"}
              {isError && "Something went wrong"}
            </Text>
          </View>

          {/* Transcript */}
          <View
            style={[
              styles.transcriptBox,
              { backgroundColor: colors.muted },
              isError && { borderColor: colors.destructive, borderWidth: 1 },
            ]}
          >
            {isError ? (
              <Text style={[styles.errorText, { color: colors.destructive }]}>
                {errorMsg}
              </Text>
            ) : (
              <Text
                style={[
                  styles.transcriptText,
                  {
                    color: transcript
                      ? colors.foreground
                      : colors.mutedForeground,
                  },
                ]}
              >
                {transcript || "Your spoken text will appear here…"}
              </Text>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.actions}>
            {isError ? (
              <TouchableOpacity
                onPress={handleRetry}
                style={[styles.actionBtn, { backgroundColor: colors.muted }]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="refresh"
                  size={18}
                  color={colors.foreground}
                  style={styles.btnIcon}
                />
                <Text style={[styles.actionBtnText, { color: colors.foreground }]}>
                  Try Again
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                {(isDone || isListening) && (
                  <TouchableOpacity
                    onPress={handleRetry}
                    style={[
                      styles.actionBtn,
                      styles.secondaryBtn,
                      { backgroundColor: colors.muted },
                    ]}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="refresh"
                      size={18}
                      color={colors.mutedForeground}
                      style={styles.btnIcon}
                    />
                    <Text
                      style={[
                        styles.actionBtnText,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      Redo
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={handleAnalyse}
                  disabled={!isDone || !transcript.trim()}
                  style={[
                    styles.actionBtn,
                    styles.primaryBtn,
                    {
                      backgroundColor: colors.primary,
                      opacity: isDone && transcript.trim() ? 1 : 0.4,
                      flex: isDone || isListening ? 1 : undefined,
                    },
                  ]}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Analyse and fill expense form"
                >
                  <Ionicons
                    name="sparkles-outline"
                    size={18}
                    color="#FFFFFF"
                    style={styles.btnIcon}
                  />
                  <Text style={[styles.actionBtnText, styles.primaryBtnText]}>
                    Analyse Expense
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const RING_SIZE = 88;
const MIC_BTN_SIZE = 72;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
    alignItems: "stretch",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  micArea: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    height: 120,
  },
  ring: {
    position: "absolute",
    width: RING_SIZE + 24,
    height: RING_SIZE + 24,
    borderRadius: (RING_SIZE + 24) / 2,
    borderWidth: 2,
  },
  micBtn: {
    width: MIC_BTN_SIZE,
    height: MIC_BTN_SIZE,
    borderRadius: MIC_BTN_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  statusText: {
    position: "absolute",
    bottom: 0,
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  transcriptBox: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 80,
    marginBottom: 20,
    justifyContent: "center",
  },
  transcriptText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
  },
  errorText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    flex: 1,
  },
  secondaryBtn: {
    flex: 0,
    paddingHorizontal: 16,
  },
  primaryBtn: {},
  btnIcon: {
    marginRight: 8,
  },
  actionBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  primaryBtnText: {
    color: "#FFFFFF",
  },
});
