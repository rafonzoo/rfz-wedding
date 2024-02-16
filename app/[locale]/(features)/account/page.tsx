import withAuthServer from '@/components/WrapperHoc/withAuthServer'
import AccountPageClient from './client'

const AccountPage = withAuthServer(() => {
  return <AccountPageClient />
})

export default AccountPage
