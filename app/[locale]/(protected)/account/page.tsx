import withAuthServer from '@/components/HoC/withAuthServer'
import AccountPageClient from './client'

const AccountPage = withAuthServer(() => {
  return <AccountPageClient />
})

export default AccountPage
