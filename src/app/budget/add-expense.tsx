import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useBudget } from "../../context/BudgetContext";
import { useTheme } from "../../context/ThemeContext";
import { formatCurrency } from "../../utils/currency";
import { today } from "../../utils/date";
import { Radius, Spacing } from "../../utils/theme";
import type { BudgetExpense } from "../../types/budget";

export default function AddExpenseScreen() {
  const router = useRouter();
  const { colors, shadow } = useTheme();
  const { categories, dispatch } = useBudget();
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const selectedCat = categories.find((c) => c.id === categoryId);

  function save() {
    const val = parseFloat(amount);
    if (!desc.trim() || isNaN(val) || val <= 0) {
      Alert.alert("Enter a valid description and amount");
      return;
    }
    if (!categoryId) {
      Alert.alert("Select a category");
      return;
    }
    dispatch({
      type: "ADD_EXPENSE",
      payload: {
        id: Date.now().toString(),
        categoryId,
        description: desc.trim(),
        amount: val,
        date: today(),
      } as BudgetExpense,
    });
    router.back();
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.secondary} />
      <View style={[styles.header, { backgroundColor: colors.secondary }]}>
        <View style={styles.headerDecor} />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Expense</Text>
        <Text style={styles.headerSub}>What did you spend on today?</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount */}
        <View
          style={[
            styles.amountCard,
            { backgroundColor: colors.surface },
            shadow.md,
          ]}
        >
          <Text style={[styles.amountLabel, { color: colors.textMuted }]}>
            Amount
          </Text>
          <View style={styles.amountRow}>
            <Text style={[styles.rupee, { color: colors.textSub }]}>₹</Text>
            <TextInput
              style={[styles.amountInput, { color: colors.text }]}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
          {amount && !isNaN(parseFloat(amount)) && (
            <Text style={[styles.amountWords, { color: colors.textMuted }]}>
              {formatCurrency(parseFloat(amount))}
            </Text>
          )}
        </View>

        {/* Description */}
        <Text style={[styles.lbl, { color: colors.text }]}>Description</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
            shadow.sm,
          ]}
          placeholder="e.g. Lunch at office"
          placeholderTextColor={colors.textMuted}
          value={desc}
          onChangeText={setDesc}
        />

        {/* Category */}
        <Text style={[styles.lbl, { color: colors.text }]}>Category</Text>
        {categories.length === 0 ? (
          <TouchableOpacity
            style={[
              styles.noCatBtn,
              {
                backgroundColor: colors.accentMuted,
                borderColor: colors.accent + "44",
              },
            ]}
            onPress={() => router.push("/budget/categories")}
          >
            <Ionicons
              name="add-circle-outline"
              size={18}
              color={colors.accent}
            />
            <Text style={{ color: colors.accent, fontWeight: "600" }}>
              Add categories first
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.catGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catPill,
                  {
                    backgroundColor:
                      categoryId === cat.id ? cat.color : colors.surface,
                    borderColor:
                      categoryId === cat.id ? cat.color : colors.border,
                  },
                ]}
                onPress={() => setCategoryId(cat.id)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={16}
                  color={categoryId === cat.id ? "#fff" : cat.color}
                />
                <Text
                  style={{
                    color: categoryId === cat.id ? "#fff" : colors.textSub,
                    fontSize: 13,
                    fontWeight: "600",
                  }}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedCat && (
          <View
            style={[
              styles.catInfo,
              {
                backgroundColor: colors.surface,
                borderLeftColor: selectedCat.color,
              },
              shadow.sm,
            ]}
          >
            <View
              style={[
                styles.catInfoIcon,
                { backgroundColor: selectedCat.color },
              ]}
            >
              <Ionicons name={selectedCat.icon as any} size={18} color="#fff" />
            </View>
            <View>
              <Text style={[styles.catInfoName, { color: colors.text }]}>
                {selectedCat.name}
              </Text>
              <Text style={[styles.catInfoLimit, { color: colors.textMuted }]}>
                {selectedCat.period.charAt(0).toUpperCase() +
                  selectedCat.period.slice(1)}{" "}
                limit: {formatCurrency(selectedCat.limit)}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.saveBtn,
            { backgroundColor: selectedCat?.color ?? colors.secondary },
            shadow.md,
          ]}
          onPress={save}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
          <Text style={styles.saveBtnText}>Save Expense</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: Spacing.md,
    overflow: "hidden",
  },
  headerDecor: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#ffffff20",
    top: -40,
    right: -20,
  },
  backBtn: { marginBottom: 8 },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "800" },
  headerSub: { color: "#ffffffaa", fontSize: 13, marginTop: 4 },
  amountCard: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  amountLabel: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  amountRow: { flexDirection: "row", alignItems: "center" },
  rupee: { fontSize: 32, fontWeight: "700", marginRight: 4 },
  amountInput: {
    fontSize: 48,
    fontWeight: "800",
    minWidth: 160,
    textAlign: "center",
  },
  amountWords: { fontSize: 13, marginTop: 4 },
  lbl: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  input: {
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: Spacing.md,
  },
  catPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  noCatBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderStyle: "dashed",
    marginBottom: Spacing.md,
  },
  catInfo: {
    borderRadius: Radius.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: Spacing.md,
    borderLeftWidth: 4,
    marginBottom: Spacing.md,
  },
  catInfoIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  catInfoName: { fontSize: 15, fontWeight: "700" },
  catInfoLimit: { fontSize: 12, marginTop: 2 },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: Radius.full,
    marginTop: Spacing.sm,
  },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
