// components/UserMultiPickerModal.tsx
import { FontAwesome6 } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type User = {
  id: number | string;
  nama: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  data: User[];
  selectedIds: Array<number | string>;
  onChange: (ids: Array<number | string>) => void;
  C: any;
};

export default function UserMultiPickerModal({
  visible,
  onClose,
  data,
  selectedIds,
  onChange,
  C,
}: Props) {
  const [search, setSearch] = useState("");
  const [tempSelected, setTempSelected] = useState<Array<number | string>>([]);

  useEffect(() => {
    if (visible) {
      setTempSelected(selectedIds);
      setSearch("");
    }
  }, [visible, selectedIds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return data;

    return data.filter((user) =>
      String(user.nama ?? "")
        .toLowerCase()
        .includes(q),
    );
  }, [data, search]);

  const toggleUser = (id: number | string) => {
    setTempSelected((prev) => {
      const exists = prev.some((item) => String(item) === String(id));

      if (exists) {
        return prev.filter((item) => String(item) !== String(id));
      }

      return [...prev, id];
    });
  };

  const handleApply = () => {
    onChange(tempSelected);
    onClose();
  };

  const handleReset = () => {
    setTempSelected([]);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <TouchableOpacity
          style={s.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={s.kavWrap}
        >
          <View style={[s.sheet, { backgroundColor: C.surface }]}>
            <View style={[s.handle, { backgroundColor: C.borderStrong }]} />

            <View style={s.header}>
              <View
                style={[
                  s.headerIcon,
                  {
                    backgroundColor: C.accentBg,
                    borderColor: C.accentBorder,
                  },
                ]}
              >
                <FontAwesome6 name="users" size={13} color={C.accent} />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[s.title, { color: C.textPrimary }]}>
                  Pilih Penerima
                </Text>
                <Text style={[s.subtitle, { color: C.textTertiary }]}>
                  {tempSelected.length} user dipilih
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  s.closeBtn,
                  {
                    backgroundColor: C.surface2,
                    borderColor: C.borderStrong,
                  },
                ]}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <FontAwesome6 name="xmark" size={13} color={C.textSecondary} />
              </TouchableOpacity>
            </View>

            <View
              style={[
                s.searchBox,
                {
                  backgroundColor: C.surface2,
                  borderColor: C.borderStrong,
                },
              ]}
            >
              <FontAwesome6
                name="magnifying-glass"
                size={13}
                color={C.textTertiary}
              />

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Cari nama penerima..."
                placeholderTextColor={C.textMuted ?? C.textTertiary}
                style={[s.searchInput, { color: C.textPrimary }]}
                returnKeyType="search"
              />
            </View>

            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.id)}
              style={s.list}
              contentContainerStyle={s.listContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              renderItem={({ item }) => {
                const active = tempSelected.some(
                  (id) => String(id) === String(item.id),
                );

                return (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => toggleUser(item.id)}
                    style={[
                      s.userRow,
                      {
                        backgroundColor: active ? C.accentBg : C.surface2,
                        borderColor: active ? C.accentBorder : C.borderStrong,
                      },
                    ]}
                  >
                    <View
                      style={[
                        s.avatar,
                        {
                          backgroundColor: active ? C.accent : C.borderStrong,
                        },
                      ]}
                    >
                      <Text style={s.avatarText}>
                        {String(item.nama ?? "U")
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    </View>

                    <Text
                      style={[s.userName, { color: C.textPrimary }]}
                      numberOfLines={1}
                    >
                      {item.nama}
                    </Text>

                    <View
                      style={[
                        s.checkCircle,
                        {
                          backgroundColor: active ? C.accent : "transparent",
                          borderColor: active ? C.accent : C.borderStrong,
                        },
                      ]}
                    >
                      {active && (
                        <FontAwesome6 name="check" size={10} color="#FFFFFF" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={[s.emptyText, { color: C.textTertiary }]}>
                  User tidak ditemukan
                </Text>
              }
            />

            <View style={[s.footer, { borderTopColor: C.border }]}>
              <TouchableOpacity
                style={[
                  s.resetBtn,
                  {
                    backgroundColor: C.surface2,
                    borderColor: C.borderStrong,
                  },
                ]}
                onPress={handleReset}
                activeOpacity={0.75}
              >
                <Text style={[s.resetText, { color: C.textSecondary }]}>
                  Reset
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.applyBtn, { backgroundColor: C.accent }]}
                onPress={handleApply}
                activeOpacity={0.85}
              >
                <Text style={s.applyText}>
                  Terapkan
                  {tempSelected.length > 0 ? ` (${tempSelected.length})` : ""}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(10,20,50,0.48)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  kavWrap: {
    width: "100%",
    maxHeight: "88%",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "100%",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 20,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 99,
    alignSelf: "center",
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    height: 44,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    paddingVertical: 0,
  },
  list: {
    flexGrow: 0,
    maxHeight: 390,
  },
  listContent: {
    gap: 8,
    paddingBottom: 8,
  },
  userRow: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  userName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
    paddingVertical: 28,
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 0.5,
  },
  resetBtn: {
    flex: 1,
    borderWidth: 0.5,
    borderRadius: 20,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  resetText: {
    fontSize: 13,
    fontWeight: "800",
  },
  applyBtn: {
    flex: 2,
    borderRadius: 20,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  applyText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
});
