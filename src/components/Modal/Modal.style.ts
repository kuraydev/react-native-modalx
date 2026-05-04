import { StyleSheet } from "react-native";

export const modalStyles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  containerBox: {
    zIndex: 2,
    opacity: 1,
    backgroundColor: "transparent",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  contentTop: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  contentBottom: {
    flex: 1,
    justifyContent: "flex-end",
  },
  contentFullScreen: {
    flex: 1,
  },
  pressable: {
    flex: 1,
  },
});
