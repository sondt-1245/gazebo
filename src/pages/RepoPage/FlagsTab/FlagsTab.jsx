import { SentryRoute } from 'sentry'

import { useRepoFlagsSelect } from 'services/repo/useRepoFlagsSelect'
import FlagsNotConfigured from 'shared/FlagsNotConfigured'

import blurredTable from './assets/blurredTable.png'
import BackfillBanners from './BackfillBanners/BackfillBanners'
import { useRepoBackfillingStatus } from './BackfillBanners/hooks'
import Header from './Header'
import FlagsTable from './subroute/FlagsTable/FlagsTable'
import TimescaleDisabled from './TimescaleDisabled'

const isDisabled = ({ flagsMeasurementsActive, isRepoBackfilling }) =>
  !flagsMeasurementsActive || isRepoBackfilling

const showFlagsTable = ({
  flagsMeasurementsActive,
  flagsMeasurementsBackfilled,
}) => {
  return flagsMeasurementsActive && flagsMeasurementsBackfilled
}

const showFlagsData = ({ flagsData }) => {
  return flagsData && flagsData?.length > 0
}

function FlagsTab() {
  const { data: flagsData } = useRepoFlagsSelect()

  const {
    flagsMeasurementsActive,
    isRepoBackfilling,
    flagsMeasurementsBackfilled,
    isTimescaleEnabled,
  } = useRepoBackfillingStatus()

  if (!isTimescaleEnabled) {
    return <TimescaleDisabled />
  }

  if (!showFlagsData({ flagsData })) {
    return <FlagsNotConfigured />
  }

  return (
    <div className="mx-4 flex flex-col gap-4 md:mx-0">
      <Header
        controlsDisabled={isDisabled({
          flagsMeasurementsActive,
          isRepoBackfilling,
        })}
      >
        <BackfillBanners />
      </Header>
      <div className="flex flex-1 flex-col gap-4">
        {showFlagsTable({
          flagsMeasurementsActive,
          flagsMeasurementsBackfilled,
        }) ? (
          <SentryRoute path="/:provider/:owner/:repo/flags" exact>
            <FlagsTable />
          </SentryRoute>
        ) : (
          <img
            alt="Blurred flags table"
            src={blurredTable}
            className="h-auto max-w-full"
          />
        )}
      </div>
    </div>
  )
}

export default FlagsTab
