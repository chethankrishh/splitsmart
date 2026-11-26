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
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useBudget } from "../../context/BudgetContext";
import { useTheme } from "../../context/ThemeContext";
import { formatCurrency } from "../../utils/currency";
import { CategoryColors, Radius, Spacing } from "../../utils/theme";
import type { Category, PeriodType } from "../../types/budget";

const ICONS: React.ComponentProps<typeof Ionicons>["name"][] = [
  "fast-food-outline",
  "car-outline",
  "film-outline",
  "medkit-outline",
  "book-outline",
  "shirt-outline",
  "home-outline",
  "airplane-outline",
  "barbell-outline",
  "gift-outline",
  "wifi-outline",
  "cart-outline",
];

export default function CategoriesScreen() {
  const router = useRouter();
  const { colors, shadow } = useTheme();
  const { categories, dispatch } = useBudget();
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("");
  const [period, setPeriod] = useState<PeriodType>("monthly");
  const [selIcon, setSelIcon] =
    useState<React.ComponentProps<typeof Ionicons>["name"]>("cart-outline");
  const [selColor, setSelColor] = useState(CategoryColors[0]);

  function save() {
    const lim = parseFloat(limit);
    if (!name.trim() || isNaN(lim) || lim <= 0) {
      Alert.alert("Enter a valid name and limit");
      return;
    }
    dispatch({
      type: "ADD_CATEGORY",
      payload: {
        id: Date.now().toString(),
        name: name.trim(),
        icon: selIcon,
        color: selColor,
        limit: lim,
        period,
      },
    });
    setName("");
    setLimit("");
    setModal(false);
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.accent} />
      <View style={[styles.header, { backgroundColor: colors.accent }]}>
        <View style={styles.headerDecor} />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
        <Text style={styles.headerSub}>
          {categories.length} budget categories
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {categories.length === 0 ? (
          <View style={styles.empty}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: colors.accentMuted },
              ]}
            >
              <Ionicons name="apps" size={36} color={colors.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No categories yet
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSub }]}>
              Add categories with spending limits.
            </Text>
          </View>
        ) : (
          <View style={{ gap: Spacing.sm }}>
            {categories.map((cat) => (
              <View
                key={cat.id}
                style={[
                  styles.catCard,
                  { backgroundColor: colors.surface },
                  shadow.sm,
                ]}
              >
                <View style={[styles.catIcon, { backgroundColor: cat.color }]}>
                  <Ionicons name={cat.icon as any} size={20} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.catName, { color: colors.text }]}>
                    {cat.name}
                  </Text>
                  <Text style={[styles.catPeriod, { color: colors.textMuted }]}>
                    {cat.period.charAt(0).toUpperCase() + cat.period.slice(1)}{" "}
                    limit
                  </Text>
                </View>
                <Text style={[styles.catLimit, { color: colors.text }]}>
                  {formatCurrency(cat.limit)}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert("Delete?", `Delete "${cat.name}"?`, [
                      { text: "Cancel", style: "cancel" },
                      {
                        text: "Delete",
                        style: "destructive",
                        onPress: () =>
                          dispatch({
                            type: "DELETE_CATEGORY",
                            payload: cat.id,
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
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.accent }, shadow.lg]}
        onPress={() => setModal(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={modal}
        animationType="slide"
        transparent
        onRequestClose={() => setModal(false)}
      >
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <ScrollView
            style={[styles.sheet, { backgroundColor: colors.surfaceRaised }]}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              New Category
            </Text>

            <Text style={[styles.lbl, { color: colors.textSub }]}>Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="e.g. Food & Dining"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
            />

            <Text style={[styles.lbl, { color: colors.textSub }]}>
              Limit (₹)
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={limit}
              onChangeText={setLimit}
            />

            <Text style={[styles.lbl, { color: colors.textSub }]}>Period</Text>
            <View style={styles.periodRow}>
              {(["monthly", "daily"] as PeriodType[]).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.periodBtn,
                    {
                      backgroundColor:
                        period === p ? colors.primary : colors.bg,
                      borderColor:
                        period === p ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setPeriod(p)}
                >
                  <Text
                    style={{
                      color: period === p ? "#fff" : colors.textSub,
                      fontWeight: "600",
                    }}
                  >
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.lbl, { color: colors.textSub }]}>Icon</Text>
            <View style={styles.iconGrid}>
              {ICONS.map((ic) => (
                <TouchableOpacity
                  key={ic}
                  style={[
                    styles.iconBtn,
                    {
                      backgroundColor:
                        selIcon === ic ? selColor + "33" : colors.bg,
                      borderColor: selIcon === ic ? selColor : colors.border,
                    },
                  ]}
                  onPress={() => setSelIcon(ic)}
                >
                  <Ionicons
                    name={ic}
                    size={22}
                    color={selIcon === ic ? selColor : colors.textSub}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.lbl, { color: colors.textSub }]}>Colour</Text>
            <View style={styles.colorRow}>
              {CategoryColors.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c },
                    selColor === c && {
                      borderWidth: 3,
                      borderColor: colors.text,
                    },
                  ]}
                  onPress={() => setSelColor(c)}
                />
              ))}
            </View>

            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={[
                  styles.cancelBtn,
                  { backgroundColor: colors.bg, borderColor: colors.border },
                ]}
                onPress={() => setModal(false)}
              >
                <Text style={{ color: colors.textSub, fontWeight: "700" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: selColor }]}
                onPress={save}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Save</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 36 }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: Spacing.md,
    overflow: "hidden",
  },
  headerDecor: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#ffffff15",
    top: -40,
    right: -20,
  },
  backBtn: { marginBottom: 8 },
  headerTitle: { color: "#fff", fontSize: 24, fontWeight: "800" },
  headerSub: { color: "#ffffffaa", fontSize: 13, marginTop: 4 },
  catCard: {
    borderRadius: Radius.xl,
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: 12,
  },
  catIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  catName: { fontSize: 15, fontWeight: "700" },
  catPeriod: { fontSize: 12, marginTop: 2 },
  catLimit: { fontSize: 16, fontWeight: "800", marginRight: 8 },
  empty: { alignItems: "center", paddingTop: 80 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptySub: {
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 24,
  },
  fab: {
    position: "absolute",
    right: Spacing.md,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    maxHeight: "90%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  sheetTitle: { fontSize: 20, fontWeight: "800", marginBottom: Spacing.md },
  lbl: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: {
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  periodRow: { flexDirection: "row", gap: 8, marginBottom: Spacing.md },
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.full,
    alignItems: "center",
    borderWidth: 1,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: Spacing.md,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: Spacing.md,
  },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  sheetActions: { flexDirection: "row", gap: Spacing.sm, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.full,
    alignItems: "center",
    borderWidth: 1,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.full,
    alignItems: "center",
  },
});
