'use client';

import { LoadingScreen } from '../components/loading-screen';

export {
  LoadingScreen,
  getTimePeriod,
  getRandomQuote,
  BAKERY_QUOTES,
  type TimePeriod,
  type LoadingScreenProps,
} from '../components/loading-screen';

export default function Loading() {
  return <LoadingScreen />;
}
