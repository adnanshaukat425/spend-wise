import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState, useMemo } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { CircularProgress } from "@/components/charts/CircularProgress";
import { ProgressBar } from "@/components/charts/ProgressBar";
import { ScreenLoading } from "@/components/ui/ScreenLoading";
import {
  useBudget,
  useCategories,
  useUpdateBudgetTotal,
  useUpdateBudgetLines,
} from "@/hooks/api";
import type { BudgetCategory } from "@/data/types";
import { formatCurrency } from "@/lib/format";
import { useColors } from "@/hooks/useColors";
import { useScreenInsets } from "@/hooks/useScreenInsets";

// ─── Category Card ────────────────────────────────────────────────────────────

function CategoryCard({
  cat,
  onEdit,
}: {
  cat: BudgetCategory;
  onEdit: (cat: BudgetCategory) => void;
}) {
  const colors = useColors();
  const pct = Math.round((cat.spent / cat.limit) * 100);
  const isOver = pct >= 100;
  const barColor = isOver ? colors.expense : colors.primary;

  return (
    <View style={[styles.catCard, { backgroundColor: colors.card }]}>
      <View style={styles.catRow}>
        <View style={[styles.catIconWrap, { backgroundColor: cat.iconBg }]}>
          <Ionicons name={cat.icon} size={20} color={cat.iconColor} />
        </View>
        <View style={styles.catInfo}>
          <Text style={[styles.catName, { color: colors.foreground }]}>
            {cat.name}
          </Text>
          <Text style={[styles.catAmounts, { color: colors.mutedForeground }]}>
            {formatCurrency(cat.spent)} / {formatCurrency(cat.limit)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onEdit(cat)}
          activeOpacity={0.7}
          style={styles.editCatBtn}
          accessibilityLabel={`Edit ${cat.name} budget`}
          testID={`edit-category-${cat.id}-btn`}
        >
          <Text
            style={[
              styles.catPct,
              { color: colors.foreground },
              isOver && { color: colors.expense },
            ]}
          >
            {pct}%
          </Text>
          <Ionicons
            name="pencil-outline"
            size={14}
            color={colors.mutedForeground}
          />
        </TouchableOpacity>
      </View>
      <ProgressBar
        percent={pct}
        color={barColor}
        trackColor={colors.muted}
        height={7}
      />
    </View>
  );
}

// ─── Limit Modal ─────────────────────────────────────────────────────────────

