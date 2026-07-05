import React from "react";
import { StyleSheet, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export function ListDivider() {
  const colors = useColors();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

export function SeparatedList<T>({
  data,
  keyExtractor,
  renderItem,
}: {
  data: T[];
  keyExtractor?: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
}) {
  return (
    <>
      {data.map((item, index) => (
        <React.Fragment key={keyExtractor?.(item, index) ?? String(index)}>
          {renderItem(item, index)}
          {index < data.length - 1 ? <ListDivider /> : null}
        </React.Fragment>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
});
