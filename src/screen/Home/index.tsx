import type { Component } from 'solid-js'
import { createSignal } from 'solid-js'
import Topbar from '@app/components/Navbar/Topbar'
import ButtonAddNew from '@app/screen/Home/partials/AddNew'

const Homepage: Component = () => {
  const [showAddNewSheet, setShowAddNewSheet] = createSignal(false)

  return (
    <>
      <Topbar>
        <ButtonAddNew show={showAddNewSheet} setShow={setShowAddNewSheet} />
      </Topbar>
    </>
  )
}

export default Homepage
