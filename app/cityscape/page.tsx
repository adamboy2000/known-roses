import type { Metadata } from 'next';
import CampaignPage from '../../components/CampaignPage';
export const metadata: Metadata = { title: 'Known — Cityscape preview', robots: { index: false, follow: false } };
export default function Page() { return <CampaignPage backdrop="cityscape"/>; }
