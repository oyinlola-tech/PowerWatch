import { useEffect, useState } from "react";
import { Animated, Easing, Pressable, Text, View } from "react-native";
import Icon from "../icons/Icon";
import { Divider } from "./ListSection";
import { alpha, fonts, type } from "../../theme";
import { makeStyles } from "../../theme/ThemeContext";

// Expandable question/answer list in the settings-style card (used by Help & FAQ)

export interface AccordionItem {
  title: string;
  body: string;
}

interface ItemProps extends AccordionItem {
  expanded: boolean;
  onToggle: () => void;
}

const Item = ({ title, body, expanded, onToggle }: ItemProps) => {
  const styles = useStyles();
  const [rotation] = useState(() => new Animated.Value(expanded ? 1 : 0));

  useEffect(() => {
    Animated.timing(rotation, {
      toValue: expanded ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [expanded, rotation]);

  const rotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "90deg"] });

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={({ pressed }) => [styles.header, pressed && { opacity: 0.7 }]}
      >
        <Text style={[type.boldText, styles.title]}>{title}</Text>
        <Animated.View style={[styles.chevron, { transform: [{ rotate }] }]}>
          <Icon name="chevronRight" />
        </Animated.View>
      </Pressable>
      {expanded && <Text style={styles.body}>{body}</Text>}
    </View>
  );
};

interface AccordionProps {
  items: AccordionItem[];
  /** Index open on first render */
  initiallyOpen?: number;
}

const Accordion = ({ items, initiallyOpen }: AccordionProps) => {
  const styles = useStyles();
  const [open, setOpen] = useState<number | null>(initiallyOpen ?? null);

  return (
    <View style={styles.card}>
      {items.map((item, index) => (
        <View key={item.title}>
          {index > 0 && <Divider />}
          <Item
            {...item}
            expanded={open === index}
            onToggle={() => setOpen((current) => (current === index ? null : index))}
          />
        </View>
      ))}
    </View>
  );
};

const useStyles = makeStyles((c) => ({
  card: {
    borderWidth: 1,
    borderColor: alpha(c.stroke, 0.6),
    borderRadius: 8,
    backgroundColor: c.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 16,
  },
  title: {
    flexShrink: 1,
    color: c.ink,
  },
  chevron: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginTop: -4,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 22,
    color: c.slate,
  },
}));

export default Accordion;
