import { Ionicons } from "@expo/vector-icons";
import React from "react";
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

import { useColors } from "@/hooks/useColors";

import { useVoiceExpense } from "../hooks/useVoiceExpense";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export { isSpeechRecognitionAvailable } from "../hooks/useVoiceExpense";

export function VoiceExpenseModal({ visible, onClose }: Props) {
  const colors = useColors();
  const {
    transcript,
    errorMsg,
    pulseAnim,
    ringScale,
    ringOpacity,
    isListening,
    isDone,
    isParsing,
    isError,
    isIdle,
    startListening,
    stopListening,
    handleAnalyse,
    handleClose,
    handleRetry,
  } = useVoiceExpense(onClose, visible);

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

          <View style={styles.micArea}>
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
