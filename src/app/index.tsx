import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSplitter } from "../context/SplitterContext";
import { useBudget } from "../context/BudgetContext";
import { useTheme } from "../context/ThemeContext";
import { formatCurrency } from "../utils/currency";
import { today, startOfMonth, formatDate } from "../utils/date";
import { computeBalances } from "../utils/splitAlgorithm";
import { Radius, Spacing, Typography, Brand } from "../utils/theme";

const { width } = Dimensions.get("window");
const CARD_W = (width - Spacing.md * 2 - Spacing.sm) / 2;

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  bg,
  onPress,
}: {
  label: string;
  value: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  bg: string;
  onPress?: () => void;
}) {
  const { shadow } = useTheme();
  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: bg,
          width: CARD_W,
          borderRadius: Radius.xl,
          padding: Spacing.md,
        },
        shadow.md,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.statIconWrap}>
        <Ionicons name={icon} size={20} color="#fff" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Quick action ─────────────────────────────────────────────────────────────
function QuickAction({
  icon,
  label,
  color,
  bg,
  onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  color: string;
  bg: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.quickAction}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.quickActionLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Activity row ─────────────────────────────────────────────────────────────
function ActivityRow({
  icon,
  iconBg,
  title,
  sub,
  amount,
  amountColor,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconBg: string;
  title: string;
  sub: string;
  amount: string;
  amountColor: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.activityRow}>
      <View style={[styles.activityIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={16} color="#fff" />
      </View>
      <View style={styles.activityInfo}>
        <Text style={[styles.activityTitle, { color: colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.activitySub, { color: colors.textMuted }]}>
          {sub}
        </Text>
      </View>
      <Text style={[styles.activityAmount, { color: amountColor }]}>
        {amount}
      </Text>
    </View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();
  const { colors, isDark, shadow, toggle } = useTheme();
  const { groups, expenses: splitterExpenses } = useSplitter();
  const { categories, expenses: budgetExpenses } = useBudget();

  // Outstanding
  const totalOwed = groups.reduce((sum, group) => {
    const ge = splitterExpenses.filter((e) => e.groupId === group.id);
    const balances = computeBalances(group.members, ge);
    return (
      sum + balances.filter((b) => b.net > 0).reduce((s, b) => s + b.net, 0)
    );
  }, 0);

  // Budget
  const monthStart = startOfMonth();
  const monthlySpend = budgetExpenses
    .filter((e) => e.date >= monthStart)
    .reduce((s, e) => s + e.amount, 0);
  const monthlyLimit = categories.reduce((s, c) => s + c.limit, 0);
  const budgetPct =
    monthlyLimit > 0 ? Math.round((monthlySpend / monthlyLimit) * 100) : 0;
  const todaySpend = budgetExpenses
    .filter((e) => e.date === today())
    .reduce((s, e) => s + e.amount, 0);

  const recentBudget = [...budgetExpenses]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  const recentSplit = [...splitterExpenses]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const barColor =
    budgetPct > 90
      ? colors.danger
      : budgetPct > 70
        ? colors.warning
        : colors.success;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "light-content"}
        backgroundColor={colors.primary}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* ── Hero ── */}
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <View style={styles.heroDecor1} />
          <View style={styles.heroDecor2} />
          <View style={styles.heroDecor3} />

          {/* Theme toggle */}
          <TouchableOpacity
            style={styles.themeToggle}
            onPress={toggle}
            activeOpacity={0.8}
          >
            <Ionicons name={isDark ? "sunny" : "moon"} size={18} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.greeting}>{greeting} 👋</Text>
          <Text style={styles.heroTitle}>SplitSmart</Text>
          <Text style={styles.heroDate}>{dateStr}</Text>

          {/* Mini summary pills */}
          <View style={styles.heroPills}>
            <View style={styles.heroPill}>
              <Ionicons name="people" size={12} color="#ffffffcc" />
              <Text style={styles.heroPillText}>{groups.length} Groups</Text>
            </View>
            <View style={[styles.heroPill, { backgroundColor: "#ffffff22" }]}>
              <Ionicons name="flash" size={12} color="#FFD93D" />
              <Text style={[styles.heroPillText, { color: "#FFD93D" }]}>
                All tracked
              </Text>
            </View>
          </View>
        </View>

        {/* ── Stats ── */}
        <View style={[styles.section, { paddingTop: Spacing.lg }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Overview
          </Text>
          <View style={styles.statsGrid}>
            <StatCard
              label="Groups"
              value={String(groups.length)}
              icon="people"
              bg={colors.card1}
              onPress={() => router.push("/splitter")}
            />
            <StatCard
              label="Outstanding"
              value={formatCurrency(totalOwed)}
              icon="cash"
              bg={colors.card2}
              onPress={() => router.push("/splitter")}
            />
            <StatCard
              label="Today"
              value={formatCurrency(todaySpend)}
              icon="today"
              bg={colors.card3}
              onPress={() => router.push("/budget")}
            />
            <StatCard
              label={`Budget ${budgetPct}%`}
              value={formatCurrency(monthlySpend)}
              icon="pie-chart"
              bg={colors.card4}
              onPress={() => router.push("/budget")}
            />
          </View>
        </View>

        {/* ── Quick actions ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Actions
          </Text>
          <View
            style={[
              styles.quickRow,
              { backgroundColor: colors.surface },
              shadow.sm,
            ]}
          >
            <QuickAction
              icon="add-circle"
              label="New Group"
              color={colors.primary}
              bg={colors.primaryMuted}
              onPress={() => router.push("/splitter")}
            />
            <View
              style={[styles.quickDivider, { backgroundColor: colors.divider }]}
            />
            <QuickAction
              icon="receipt"
              label="Add Expense"
              color={colors.secondary}
              bg={colors.secondaryMuted}
              onPress={() => router.push("/splitter")}
            />
            <View
              style={[styles.quickDivider, { backgroundColor: colors.divider }]}
            />
            <QuickAction
              icon="trending-down"
              label="Log Spend"
              color={colors.warning}
              bg={colors.warningMuted}
              onPress={() => router.push("/budget/add-expense")}
            />
            <View
              style={[styles.quickDivider, { backgroundColor: colors.divider }]}
            />
            <QuickAction
              icon="apps"
              label="Categories"
              color={colors.accent}
              bg={colors.accentMuted}
              onPress={() => router.push("/budget/categories")}
            />
          </View>
        </View>

        {/* ── Budget progress ── */}
        {monthlyLimit > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Monthly Budget
            </Text>
            <View
              style={[
                styles.budgetCard,
                { backgroundColor: colors.surface },
                shadow.sm,
              ]}
            >
              <View style={styles.budgetTop}>
                <View>
                  <Text style={[styles.budgetSpent, { color: colors.text }]}>
                    {formatCurrency(monthlySpend)}
                  </Text>
                  <Text
                    style={[styles.budgetLimitText, { color: colors.textSub }]}
                  >
                    of {formatCurrency(monthlyLimit)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.budgetPctBadge,
                    { backgroundColor: barColor + "22" },
                  ]}
                >
                  <Text style={[styles.budgetPctText, { color: barColor }]}>
                    {budgetPct}%
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.progressTrack,
                  { backgroundColor: colors.border },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(budgetPct, 100)}%` as any,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
              <View style={styles.budgetFooter}>
                <Text
                  style={[styles.budgetFooterText, { color: colors.textMuted }]}
                >
                  {formatCurrency(Math.max(0, monthlyLimit - monthlySpend))}{" "}
                  remaining
                </Text>
                <TouchableOpacity onPress={() => router.push("/budget")}>
                  <Text
                    style={[styles.budgetFooterLink, { color: colors.primary }]}
                  >
                    Details →
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ── Recent splits ── */}
        {recentSplit.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Recent Splits
              </Text>
              <TouchableOpacity onPress={() => router.push("/splitter")}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>
                  See all
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.activityCard,
                { backgroundColor: colors.surface },
                shadow.sm,
              ]}
            >
              {recentSplit.map((e, i) => (
                <View key={e.id}>
                  <ActivityRow
                    icon="receipt-outline"
                    iconBg={colors.primary}
                    title={e.description}
                    sub={formatDate(e.date)}
                    amount={formatCurrency(e.amount)}
                    amountColor={colors.primary}
                  />
                  {i < recentSplit.length - 1 && (
                    <View
                      style={[
                        styles.rowDivider,
                        { backgroundColor: colors.divider, marginLeft: 60 },
                      ]}
                    />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Recent spends ── */}
        {recentBudget.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Recent Spends
              </Text>
              <TouchableOpacity onPress={() => router.push("/budget")}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>
                  See all
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.activityCard,
                { backgroundColor: colors.surface },
                shadow.sm,
              ]}
            >
              {recentBudget.map((e, i) => {
                const cat = categories.find((c) => c.id === e.categoryId);
                return (
                  <View key={e.id}>
                    <ActivityRow
                      icon={(cat?.icon as any) ?? "cash-outline"}
                      iconBg={cat?.color ?? colors.warning}
                      title={e.description}
                      sub={`${cat?.name ?? "Uncategorised"} · ${formatDate(e.date)}`}
                      amount={`-${formatCurrency(e.amount)}`}
                      amountColor={colors.danger}
                    />
                    {i < recentBudget.length - 1 && (
                      <View
                        style={[
                          styles.rowDivider,
                          { backgroundColor: colors.divider, marginLeft: 60 },
                        ]}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ── Empty state ── */}
        {groups.length === 0 && budgetExpenses.length === 0 && (
          <View style={styles.emptyWrap}>
            <View
              style={[
                styles.emptyIconWrap,
                { backgroundColor: colors.primaryMuted },
              ]}
            >
              <Ionicons name="sparkles" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Everything starts here!
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSub }]}>
              Create a group to split bills, or set up categories to track your
              budget.
            </Text>
            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/splitter")}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.emptyBtnText}>Create a Group</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Hero
  hero: {
    paddingTop: 56,
    paddingBottom: 28,
    paddingHorizontal: Spacing.md,
    overflow: "hidden",
  },
  heroDecor1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#ffffff0D",
    top: -60,
    right: -50,
  },
  heroDecor2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ffffff0A",
    top: 20,
    right: 70,
  },
  heroDecor3: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ffffff08",
    bottom: -20,
    left: 20,
  },
  themeToggle: {
    position: "absolute",
    top: 54,
    right: Spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff22",
    alignItems: "center",
    justifyContent: "center",
  },
  greeting: { color: "#ffffffBB", ...Typography.sm, fontWeight: "500" },
  heroTitle: {
    color: "#fff",
    ...Typography.xxxl,
    fontWeight: "800",
    marginTop: 2,
  },
  heroDate: { color: "#ffffff99", ...Typography.sm, marginTop: 4 },
  heroPills: { flexDirection: "row", gap: 8, marginTop: 16 },
  heroPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ffffff15",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  heroPillText: { color: "#ffffffcc", fontSize: 12, fontWeight: "600" },

  // Sections
  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.lg },
  sectionTitle: {
    ...Typography.md,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  seeAll: { ...Typography.sm, fontWeight: "600" },

  // Stats
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  statIconWrap: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: "#ffffff22",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  statValue: { color: "#fff", ...Typography.xl, fontWeight: "800" },
  statLabel: {
    color: "#ffffffCC",
    ...Typography.xs,
    fontWeight: "600",
    marginTop: 2,
  },

  // Quick actions
  quickRow: {
    borderRadius: Radius.xl,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
  },
  quickAction: { flex: 1, alignItems: "center", paddingVertical: Spacing.sm },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  quickActionLabel: { fontSize: 11, fontWeight: "700" },
  quickDivider: { width: 1, height: 36 },

  // Budget
  budgetCard: { borderRadius: Radius.xl, padding: Spacing.md },
  budgetTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  budgetSpent: { ...Typography.xl, fontWeight: "800" },
  budgetLimitText: { ...Typography.sm, marginTop: 2 },
  budgetPctBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  budgetPctText: { fontSize: 13, fontWeight: "800" },
  progressTrack: { height: 10, borderRadius: 5, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 5 },
  budgetFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  budgetFooterText: { ...Typography.xs },
  budgetFooterLink: { ...Typography.xs, fontWeight: "700" },

  // Activity
  activityCard: { borderRadius: Radius.xl, overflow: "hidden" },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  activityInfo: { flex: 1 },
  activityTitle: { ...Typography.sm, fontWeight: "600" },
  activitySub: { fontSize: 11, marginTop: 1 },
  activityAmount: { ...Typography.base, fontWeight: "700" },
  rowDivider: { height: 1 },

  // Empty
  emptyWrap: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: Radius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  emptyTitle: { ...Typography.lg, fontWeight: "800", textAlign: "center" },
  emptySub: {
    textAlign: "center",
    ...Typography.sm,
    marginTop: 8,
    lineHeight: 20,
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
  emptyBtnText: { color: "#fff", fontWeight: "700", ...Typography.base },
});
