import Gallery from '@/components/Gallery.astro'
import Link from '@/components/Link.astro'
import ResponsivePicture from '@/components/ResponsivePicture.astro'
import TableWrapper from '@/components/TableWrapper.astro'

export default {
  a: Link,
  table: TableWrapper,
  img: ResponsivePicture,
  Gallery,
}
