import type { Components } from 'react-markdown'
import type { MouseEvent } from 'react'
import { IoCopyOutline } from 'react-icons/io5'
import * as clipboard from 'clipboard-polyfill'

async function onCopy(e: MouseEvent<HTMLButtonElement>) {
  const timeout: { copy: NodeJS.Timeout | null } = { copy: null }
  const target = e.currentTarget
  const value = target.dataset.value

  const wrapper = target.firstElementChild as HTMLElement | null
  const copyIcon = target.querySelector('svg')

  if (value && wrapper && copyIcon) {
    timeout.copy && clearTimeout(timeout.copy)
    await clipboard.writeText(value)

    wrapper.textContent = 'Disalin'
    timeout.copy = setTimeout(() => {
      wrapper.textContent = null
      wrapper.appendChild(copyIcon)
    }, 2000)
  }
}

const markdownConfig = {
  disallowedElements: ['h3', 'h4', 'h5', 'img'],
  components: {
    h1: 'h4',
    h2: 'h5',
    em: ({ node, ...props }) => {
      if (
        typeof props.children === 'string' &&
        props.children.includes('copy:')
      ) {
        const value = props.children.replace(/copy:|copy: /g, '')
        return (
          <button
            className='inline-flex items-center justify-center text-blue-600 [.dark_&]:text-blue-400'
            onClick={onCopy}
            data-value={value}
          >
            {value}
            <span className='ml-2 block'>
              <IoCopyOutline />
            </span>
          </button>
        )
      }

      return <i {...props} />
    },
  } as Partial<Components>,
}

export default markdownConfig
