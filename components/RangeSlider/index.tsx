import { tw } from '@/tools/lib'
import * as Slider from '@radix-ui/react-slider'

type RangeSliderProps = {
  root?: Slider.SliderProps
  track?: Slider.SliderTrackProps
  range?: Slider.SliderRangeProps
  thumb?: Slider.SliderThumbProps
}

const RangeSlider: RF<RangeSliderProps> = ({ root, track, range, thumb }) => {
  return (
    <Slider.Root
      {...root}
      className={tw(
        'relative flex h-7 w-full min-w-[100px] touch-none select-none items-center',
        root?.className
      )}
    >
      <Slider.Track
        {...track}
        className={tw(
          'relative h-[3px] flex-grow rounded-full bg-zinc-200 [.dark_&]:bg-zinc-800',
          track?.className
        )}
      >
        <Slider.Range
          {...range}
          className={tw(
            'absolute h-full rounded-full bg-blue-400 [.dark_&]:bg-blue-500',
            root?.disabled && 'opacity-40',
            range?.className
          )}
        />
      </Slider.Track>
      <Slider.Thumb
        {...thumb}
        className={tw(
          'block h-5 w-5 rounded-full border border-zinc-300 bg-white focus:shadow-[rgba(0,_0,_0,_0.3)_0px_0px_0px_4px] focus:outline-none',
          thumb?.className
        )}
      />
    </Slider.Root>
  )
}

export default RangeSlider
