import PropTypes from 'prop-types'

import A from 'ui/A'
import Icon from 'ui/Icon'

function DirEntry({
  linkRef,
  name,
  path,
  runPrefetch,
  pageName = 'treeView',
  commitSha,
}) {
  return (
    <div className="flex gap-3" onMouseEnter={async () => await runPrefetch()}>
      <A
        to={{
          pageName: pageName,
          options: {
            ref: linkRef,
            commit: commitSha,
            tree: !!path ? `${path}/${name}` : name,
          },
        }}
      >
        <Icon name="folder" size="md" variant="solid" />
        <span className="whitespace-pre">{name}</span>
      </A>
    </div>
  )
}

DirEntry.propTypes = {
  linkRef: PropTypes.string,
  name: PropTypes.string.isRequired,
  path: PropTypes.string,
  runPrefetch: PropTypes.func,
  pageName: PropTypes.string,
  commitSha: PropTypes.string,
}

export default DirEntry