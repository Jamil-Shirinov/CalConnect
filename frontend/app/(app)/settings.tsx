import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { useAppStore } from '../../store/AppStore';
import type { Student } from '../../data/mock';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const MODES: Student['mode'][] = ['In-person', 'Online'];
const toList = (s: string) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

export default function Settings() {
  const { state, updateProfile, signOut } = useAppStore();
  const s = state.student;
  const [name, setName] = useState(s.name);
  const [major, setMajor] = useState(s.major);
  const [courses, setCourses] = useState(s.courses.join(', '));
  const [style, setStyle] = useState(s.style);
  const [location, setLocation] = useState(s.location);
  const [availability, setAvailability] = useState(s.availability.join(', '));
  const [mode, setMode] = useState<Student['mode']>(s.mode);
  const [saved, setSaved] = useState(false);

  const edit = (set: (v: string) => void) => (text: string) => {
    set(text);
    setSaved(false);
  };

  const save = () => {
    const courseList = toList(courses);
    const availabilityList = toList(availability);
    const finalName = name.trim() ? name : s.name;
    updateProfile({ name: finalName, major, courses: courseList, style, location, availability: availabilityList, mode });
    setName(finalName);
    setCourses(courseList.join(', '));
    setAvailability(availabilityList.join(', '));
    setSaved(true);
  };

  return (
    <View>
      <Text style={styles.heading}>Settings</Text>
      <TextField label="Name" placeholder="Name" value={name} onChangeText={edit(setName)} />
      <TextField label="Major" placeholder="Major" value={major} onChangeText={edit(setMajor)} />
      <TextField label="Courses" placeholder="Courses" value={courses} onChangeText={edit(setCourses)} />
      <TextField label="Learning style" placeholder="Learning style" value={style} onChangeText={edit(setStyle)} />
      <TextField label="Location" placeholder="Location" value={location} onChangeText={edit(setLocation)} />
      <TextField
        label="Availability"
        placeholder="Availability"
        value={availability}
        onChangeText={edit(setAvailability)}
      />
      <Text style={styles.label}>Mode</Text>
      <View style={styles.chips}>
        {MODES.map((m) => (
          <Pressable
            key={m}
            accessibilityRole="button"
            accessibilityLabel={m}
            accessibilityState={{ selected: mode === m }}
            onPress={() => {
              setMode(m);
              setSaved(false);
            }}
            style={[styles.chip, mode === m && styles.chipSelected]}
          >
            <Text style={styles.chipText}>{m}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.buttons}>
        <Button title="Save" variant="goldBright" onPress={save} />
        <Button title="Log out" variant="navy" onPress={signOut} />
      </View>
      {saved ? <Text style={styles.success}>Profile saved</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontFamily: fonts.bold, fontSize: 24, color: colors.navy, marginBottom: spacing.lg },
  label: { fontFamily: fonts.semibold, color: colors.navy, marginBottom: spacing.xs },
  chips: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  chip: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: spacing.lg, backgroundColor: colors.grey },
  chipSelected: { backgroundColor: colors.goldBright },
  chipText: { fontFamily: fonts.semibold, color: colors.navy },
  buttons: { gap: spacing.md },
  success: { fontFamily: fonts.semibold, color: colors.navy, marginTop: spacing.md },
});
