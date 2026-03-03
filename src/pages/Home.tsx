import type { FC } from 'hono/jsx'
import { Layout } from '../components/Layout'
import { HeroSection } from '../components/home/HeroSection'
import { StatsBar } from '../components/home/StatsBar'
import { HowItWorks } from '../components/home/HowItWorks'
import { BrowseBySector } from '../components/home/BrowseBySector'
import { BrowseByEducation } from '../components/home/BrowseByEducation'
import { LatestNotifications } from '../components/home/LatestNotifications'
import { ClosingSoon } from '../components/home/ClosingSoon'
import { CtaBanner } from '../components/home/CtaBanner'
import { ProfileWizard } from '../components/ProfileWizard'

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  'name': 'SarkariMatch',
  'url': 'https://sarkarimatch.com',
  'description': 'Personalized government job finder for India',
  'potentialAction': {
    '@type': 'SearchAction',
    'target': 'https://sarkarimatch.com/jobs?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

export const HomePage: FC = () => {
  return (
    <Layout
      meta={{
        title: 'SarkariMatch — Personalized Government Job Finder for India 2026',
        description:
          'Find government jobs matching YOUR eligibility. Set your age, education & category — see only the jobs you can apply for. 500+ active notifications across Railway, Banking, SSC, UPSC, Defence. No signup. 100% free.',
        ogTitle: 'SarkariMatch — Never Miss an Eligible Govt Job',
        ogDescription:
          "India's smartest government job finder. Personalized eligibility matching. No accounts required.",
        ogUrl: 'https://sarkarimatch.com',
      }}
      currentPath="/"
      structuredData={websiteSchema}
    >
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <BrowseBySector />
      <BrowseByEducation />
      <LatestNotifications />
      <ClosingSoon />
      <CtaBanner />
      <ProfileWizard />
    </Layout>
  )
}
