import type { Component } from 'solid-js'
import clsx from 'clsx'
import IconSpinner from '@app/components/Icon/Spinner'

const Loading: Component = () => {
  return (
    <div class={styles.wrapper}>
      <IconSpinner size={40} />
    </div>
  )
}

const styles = {
  wrapper: clsx(
    'absolute left-0 top-0 flex h-screen w-screen tc:h-full tc:w-full',
    'items-center justify-center text-gray-500'
  ),
}

export default Loading
