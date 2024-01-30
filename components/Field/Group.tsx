import { tw } from '@/tools/lib'

type InputGroupProps = {
  title?: string
  classNames?: {
    w1?: string
    w2?: string
    p?: string
    root?: string
  }
}

const FieldGroup: RFZ<InputGroupProps> = ({ title, classNames, children }) => {
  return (
    <div className={tw(classNames?.root)}>
      {title && (
        <p
          className={tw(
            'bg-zinc-100 px-6 py-2 text-xs font-semibold uppercase tracking-wide dark:bg-zinc-700',
            classNames?.p
          )}
        >
          {title}
        </p>
      )}
      <div
        className={tw(
          !classNames?.w2?.includes('px') && 'px-6',
          !classNames?.w2?.includes('pt') && 'pt-6',
          classNames?.w2
        )}
      >
        <div
          className={tw(
            !classNames?.w1?.includes('space-y') && 'space-y-4',
            classNames?.w1
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export default FieldGroup
