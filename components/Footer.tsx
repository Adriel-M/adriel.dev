import Link from './Link'
import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'

export default function Footer() {
  return (
    <footer>
      <div className="mt-16 flex flex-col items-center">
        <div className="mb-3 flex space-x-4">
          <SocialIcon kind="mail" href={`mailto:${siteMetadata.email}`} size={6} />
          <SocialIcon kind="github" href={siteMetadata.github} size={6} />
          <SocialIcon kind="facebook" href={siteMetadata.facebook} size={6} />
          <SocialIcon kind="youtube" href={siteMetadata.youtube} size={6} />
          <SocialIcon kind="linkedin" href={siteMetadata.linkedin} size={6} />
          <SocialIcon kind="twitter" href={siteMetadata.twitter} size={6} />
          <SocialIcon kind="rss" href="/rss.xml" size={6} />
        </div>
        <div className="mb-2 flex space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div>
            Logo from{' '}
            <Link
              className="hover:text-primary-500 dark:hover:text-primary-400"
              href="https://github.com/twitter/twemoji"
            >
              Twemoji
            </Link>
          </div>
          <div>{` • `}</div>
          <Link
            className="hover:text-primary-500 dark:hover:text-primary-400"
            href="https://creativecommons.org/licenses/by/4.0/"
          >
            CC BY 4.0
          </Link>
        </div>
        <div className="mb-8 flex space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div>{`© ${new Date().getFullYear()}`}</div>
          <div>{` • `}</div>
          <div>Adriel Martinez</div>
          <div>{` • `}</div>
          <Link
            className="hover:text-primary-500 dark:hover:text-primary-400"
            href="https://creativecommons.org/licenses/by/4.0/"
          >
            CC BY 4.0
          </Link>
        </div>
      </div>
    </footer>
  )
}
