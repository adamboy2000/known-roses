import type { Metadata } from 'next';
import RoseClaim from '../../../components/RoseClaim';

export const metadata: Metadata = { title: 'A rose for you — Known', robots: { index: false, follow: false } };
export default function Page() { return <RoseClaim/>; }
