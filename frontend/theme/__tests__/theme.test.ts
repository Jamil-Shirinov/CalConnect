import { colors } from '../colors';
import { spacing } from '../spacing';
test('theme tokens match spec', () => {
  expect(colors).toEqual({ navy: '#1B0A5C', gold: '#C4A74F', goldBright: '#E8C245', cream: '#F8E9A8',
    skyLight: '#CFE8EC', grey: '#D9D9D9', greyDark: '#A6A6A6', white: '#FFFFFF' });
  expect(Object.values(spacing)).toEqual([4, 8, 12, 16, 24, 32]);
});
