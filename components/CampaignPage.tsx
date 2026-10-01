import { content } from '../app/content';
import RoseScene from '../components/RoseScene';
import SidePhotos from '../components/SidePhotos';
import { Hero, Actions, ContentReveals } from '../components/Motion';
import { KnownLogo } from '../components/KnownLogo';
import { CheckoutProvider } from '../components/RoseCheckout';
import { RoseAssetsProvider } from './RoseAssetsProvider';
import type { RoseBackdrop } from '../lib/rose-assets';
function BeliefCopy() { return <div className="bodyCopy">{content.belief.map(p => <p key={p}>{p}</p>)}</div>; }
export default function CampaignPage({ backdrop = 'sunset' }: { backdrop?: RoseBackdrop }) { return <RoseAssetsProvider backdrop={backdrop}><CheckoutProvider><main className="page"><ContentReveals/>
  <a className="skipLink" href="#how">Skip to how it works</a>
  <RoseScene><Hero/><section className="hero" aria-label="Send a real rose"><div className="content">
    <h2 className="heading">Send a <em>rose.</em></h2><p className="details">For $3.33, the price of a Rose on Hinge*, send someone a real one.<br/><a className="bodyCopy deliveryLink" href="#where">{content.deliveryLine}</a></p><Actions/>
  </div></section></RoseScene>
  <SidePhotos><section className="nextSection"><div className="campaignRows">
    <section className="campaignRow" aria-labelledby="belief-label"><h2 className="sectionLabel" id="belief-label">We believe</h2><div className="sectionContent beliefContent"><p className="beliefHeading">Money spent on <em>dating apps</em> should get you something real: Real roses, real dates, real relationships.</p><BeliefCopy/></div></section>
    <section id="how" className="campaignRow" tabIndex={-1} aria-labelledby="how-label"><h2 className="sectionLabel" id="how-label">How it works</h2><div className="sectionContent stepsContent"><p className="bodyCopy">{content.howIntro}</p><ol className="steps">{content.steps.map(step => <li className="step" key={step.icon}><img src={`/known/${step.icon}.svg`} alt=""/><h3>{step.title}{step.emphasis && <> <em>{step.emphasis}</em></>}</h3><p>{step.description}</p></li>)}</ol></div></section>
    <section id="where" className="campaignRow" tabIndex={-1} aria-labelledby="where-label"><h2 className="sectionLabel" id="where-label">Where we deliver</h2><div className="sectionContent deliveryContent"><ul className="cities">{content.cities.map(city => <li key={city}>{city}</li>)}</ul></div></section>
  </div></section></SidePhotos>
  <footer className="closingBlock"><div className="footerBackdrop" aria-hidden="true"><img src="/known/footer-blur.png" alt="" loading="lazy" decoding="async" /></div><div className="closingHead"><h2 className="heading">Send <em>roses.</em></h2><p>Roses belong in real life. So does dating.</p></div><Actions closing/><div className="footerLogo"><KnownLogo footer/></div>
    <div className="footerInfo"><nav aria-label="Social and support"><ul>{content.social.map(link => <li key={link.label}><a href={link.href}>{link.label}</a></li>)}</ul></nav><nav aria-label="Company"><ul className="companyLinks"><li><a href="https://known.com/careers">Careers</a></li><li><a href="https://known.com/legal">Legal</a></li><li>©2026</li></ul></nav><p className="finePrint">*Hinge’s smallest Rose bundle on the<br className="footnoteBreak"/> US App Store is 3 for $9.99, as of Sep 26, 2026.</p></div>
  </footer>
</main></CheckoutProvider></RoseAssetsProvider>; }
