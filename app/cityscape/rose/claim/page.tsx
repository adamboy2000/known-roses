import type { Metadata } from 'next';
import RoseClaim from '../../../../components/RoseClaim';
import { RoseAssetsProvider } from '../../../../components/RoseAssetsProvider';
export const metadata: Metadata = { title: 'A rose for you — Known cityscape preview', robots: { index: false, follow: false } };
export default function Page() { return <RoseAssetsProvider backdrop="cityscape"><RoseClaim/></RoseAssetsProvider>; }
