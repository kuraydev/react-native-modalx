import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BlurView } from "expo-blur";
import Modal, {
  ModalManager,
  ModalProvider,
  registerAnimation,
  useModal,
} from "react-native-modalx";

// Demo of registerAnimation — registered once at module load.
registerAnimation("warpIn", {
  from: { opacity: 0, scale: 0.4, rotate: -15 },
  to: { opacity: 1, scale: 1, rotate: 0 },
});
registerAnimation("warpOut", {
  from: { opacity: 1, scale: 1, rotate: 0 },
  to: { opacity: 0, scale: 0.4, rotate: 15 },
});

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const Btn: React.FC<{
  label: string;
  onPress: () => void;
  tone?: "primary" | "ghost";
}> = ({ label, onPress, tone = "primary" }) => (
  <Pressable
    style={[styles.button, tone === "ghost" ? styles.buttonGhost : null]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.buttonText,
        tone === "ghost" ? styles.buttonGhostText : null,
      ]}
    >
      {label}
    </Text>
  </Pressable>
);

const Demo: React.FC = () => {
  const [showCenter, setShowCenter] = useState(false);
  const [showBottom, setShowBottom] = useState(false);
  const [showSpring, setShowSpring] = useState(false);
  const [showWarp, setShowWarp] = useState(false);
  const [showStackOuter, setShowStackOuter] = useState(false);
  const [showStackInner, setShowStackInner] = useState(false);
  const [showBlur, setShowBlur] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [respectMotion, setRespectMotion] = useState(true);
  const [name, setName] = useState("");
  const imperative = useModal();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>react-native-modalx</Text>
      <Text style={styles.subheading}>
        Reanimated-first drop-in replacement for react-native-modal.
      </Text>

      <Section title="1. Center modal (controlled)">
        <Btn label="Open center modal" onPress={() => setShowCenter(true)} />
        <Modal
          isVisible={showCenter}
          respectReducedMotion={respectMotion}
          onBackdropPress={() => setShowCenter(false)}
          onBackButtonPress={() => setShowCenter(false)}
        >
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Hello</Text>
            <Text style={styles.dialogBody}>
              I'm a center modal with a fade animation by default.
            </Text>
            <Btn label="Close" onPress={() => setShowCenter(false)} />
          </View>
        </Modal>
      </Section>

      <Section title="2. Bottom sheet with swipe-to-dismiss">
        <Btn label="Open bottom sheet" onPress={() => setShowBottom(true)} />
        <Modal
          isVisible={showBottom}
          respectReducedMotion={respectMotion}
          position="bottom"
          swipeDirection="down"
          onSwipeComplete={() => setShowBottom(false)}
          onBackdropPress={() => setShowBottom(false)}
          style={styles.bottomSheet}
        >
          <View style={styles.bottomSheetGrabber} />
          <Text style={styles.dialogTitle}>Bottom sheet</Text>
          <Text style={styles.dialogBody}>
            Drag me down to dismiss, or tap the backdrop.
          </Text>
        </Modal>
      </Section>

      <Section title="3. Spring animation (Reanimated config)">
        <Btn label="Open springy modal" onPress={() => setShowSpring(true)} />
        <Modal
          isVisible={showSpring}
          respectReducedMotion={respectMotion}
          animationIn={{ type: "spring", damping: 14, stiffness: 220 }}
          animationOut={{ type: "timing", duration: 200 }}
          onBackdropPress={() => setShowSpring(false)}
        >
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Boing!</Text>
            <Text style={styles.dialogBody}>
              The entrance is a spring; exit is a quick fade.
            </Text>
            <Btn label="Close" onPress={() => setShowSpring(false)} />
          </View>
        </Modal>
      </Section>

      <Section title="4. Custom animation (registerAnimation)">
        <Btn label="Open warped modal" onPress={() => setShowWarp(true)} />
        <Modal
          isVisible={showWarp}
          respectReducedMotion={respectMotion}
          animationIn="warpIn"
          animationOut="warpOut"
          onBackdropPress={() => setShowWarp(false)}
        >
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Warped in</Text>
            <Text style={styles.dialogBody}>
              Custom animation registered at the top of this file.
            </Text>
            <Btn label="Close" onPress={() => setShowWarp(false)} />
          </View>
        </Modal>
      </Section>

      <Section title="5. Imperative API (useModal)">
        <Btn label="Open via ref" onPress={imperative.show} />
        <Modal ref={imperative.ref} respectReducedMotion={respectMotion}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>I'm imperative</Text>
            <Text style={styles.dialogBody}>
              No state, just a ref and useModal().
            </Text>
            <Btn label="Close" onPress={imperative.hide} />
          </View>
        </Modal>
      </Section>

      <Section title="6. Global manager (ModalManager.show)">
        <Btn
          label="Show via manager"
          onPress={() => {
            const id = ModalManager.show(
              <Modal
                isVisible
                respectReducedMotion={respectMotion}
                position="bottom"
                swipeDirection="down"
                onSwipeComplete={() => ModalManager.hide(id)}
                onBackdropPress={() => ModalManager.hide(id)}
                style={styles.bottomSheet}
              >
                <View style={styles.bottomSheetGrabber} />
                <Text style={styles.dialogTitle}>Dispatched globally</Text>
                <Text style={styles.dialogBody}>
                  No need to wire state into your screen — fire-and-forget.
                </Text>
              </Modal>,
            );
          }}
        />
      </Section>

      <Section title="7. Stacked modals">
        <Btn label="Open outer modal" onPress={() => setShowStackOuter(true)} />
        <Modal
          isVisible={showStackOuter}
          respectReducedMotion={respectMotion}
          onBackdropPress={() => setShowStackOuter(false)}
        >
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Outer modal</Text>
            <Text style={styles.dialogBody}>
              Open a second modal on top of this one.
            </Text>
            <Btn
              label="Open inner modal"
              onPress={() => setShowStackInner(true)}
            />
            <Btn
              label="Close"
              tone="ghost"
              onPress={() => setShowStackOuter(false)}
            />
          </View>
        </Modal>
        <Modal
          isVisible={showStackInner}
          respectReducedMotion={respectMotion}
          animationIn="zoomIn"
          animationOut="zoomOut"
          onBackdropPress={() => setShowStackInner(false)}
        >
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Inner modal</Text>
            <Text style={styles.dialogBody}>
              Stacked above the outer modal — backdrop included.
            </Text>
            <Btn label="Close inner" onPress={() => setShowStackInner(false)} />
          </View>
        </Modal>
      </Section>

      <Section title="8. Custom blur backdrop (expo-blur)">
        <Btn label="Open blur backdrop" onPress={() => setShowBlur(true)} />
        <Modal
          isVisible={showBlur}
          respectReducedMotion={respectMotion}
          customBackdrop={
            <BlurView
              intensity={50}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          }
          onBackdropPress={() => setShowBlur(false)}
        >
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Blurred backdrop</Text>
            <Text style={styles.dialogBody}>
              The backdrop is an `expo-blur` view passed via `customBackdrop`.
            </Text>
            <Btn label="Close" onPress={() => setShowBlur(false)} />
          </View>
        </Modal>
      </Section>

      <Section title="9. Keyboard-avoiding form">
        <Btn label="Open form modal" onPress={() => setShowForm(true)} />
        <Modal
          isVisible={showForm}
          respectReducedMotion={respectMotion}
          avoidKeyboard
          position="bottom"
          onBackdropPress={() => setShowForm(false)}
          style={styles.bottomSheet}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View style={styles.bottomSheetGrabber} />
            <Text style={styles.dialogTitle}>What's your name?</Text>
            <TextInput
              autoFocus
              value={name}
              onChangeText={setName}
              placeholder="Type here…"
              style={styles.input}
            />
            <Btn
              label={name ? `Hi, ${name}!` : "Submit"}
              onPress={() => setShowForm(false)}
            />
          </KeyboardAvoidingView>
        </Modal>
      </Section>

      <Section title="10. Promise-based confirm / alert">
        <Btn
          label="Show confirm dialog"
          onPress={async () => {
            const ok = await ModalManager.confirm({
              title: "Delete this item?",
              message: "This action can't be undone.",
              confirmLabel: "Delete",
              destructive: true,
            });
            await ModalManager.alert({
              title: ok ? "Deleted" : "Cancelled",
              message: ok ? "The item is gone." : "Nothing happened.",
            });
          }}
        />
      </Section>

      <Section title="Settings">
        <View style={styles.row}>
          <Text style={styles.toggleLabel}>Respect reduced motion</Text>
          <Switch value={respectMotion} onValueChange={setRespectMotion} />
        </View>
        <Text style={styles.subheading}>
          When the OS reduced-motion setting is on and this is enabled, modals
          open and close instantly.
        </Text>
      </Section>
    </ScrollView>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ModalProvider>
        <Demo />
      </ModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0e0e10" },
  container: {
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 64,
    gap: 28,
  },
  heading: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subheading: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 14,
    lineHeight: 20,
  },
  section: { gap: 10 },
  sectionTitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "700",
  },
  button: {
    backgroundColor: "#7c5cff",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonGhost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  buttonGhostText: { color: "#444" },
  dialog: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    gap: 12,
  },
  dialogTitle: { fontSize: 22, fontWeight: "800" },
  dialogBody: { fontSize: 15, lineHeight: 22, color: "#444" },
  bottomSheet: {
    backgroundColor: "#fff",
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 48,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 12,
    margin: 0,
  },
  bottomSheetGrabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleLabel: { color: "#fff", fontSize: 15, fontWeight: "600" },
});
