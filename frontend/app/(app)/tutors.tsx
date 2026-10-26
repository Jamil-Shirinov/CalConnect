import { StyleSheet, Text, View } from 'react-native';
import { TutorCard } from '../../components/TutorCard';
import { sortByMatch } from '../../lib/filters';
import { useAppStore } from '../../store/AppStore';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function Tutors() {
  const { state, sendRequest } = useAppStore();
  return (
    <View>
      <Text style={styles.heading}>Tutors</Text>
      {sortByMatch(state.tutors).map(tutor => (
        <TutorCard
          key={tutor.id}
          tutor={tutor}
          today={state.today}
          onRequest={(date, course) => sendRequest(tutor.id, date, course)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontFamily: fonts.bold, fontSize: 24, color: colors.navy, marginBottom: spacing.lg },
});
