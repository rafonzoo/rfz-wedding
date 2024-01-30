import ReactMarkdown from 'react-markdown'
// @ts-expect-error polyfill
import hasOwn from 'object.hasown'

if (typeof window !== 'undefined' && !Object.hasOwn) {
  Object.hasOwn = hasOwn
}

const Markdown = ReactMarkdown

export default Markdown
