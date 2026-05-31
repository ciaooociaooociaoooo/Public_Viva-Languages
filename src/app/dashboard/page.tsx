import { auth, isUserActive } from '@/auth'
import { redirect } from 'next/navigation'
import PieChart from '../ui/dashboard/pieChart'
import AreaChart from '../ui/dashboard/areaChart'
import AreaChartWrapper from '../ui/dashboard/areaChartWrapper'
import PieChartWrapper from '../ui/dashboard/pieChartWrapper'
import DashboardDataWrapper from '../ui/dashboard/dashboardDataWrapper'
import GrowthOrDeclineMark from '../ui/growthOrDeclineMark'
import {
  fetchAdminCreatedProgramsByAgeGroups,
  fetchAdminMonthlyRevenueAndMOMGrowth,
  fetchAdminRepurchaseRate,
  fetchAdminSoldCoursesByLanguages,
  fetchAdminSoldCoursesByLevels,
  fetchAdminSoldProgramsByAgeGroups,
  fetchAdminStudentsGrowth,
  fetchAdminTotalRevenue,
  fetchAdminTotalStudents,
} from '../lib/data'
import clsx from 'clsx'
import { formatNumber } from '../lib/utils'
import { WindowSizeProvider } from '../ctx/windowSizeContext'

const PIE_COLORS_AGE_GROUPS = {
  Adults: '#468588',
  Kids: '#b9d39f',
  All: '#eeaf42',
}

const PIE_COLORS_LANGUAGES = {
  French: '#6fa3d8',
  Italian: '#8ccf9b',
  Spanish: '#e18f83',
}

const PIE_COLORS_LEVELS = {
  A1: '#2f6f95',
  A2: '#6bbbcf',
  B1: '#f2b84b',
  B2: '#c97c2d',
  All: '#9c8f7a',
  C1: '#6b7f6e',
  C2: '#b3a5c9',
}

