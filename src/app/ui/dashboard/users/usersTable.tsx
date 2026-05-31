import { UsersSortKey, SortOrder, UsersType } from '../../../lib/definitions'
import { LocalTime } from '../../localTime'
import THead from '../../tHead'
import ActiveWrapper from './activeWrapper'

interface UsersTableProps {
  tHeadColumns: {
    name: string
    dbColumn: string
    sortable: boolean
  }[]
  users: UsersType[]
  sortBy: UsersSortKey
  sortOrder: SortOrder
  usersCount: number
  currentPage: number
  limit: number
}

export default function UsersTable({
  tHeadColumns,
  users,
  sortBy,
  sortOrder,
  usersCount,
  currentPage,
  limit,
}: UsersTableProps) {
  return (
    <table className='dashboard-table text-lg' aria-rowcount={usersCount + 1}>
      <THead
        tHeadColumns={tHeadColumns}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
      <tbody className='dashboard-tbody text-dashboard-text-4'>
        {users.map((user, i) => {
          const ariaRowIndex = (currentPage - 1) * limit + i + 2

          return (
            <tr
              key={user.id}
              className='border-dashboard-table-border h-[91.22px] border-1 border-solid text-nowrap'
              aria-rowindex={ariaRowIndex}
            >
              <td>
                <ActiveWrapper userId={user.id} isUserActive={user.is_active} />
              </td>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <LocalTime
                  isoString={new Date(user.created_at).toISOString()}
                />
              </td>
              <td>
                <LocalTime
                  isoString={new Date(user.updated_at).toISOString()}
                />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
