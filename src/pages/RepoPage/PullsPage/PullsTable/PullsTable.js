import Table from 'ui/Table'
import PropTypes from 'prop-types'
import { useOwner } from 'services/user'
import Coverage from './Coverage'
import Change from './Change'
import Title from './Title'

const headers = [
  {
    Header: 'Name',
    accessor: 'title',
    width: 'w-6/12',
  },
  {
    Header: (
      <span className="w-full text-right">
        Coverage on <span className="font-light">HEAD</span>
      </span>
    ),
    accessor: 'coverage',
    width: 'w-3/12',
  },
  {
    Header: (
      <span className="w-full text-sm text-right">
        Change from <span className="font-light">BASE</span>
      </span>
    ),
    accessor: 'change',
    width: 'w-3/12',
  },
]

const handleOnNull = () => {
  return {
    title: <span className="text-sm">we can&apos;t find this pull</span>,
  }
}

function transformPullToTable(pulls) {
  // if there are no repos show empty message
  if (pulls.length <= 0) {
    return [
      {
        title: <span className="text-sm">no results found</span>,
      },
    ]
  }

  return pulls.map((pullNode) => {
    if (!pullNode) return handleOnNull()
    const pull = pullNode.node
    const { data: ownerData } = useOwner({ username: pull?.author?.username })

    return {
      title: <Title ownerData={ownerData} pull={pull} />,
      coverage: <Coverage pull={pull} />,
      change: <Change pull={pull} />,
    }
  })
}

function PullsPage({ pulls }) {
  const dataTable = transformPullToTable(pulls)
  return (
    <>
      <Table data={dataTable} columns={headers} />
    </>
  )
}

PullsPage.propTypes = {
  pulls: PropTypes.arrayOf(
    PropTypes.shape({
      node: PropTypes.shape({
        author: PropTypes.shape({
          username: PropTypes.string,
        }),
        compareWithBase: PropTypes.shape({
          patchTotals: PropTypes.shape({
            coverage: PropTypes.number,
          }),
        }),
        head: PropTypes.shape({
          totals: PropTypes.shape({
            coverage: PropTypes.number,
          }),
        }),
        pullId: PropTypes.number,
        state: PropTypes.string,
        title: PropTypes.string,
        updatestamp: PropTypes.string,
      }),
    })
  ),
}

export default PullsPage
