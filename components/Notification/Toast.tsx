import { tw } from '@/tools/lib'
import { delay } from '@/tools/helpers'
import { AppConfig } from '@/tools/config'

class Toast {
  protected toasts = () => {
    return Array.from(
      document.querySelectorAll<HTMLElement>('[data-role="toast"]')
    )
  }

  protected create = (message: string, className?: string) => {
    const toastElement = document.createElement('div')

    toastElement.dataset.role = 'toast'
    toastElement.textContent = message
    toastElement.className = tw(
      'p-3 fixed top-0 text-sm tracking-normal left-0 w-full -translate-y-full transition-transform duration-300 z-[1200]',
      className
    )

    document.body.appendChild(toastElement)
    setTimeout(() => toastElement.classList.remove('-translate-y-full'), 20)
    return toastElement
  }

  // Show
  show = async (
    message?: string | null,
    severity?: 'error' | 'success' | 'info'
  ) => {
    if (!message) return

    await this.hide()
    const instance = this.create(
      message,
      tw(
        severity ?? 'bg-zinc-100',
        severity === 'error' && 'bg-red-600 text-white',
        severity === 'success' && 'bg-green-600 text-white'
      )
    )

    await delay(AppConfig.Timeout.Toast)
    instance.classList.add('-translate-y-full')
    instance.addEventListener('transitionend', (e) =>
      (e.currentTarget as HTMLElement)?.remove()
    )
  }

  hide = async () => {
    const _toast = this.toasts()
    const toast = _toast[_toast.length - 1]

    if (toast) {
      toast.className += tw(toast.className, '-translate-y-full')
      toast.addEventListener('transitionend', (e) =>
        (e.currentTarget as HTMLElement)?.remove()
      )
    }
  }

  error = (message?: string | null) => this.show(message, 'error')
  success = (message?: string | null) => this.show(message, 'success')
}

export default Toast
