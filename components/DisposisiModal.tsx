// components/DisposisiModal.tsx
import { FontAwesome6 } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export interface DisposisiTheme {
  surface: string;
  surface2: string;
  border: string;
  borderStrong: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;
  danger: string;
  panelTopLine: string;
}

export interface KandidatUser {
  id: number | string;
  nama: string;
}

export interface DisposisiModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    selectedUsers: Array<number | string>;
    instruksi: string;
    catatan: string;
    deadline: string;
  }) => Promise<void>;
  kandidat: KandidatUser[];
  submitting?: boolean;
  C: DisposisiTheme;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DisposisiModal({
  visible,
  onClose,
  onSubmit,
  kandidat,
  submitting = false,
  C,
}: DisposisiModalProps) {
  const [selectedUsers, setSelectedUsers] = useState<Array<number | string>>(
    [],
  );
  const [instruksi, setInstruksi] = useState("");
  const [catatan, setCatatan] = useState("");

  const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const [mode, setMode] = useState<"form" | "userPicker">("form");
  const [searchUser, setSearchUser] = useState("");

  const deadlineString = deadlineDate ? formatDate(deadlineDate) : "";

  const filteredUsers = useMemo(() => {
    const q = searchUser.trim().toLowerCase();

    if (!q) return kandidat;

    return kandidat.filter((user) =>
      String(user.nama ?? "")
        .toLowerCase()
        .includes(q),
    );
  }, [kandidat, searchUser]);

  const resetState = () => {
    setSelectedUsers([]);
    setInstruksi("");
    setCatatan("");
    setDeadlineDate(null);
    setTempDate(new Date());
    setShowPicker(false);
    setMode("form");
    setSearchUser("");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = async () => {
    await onSubmit({
      selectedUsers,
      instruksi,
      catatan,
      deadline: deadlineString,
    });

    resetState();
  };

  const openPicker = () => {
    setTempDate(deadlineDate ?? new Date());
    setShowPicker(true);
  };

  const onDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);

      if (event.type === "set" && selected) {
        setDeadlineDate(selected);
      }

      return;
    }

    if (selected) {
      setTempDate(selected);
    }
  };

  const onIOSConfirm = () => {
    setDeadlineDate(tempDate);
    setShowPicker(false);
  };

  const onIOSCancel = () => {
    setShowPicker(false);
  };

  const clearDeadline = () => {
    setDeadlineDate(null);
    setTempDate(new Date());
  };

  const toggleUser = (id: number | string) => {
    setSelectedUsers((prev) => {
      const exists = prev.some((item) => String(item) === String(id));

      if (exists) {
        return prev.filter((item) => String(item) !== String(id));
      }

      return [...prev, id];
    });
  };

  const isSubmitDisabled =
    selectedUsers.length === 0 || !instruksi.trim() || submitting;

  const renderForm = () => (
    <>
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={s.fieldBlock}>
          <Text style={[s.label, { color: C.textSecondary }]}>
            PENERIMA DISPOSISI
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setMode("userPicker")}
            style={[
              s.userPickerButton,
              {
                backgroundColor: C.surface2,
                borderColor: C.borderStrong,
              },
            ]}
          >
            <View style={[s.userPickerIcon, { backgroundColor: C.accentBg }]}>
              <FontAwesome6 name="users" size={14} color={C.accent} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[s.userPickerTitle, { color: C.textPrimary }]}>
                {selectedUsers.length > 0
                  ? `${selectedUsers.length} penerima dipilih`
                  : "Pilih penerima"}
              </Text>
              <Text style={[s.userPickerSub, { color: C.textTertiary }]}>
                Bisa memilih lebih dari satu user
              </Text>
            </View>

            <FontAwesome6
              name="chevron-right"
              size={12}
              color={C.textTertiary}
            />
          </TouchableOpacity>

          {selectedUsers.length > 0 && (
            <View style={s.selectedWrap}>
              {selectedUsers.slice(0, 5).map((id) => {
                const user = kandidat.find((u) => String(u.id) === String(id));

                return (
                  <View
                    key={String(id)}
                    style={[
                      s.selectedChip,
                      {
                        backgroundColor: C.accentBg,
                        borderColor: C.accentBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[s.selectedChipText, { color: C.accent }]}
                      numberOfLines={1}
                    >
                      {user?.nama ?? "User"}
                    </Text>
                  </View>
                );
              })}

              {selectedUsers.length > 5 && (
                <View
                  style={[
                    s.selectedChip,
                    {
                      backgroundColor: C.surface2,
                      borderColor: C.borderStrong,
                    },
                  ]}
                >
                  <Text style={[s.selectedChipText, { color: C.textTertiary }]}>
                    +{selectedUsers.length - 5} lainnya
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={s.section}>
          <Text style={[s.sectionLabel, { color: C.textTertiary }]}>
            INSTRUKSI <Text style={{ color: C.danger }}>*</Text>
          </Text>

          <TextInput
            value={instruksi}
            onChangeText={setInstruksi}
            placeholder="Masukkan instruksi disposisi..."
            placeholderTextColor={C.textMuted}
            multiline
            textAlignVertical="top"
            style={[
              s.textarea,
              {
                backgroundColor: C.surface2,
                borderColor: C.borderStrong,
                color: C.textPrimary,
              },
            ]}
          />
        </View>

        <View style={s.section}>
          <Text style={[s.sectionLabel, { color: C.textTertiary }]}>
            CATATAN
          </Text>

          <TextInput
            value={catatan}
            onChangeText={setCatatan}
            placeholder="Catatan tambahan, opsional..."
            placeholderTextColor={C.textMuted}
            multiline
            textAlignVertical="top"
            style={[
              s.textareaSmall,
              {
                backgroundColor: C.surface2,
                borderColor: C.borderStrong,
                color: C.textPrimary,
              },
            ]}
          />
        </View>

        <View style={s.section}>
          <Text style={[s.sectionLabel, { color: C.textTertiary }]}>
            DEADLINE
          </Text>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={openPicker}
            style={[
              s.dateButton,
              {
                backgroundColor: C.surface2,
                borderColor: C.borderStrong,
              },
            ]}
          >
            <FontAwesome6 name="calendar-days" size={14} color={C.accent} />

            <Text
              style={[
                s.dateButtonText,
                { color: deadlineDate ? C.textPrimary : C.textMuted },
              ]}
            >
              {deadlineDate
                ? formatDisplayDate(deadlineDate)
                : "Pilih deadline"}
            </Text>

            {deadlineDate ? (
              <TouchableOpacity onPress={clearDeadline} hitSlop={10}>
                <FontAwesome6 name="xmark" size={13} color={C.textTertiary} />
              </TouchableOpacity>
            ) : (
              <FontAwesome6
                name="chevron-down"
                size={12}
                color={C.textTertiary}
              />
            )}
          </TouchableOpacity>

          {showPicker && Platform.OS === "android" && (
            <DateTimePicker
              value={deadlineDate ?? new Date()}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={onDateChange}
            />
          )}
        </View>
      </ScrollView>

      <View style={[s.footer, { borderTopColor: C.border }]}>
        <TouchableOpacity
          style={[
            s.cancelBtn,
            { backgroundColor: C.surface2, borderColor: C.borderStrong },
          ]}
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <Text style={[s.cancelText, { color: C.textSecondary }]}>Batal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            s.submitBtn,
            {
              backgroundColor: C.accent,
              opacity: isSubmitDisabled ? 0.45 : 1,
            },
          ]}
          onPress={handleSubmit}
          disabled={isSubmitDisabled}
          activeOpacity={0.85}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <FontAwesome6 name="paper-plane" size={13} color="#fff" />
              <Text style={s.submitText}>Kirim Disposisi</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  const renderUserPicker = () => (
    <>
      <View style={s.pickerSearchWrap}>
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
            value={searchUser}
            onChangeText={setSearchUser}
            placeholder="Cari nama penerima..."
            placeholderTextColor={C.textMuted}
            style={[s.searchInput, { color: C.textPrimary }]}
            returnKeyType="search"
          />
        </View>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => String(item.id)}
        style={s.userList}
        contentContainerStyle={s.userListContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const active = selectedUsers.some(
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
            s.cancelBtn,
            { backgroundColor: C.surface2, borderColor: C.borderStrong },
          ]}
          onPress={() => setSelectedUsers([])}
          activeOpacity={0.7}
        >
          <Text style={[s.cancelText, { color: C.textSecondary }]}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.submitBtn, { backgroundColor: C.accent }]}
          onPress={() => setMode("form")}
          activeOpacity={0.85}
        >
          <Text style={s.submitText}>
            Selesai
            {selectedUsers.length > 0 ? ` (${selectedUsers.length})` : ""}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={
        mode === "userPicker" ? () => setMode("form") : handleClose
      }
      statusBarTranslucent={false}
      navigationBarTranslucent={false}
    >
      <SafeAreaView style={[s.safe, { backgroundColor: C.surface }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={s.keyboard}
        >
          <View style={[s.container, { backgroundColor: C.surface }]}>
            <View style={s.header}>
              <TouchableOpacity
                style={[
                  s.closeBtn,
                  { backgroundColor: C.surface2, borderColor: C.borderStrong },
                ]}
                onPress={
                  mode === "userPicker" ? () => setMode("form") : handleClose
                }
                activeOpacity={0.7}
              >
                <FontAwesome6
                  name={mode === "userPicker" ? "arrow-left" : "xmark"}
                  size={13}
                  color={C.textSecondary}
                />
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <Text style={[s.headerTitle, { color: C.textPrimary }]}>
                  {mode === "userPicker" ? "Pilih Penerima" : "Buat Disposisi"}
                </Text>
                <Text style={[s.headerSub, { color: C.textTertiary }]}>
                  {mode === "userPicker"
                    ? `${selectedUsers.length} user dipilih`
                    : "Pilih penerima dan isi instruksi"}
                </Text>
              </View>

              <View
                style={[
                  s.headerIcon,
                  { backgroundColor: C.accentBg, borderColor: C.accentBorder },
                ]}
              >
                <FontAwesome6
                  name={mode === "userPicker" ? "users" : "paper-plane"}
                  size={13}
                  color={C.accent}
                />
              </View>
            </View>

            <View style={[s.divider, { backgroundColor: C.border }]} />

            {mode === "form" ? renderForm() : renderUserPicker()}
          </View>
        </KeyboardAvoidingView>

        {showPicker && Platform.OS === "ios" && (
          <Modal
            transparent
            visible={showPicker}
            animationType="fade"
            onRequestClose={onIOSCancel}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={s.iosPickerBackdrop}
              onPress={onIOSCancel}
            >
              <TouchableOpacity
                activeOpacity={1}
                style={s.iosPickerBox}
                onPress={(e) => e.stopPropagation()}
              >
                <View style={s.iosPickerHeader}>
                  <TouchableOpacity onPress={onIOSCancel}>
                    <Text style={s.iosPickerCancel}>Batal</Text>
                  </TouchableOpacity>

                  <Text style={s.iosPickerTitle}>Pilih Deadline</Text>

                  <TouchableOpacity onPress={onIOSConfirm}>
                    <Text style={s.iosPickerDone}>Selesai</Text>
                  </TouchableOpacity>
                </View>

                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  minimumDate={new Date()}
                  onChange={onDateChange}
                  themeVariant="light"
                  textColor="#0F1E50"
                  locale="id-ID"
                  style={s.iosPicker}
                />
              </TouchableOpacity>
            </TouchableOpacity>
          </Modal>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    minHeight: 64,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 0.5,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 120,
    flexGrow: 1,
  },
  fieldBlock: {
    marginBottom: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  section: {
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  userPickerButton: {
    minHeight: 58,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userPickerIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  userPickerTitle: {
    fontSize: 13,
    fontWeight: "800",
  },
  userPickerSub: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  selectedWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 10,
  },
  selectedChip: {
    maxWidth: "100%",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  selectedChipText: {
    fontSize: 11,
    fontWeight: "800",
  },
  textarea: {
    borderRadius: 13,
    borderWidth: 0.5,
    padding: 13,
    minHeight: 120,
    fontSize: 13,
    lineHeight: 20,
  },
  textareaSmall: {
    borderRadius: 13,
    borderWidth: 0.5,
    padding: 13,
    minHeight: 90,
    fontSize: 13,
    lineHeight: 20,
  },
  dateButton: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateButtonText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  pickerSearchWrap: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
  },
  searchBox: {
    height: 44,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    paddingVertical: 0,
  },
  userList: {
    flex: 1,
  },
  userListContent: {
    paddingHorizontal: 18,
    paddingBottom: 120,
    gap: 8,
  },
  userRow: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
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
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 18,
    borderTopWidth: 0.5,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 20,
    borderWidth: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 13,
    fontWeight: "700",
  },
  submitBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 13,
    borderRadius: 20,
  },
  submitText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.1,
  },
  iosPickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,30,80,0.45)",
    justifyContent: "flex-end",
  },
  iosPickerBox: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
    overflow: "hidden",
  },
  iosPickerHeader: {
    height: 48,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15,30,80,0.08)",
  },
  iosPickerTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F1E50",
  },
  iosPickerCancel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },
  iosPickerDone: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2563EB",
  },
  iosPicker: {
    height: 210,
    backgroundColor: "#FFFFFF",
  },
});
