import type { FC } from '@app/types'
import WheelPicker from '@app/components/Picker/Wheel'

const Notification: FC = () => {
  return (
    <div class='mx-auto flex w-[254px]'>
      <WheelPicker />
    </div>
  )
}

export default Notification
