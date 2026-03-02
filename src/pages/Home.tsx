import type { FC } from 'hono/jsx'
import { Layout } from '../components/Layout'
import { HeroSection } from '../components/home/HeroSection'
import { StatsBar } from '../components/home/StatsBar'
import { HowItWorks } from '../components/home/HowItWorks'
import { BrowseBySector } from '../components/home/BrowseBySector'
import { BrowseByEducation } from '../components/home/BrowseByEducation'

export const HomePage: FC = () => {
  return (
    <Layout
      meta={{
        title: 'SarkariMatch — Your Jobs. Your Eligibility. Zero Noise.',
        description:
          'Find government jobs matched to your eligibility. No accounts, no tracking, 100% free. Filter by education, age, category and more.',
        ogTitle: "SarkariMatch — India's Smartest Government Job Finder",
        ogDescription:
          'Personalized government job matching. Filter sarkari jobs by your education, age, and category. All data stays in your browser.',
      }}
      currentPath="/"
    >
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <BrowseBySector />
      <BrowseByEducation />
    </Layout>
  )
}
