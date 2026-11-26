import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSplitter } from "../../context/SplitterContext";
import { useTheme } from "../../context/ThemeContext";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";
import { computeBalances, simplifyDebts } from "../../utils/splitAlgorithm";
import { Radius, Spacing, Typography } from "../../utils/theme";
import type { Expense } from "../../types/splitter";

type SplitMode = "equal" | "custom";

// ─── helpers ─────────────────────────────────────────────────────────────────

function getShareLabel(e: Expense, memberId: string): string {
  if (e.customShares) {
    return formatCurrency(e.customShares[memberId] ?? 0);
  }
  return formatCurrency(e.amount / e.splitAmong.length);
}

// ─── main component ───────────────────────────────────────────────────────────

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const { colors, shadow } = useTheme();
  const { groups, expenses, dispatch } = useSplitter();
  const styles = makeStyles(colors);

  const group = groups.find((g) => g.id === groupId);
  const groupExpenses = expenses.filter((e) => e.groupId === groupId);

  // ── modal state ──
  const [modal, setModal] = useState(false);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  // customShares: memberId → raw string input
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});

  const [tab, setTab] = useState<"expenses" | "balances">("expenses");

  const balances = useMemo(
    () => (group ? computeBalances(group.members, groupExpenses) : []),
    [group, groupExpenses],
  );
  const settlements = useMemo(() => simplifyDebts(balances), [balances]);

  if (!group) {
    return (
      <View style={styles.notFound}>
        <Text style={{ color: colors.textSub }}>Group not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.primary, marginTop: 8 }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── derived values for the modal ──────────────────────────────────────────
  const totalAmt = parseFloat(amount) || 0;

  const customSharesNumeric: Record<string, number> = {};
  if (splitMode === "custom") {
    group.members.forEach((m) => {
      customSharesNumeric[m.id] = parseFloat(customInputs[m.id] || "0") || 0;
    });
  }

  const customTotal = Object.values(customSharesNumeric).reduce(
    (s, v) => s + v,
    0,
  );
  const customDiff = parseFloat((totalAmt - customTotal).toFixed(2));
  const customValid = splitMode === "equal" || Math.abs(customDiff) < 0.01;

  const equalShare =
    group.members.length > 0 ? totalAmt / group.members.length : 0;

  // ── open modal cleanly ────────────────────────────────────────────────────
  function openModal() {
    setDesc("");
    setAmount("");
    setPaidBy("");
    setSplitMode("equal");
    // pre-fill custom inputs as empty
    const empty: Record<string, string> = {};
    group!.members.forEach((m) => (empty[m.id] = ""));
    setCustomInputs(empty);
    setModal(true);
  }

  // distribute remainder to first member when switching to custom
  function switchToCustom() {
    const perPerson =
      totalAmt > 0 ? (totalAmt / group!.members.length).toFixed(2) : "";
    const filled: Record<string, string> = {};
    group!.members.forEach((m) => (filled[m.id] = perPerson));
    setCustomInputs(filled);
    setSplitMode("custom");
  }

  // ── add expense ───────────────────────────────────────────────────────────
  function addExpense() {
    const val = parseFloat(amount);
    if (!desc.trim() || isNaN(val) || val <= 0) {
      Alert.alert("Invalid input", "Enter a valid description and amount.");
      return;
    }
    if (!paidBy) {
      Alert.alert("Who paid?", "Select the person who paid.");
      return;
    }
    if (splitMode === "custom" && !customValid) {
      Alert.alert(
        "Amounts don't add up",
        `Custom shares total ${formatCurrency(customTotal)} but expense is ${formatCurrency(val)}. Difference: ${formatCurrency(Math.abs(customDiff))}.`,
      );
      return;
    }

    const exp: Expense = {
      id: Date.now().toString(),
      groupId: group!.id,
      description: desc.trim(),
      amount: val,
      paidBy,
      splitAmong: group!.members.map((m) => m.id),
      date: new Date().toISOString().split("T")[0],
      ...(splitMode === "custom" && { customShares: customSharesNumeric }),
    };

    dispatch({ type: "ADD_EXPENSE", payload: exp });
    setModal(false);
  }

  const totalExpenses = groupExpenses.reduce((s, e) => s + e.amount, 0);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerDecor} />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{group.name}</Text>
        <Text style={styles.headerSub}>
          {group.members.length} members · {formatCurrency(totalExpenses)} total
        </Text>
        <View style={styles.tabRow}>
          {(["expenses", "balances"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tabPill, tab === t && styles.tabPillActive]}
              onPress={() => setTab(t)}
            >
              <Text
                style={[
                  styles.tabPillText,
                  tab === t && styles.tabPillTextActive,
                ]}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Body ── */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Member chips */}
        <View style={styles.chips}>
          {group.members.map((m) => (
            <View key={m.id} style={styles.chip}>
              <Text style={styles.chipText}>{m.name}</Text>
            </View>
          ))}
        </View>

        {/* ── Expenses tab ── */}
        {tab === "expenses" ? (
          groupExpenses.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons
                name="receipt-outline"
                size={40}
                color={colors.primary}
              />
              <Text style={styles.emptyTitle}>No expenses yet</Text>
              <Text style={styles.emptySub}>
                Tap + to add the first expense.
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {[...groupExpenses].reverse().map((e) => {
                const payer = group.members.find((m) => m.id === e.paidBy);
                const isCustom = !!e.customShares;
                return (
                  <View key={e.id} style={[styles.expCard, shadow.sm]}>
                    <View style={styles.expLeft}>
                      <View style={styles.expIcon}>
                        <Ionicons
                          name="receipt-outline"
                          size={18}
                          color={colors.primary}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.expDesc}>{e.description}</Text>
                        <Text style={styles.expMeta}>
                          Paid by {payer?.name ?? "?"} · {formatDate(e.date)}
                        </Text>
                        {/* Per-member shares */}
                        <View style={styles.sharesRow}>
                          {group.members.map((m) => (
                            <View key={m.id} style={styles.shareChip}>
                              <Text style={styles.shareChipName}>
                                {m.name.split(" ")[0]}
                              </Text>
                              <Text style={styles.shareChipAmt}>
                                {getShareLabel(e, m.id)}
                              </Text>
                            </View>
                          ))}
                        </View>
                        {isCustom && (
                          <View style={styles.customBadge}>
                            <Ionicons
                              name="git-branch-outline"
                              size={11}
                              color={colors.accentPurple}
                            />
                            <Text style={styles.customBadgeText}>
                              Custom split
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={styles.expRight}>
                      <Text style={styles.expAmount}>
                        {formatCurrency(e.amount)}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          Alert.alert("Delete expense?", e.description, [
                            { text: "Cancel", style: "cancel" },
                            {
                              text: "Delete",
                              style: "destructive",
                              onPress: () =>
                                dispatch({
                                  type: "DELETE_EXPENSE",
                                  payload: e.id,
                                }),
                            },
                          ])
                        }
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color={colors.danger}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )
        ) : (
          /* ── Balances tab ── */
          <View style={styles.list}>
            <Text style={styles.sectionLabel}>Net Balances</Text>
            {balances.map((b) => (
              <View key={b.memberId} style={[styles.balanceRow, shadow.sm]}>
                <View style={styles.balanceAvatar}>
                  <Text style={styles.balanceAvatarText}>
                    {b.memberName.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.balanceName}>{b.memberName}</Text>
                <Text
                  style={[
                    styles.balanceNet,
                    { color: b.net >= 0 ? colors.accent : colors.danger },
                  ]}
                >
                  {b.net >= 0 ? "+" : ""}
                  {formatCurrency(b.net)}
                </Text>
              </View>
            ))}

            {settlements.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { marginTop: Spacing.md }]}>
                  Settle Up
                </Text>
                {settlements.map((s, i) => (
                  <View key={i} style={[styles.settlementRow, shadow.sm]}>
                    <Ionicons
                      name="arrow-forward-circle"
                      size={20}
                      color={colors.primary}
                    />
                    <Text style={styles.settlementText}>
                      <Text style={styles.settlementName}>{s.fromName}</Text>
                      {" pays "}
                      <Text style={styles.settlementName}>{s.toName}</Text>
                    </Text>
                    <Text style={styles.settlementAmount}>
                      {formatCurrency(s.amount)}
                    </Text>
                  </View>
                ))}
              </>
            )}

            {settlements.length === 0 && groupExpenses.length > 0 && (
              <View style={styles.settled}>
                <Ionicons
                  name="checkmark-circle"
                  size={32}
                  color={colors.accent}
                />
                <Text style={styles.settledText}>All settled up! 🎉</Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, shadow.lg]} onPress={openModal}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* ── Add Expense Modal ── */}
      <Modal
        visible={modal}
        animationType="slide"
        transparent
        onRequestClose={() => setModal(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.overlay}>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.sheetTitle}>Add Expense</Text>

                {/* Description */}
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Dinner at hotel"
                  placeholderTextColor={colors.textMuted}
                  value={desc}
                  onChangeText={setDesc}
                />

                {/* Amount */}
                <Text style={styles.label}>Amount (₹)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0.00"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={(v) => {
                    setAmount(v);
                    // keep equal-split preview live; reset custom inputs
                    if (splitMode === "custom") {
                      const val = parseFloat(v) || 0;
                      const per =
                        val > 0 ? (val / group.members.length).toFixed(2) : "";
                      const updated: Record<string, string> = {};
                      group.members.forEach((m) => (updated[m.id] = per));
                      setCustomInputs(updated);
                    }
                  }}
                />

                {/* Paid by */}
                <Text style={styles.label}>Paid by</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: Spacing.md }}
                >
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {group.members.map((m) => (
                      <TouchableOpacity
                        key={m.id}
                        style={[
                          styles.memberChip,
                          paidBy === m.id && styles.memberChipActive,
                        ]}
                        onPress={() => setPaidBy(m.id)}
                      >
                        <Text
                          style={[
                            styles.memberChipText,
                            paidBy === m.id && styles.memberChipTextActive,
                          ]}
                        >
                          {m.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>

                {/* Split mode toggle */}
                <Text style={styles.label}>Split type</Text>
                <View style={styles.splitToggle}>
                  <TouchableOpacity
                    style={[
                      styles.splitToggleBtn,
                      splitMode === "equal" && styles.splitToggleBtnActive,
                    ]}
                    onPress={() => setSplitMode("equal")}
                  >
                    <Ionicons
                      name="git-merge-outline"
                      size={15}
                      color={splitMode === "equal" ? "#fff" : colors.textSub}
                    />
                    <Text
                      style={[
                        styles.splitToggleText,
                        splitMode === "equal" && styles.splitToggleTextActive,
                      ]}
                    >
                      Equal
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.splitToggleBtn,
                      splitMode === "custom" && styles.splitToggleBtnActive,
                    ]}
                    onPress={switchToCustom}
                  >
                    <Ionicons
                      name="git-branch-outline"
                      size={15}
                      color={splitMode === "custom" ? "#fff" : colors.textSub}
                    />
                    <Text
                      style={[
                        styles.splitToggleText,
                        splitMode === "custom" && styles.splitToggleTextActive,
                      ]}
                    >
                      Custom
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* ── Equal split preview ── */}
                {splitMode === "equal" && (
                  <View style={styles.equalPreview}>
                    <Ionicons
                      name="information-circle-outline"
                      size={15}
                      color={colors.primary}
                    />
                    <Text style={styles.equalPreviewText}>
                      {totalAmt > 0
                        ? `Each of the ${group.members.length} members pays ${formatCurrency(equalShare)}`
                        : `Split equally among ${group.members.length} members`}
                    </Text>
                  </View>
                )}

                {/* ── Custom split inputs ── */}
                {splitMode === "custom" && (
                  <View style={styles.customSection}>
                    <Text style={styles.customHint}>
                      Enter each person's share. Total must equal the expense
                      amount.
                    </Text>

                    {group.members.map((m) => (
                      <View key={m.id} style={styles.customRow}>
                        <View style={styles.customAvatar}>
                          <Text style={styles.customAvatarText}>
                            {m.name.charAt(0)}
                          </Text>
                        </View>
                        <Text style={styles.customMemberName}>{m.name}</Text>
                        <View style={styles.customInputWrap}>
                          <Text style={styles.customRupee}>₹</Text>
                          <TextInput
                            style={styles.customInput}
                            placeholder="0.00"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="numeric"
                            value={customInputs[m.id] ?? ""}
                            onChangeText={(v) =>
                              setCustomInputs((prev) => ({
                                ...prev,
                                [m.id]: v,
                              }))
                            }
                          />
                        </View>
                      </View>
                    ))}

                    {/* Running total indicator */}
                    <View
                      style={[
                        styles.totalIndicator,
                        {
                          backgroundColor: customValid
                            ? colors.accent + "22"
                            : colors.danger + "15",
                        },
                      ]}
                    >
                      <View style={styles.totalIndicatorRow}>
                        <Text style={styles.totalIndicatorLabel}>
                          Total entered
                        </Text>
                        <Text
                          style={[
                            styles.totalIndicatorValue,
                            {
                              color: customValid
                                ? colors.accent
                                : colors.danger,
                            },
                          ]}
                        >
                          {formatCurrency(customTotal)}
                        </Text>
                      </View>
                      <View style={styles.totalIndicatorRow}>
                        <Text style={styles.totalIndicatorLabel}>
                          Expense amount
                        </Text>
                        <Text style={styles.totalIndicatorValue}>
                          {formatCurrency(totalAmt)}
                        </Text>
                      </View>
                      <View style={[styles.totalIndicatorDivider]} />
                      <View style={styles.totalIndicatorRow}>
                        <Text style={styles.totalIndicatorLabel}>
                          {customDiff > 0
                            ? "Unallocated"
                            : customDiff < 0
                              ? "Over by"
                              : "Balanced ✓"}
                        </Text>
                        <Text
                          style={[
                            styles.totalIndicatorDiff,
                            {
                              color: customValid
                                ? colors.accent
                                : colors.danger,
                            },
                          ]}
                        >
                          {customValid
                            ? "₹0.00"
                            : formatCurrency(Math.abs(customDiff))}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Actions */}
                <View style={[styles.actions, { marginTop: Spacing.md }]}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setModal(false)}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.addBtn,
                      !customValid && { backgroundColor: colors.textMuted },
                    ]}
                    onPress={addExpense}
                  >
                    <Text style={styles.addText}>Add Expense</Text>
                  </TouchableOpacity>
                </View>

                <View style={{ height: 20 }} />
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ─── styles (theme-aware factory) ────────────────────────────────────────────
function makeStyles(c: ReturnType<typeof useTheme>["colors"]) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    notFound: { flex: 1, alignItems: "center", justifyContent: "center" },

    header: {
      backgroundColor: c.primary,
      paddingTop: 50,
      paddingBottom: 0,
      paddingHorizontal: Spacing.md,
      overflow: "hidden",
    },
    headerDecor: {
      position: "absolute",
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: "#ffffff15",
      top: -40,
      right: -20,
    },
    backBtn: { marginBottom: 8 },
    headerTitle: { color: "#fff", fontSize: 24, fontWeight: "800" },
    headerSub: {
      color: "#ffffffaa",
      fontSize: 13,
      marginTop: 2,
      marginBottom: 16,
    },

    tabRow: { flexDirection: "row", gap: 8, paddingBottom: 16 },
    tabPill: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: Radius.full,
      backgroundColor: "#ffffff22",
    },
    tabPillActive: { backgroundColor: "#fff" },
    tabPillText: { color: "#ffffffaa", fontWeight: "600", fontSize: 13 },
    tabPillTextActive: { color: c.primary },

    scroll: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },

    chips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: Spacing.md,
    },
    chip: {
      backgroundColor: c.primary + "22",
      borderRadius: Radius.full,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    chipText: { color: c.primary, fontSize: 12, fontWeight: "600" },

    list: { gap: Spacing.sm },
    sectionLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: c.textSub,
      marginBottom: 4,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    expCard: {
      backgroundColor: c.surface,
      borderRadius: Radius.lg,
      flexDirection: "row",
      alignItems: "flex-start",
      padding: Spacing.md,
    },
    expLeft: {
      flex: 1,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    expIcon: {
      width: 38,
      height: 38,
      borderRadius: 10,
      backgroundColor: c.primary + "15",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
    },
    expDesc: { fontSize: 15, fontWeight: "700", color: c.text },
    expMeta: { fontSize: 12, color: c.textMuted, marginTop: 2 },
    sharesRow: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 6 },
    shareChip: {
      backgroundColor: c.bg,
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 3,
      flexDirection: "row",
      gap: 3,
      alignItems: "center",
      borderWidth: 1,
      borderColor: c.border,
    },
    shareChipName: { fontSize: 11, color: c.textSub, fontWeight: "600" },
    shareChipAmt: { fontSize: 11, color: c.primary, fontWeight: "700" },
    customBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      marginTop: 5,
    },
    customBadgeText: { fontSize: 11, color: c.accentPurple, fontWeight: "600" },
    expRight: { alignItems: "flex-end", gap: 6, paddingTop: 2 },
    expAmount: { fontSize: 17, fontWeight: "800", color: c.text },

    balanceRow: {
      backgroundColor: c.surface,
      borderRadius: Radius.lg,
      flexDirection: "row",
      alignItems: "center",
      padding: Spacing.md,
      gap: 12,
    },
    balanceAvatar: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    balanceAvatarText: { color: "#fff", fontWeight: "800", fontSize: 16 },
    balanceName: { flex: 1, fontSize: 15, fontWeight: "600", color: c.text },
    balanceNet: { fontSize: 16, fontWeight: "800" },

    settlementRow: {
      backgroundColor: c.surface,
      borderRadius: Radius.md,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      padding: 12,
    },
    settlementText: { flex: 1, fontSize: 14, color: c.textSub },
    settlementName: { fontWeight: "700", color: c.text },
    settlementAmount: { fontSize: 15, fontWeight: "800", color: c.primary },

    settled: { alignItems: "center", paddingVertical: Spacing.xl, gap: 8 },
    settledText: { fontSize: 16, fontWeight: "700", color: c.text },

    empty: { alignItems: "center", paddingTop: 60, gap: 8 },
    emptyTitle: { fontSize: 17, fontWeight: "700", color: c.text },
    emptySub: { color: c.textMuted, fontSize: 13 },

    fab: {
      position: "absolute",
      right: Spacing.md,
      bottom: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
    },

    overlay: {
      flex: 1,
      backgroundColor: c.overlay,
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: c.surfaceRaised,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.md,
      maxHeight: "92%",
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.border,
      alignSelf: "center",
      marginBottom: Spacing.md,
    },
    sheetTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: c.text,
      marginBottom: Spacing.md,
    },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: c.textSub,
      marginBottom: 6,
    },
    input: {
      backgroundColor: c.bg,
      borderRadius: Radius.md,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: c.text,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: c.border,
    },
    memberChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: Radius.full,
      backgroundColor: c.bg,
      borderWidth: 1,
      borderColor: c.border,
    },
    memberChipActive: { backgroundColor: c.primary, borderColor: c.primary },
    memberChipText: { color: c.textSub, fontWeight: "600" },
    memberChipTextActive: { color: "#fff" },

    splitToggle: {
      flexDirection: "row",
      backgroundColor: c.bg,
      borderRadius: Radius.full,
      padding: 4,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: Spacing.md,
    },
    splitToggleBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 9,
      borderRadius: Radius.full,
    },
    splitToggleBtnActive: { backgroundColor: c.primary },
    splitToggleText: { fontSize: 14, fontWeight: "700", color: c.textSub },
    splitToggleTextActive: { color: "#fff" },

    equalPreview: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: c.primary + "18",
      borderRadius: Radius.md,
      padding: 10,
      marginBottom: Spacing.md,
    },
    equalPreviewText: {
      flex: 1,
      fontSize: 13,
      color: c.primary,
      fontWeight: "500",
    },

    customSection: { marginBottom: Spacing.sm },
    customHint: { fontSize: 12, color: c.textMuted, marginBottom: Spacing.sm },
    customRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 10,
    },
    customAvatar: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: c.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    customAvatarText: { color: "#fff", fontWeight: "800", fontSize: 14 },
    customMemberName: {
      flex: 1,
      fontSize: 14,
      fontWeight: "600",
      color: c.text,
    },
    customInputWrap: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: c.bg,
      borderRadius: Radius.md,
      borderWidth: 1.5,
      borderColor: c.border,
      paddingHorizontal: 10,
      paddingVertical: 8,
      minWidth: 100,
    },
    customRupee: { fontSize: 15, color: c.textSub, marginRight: 4 },
    customInput: {
      fontSize: 15,
      fontWeight: "700",
      color: c.text,
      minWidth: 70,
    },

    totalIndicator: {
      borderRadius: Radius.md,
      padding: Spacing.sm,
      marginTop: 4,
      marginBottom: 4,
    },
    totalIndicatorRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 2,
    },
    totalIndicatorLabel: { fontSize: 12, color: c.textSub },
    totalIndicatorValue: { fontSize: 13, fontWeight: "700", color: c.text },
    totalIndicatorDivider: {
      height: 1,
      backgroundColor: c.border,
      marginVertical: 4,
    },
    totalIndicatorDiff: { fontSize: 14, fontWeight: "800" },

    actions: { flexDirection: "row", gap: Spacing.sm },
    cancelBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: Radius.full,
      backgroundColor: c.bg,
      alignItems: "center",
      borderWidth: 1,
      borderColor: c.border,
    },
    cancelText: { color: c.textSub, fontWeight: "700" },
    addBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: Radius.full,
      backgroundColor: c.primary,
      alignItems: "center",
    },
    addText: { color: "#fff", fontWeight: "700" },
  });
}
