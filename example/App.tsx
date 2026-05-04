import React, { useState } from "react";
import {
  Image,
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
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import Modal, {
  ModalManager,
  ModalProvider,
  registerAnimation,
  useModal,
} from "react-native-modalx";

/** Minimum gap above the bottom edge / home indicator on every sheet. */
const BOTTOM_INSET_MIN = 16;

// Custom animation registered once at module load — used by the "achievement"
// demo to give a snappy entry that doesn't rely on a stock spring config.
registerAnimation("popInRotated", {
  from: { opacity: 0, scale: 0.5, rotate: -8 },
  to: { opacity: 1, scale: 1, rotate: 0 },
});
registerAnimation("popOutRotated", {
  from: { opacity: 1, scale: 1, rotate: 0 },
  to: { opacity: 0, scale: 0.5, rotate: 8 },
});

const palette = {
  bg: "#0e0e10",
  card: "#ffffff",
  text: "#111111",
  muted: "#6b6b76",
  border: "#e6e6ea",
  accent: "#7c5cff",
  destructive: "#e64545",
};

/* ---------------------------------------------------------------------- */
/*                              Reusable bits                             */
/* ---------------------------------------------------------------------- */

const Divider: React.FC = () => <View style={styles.divider} />;

const Section: React.FC<{
  title: string;
  caption?: string;
  children: React.ReactNode;
}> = ({ title, caption, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {caption ? <Text style={styles.sectionCaption}>{caption}</Text> : null}
    {children}
  </View>
);

const Btn: React.FC<{
  label: string;
  onPress: () => void;
  tone?: "primary" | "secondary" | "destructive" | "ghost";
}> = ({ label, onPress, tone = "primary" }) => (
  <Pressable
    style={[
      styles.button,
      tone === "secondary" && styles.buttonSecondary,
      tone === "destructive" && styles.buttonDestructive,
      tone === "ghost" && styles.buttonGhost,
    ]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.buttonText,
        tone === "secondary" && styles.buttonTextSecondary,
        tone === "ghost" && styles.buttonTextGhost,
      ]}
    >
      {label}
    </Text>
  </Pressable>
);

const SheetHandle = () => <View style={styles.handle} />;

/* ---------------------------------------------------------------------- */
/*                       1. Sign-in bottom sheet                          */
/* ---------------------------------------------------------------------- */

const SignInSheet: React.FC<{
  visible: boolean;
  onClose: () => void;
  respectMotion: boolean;
}> = ({ visible, onClose, respectMotion }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const insets = useSafeAreaInsets();

  return (
    <Modal
      isVisible={visible}
      respectReducedMotion={respectMotion}
      position="bottom"
      avoidKeyboard
      swipeDirection="down"
      onSwipeComplete={onClose}
      onBackdropPress={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={[
          styles.sheet,
          { paddingBottom: insets.bottom + BOTTOM_INSET_MIN },
        ]}
      >
        <SheetHandle />
        <Text style={styles.sheetTitle}>Welcome back</Text>
        <Text style={styles.sheetSubtitle}>Sign in to continue</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={palette.muted}
          style={styles.input}
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor={palette.muted}
          style={styles.input}
        />

        <Btn
          label="Sign in"
          onPress={() => {
            onClose();
            ModalManager.alert({
              title: "Signed in",
              message: email ? `Welcome back, ${email}` : "Demo only.",
            });
          }}
        />

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <Btn label="Continue with Apple" onPress={onClose} tone="secondary" />
        <View style={styles.spacer} />
        <Btn label="Continue with Google" onPress={onClose} tone="secondary" />
      </KeyboardAvoidingView>
    </Modal>
  );
};

/* ---------------------------------------------------------------------- */
/*                      2. iOS-style action sheet                          */
/* ---------------------------------------------------------------------- */

const ActionSheet: React.FC<{
  visible: boolean;
  onClose: () => void;
  respectMotion: boolean;
}> = ({ visible, onClose, respectMotion }) => {
  const insets = useSafeAreaInsets();
  const item = (label: string, onPress: () => void, destructive = false) => (
    <Pressable
      style={({ pressed }) => [
        styles.actionItem,
        pressed && styles.actionItemPressed,
      ]}
      onPress={() => {
        onPress();
        onClose();
      }}
    >
      <Text
        style={[
          styles.actionItemText,
          destructive && { color: palette.destructive },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <Modal
      isVisible={visible}
      respectReducedMotion={respectMotion}
      position="bottom"
      swipeDirection="down"
      onSwipeComplete={onClose}
      onBackdropPress={onClose}
    >
      <View
        style={[
          styles.actionSheetContainer,
          { paddingBottom: insets.bottom + BOTTOM_INSET_MIN },
        ]}
      >
        <View style={styles.actionGroup}>
          {item("Share post", () =>
            ModalManager.alert({
              title: "Shared",
              message: "Sent to clipboard.",
            }),
          )}
          <Divider />
          {item("Save to favorites", () =>
            ModalManager.alert({ title: "Saved" }),
          )}
          <Divider />
          {item("Copy link", () =>
            ModalManager.alert({ title: "Link copied" }),
          )}
          <Divider />
          {item(
            "Report this post",
            () =>
              ModalManager.alert({
                title: "Reported",
                message: "Thanks for letting us know.",
              }),
            true,
          )}
        </View>
        <View style={styles.actionGroup}>
          <Pressable
            style={({ pressed }) => [
              styles.actionItem,
              pressed && styles.actionItemPressed,
            ]}
            onPress={onClose}
          >
            <Text style={[styles.actionItemText, { fontWeight: "700" }]}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

/* ---------------------------------------------------------------------- */
/*                    3. Filter & sort bottom sheet                        */
/* ---------------------------------------------------------------------- */

const FilterSheet: React.FC<{
  visible: boolean;
  onClose: () => void;
  respectMotion: boolean;
}> = ({ visible, onClose, respectMotion }) => {
  const insets = useSafeAreaInsets();
  const [sort, setSort] = useState<"newest" | "oldest" | "price">("newest");
  const [filters, setFilters] = useState({
    inStock: true,
    freeShipping: false,
    onSale: false,
  });

  const sortRow = (key: typeof sort, label: string) => (
    <Pressable style={styles.choiceRow} onPress={() => setSort(key)} key={key}>
      <View style={styles.radio}>
        {sort === key ? <View style={styles.radioInner} /> : null}
      </View>
      <Text style={styles.choiceLabel}>{label}</Text>
    </Pressable>
  );

  const filterRow = (key: keyof typeof filters, label: string) => (
    <Pressable
      style={styles.choiceRow}
      onPress={() => setFilters((prev) => ({ ...prev, [key]: !prev[key] }))}
      key={key}
    >
      <View style={[styles.checkbox, filters[key] && styles.checkboxChecked]}>
        {filters[key] ? <Text style={styles.checkboxMark}>✓</Text> : null}
      </View>
      <Text style={styles.choiceLabel}>{label}</Text>
    </Pressable>
  );

  return (
    <Modal
      isVisible={visible}
      respectReducedMotion={respectMotion}
      position="bottom"
      swipeDirection="down"
      onSwipeComplete={onClose}
      onBackdropPress={onClose}
    >
      <View
        style={[
          styles.sheet,
          { paddingBottom: insets.bottom + BOTTOM_INSET_MIN },
        ]}
      >
        <SheetHandle />
        <Text style={styles.sheetTitle}>Sort & filter</Text>

        <Text style={styles.groupLabel}>Sort</Text>
        {sortRow("newest", "Newest first")}
        {sortRow("oldest", "Oldest first")}
        {sortRow("price", "Lowest price")}

        <View style={styles.divider} />

        <Text style={styles.groupLabel}>Filter</Text>
        {filterRow("inStock", "In stock")}
        {filterRow("freeShipping", "Free shipping")}
        {filterRow("onSale", "On sale")}

        <View style={styles.spacerL} />
        <Btn label="Apply" onPress={onClose} />
      </View>
    </Modal>
  );
};

/* ---------------------------------------------------------------------- */
/*                          4. Share sheet                                 */
/* ---------------------------------------------------------------------- */

const ShareSheet: React.FC<{
  visible: boolean;
  onClose: () => void;
  respectMotion: boolean;
}> = ({ visible, onClose, respectMotion }) => {
  const insets = useSafeAreaInsets();
  const targets = [
    { name: "Messages", color: "#34c759" },
    { name: "Mail", color: "#3478f6" },
    { name: "Twitter", color: "#1d9bf0" },
    { name: "Slack", color: "#4a154b" },
    { name: "Drive", color: "#fbbc04" },
    { name: "Notion", color: "#111111" },
    { name: "Copy", color: "#6b6b76" },
  ];

  return (
    <Modal
      isVisible={visible}
      respectReducedMotion={respectMotion}
      position="bottom"
      swipeDirection="down"
      onSwipeComplete={onClose}
      onBackdropPress={onClose}
    >
      <View
        style={[
          styles.sheet,
          { paddingBottom: insets.bottom + BOTTOM_INSET_MIN },
        ]}
      >
        <SheetHandle />
        <Text style={styles.sheetTitle}>Share</Text>
        <Text style={styles.sheetSubtitle}>How would you like to share?</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.shareRow}
        >
          {targets.map((t) => (
            <Pressable
              key={t.name}
              style={styles.shareTarget}
              onPress={() => {
                onClose();
                ModalManager.alert({
                  title: `Shared via ${t.name}`,
                });
              }}
            >
              <View style={[styles.shareIcon, { backgroundColor: t.color }]}>
                <Text style={styles.shareIconText}>{t.name.slice(0, 1)}</Text>
              </View>
              <Text style={styles.shareLabel}>{t.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.spacer} />
        <Btn label="Cancel" tone="ghost" onPress={onClose} />
      </View>
    </Modal>
  );
};

/* ---------------------------------------------------------------------- */
/*                       5. Image lightbox                                 */
/* ---------------------------------------------------------------------- */

const Lightbox: React.FC<{
  visible: boolean;
  onClose: () => void;
  respectMotion: boolean;
}> = ({ visible, onClose, respectMotion }) => (
  <Modal
    isVisible={visible}
    respectReducedMotion={respectMotion}
    animationIn="fadeIn"
    animationOut="fadeOut"
    position="fullscreen"
    swipeDirection={["up", "down"]}
    onSwipeComplete={onClose}
    onBackdropPress={onClose}
    customBackdrop={
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
    }
  >
    <View style={styles.lightboxRoot}>
      <Pressable
        style={styles.lightboxClose}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close image"
      >
        <Text style={styles.lightboxCloseText}>×</Text>
      </Pressable>
      <Image
        source={{ uri: "https://picsum.photos/seed/modalx/900/1400" }}
        style={styles.lightboxImage}
        resizeMode="contain"
      />
      <Text style={styles.lightboxCaption}>Swipe up or down to dismiss</Text>
    </View>
  </Modal>
);

/* ---------------------------------------------------------------------- */
/*                      6. Achievement (spring zoom)                       */
/* ---------------------------------------------------------------------- */

const Achievement: React.FC<{
  visible: boolean;
  onClose: () => void;
  respectMotion: boolean;
}> = ({ visible, onClose, respectMotion }) => (
  <Modal
    isVisible={visible}
    respectReducedMotion={respectMotion}
    animationIn={{
      type: "spring",
      preset: "zoomIn",
      damping: 11,
      stiffness: 110,
      mass: 0.7,
    }}
    animationOut={{ type: "timing", preset: "zoomOut", duration: 180 }}
    onBackdropPress={onClose}
  >
    <View style={styles.dialog}>
      <View style={styles.medal}>
        <Text style={styles.medalText}>★</Text>
      </View>
      <Text style={styles.dialogTitle}>Achievement unlocked</Text>
      <Text style={styles.dialogBody}>
        First open-source library shipped. Keep going.
      </Text>
      <Btn label="Nice" onPress={onClose} />
    </View>
  </Modal>
);

/* ---------------------------------------------------------------------- */
/*                    7. Stacked: profile + edit avatar                    */
/* ---------------------------------------------------------------------- */

const StackedProfile: React.FC<{
  visible: boolean;
  onClose: () => void;
  respectMotion: boolean;
}> = ({ visible, onClose, respectMotion }) => {
  const insets = useSafeAreaInsets();
  const [editVisible, setEditVisible] = useState(false);
  const [color, setColor] = useState(palette.accent);

  return (
    <>
      <Modal
        isVisible={visible}
        respectReducedMotion={respectMotion}
        position="bottom"
        swipeDirection="down"
        onSwipeComplete={onClose}
        onBackdropPress={onClose}
      >
        <View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + BOTTOM_INSET_MIN },
          ]}
        >
          <SheetHandle />
          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: color }]}>
              <Text style={styles.avatarText}>K</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>Kuray</Text>
              <Text style={styles.profileHandle}>@kuraydev</Text>
            </View>
          </View>
          <Btn
            label="Edit avatar"
            tone="secondary"
            onPress={() => setEditVisible(true)}
          />
          <View style={styles.spacer} />
          <Btn label="Sign out" tone="ghost" onPress={onClose} />
        </View>
      </Modal>

      <Modal
        isVisible={editVisible}
        respectReducedMotion={respectMotion}
        animationIn="zoomIn"
        animationOut="zoomOut"
        onBackdropPress={() => setEditVisible(false)}
      >
        <View style={styles.dialog}>
          <Text style={styles.dialogTitle}>Pick a color</Text>
          <Text style={styles.dialogBody}>
            Stacked above the profile sheet — its own backdrop included.
          </Text>
          <View style={styles.colorRow}>
            {[palette.accent, "#ff7a59", "#3ddb91", "#3478f6", "#e64545"].map(
              (c) => (
                <Pressable
                  key={c}
                  style={[
                    styles.swatch,
                    { backgroundColor: c },
                    c === color && styles.swatchActive,
                  ]}
                  onPress={() => setColor(c)}
                />
              ),
            )}
          </View>
          <Btn label="Done" onPress={() => setEditVisible(false)} />
        </View>
      </Modal>
    </>
  );
};

/* ---------------------------------------------------------------------- */
/*                              Top-level app                              */
/* ---------------------------------------------------------------------- */

const Demo: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [signIn, setSignIn] = useState(false);
  const [actions, setActions] = useState(false);
  const [filter, setFilter] = useState(false);
  const [share, setShare] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [achievement, setAchievement] = useState(false);
  const [profile, setProfile] = useState(false);
  const [respectMotion, setRespectMotion] = useState(true);
  const imperative = useModal();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>react-native-modalx</Text>
      <Text style={styles.subheading}>
        Reanimated-first drop-in replacement for react-native-modal.
      </Text>

      <Section title="Sheets" caption="Bottom-anchored, swipe-to-dismiss.">
        <Btn label="Sign in" onPress={() => setSignIn(true)} />
        <View style={styles.spacer} />
        <Btn
          label="Action sheet"
          tone="secondary"
          onPress={() => setActions(true)}
        />
        <View style={styles.spacer} />
        <Btn
          label="Sort & filter"
          tone="secondary"
          onPress={() => setFilter(true)}
        />
        <View style={styles.spacer} />
        <Btn label="Share" tone="secondary" onPress={() => setShare(true)} />
      </Section>

      <Section title="Fullscreen" caption="With a blurred backdrop.">
        <Btn label="Open image preview" onPress={() => setLightbox(true)} />
      </Section>

      <Section
        title="Dialogs"
        caption="Centered cards with timing or spring entries."
      >
        <Btn
          label="Achievement (spring)"
          onPress={() => setAchievement(true)}
        />
        <View style={styles.spacer} />
        <Btn
          label="Confirm delete (promise)"
          tone="destructive"
          onPress={async () => {
            const ok = await ModalManager.confirm({
              title: "Delete this post?",
              message:
                "It will be removed from your timeline and cannot be undone.",
              confirmLabel: "Delete",
              destructive: true,
            });
            if (ok) {
              await ModalManager.alert({
                title: "Deleted",
                message: "The post is gone.",
              });
            }
          }}
        />
      </Section>

      <Section title="Architectural">
        <Btn
          label="Profile (stacked sheets)"
          onPress={() => setProfile(true)}
        />
        <View style={styles.spacer} />
        <Btn
          label="Imperative (useModal ref)"
          tone="secondary"
          onPress={imperative.show}
        />
        <View style={styles.spacer} />
        <Btn
          label="Global manager (no state)"
          tone="secondary"
          onPress={() => {
            const id = ModalManager.show(
              <Modal
                isVisible
                respectReducedMotion={respectMotion}
                position="bottom"
                swipeDirection="down"
                onSwipeComplete={() => ModalManager.hide(id)}
                onBackdropPress={() => ModalManager.hide(id)}
              >
                <View
                  style={[
                    styles.sheet,
                    { paddingBottom: insets.bottom + BOTTOM_INSET_MIN },
                  ]}
                >
                  <SheetHandle />
                  <Text style={styles.sheetTitle}>Dispatched globally</Text>
                  <Text style={styles.sheetSubtitle}>
                    No state wired into the screen — fire and forget.
                  </Text>
                  <Btn label="Got it" onPress={() => ModalManager.hide(id)} />
                </View>
              </Modal>,
            );
          }}
        />
      </Section>

      <Section title="Settings">
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Respect reduced motion</Text>
          <Switch value={respectMotion} onValueChange={setRespectMotion} />
        </View>
        <Text style={styles.subheading}>
          When the OS reduced-motion setting is on and this is enabled, modals
          open and close instantly.
        </Text>
      </Section>

      {/* Imperative ref demo modal — content lives at the root, ref drives it. */}
      <Modal ref={imperative.ref} respectReducedMotion={respectMotion}>
        <View style={styles.dialog}>
          <Text style={styles.dialogTitle}>Imperative open</Text>
          <Text style={styles.dialogBody}>
            Triggered via a ref returned by useModal(). No state in the parent.
          </Text>
          <Btn label="Close" onPress={imperative.hide} />
        </View>
      </Modal>

      {/* Mounted modals (controlled with state) */}
      <SignInSheet
        visible={signIn}
        onClose={() => setSignIn(false)}
        respectMotion={respectMotion}
      />
      <ActionSheet
        visible={actions}
        onClose={() => setActions(false)}
        respectMotion={respectMotion}
      />
      <FilterSheet
        visible={filter}
        onClose={() => setFilter(false)}
        respectMotion={respectMotion}
      />
      <ShareSheet
        visible={share}
        onClose={() => setShare(false)}
        respectMotion={respectMotion}
      />
      <Lightbox
        visible={lightbox}
        onClose={() => setLightbox(false)}
        respectMotion={respectMotion}
      />
      <Achievement
        visible={achievement}
        onClose={() => setAchievement(false)}
        respectMotion={respectMotion}
      />
      <StackedProfile
        visible={profile}
        onClose={() => setProfile(false)}
        respectMotion={respectMotion}
      />
    </ScrollView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={styles.root}>
        <ModalProvider>
          <Demo />
        </ModalProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.bg },
  container: {
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 96,
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
  section: { gap: 8 },
  sectionTitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "700",
  },
  sectionCaption: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    marginBottom: 6,
  },
  spacer: { height: 10 },
  spacerL: { height: 18 },
  divider: {
    height: 1,
    backgroundColor: palette.border,
    marginVertical: 12,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: palette.border,
  },
  dividerText: {
    color: palette.muted,
    fontSize: 13,
  },

  /* buttons */
  button: {
    backgroundColor: palette.accent,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonSecondary: {
    backgroundColor: "#f3f3f6",
  },
  buttonDestructive: {
    backgroundColor: palette.destructive,
  },
  buttonGhost: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: palette.border,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  buttonTextSecondary: { color: palette.text },
  buttonTextGhost: { color: palette.text },

  /* sheet (used by every bottom modal body) */
  sheet: {
    backgroundColor: palette.card,
    paddingTop: 12,
    paddingHorizontal: 24,
    // 48pt clears the home-indicator zone (~34pt) on Face-ID iPhones and
    // looks fine on devices without one.
    paddingBottom: 48,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    backgroundColor: palette.border,
    borderRadius: 2,
    marginBottom: 16,
  },
  sheetTitle: {
    color: palette.text,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  sheetSubtitle: {
    color: palette.muted,
    fontSize: 14,
    marginBottom: 20,
  },

  /* dialog (centered card) — Modal's center position already adds horizontal
     padding, so the dialog itself just needs internal padding + radius. */
  dialog: {
    backgroundColor: palette.card,
    padding: 24,
    borderRadius: 18,
    gap: 12,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: palette.text,
  },
  dialogBody: {
    fontSize: 15,
    lineHeight: 22,
    color: palette.muted,
  },

  /* sign-in form */
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: palette.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 14,
    color: palette.text,
  },

  /* action sheet */
  actionSheetContainer: {
    paddingHorizontal: 12,
    paddingBottom: 40,
    gap: 10,
  },
  actionGroup: {
    backgroundColor: palette.card,
    borderRadius: 14,
    overflow: "hidden",
  },
  actionItem: {
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: palette.card,
  },
  actionItemPressed: {
    backgroundColor: "#eaeaef",
  },
  actionItemText: {
    fontSize: 17,
    color: palette.text,
  },

  /* filter / sort */
  groupLabel: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  choiceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 10,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: palette.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: palette.accent,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: palette.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: palette.accent,
  },
  checkboxMark: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 14,
  },
  choiceLabel: {
    fontSize: 15,
    color: palette.text,
  },

  /* share */
  shareRow: {
    paddingVertical: 8,
    paddingRight: 24,
    gap: 18,
  },
  shareTarget: {
    width: 64,
    alignItems: "center",
  },
  shareIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  shareIconText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  shareLabel: {
    fontSize: 12,
    color: palette.text,
  },

  /* lightbox */
  lightboxRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  lightboxImage: {
    width: "92%",
    height: "75%",
    borderRadius: 16,
    backgroundColor: "#222",
  },
  lightboxClose: {
    position: "absolute",
    top: 56,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  lightboxCloseText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 24,
  },
  lightboxCaption: {
    position: "absolute",
    bottom: 64,
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
  },

  /* achievement */
  medal: {
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff3a8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  medalText: {
    fontSize: 30,
    color: "#a87b00",
  },

  /* profile */
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.text,
  },
  profileHandle: {
    fontSize: 13,
    color: palette.muted,
    marginTop: 2,
  },
  colorRow: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 8,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  swatchActive: {
    borderWidth: 3,
    borderColor: palette.text,
  },

  /* settings */
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleLabel: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
