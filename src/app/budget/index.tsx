import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useBudget } from "../../context/BudgetContext";
import { useTheme } from "../../context/ThemeContext";
import { useBudgetSummary } from "../../hooks/useBudgetSummary";
import { formatCurrency } from "../../utils/currency";
import { formatDate, today, startOfMonth } from "../../utils/date";
import { Radius, Spacing } from "../../utils/theme";

export default function BudgetOverviewScreen() {
  const router = useRouter();
  const { colors, shadow } = useTheme();
  const { expenses } = useBudget();
  const monthlySummary = useBudgetSummary("monthly");
  const dailySummary = useBudgetSummary("daily");

  const todayExpenses = expenses.filter((e) => e.date === today());
  const todaySpend = todayExpenses.reduce((s, e) => s + e.amount, 0);
  const monthSpend = expenses
    .filter((e) => e.date >= startOfMonth())
    .reduce((s, e) => s + e.amount, 0);
  const totalLimit = monthlySummary.reduce((s, c) => s + c.limit, 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle="light-content" backgroundColor="#E07B00" />

      <View style={[styles.header, { backgroundColor: "#E07B00" }]}>
        <View style={styles.headerDecor} />
        <Text style={styles.headerTitle}>Budget Tracker</Text>
        <View style={styles.headerStats}>
          {[
            { label: "Today", val: formatCurrency(todaySpend) },
            { label: "This month", val: formatCurrency(monthSpend) },
            { label: "Limit", val: formatCurrency(totalLimit) },
          ].map((s, i) => (
            <View key={i} style={styles.headerStatWrap}>
              {i > 0 && <View style={styles.statDivider} />}
              <View style={styles.headerStat}>
                <Text style={styles.headerStatVal}>{s.val}</Text>
                <Text style={styles.headerStatLabel}>{s.label}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: Spacing.md, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.actions}>
          {[
            {
              label: "Log Expense",
              icon: "add-circle-outline" as const,
              color: colors.warning,
              route: "/budget/add-expense",
            },
            {
              label: "Categories",
              icon: "apps-outline" as const,
              color: colors.primary,
              route: "/budget/categories",
            },
          ].map((btn) => (
            <TouchableOpacity
              key={btn.label}
              style={[
                styles.actionBtn,
                { backgroundColor: btn.color },
                shadow.sm,
              ]}
              onPress={() => router.push(btn.route as any)}
            >
              <Ionicons name={btn.icon} size={20} color="#fff" />
              <Text style={styles.actionBtnText}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {monthlySummary.length > 0 && (
          <Section title="Monthly Budgets" colors={colors}>
            {monthlySummary.map((cat, i) => (
              <CatRow
                key={cat.id}
                cat={cat}
                colors={colors}
                last={i === monthlySummary.length - 1}
              />
            ))}
          </Section>
        )}

        {dailySummary.length > 0 && (
          <Section title="Daily Budgets" colors={colors}>
            {dailySummary.map((cat, i) => (
              <CatRow
                key={cat.id}
                cat={cat}
                colors={colors}
                last={i === dailySummary.length - 1}
              />
            ))}
          </Section>
        )}

        {todayExpenses.length > 0 && (
          <Section title="Today's Transactions" colors={colors}>
            {todayExpenses.map((e, i) => (
              <View key={e.id}>
                <View style={styles.txRow}>
                  <Ionicons
                    name="ellipse"
                    size={8}
                    color={colors.warning}
                    style={{ marginTop: 5 }}
                  />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={[styles.txDesc, { color: colors.text }]}>
                      {e.description}
                    </Text>
                    <Text style={[styles.txDate, { color: colors.textMuted }]}>
                      {formatDate(e.date)}
                    </Text>
                  </View>
                  <Text style={[styles.txAmt, { color: colors.danger }]}>
                    -{formatCurrency(e.amount)}
                  </Text>
                </View>
                {i < todayExpenses.length - 1 && (
                  <View
                    style={[
                      styles.divider,
                      { backgroundColor: colors.divider },
                    ]}
                  />
                )}
              </View>
            ))}
          </Section>
        )}

        {monthlySummary.length === 0 && dailySummary.length === 0 && (
          <View style={styles.empty}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: colors.warningMuted },
              ]}
            >
              <Ionicons name="wallet" size={36} color={colors.warning} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No budgets set up
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSub }]}>
              Add categories to track your spending.
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.warning }]}
              onPress={() => router.push("/budget/categories")}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.emptyBtnText}>Add Category</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function Section({
  title,
  colors,
  children,
}: {
  title: string;
  colors: any;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: Spacing.lg }}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {children}
      </View>
    </View>
  );
}

function CatRow({
  cat,
  colors,
  last,
}: {
  cat: any;
  colors: any;
  last: boolean;
}) {
  const pct = cat.percentUsed;
  const barColor =
    pct > 90 ? colors.danger : pct > 70 ? colors.warning : cat.color;
  return (
    <View>
      <View style={styles.catRow}>
        <View style={[styles.catDot, { backgroundColor: cat.color }]} />
        <Text style={[styles.catName, { color: colors.text }]}>{cat.name}</Text>
        <Text style={[styles.catSpent, { color: colors.text }]}>
          {formatCurrency(cat.spent)}
        </Text>
        <Text style={[styles.catLimit, { color: colors.textMuted }]}>
          / {formatCurrency(cat.limit)}
        </Text>
      </View>
      <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.barFill,
            {
              width: `${Math.min(pct, 100)}%` as any,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
      {!last && (
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: Spacing.md,
    overflow: "hidden",
  },
  headerDecor: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#ffffff20",
    top: -40,
    right: -20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 16,
  },
  headerStats: { flexDirection: "row", alignItems: "center" },
  headerStatWrap: { flex: 1, flexDirection: "row", alignItems: "center" },
  statDivider: { width: 1, height: 32, backgroundColor: "#ffffff44" },
  headerStat: { flex: 1, alignItems: "center" },
  headerStatVal: { color: "#fff", fontSize: 18, fontWeight: "800" },
  headerStatLabel: { color: "#ffffffaa", fontSize: 11, marginTop: 2 },
  actions: { flexDirection: "row", gap: Spacing.sm, marginBottom: Spacing.lg },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 13,
    borderRadius: Radius.lg,
  },
  actionBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: Spacing.sm },
  card: { borderRadius: Radius.lg, padding: Spacing.md },
  divider: { height: 1, marginVertical: Spacing.sm },
  catRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catName: { flex: 1, fontSize: 14, fontWeight: "600" },
  catSpent: { fontSize: 14, fontWeight: "700" },
  catLimit: { fontSize: 12 },
  barTrack: { height: 8, borderRadius: 4, overflow: "hidden", marginTop: 6 },
  barFill: { height: "100%", borderRadius: 4 },
  txRow: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 2 },
  txDesc: { fontSize: 14, fontWeight: "600" },
  txDate: { fontSize: 12, marginTop: 2 },
  txAmt: { fontSize: 15, fontWeight: "700" },
  empty: { alignItems: "center", paddingTop: 60 },
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
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: Radius.full,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: Spacing.lg,
  },
  emptyBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
