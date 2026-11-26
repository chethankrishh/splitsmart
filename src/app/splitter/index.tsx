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
import { useSplitter } from "../../context/SplitterContext";
import { useTheme } from "../../context/ThemeContext";
import { formatCurrency } from "../../utils/currency";
import { formatDate } from "../../utils/date";
import { computeBalances } from "../../utils/splitAlgorithm";
import { Radius, Spacing, Typography } from "../../utils/theme";
import type { Group } from "../../types/splitter";

const GROUP_BG = [
  "#6366F1",
  "#F43F5E",
  "#10B981",
  "#F59E0B",
  "#8B5CF6",
  "#0EA5E9",
];

function GroupCard({
  group,
  totalExpenses,
  onPress,
  onDelete,
}: {
  group: Group;
  totalExpenses: number;
  onPress: () => void;
  onDelete: () => void;
}) {
  const { colors, shadow } = useTheme();
  const bg = GROUP_BG[group.name.charCodeAt(0) % GROUP_BG.length];
  return (
    <TouchableOpacity
      style={[styles.groupCard, { backgroundColor: colors.surface }, shadow.md]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={[styles.groupAvatar, { backgroundColor: bg }]}>
        <Text style={styles.groupAvatarText}>
          {group.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.groupInfo}>
        <Text style={[styles.groupName, { color: colors.text }]}>
          {group.name}
        </Text>
        <Text style={[styles.groupMeta, { color: colors.textMuted }]}>
          {group.members.length} member{group.members.length !== 1 ? "s" : ""} ·{" "}
          {formatDate(group.createdAt)}
        </Text>
      </View>
      <View style={styles.groupRight}>
        <Text style={[styles.groupAmount, { color: colors.primary }]}>
          {formatCurrency(totalExpenses)}
        </Text>
        <Text style={[styles.groupAmountLabel, { color: colors.textMuted }]}>
          total
        </Text>
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={onDelete}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="trash-outline" size={16} color={colors.danger} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

export default function SplitterScreen() {
  const router = useRouter();
  const { colors, isDark, shadow } = useTheme();
  const { groups, expenses, dispatch } = useSplitter();
  const [modal, setModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [membersText, setMembersText] = useState("");

  function createGroup() {
    const name = groupName.trim();
    if (!name) return;
    const memberNames = membersText
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    if (memberNames.length < 1) {
      Alert.alert("Add at least one member");
      return;
    }
    const members = memberNames.map((n, i) => ({
      id: `${Date.now()}_${i}`,
      name: n,
    }));
    const group: Group = {
      id: Date.now().toString(),
      name,
      members,
      createdAt: new Date().toISOString().split("T")[0],
    };
    dispatch({ type: "ADD_GROUP", payload: group });
    setGroupName("");
    setMembersText("");
    setModal(false);
  }

  const totalOutstanding = groups.reduce((groupSum, group) => {
    const ge = expenses.filter((e) => e.groupId === group.id);
    const balances = computeBalances(group.members, ge);
    return (
      groupSum +
      balances.filter((b) => b.net > 0).reduce((s, b) => s + b.net, 0)
    );
  }, 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerDecor} />
        <Text style={styles.headerTitle}>Expense Splitter</Text>
        <View style={styles.headerMeta}>
          <View style={styles.headerPill}>
            <Text style={styles.headerPillText}>
              {groups.length} group{groups.length !== 1 ? "s" : ""}
            </Text>
          </View>
          {totalOutstanding > 0 && (
            <View style={[styles.headerPill, { backgroundColor: "#FF6B6B33" }]}>
              <Ionicons name="cash-outline" size={12} color="#FFB3B3" />
              <Text style={[styles.headerPillText, { color: "#FFB3B3" }]}>
                {formatCurrency(totalOutstanding)} outstanding
              </Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView
        style={{
          flex: 1,
          paddingHorizontal: Spacing.md,
          paddingTop: Spacing.md,
        }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {groups.length === 0 ? (
          <View style={styles.empty}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: colors.primaryMuted },
              ]}
            >
              <Ionicons name="people" size={36} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No groups yet
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSub }]}>
              Create a group and start splitting expenses with friends.
            </Text>
          </View>
        ) : (
          <View style={{ gap: Spacing.sm }}>
            {groups.map((g) => {
              const total = expenses
                .filter((e) => e.groupId === g.id)
                .reduce((s, e) => s + e.amount, 0);
              return (
                <GroupCard
                  key={g.id}
                  group={g}
                  totalExpenses={total}
                  onPress={() => router.push(`/splitter/${g.id}`)}
                  onDelete={() =>
                    Alert.alert(
                      "Delete group?",
                      `"${g.name}" and all its expenses will be removed.`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: () =>
                            dispatch({ type: "DELETE_GROUP", payload: g.id }),
                        },
                      ],
                    )
                  }
                />
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }, shadow.lg]}
        onPress={() => setModal(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={modal}
        animationType="slide"
        transparent
        onRequestClose={() => setModal(false)}
      >
        <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
          <View
            style={[styles.sheet, { backgroundColor: colors.surfaceRaised }]}
          >
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              New Group
            </Text>

            <Text style={[styles.inputLabel, { color: colors.textSub }]}>
              Group Name
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
              placeholder="e.g. Goa Trip"
              placeholderTextColor={colors.textMuted}
              value={groupName}
              onChangeText={setGroupName}
            />

            <Text style={[styles.inputLabel, { color: colors.textSub }]}>
              Members{" "}
              <Text style={{ fontWeight: "400", color: colors.textMuted }}>
                (comma-separated)
              </Text>
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
              placeholder="Alice, Bob, Charlie"
              placeholderTextColor={colors.textMuted}
              value={membersText}
              onChangeText={setMembersText}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[
                  styles.cancelBtn,
                  { backgroundColor: colors.bg, borderColor: colors.border },
                ]}
                onPress={() => setModal(false)}
              >
                <Text style={[styles.cancelText, { color: colors.textSub }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.createBtn, { backgroundColor: colors.primary }]}
                onPress={createGroup}
              >
                <Text style={styles.createText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: Spacing.md,
    overflow: "hidden",
  },
  headerDecor: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#ffffff0F",
    top: -50,
    right: -40,
  },
  headerTitle: { color: "#fff", ...Typography.xl, fontWeight: "800" },
  headerMeta: { flexDirection: "row", gap: 8, marginTop: 10 },
  headerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ffffff22",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  headerPillText: { color: "#ffffffCC", fontSize: 12, fontWeight: "600" },

  groupCard: {
    borderRadius: Radius.xl,
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
  },
  groupAvatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  groupAvatarText: { color: "#fff", fontSize: 20, fontWeight: "800" },
  groupInfo: { flex: 1 },
  groupName: { ...Typography.base, fontWeight: "700" },
  groupMeta: { fontSize: 12, marginTop: 2 },
  groupRight: { alignItems: "flex-end", marginRight: 12 },
  groupAmount: { ...Typography.base, fontWeight: "800" },
  groupAmountLabel: { fontSize: 11 },
  deleteBtn: { padding: 4 },

  empty: { alignItems: "center", paddingTop: 80 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  emptyTitle: { ...Typography.md, fontWeight: "700" },
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
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },

  overlay: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    padding: Spacing.lg,
    paddingBottom: 36,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  sheetTitle: { ...Typography.lg, fontWeight: "800", marginBottom: Spacing.md },
  inputLabel: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: {
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...Typography.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  modalActions: { flexDirection: "row", gap: Spacing.sm, marginTop: 4 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.full,
    alignItems: "center",
    borderWidth: 1,
  },
  cancelText: { fontWeight: "700" },
  createBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.full,
    alignItems: "center",
  },
  createText: { color: "#fff", fontWeight: "700" },
});
