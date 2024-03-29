import Link from './Link'

interface Props {
  title: string
  description: string
  href?: string
}

const Card = ({ title, description, href }: Props) => (
  <div className="md max-w-[544px] p-4 md:w-1/2">
    <div className="overflow-hidden rounded-md border-2 border-gray-200 border-opacity-60">
      <div className="p-6">
        <h2 className="mb-3 text-lg font-bold leading-8 tracking-tight">
          {href ? (
            <Link href={href} className="hover:text-primary-500" aria-label={`Link to ${title}`}>
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
        <p className="prose mb-3 min-h-24 max-w-none text-gray-500">{description}</p>
        {href && (
          <Link
            href={href}
            className="text-base font-medium leading-6 text-primary-500 hover:text-primary-600"
            aria-label={`Link to ${title}`}
          >
            Learn more &rarr;
          </Link>
        )}
      </div>
    </div>
  </div>
)

export default Card
