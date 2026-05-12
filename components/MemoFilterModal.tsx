import CustomModal from "@/components/CustomModal";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Option = {
  label: string;
  value: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    status: string | null;
    kodeBagian: string | null;
  }) => void;
  statusOptions: Option[];
  kodeOptions: Option[];
  initialStatus?: string | null;
  initialKodeBagian?: string | null;
  isDark?: boolean;
  title?: string;
  subtitle?: string;
};

function FilterChip({
  label,
  active,
  onPress,
  isDark,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  isDark: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.chip,
        active
          ? isDark
            ? styles.chipActiveDark
            : styles.chipActiveLight
          : isDark
            ? styles.chipIdleDark
            : styles.chipIdleLight,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          {
            color: active
              ? isDark
                ? "#00D4FF"
                : "#2563EB"
              : isDark
                ? "rgba(255,255,255,0.45)"
                : "rgba(15,30,80,0.5)",
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SectionLabel({ label, isDark }: { label: string; isDark: boolean }) {
  return (
    <Text
      style={[
        styles.sectionLabel,
        { color: isDark ? "rgba(255,255,255,0.28)" : "rgba(15,30,80,0.30)" },
      ]}
    >
      {label.toUpperCase()}
    </Text>
  );
}

export default function MemoFilterModal({
  visible,
  onClose,
  onApply,
  statusOptions,
  kodeOptions,
  initialStatus = null,
  initialKodeBagian = null,
  isDark = false,
}: Props) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(
    initialStatus,
  );
  const [selectedKodeBagian, setSelectedKodeBagian] = useState<string | null>(
    initialKodeBagian,
  );

  useEffect(() => {
    if (visible) {
      setSelectedStatus(initialStatus);
      setSelectedKodeBagian(initialKodeBagian);
    }
  }, [visible, initialStatus, initialKodeBagian]);

  const handleReset = () => {
    setSelectedStatus(null);
    setSelectedKodeBagian(null);
  };

  const handleApply = () => {
    onApply({
      status: selectedStatus,
      kodeBagian: selectedKodeBagian,
    });
    onClose();
  };

  return (
    <CustomModal
      visible={visible}
      onClose={onClose}
      title="Filter Dokumen"
      subtitle="Saring berdasarkan status dan kode bagian"
      icon="filter"
      resetLabel="Reset"
      onReset={handleReset}
      applyLabel="Terapkan Filter"
      onApply={handleApply}
      isDark={isDark}
    >
      <SectionLabel label="Status Memo" isDark={isDark} />

      <View style={styles.row}>
        <FilterChip
          label="Semua"
          active={selectedStatus === null}
          onPress={() => setSelectedStatus(null)}
          isDark={isDark}
        />

        {statusOptions.map((item) => (
          <FilterChip
            key={item.value}
            label={item.label}
            active={selectedStatus === item.value}
            onPress={() => setSelectedStatus(item.value)}
            isDark={isDark}
          />
        ))}
      </View>

      <View style={styles.gap} />

      <SectionLabel label="Kode Bagian" isDark={isDark} />

      <View style={styles.row}>
        <FilterChip
          label="Semua"
          active={selectedKodeBagian === null}
          onPress={() => setSelectedKodeBagian(null)}
          isDark={isDark}
        />

        {kodeOptions.map((item) => (
          <FilterChip
            key={item.value}
            label={item.label}
            active={selectedKodeBagian === item.value}
            onPress={() => setSelectedKodeBagian(item.value)}
            isDark={isDark}
          />
        ))}
      </View>
    </CustomModal>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 9.5,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  gap: {
    height: 18,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipActiveLight: {
    backgroundColor: "#EEF4FF",
    borderColor: "rgba(37,99,235,0.28)",
  },
  chipActiveDark: {
    backgroundColor: "rgba(0,212,255,0.08)",
    borderColor: "rgba(0,212,255,0.25)",
  },
  chipIdleLight: {
    backgroundColor: "#F8FAFF",
    borderColor: "rgba(15,30,80,0.10)",
  },
  chipIdleDark: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.08)",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
