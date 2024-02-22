import Spinner from '@/components/Loading/Spinner'

const Loading = () => {
  return (
    <div
      data-loading
      className='absolute left-0 top-0 flex h-full w-full items-center justify-center opacity-75'
    >
      <Spinner size={32} />
    </div>
  )
}

export default Loading
