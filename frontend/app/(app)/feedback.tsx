import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { validateFeedback, type FieldErrors } from '../../lib/validation';
import { useAppStore } from '../../store/AppStore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type Field = 'name' | 'email' | 'subject' | 'message';
const EMPTY = { name: '', email: '', subject: '', message: '' };

export default function Feedback() {
  const { submitFeedback } = useAppStore();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  const [sent, setSent] = useState(false);

  const edit = (field: Field) => (text: string) => {
    setForm((prev) => ({ ...prev, [field]: text }));
    setErrors((prev) => {
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
    setSent(false);
  };

  const submit = () => {
    const found = validateFeedback(form);
    setErrors(found);
    if (Object.keys(found).length === 0) {
      submitFeedback(form);
      setForm(EMPTY);
      setSent(true);
    }
  };

  return (
    <View>
      <Text style={styles.heading}>Feedback</Text>
      <TextField placeholder="Name" value={form.name} onChangeText={edit('name')} error={errors.name} />
      <TextField
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        value={form.email}
        onChangeText={edit('email')}
        error={errors.email}
      />
      <TextField placeholder="Subject" value={form.subject} onChangeText={edit('subject')} error={errors.subject} />
      <TextField
        placeholder="Message"
        value={form.message}
        onChangeText={edit('message')}
        error={errors.message}
        multiline
      />
      <Button title="Submit" variant="goldBright" onPress={submit} />
      {sent ? <Text style={styles.success}>Thanks! Your feedback was sent.</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontFamily: fonts.bold, fontSize: 24, color: colors.navy, marginBottom: spacing.lg },
  success: { fontFamily: fonts.semibold, color: colors.navy, marginTop: spacing.md },
});
