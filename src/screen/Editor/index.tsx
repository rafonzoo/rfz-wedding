import type { Component } from 'solid-js'
import Topbar from '@app/components/Navbar/Topbar'

const Editor: Component = () => {
  return (
    <>
      <Topbar>
        <div>{'<'}</div>
      </Topbar>
    </>
  )
}

export default Editor