export default async function Page() {
  // Authentication & Authorization
  const callbackUrl = '/dashboard'

  const session = await auth()
  if (!session)
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)

  const isActive = await isUserActive(session?.user?.email)
  if (!isActive)
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)

  if (session?.user?.role !== 'admin') redirect('/')
  // End Authentication & Authorization

  const [
    total_revenue,
    monthly_revenue_and_MOM_growth,
    total_students,
    students_growth,
    repurchaseRate,
    created_programs_by_age_groups,
    sold_programs_by_age_groups,
    sold_courses_by_languages,
    sold_courses_by_levels_FRENCH,
    sold_courses_by_levels_ITALIAN,
    sold_courses_by_levels_SPANISH,
  ] = await Promise.all([
    fetchAdminTotalRevenue(),
    fetchAdminMonthlyRevenueAndMOMGrowth(),
    fetchAdminTotalStudents(),
    fetchAdminStudentsGrowth(),
    fetchAdminRepurchaseRate(),
    fetchAdminCreatedProgramsByAgeGroups(),
    fetchAdminSoldProgramsByAgeGroups(),
    fetchAdminSoldCoursesByLanguages(),
    fetchAdminSoldCoursesByLevels('French'),
    fetchAdminSoldCoursesByLevels('Italian'),
    fetchAdminSoldCoursesByLevels('Spanish'),
  ])

  const momGrowthPercent = monthly_revenue_and_MOM_growth?.[
    (monthly_revenue_and_MOM_growth?.length ?? 0) - 1
  ]?.mom_growth_percent
    ? monthly_revenue_and_MOM_growth[monthly_revenue_and_MOM_growth.length - 1]
        .mom_growth_percent
    : null

  const is_momGrowthPercent_positive = Number(momGrowthPercent) > 0
  const is_studentsGrowth_positive = Number(students_growth) > 0

  return (
    // (gap-8 affects PieChartWrapper.tsx and DashboardDataWrapper.tsx)
    <div className='grid grid-cols-1 items-center justify-between gap-8 px-6 py-9 sm:grid-cols-6 sm:px-8'>
      {/* Total Revenue */}
      <DashboardDataWrapper className='grid grid-cols-1 items-center justify-center'>
        <h2 className='text-dashboard-header-1 self-stretch py-2 text-center text-2xl font-semibold sm:text-left'>
          Total Revenue
        </h2>
        <p
          className='text-dashboard-pie-chart-sector-4 py-3 text-center text-3xl font-semibold'
          aria-hidden
        >
          &#36;{formatNumber(total_revenue)}
        </p>
        <p className='sr-only'>{formatNumber(total_revenue)} dollars</p>
        {momGrowthPercent ? (
          <div>
            <div className='flex items-center justify-center gap-2' aria-hidden>
              <span
                className={clsx(
                  'text-xl',
                  is_momGrowthPercent_positive
                    ? 'text-dashboard-growth-text/70'
                    : 'text-dashboard-decline-text/70',
                )}
              >
                {formatNumber(momGrowthPercent)}&#37;
              </span>
              <GrowthOrDeclineMark isPositive={is_momGrowthPercent_positive} />
              <span className='text-sm whitespace-nowrap text-[#888]/70'>
                compared to last month
              </span>
            </div>
            <p className='sr-only'>
              {is_momGrowthPercent_positive ? 'increased' : 'decreased'} by{' '}
              {Math.abs(Number(formatNumber(momGrowthPercent)))} percent
              compared to last month
            </p>
          </div>
        ) : (
          <p className='flex min-h-[40px] items-center justify-center text-sm whitespace-nowrap text-[#888]/70'>
            (no data last month)
          </p>
        )}
      </DashboardDataWrapper>

      {/* Total Students */}
      <DashboardDataWrapper className='grid grid-cols-1 items-center justify-center'>
        <h2 className='text-dashboard-header-1 self-stretch py-2 text-center text-2xl font-semibold sm:text-left'>
          Total Students
        </h2>
        <p className='text-dashboard-pie-chart-sector-4 py-3 text-center text-3xl font-semibold'>
          {formatNumber(total_students)}
        </p>
        {students_growth ? (
          <div>
            <div className='flex items-center justify-center gap-2' aria-hidden>
              <span
                className={clsx(
                  'text-xl',
                  is_studentsGrowth_positive
                    ? 'text-dashboard-growth-text/70'
                    : 'text-dashboard-decline-text/70',
                )}
              >
                {formatNumber(students_growth)}&#37;
              </span>
              <GrowthOrDeclineMark isPositive={is_studentsGrowth_positive} />
              <span className='text-sm whitespace-nowrap text-[#888]/70'>
                compared to last month
              </span>
            </div>
            <p className='sr-only'>
              {is_studentsGrowth_positive ? 'increased' : 'decreased'} by{' '}
              {Math.abs(Number(formatNumber(students_growth)))} percent compared
              to last month
            </p>
          </div>
        ) : (
          <p className='flex min-h-[40px] items-center justify-center text-sm whitespace-nowrap text-[#888]/70'>
            (no data last month)
          </p>
        )}
      </DashboardDataWrapper>

      {/* Repurchase Rate */}
      <DashboardDataWrapper className='grid grid-cols-1 items-center justify-center'>
        <h2 className='text-dashboard-header-1 self-stretch py-2 text-center text-2xl font-semibold sm:text-left'>
          Repurchase Rate
        </h2>
        <p
          className='text-dashboard-pie-chart-sector-4 py-3 text-center text-3xl font-semibold'
          aria-hidden
        >
          {formatNumber(repurchaseRate.repurchase_rate)}&#37;
        </p>
        <p className='sr-only'>
          {formatNumber(repurchaseRate.repurchase_rate)} percent
        </p>
        <p className='flex min-h-[40px] items-center justify-center text-sm whitespace-nowrap text-[#888]/70'>
          {`${formatNumber(repurchaseRate.repurchasing_students)} out of ${formatNumber(repurchaseRate.total_paying_students)} students has repurchased`}
        </p>
      </DashboardDataWrapper>

      {/* Monthly Revenue (Area Chart) */}
      <AreaChartWrapper>
        <h2 className='text-dashboard-header-1 px-5 text-center text-2xl font-semibold'>
          Monthly Revenue
        </h2>
        <AreaChart
          data={monthly_revenue_and_MOM_growth.map((obj) => ({
            name: obj.month,
            Revenue: Number(obj.revenue),
          }))}
          areaChartTitle='Monthly Revenue'
        />
      </AreaChartWrapper>

      {/* (here we use Context to call useMobileSizeDetector() hook once instead of calling it inside every PieChart.) */}
      <WindowSizeProvider>
        {/* Created Programs by Age Group (Pie Chart) */}
        <PieChartWrapper>
          <h2 className='text-dashboard-header-1 text-center text-lg font-semibold lg:text-2xl'>
            Created Programs by Age Group
          </h2>
          <PieChart
            data={created_programs_by_age_groups.age_groups.map(
              ({ age_group, program_count }) => ({
                name: age_group,
                value: program_count,
                fill: PIE_COLORS_AGE_GROUPS[
                  age_group as keyof typeof PIE_COLORS_AGE_GROUPS
                ],
              }),
            )}
            total={created_programs_by_age_groups.total_programs}
            centerTitle='Total'
            pieChartTitle='Created Programs by Age Group'
          />
        </PieChartWrapper>

        {/* Sold Programs by Age Group (Pie Chart) */}
        <PieChartWrapper>
          <h2 className='text-dashboard-header-1 text-center text-lg font-semibold lg:text-2xl'>
            Sold Programs by Age Group
          </h2>
          <PieChart
            data={sold_programs_by_age_groups.age_groups.map(
              ({ age_group, total_sold }) => ({
                name: age_group,
                value: total_sold,
                fill: PIE_COLORS_AGE_GROUPS[
                  age_group as keyof typeof PIE_COLORS_AGE_GROUPS
                ],
              }),
            )}
            total={sold_programs_by_age_groups.total_sold_programs}
            centerTitle='Total'
            pieChartTitle='Sold Programs by Age Group'
          />
        </PieChartWrapper>

        {/* Sold Courses by Languages (Pie Chart) */}
        <PieChartWrapper>
          <h2 className='text-dashboard-header-1 text-center text-lg font-semibold lg:text-2xl'>
            Sold Courses by Languages
          </h2>
          <PieChart
            data={sold_courses_by_languages.languages.map(
              ({ language, total_sold }) => ({
                name: language,
                value: total_sold,
                fill: PIE_COLORS_LANGUAGES[
                  language as keyof typeof PIE_COLORS_LANGUAGES
                ],
              }),
            )}
            total={sold_courses_by_languages.total_sold_courses}
            centerTitle='Total'
            pieChartTitle='Sold Courses by Languages'
          />
        </PieChartWrapper>

        {/* Sold Courses by Levels - French (Pie Chart) */}
        <PieChartWrapper>
          <h2 className='text-dashboard-header-1 text-center text-lg font-semibold lg:text-2xl'>
            Sold Courses by Levels - French
          </h2>
          <PieChart
            data={sold_courses_by_levels_FRENCH.levels.map(
              ({ level, total_sold }) => ({
                name: level,
                value: total_sold,
                fill: PIE_COLORS_LEVELS[
                  level as keyof typeof PIE_COLORS_LEVELS
                ],
              }),
            )}
            total={Number(
              sold_courses_by_levels_FRENCH.total_sold_per_language,
            )}
            centerTitle='Total'
            pieChartTitle='Sold Courses by Levels - French'
          />
        </PieChartWrapper>

        {/* Sold Courses by Levels - Italian (Pie Chart) */}
        <PieChartWrapper>
          <h2 className='text-dashboard-header-1 text-center text-lg font-semibold lg:text-2xl'>
            Sold Courses by Levels - Italian
          </h2>
          <PieChart
            data={sold_courses_by_levels_ITALIAN.levels.map(
              ({ level, total_sold }) => ({
                name: level,
                value: total_sold,
                fill: PIE_COLORS_LEVELS[
                  level as keyof typeof PIE_COLORS_LEVELS
                ],
              }),
            )}
            total={Number(
              sold_courses_by_levels_ITALIAN.total_sold_per_language,
            )}
            centerTitle='Total'
            pieChartTitle='Sold Courses by Levels - Italian'
          />
        </PieChartWrapper>

        {/* Sold Courses by Levels - Spanish (Pie Chart) */}
        <PieChartWrapper>
          <h2 className='text-dashboard-header-1 text-center text-lg font-semibold lg:text-2xl'>
            Sold Courses by Levels - Spanish
          </h2>
          <PieChart
            data={sold_courses_by_levels_SPANISH.levels.map(
              ({ level, total_sold }) => ({
                name: level,
                value: total_sold,
                fill: PIE_COLORS_LEVELS[
                  level as keyof typeof PIE_COLORS_LEVELS
                ],
              }),
            )}
            total={Number(
              sold_courses_by_levels_SPANISH.total_sold_per_language,
            )}
            centerTitle='Total'
            pieChartTitle='Sold Courses by Levels - Spanish'
          />
        </PieChartWrapper>
      </WindowSizeProvider>
    </div>
  )
}
