import {
  AdminOrdersSortKey,
  AdminOrdersType,
  SortOrder,
} from '../../../lib/definitions'
import THead from '../../tHead'
import { LocalTime } from '../../localTime'

interface OrdersTableProps {
  tHeadColumns: {
    name: string
    dbColumn: string
    sortable: boolean
  }[]
  orders: AdminOrdersType[]
  sortBy: AdminOrdersSortKey
  sortOrder: SortOrder
  ordersCount: number
  currentPage: number
  limit: number
}

export default function OrdersTable({
  tHeadColumns,
  orders,
  sortBy,
  sortOrder,
  ordersCount,
  currentPage,
  limit,
}: OrdersTableProps) {
  return (
    <table className='dashboard-table text-lg' aria-rowcount={ordersCount + 1}>
      <THead
        tHeadColumns={tHeadColumns}
        sortBy={sortBy}
        sortOrder={sortOrder}
      />
      <tbody className='dashboard-tbody text-dashboard-text-4'>
        {orders.map((order, i) => {
          const ariaRowIndex = (currentPage - 1) * limit + i + 2

          return (
            <tr
              key={order.id}
              className='border-dashboard-table-border border-1 border-solid text-nowrap'
              aria-rowindex={ariaRowIndex}
            >
              <td>
                <div className='flex min-h-[63.219px] min-w-[356.297px] items-center justify-center'>
                  {order.id}
                </div>
              </td>
              <td>
                <div className='flex min-h-[63.219px] min-w-[356.297px] items-center justify-center'>
                  {order.user_id ?? '/'}
                </div>
              </td>
              <td>
                <div className='flex min-h-[63.219px] min-w-[356.297px] items-center justify-center'>
                  {order.guest_id ?? '/'}
                </div>
              </td>
              <td>
                <div className='flex min-h-[63.219px] min-w-[356.297px] items-center justify-center'>
                  {order.student_id}
                </div>
              </td>
              <td>
                <div className='flex min-h-[63.219px] items-center justify-center'>
                  {order.total}
                </div>
              </td>
              <td>
                <div className='flex min-h-[63.219px] items-center justify-center'>
                  {order.status}
                </div>
              </td>
              <td>
                <div className='flex min-h-[63.219px] items-center justify-center'>
                  <LocalTime
                    isoString={new Date(order.paid_at).toISOString()}
                  />
                </div>
              </td>
              <td>
                <div className='flex min-h-[63.219px] items-center justify-center'>
                  {order.receipt_email}
                </div>
              </td>
              <td>
                <div className='flex min-h-[63.219px] items-center justify-center'>
                  <LocalTime
                    isoString={new Date(order.created_at).toISOString()}
                  />
                </div>
              </td>
              <td>
                <div className='flex min-h-[63.219px] items-center justify-center'>
                  <LocalTime
                    isoString={new Date(order.updated_at).toISOString()}
                  />
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
