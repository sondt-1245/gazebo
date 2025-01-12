import { useParams } from 'react-router-dom'

import RawFileviewer from 'shared/RawFileviewer'
import { useCommitTreePaths } from 'shared/treePaths'
import Breadcrumb from 'ui/Breadcrumb'

function CommitDetailFileViewer() {
  const { treePaths } = useCommitTreePaths()
  const { commit } = useParams()

  return (
    <RawFileviewer
      title={
        <div className="text-sm font-normal">
          <Breadcrumb paths={treePaths} />
        </div>
      }
      commit={commit}
      withKey={false}
    />
  )
}

export default CommitDetailFileViewer
