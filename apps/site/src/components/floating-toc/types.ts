export interface TocEntry {
  slug: string
  text: string
  depth: number
  items: TocEntry[]
}