function LimitModal({
  visible,
  title,
  subtitle,
  initialValue,
  saving,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  initialValue: string;
  saving: boolean;
  onConfirm: (value: string) => void;
  onClose: () => void;
}) {
  const colors = useColors();
  const [value, setValue] = useState(initialValue);

  // Sync when modal opens with a new initialValue
  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue, visible]);

  const isValid = value.trim() !== "" && !Number.isNaN(parseFloat(value)) && parseFloat(value) >= 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={[styles.modalCard, { backgroundColor: colors.card }]}
        >
          <Text style={[styles.modalTitle, { color: colors.foreground }]} testID="budget-modal-title">
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[styles.modalSubtitle, { color: colors.mutedForeground }]}
            >
              {subtitle}
            </Text>
          ) : null}
          <View
            style={[styles.modalAmountField, { backgroundColor: colors.muted }]}
          >
            <Text
              style={[styles.modalCurrency, { color: colors.mutedForeground }]}
            >
              $
            </Text>
            <TextInput
              style={[styles.modalAmountInput, { color: colors.foreground }]}
              value={value}
              onChangeText={setValue}
              keyboardType="decimal-pad"
              autoFocus
              selectTextOnFocus
              placeholderTextColor={colors.mutedForeground}
              placeholder="0.00"
            />
          </View>
          <View style={styles.modalBtns}>
            <TouchableOpacity
              style={[
                styles.modalCancelBtn,
                { borderColor: colors.border },
              ]}
              onPress={onClose}
              activeOpacity={0.7}
              testID="budget-modal-cancel-btn"
            >
              <Text
                style={[
                  styles.modalCancelText,
                  { color: colors.foreground },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalConfirmBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: isValid && !saving ? 1 : 0.5,
                },
              ]}
              onPress={() => isValid && !saving && onConfirm(value)}
              activeOpacity={0.85}
              disabled={!isValid || saving}
            >
              <Text style={styles.modalConfirmText}>
                {saving ? "Saving…" : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Add Category Modal ───────────────────────────────────────────────────────

function AddCategoryModal({
  visible,
  existingCategorySlugs,
  rawLines,
  saving,
  onConfirm,
  onClose,
}: {
  visible: boolean;
  existingCategorySlugs: string[];
  rawLines: { categoryId: string; limitAmount: number }[];
  saving: boolean;
  onConfirm: (lines: { categoryId: string; limitAmount: number }[]) => void;
  onClose: () => void;
}) {
  const colors = useColors();
  const { data: allCategories = [] } = useCategories("expense");
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [limit, setLimit] = useState("100");

  const available = useMemo(
    () => allCategories.filter((c) => !existingCategorySlugs.includes(c.id)),
    [allCategories, existingCategorySlugs],
  );

  React.useEffect(() => {
    if (visible) {
      setSelectedSlug(available[0]?.id ?? "");
      setLimit("100");
    }
  }, [visible, available]);

  const selectedCat = useMemo(
    () => available.find((c) => c.id === selectedSlug),
    [available, selectedSlug],
  );

  const isValid =
    selectedSlug !== "" &&
    limit.trim() !== "" &&
    !Number.isNaN(parseFloat(limit)) &&
    parseFloat(limit) > 0 &&
    selectedCat !== undefined;

  const handleConfirm = () => {
    if (!isValid || !selectedCat) return;
    const newLines = [
      ...rawLines,
      { categoryId: selectedCat.categoryId, limitAmount: parseFloat(limit) },
    ];
    onConfirm(newLines);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.foreground }]} testID="add-category-modal-title">
            Add Budget Category
          </Text>

          {available.length === 0 ? (
            <Text
              style={[styles.modalSubtitle, { color: colors.mutedForeground }]}
            >
              All expense categories are already in your budget.
            </Text>
          ) : (
            <>
              <Text
                style={[styles.modalSubtitle, { color: colors.mutedForeground }]}
              >
                Select a category
              </Text>
              <ScrollView
                style={styles.catPickerList}
                showsVerticalScrollIndicator={false}
              >
                {available.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.catPickerRow,
                      {
                        backgroundColor:
                          selectedSlug === cat.id
                            ? colors.secondary
                            : "transparent",
                      },
                    ]}
                    onPress={() => {
                      setSelectedSlug(cat.id);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={cat.icon}
                      size={18}
                      color={
                        selectedSlug === cat.id
                          ? colors.primary
                          : colors.mutedForeground
                      }
                    />
                    <Text
                      style={[
                        styles.catPickerLabel,
                        {
                          color:
                            selectedSlug === cat.id
                              ? colors.primary
                              : colors.foreground,
                          fontFamily:
                            selectedSlug === cat.id
                              ? "Inter_600SemiBold"
                              : "Inter_400Regular",
                        },
                      ]}
                    >
                      {cat.label}
                    </Text>
                    {selectedSlug === cat.id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={colors.primary}
                        style={{ marginLeft: "auto" }}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text
                style={[
                  styles.modalSubtitle,
                  { color: colors.mutedForeground, marginTop: 12 },
                ]}
              >
                Monthly limit
              </Text>
              <View
                style={[
                  styles.modalAmountField,
                  { backgroundColor: colors.muted },
                ]}
              >
                <Text
                  style={[
                    styles.modalCurrency,
                    { color: colors.mutedForeground },
                  ]}
                >
                  $
                </Text>
                <TextInput
                  style={[
                    styles.modalAmountInput,
                    { color: colors.foreground },
                  ]}
                  value={limit}
                  onChangeText={setLimit}
                  keyboardType="decimal-pad"
                  selectTextOnFocus
                  placeholderTextColor={colors.mutedForeground}
                  placeholder="0.00"
                />
              </View>
            </>
          )}

          <View style={styles.modalBtns}>
            <TouchableOpacity
              style={[styles.modalCancelBtn, { borderColor: colors.border }]}
              onPress={onClose}
              activeOpacity={0.7}
              testID="add-category-cancel-btn"
            >
              <Text
                style={[styles.modalCancelText, { color: colors.foreground }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            {available.length > 0 && (
              <TouchableOpacity
                style={[
                  styles.modalConfirmBtn,
                  {
                    backgroundColor: colors.primary,
                    opacity: isValid && !saving ? 1 : 0.5,
                  },
                ]}
                onPress={handleConfirm}
                activeOpacity={0.85}
                disabled={!isValid || saving}
              >
                <Text style={styles.modalConfirmText}>
                  {saving ? "Saving…" : "Add"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Budget Screen ────────────────────────────────────────────────────────────

export default function BudgetScreen() {
  const colors = useColors();
  const insets = useScreenInsets();
  const router = useRouter();
  const { data, isLoading } = useBudget();
  const updateTotal = useUpdateBudgetTotal();
  const updateLines = useUpdateBudgetLines();

  const budgetCategories = data?.budgetCategories ?? [];
  const budgetSummary = data?.budgetSummary ?? {
    totalBudget: 0,
    totalSpent: 0,
    daysRemaining: 0,
    monthLabel: "",
  };
  const rawLines = useMemo(
    () =>
      (data?.raw?.lines ?? []).map((l) => ({
        categoryId: l.categoryId,
        limitAmount: l.limitAmount,
      })),
    [data],
  );

  const existingCategorySlugs = useMemo(
    () => (data?.raw?.lines ?? []).map((l) => l.categorySlug),
    [data],
  );

  // Modal state
  const [adjustVisible, setAdjustVisible] = useState(false);
  const [editCat, setEditCat] = useState<BudgetCategory | null>(null);
  const [addCatVisible, setAddCatVisible] = useState(false);
  const [savingModal, setSavingModal] = useState(false);

  if (isLoading) return <ScreenLoading />;

  const remaining = budgetSummary.totalBudget - budgetSummary.totalSpent;
  const pct = budgetSummary.totalBudget > 0
    ? Math.round((budgetSummary.totalSpent / budgetSummary.totalBudget) * 100)
    : 0;
  const daysElapsed = 30 - budgetSummary.daysRemaining;
  const dailyAvg =
    daysElapsed > 0 ? budgetSummary.totalSpent / daysElapsed : 0;
  const safeToSpend =
    budgetSummary.daysRemaining > 0
      ? remaining / budgetSummary.daysRemaining
      : 0;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAdjustConfirm = async (value: string) => {
    setSavingModal(true);
    try {
      await updateTotal.mutateAsync(parseFloat(value));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAdjustVisible(false);
    } catch (err) {
      Alert.alert(
        "Could not update budget",
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSavingModal(false);
    }
  };

  const handleEditCatConfirm = async (value: string) => {
    if (!editCat) return;
    setSavingModal(true);
    try {
      const newLines = rawLines.map((l) =>
        l.categoryId === editCat.id
          ? { ...l, limitAmount: parseFloat(value) }
          : l,
      );
      await updateLines.mutateAsync(newLines);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setEditCat(null);
    } catch (err) {
      Alert.alert(
        "Could not update category",
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSavingModal(false);
    }
  };

  const handleAddCategoryConfirm = async (
    newLines: { categoryId: string; limitAmount: number }[],
  ) => {
    setSavingModal(true);
    try {
      await updateLines.mutateAsync(newLines);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setAddCatVisible(false);
    } catch (err) {
      Alert.alert(
        "Could not add category",
        err instanceof Error ? err.message : "Something went wrong.",
      );
    } finally {
      setSavingModal(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.iconBtn} />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Budget
        </Text>
        <TouchableOpacity
          style={[styles.headerFab, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
          onPress={() => router.push("/add-expense")}
          accessibilityRole="button"
          accessibilityLabel="Add expense"
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 110,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero card */}
        <View style={[styles.heroCard, { backgroundColor: colors.secondary }]}>
          <View style={styles.heroTopRow}>
            <Text style={[styles.heroMonth, { color: colors.mutedForeground }]}>
              {budgetSummary.monthLabel}
            </Text>
            <View style={[styles.remainBadge, { backgroundColor: colors.card }]}>
              <Ionicons
                name="trending-down-outline"
                size={12}
                color={colors.primary}
              />
              <Text style={[styles.remainText, { color: colors.primary }]}>
                {formatCurrency(remaining)} left
              </Text>
            </View>
          </View>

          <Text style={[styles.heroSpent, { color: colors.foreground }]} testID="budget-total-spent">
            {formatCurrency(budgetSummary.totalSpent)}
            <Text style={[styles.heroTotal, { color: colors.mutedForeground }]}>
              {" "}
              / {formatCurrency(budgetSummary.totalBudget)}
            </Text>
          </Text>

          <View style={styles.heroBody}>
            <CircularProgress
              percent={pct}
              size={86}
              trackColor={colors.circleOuter}
              progressColor={colors.primary}
              labelColor={colors.primary}
            />
            <View style={styles.heroStats}>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  Daily Average
                </Text>
                <Text style={[styles.statValue, { color: colors.foreground }]}>
                  {formatCurrency(dailyAvg)}
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  Days Remaining
                </Text>
                <Text style={[styles.statValue, { color: colors.foreground }]}>
                  {budgetSummary.daysRemaining} days
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                  Safe to Spend
                </Text>
                <Text style={[styles.statValue, { color: colors.primary }]}>
                  {formatCurrency(safeToSpend)}/day
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Categories section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Categories
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (budgetCategories.length > 0) {
                setEditCat(budgetCategories[0]);
              }
            }}
          >
            <Text style={[styles.editLink, { color: colors.primary }]}>
              Edit
            </Text>
          </TouchableOpacity>
        </View>

        {budgetCategories.map((cat) => (
          <CategoryCard
            key={cat.id}
            cat={cat}
            onEdit={(c) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setEditCat(c);
            }}
          />
        ))}

        {/* Quick actions */}
        <View style={[styles.quickCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.quickTitle, { color: colors.foreground }]}>
            Quick Actions
          </Text>
          <View style={styles.quickRow}>
            <TouchableOpacity
              style={[styles.adjustBtn, { borderColor: colors.border }]}
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAdjustVisible(true);
              }}
              testID="adjust-budget-btn"
            >
              <Text style={[styles.adjustText, { color: colors.foreground }]}>
                Adjust Budget
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addCatBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAddCatVisible(true);
              }}
              testID="add-category-btn"
            >
              <Text style={styles.addCatText}>Add Category</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Adjust total budget modal */}
      <LimitModal
        visible={adjustVisible}
        title="Adjust Monthly Budget"
        subtitle="Set your total spending limit for this month"
        initialValue={String(budgetSummary.totalBudget)}
        saving={savingModal}
        onConfirm={handleAdjustConfirm}
        onClose={() => setAdjustVisible(false)}
      />

      {/* Edit category limit modal */}
      <LimitModal
        visible={editCat !== null}
        title={editCat ? `Edit ${editCat.name}` : ""}
        subtitle="Set the monthly limit for this category"
        initialValue={editCat ? String(editCat.limit) : ""}
        saving={savingModal}
        onConfirm={handleEditCatConfirm}
        onClose={() => setEditCat(null)}
      />

      {/* Add category modal */}
      <AddCategoryModal
        visible={addCatVisible}
        existingCategorySlugs={existingCategorySlugs}
        rawLines={rawLines}
        saving={savingModal}
        onConfirm={handleAddCategoryConfirm}
        onClose={() => setAddCatVisible(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  iconBtn: { width: 36, height: 36 },
  headerTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold" },
  headerFab: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: { borderRadius: 20, padding: 20, marginBottom: 24 },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  heroMonth: { fontSize: 13, fontFamily: "Inter_400Regular" },
  remainBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  remainText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  heroSpent: { fontSize: 30, fontFamily: "Inter_700Bold", marginBottom: 18 },
  heroTotal: { fontSize: 18, fontFamily: "Inter_400Regular" },
  heroBody: { flexDirection: "row", alignItems: "center", gap: 20 },
  heroStats: { flex: 1, gap: 10 },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statValue: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  editLink: { fontSize: 14, fontFamily: "Inter_500Medium" },
  catCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  catRow: { flexDirection: "row", alignItems: "center" },
  catIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  catInfo: { flex: 1 },
  catName: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  catAmounts: { fontSize: 12, fontFamily: "Inter_400Regular" },
  editCatBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  catPct: { fontSize: 16, fontFamily: "Inter_700Bold" },
  quickCard: {
    borderRadius: 16,
    padding: 16,
    marginTop: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  quickTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 14 },
  quickRow: { flexDirection: "row", gap: 10 },
  adjustBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  adjustText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  addCatBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  addCatText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 16,
  },
  modalAmountField: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
    marginBottom: 20,
  },
  modalCurrency: { fontSize: 18, fontFamily: "Inter_400Regular" },
  modalAmountInput: {
    flex: 1,
    fontSize: 18,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  modalBtns: { flexDirection: "row", gap: 10 },
  modalCancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  modalCancelText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  modalConfirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  modalConfirmText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  // Add category picker
  catPickerList: {
    maxHeight: 180,
    marginBottom: 4,
  },
  catPickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 4,
  },
  catPickerLabel: {
    fontSize: 14,
  },
});
