import Table from 'ui/Table'

import { useRepoBranchContentsTable } from '../hooks'
import { Loader, RepoContentsResult } from '../shared'

function FileListTable() {
  const {
    data,
    headers,
    handleSort,
    isSearching,
    isMissingHeadReport,
    isLoading,
  } = useRepoBranchContentsTable()

  return (
    <div className="col-span-12 flex flex-col gap-4">
      <Table
        data={data}
        columns={headers}
        onSort={handleSort}
        enableHover
        defaultSort={[{ id: 'misses', desc: true }]}
      />
      <Loader isLoading={isLoading} />
      {data?.length === 0 && !isLoading && (
        <RepoContentsResult
          isSearching={isSearching}
          isMissingHeadReport={isMissingHeadReport}
        />
      )}
    </div>
  )
}

export default FileListTable