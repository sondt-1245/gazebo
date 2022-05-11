import cs from 'classnames'
import PropTypes from 'prop-types'

import { LINE_STATE, LINE_TYPE } from 'shared/utils/fileviewerLines'

const classNamePerLineState = {
  [LINE_STATE.COVERED]:
    'bg-ds-coverage-covered border-ds-primary-green border-r-2',
  [LINE_STATE.UNCOVERED]:
    'bg-ds-coverage-uncovered border-ds-primary-red border-r-2',
  [LINE_STATE.BLANK]: 'border-ds-gray-tertiary border-r',
  [LINE_STATE.PARTIAL]:
    'bg-ds-coverage-partial border-ds-primary-yellow border-r-2',
}

const lineStateToLabel = {
  [LINE_STATE.COVERED]: 'covered line of code',
  [LINE_STATE.UNCOVERED]: 'uncovered line of code',
  [LINE_STATE.BLANK]: 'line of code',
  [LINE_STATE.PARTIAL]: 'partial line of code',
}

// Enum from https://github.com/codecov/shared/blob/master/shared/utils/merge.py#L275-L279
function getLineState({ coverage, showLines }) {
  const { showCovered, showUncovered, showPartial } = showLines
  return coverage
    ? {
        [LINE_TYPE.HIT]: showCovered ? LINE_STATE.COVERED : LINE_STATE.BLANK,
        [LINE_TYPE.MISS]: showUncovered
          ? LINE_STATE.UNCOVERED
          : LINE_STATE.BLANK,
        [LINE_TYPE.PARTIAL]: showPartial
          ? LINE_STATE.PARTIAL
          : LINE_STATE.BLANK,
      }[coverage]
    : LINE_STATE.BLANK
}

function SingleLine({
  line,
  number,
  coverage,
  showLines,
  getLineProps,
  getTokenProps,
}) {
  console.log(number, coverage, showLines, getLineProps, getTokenProps)
  const lineState = getLineState({ coverage, showLines })

  return (
    <tr {...getLineProps({ line, key: number })}>
      <td
        aria-label={lineStateToLabel[lineState]}
        className={cs(
          'line-number text-ds-gray-quaternary font-mono text-right border-solid px-2 select-none',
          classNamePerLineState[lineState]
        )}
      >
        {number}
      </td>
      <td className="pl-2 break-all">
        {line.map((token, key) => (
          <span key={key} {...getTokenProps({ token, key })} />
        ))}
      </td>
    </tr>
  )
}

SingleLine.propTypes = {
  line: PropTypes.array.isRequired,
  coverage: PropTypes.oneOf(Object.values(LINE_TYPE)),
  showLines: PropTypes.shape({
    showCovered: PropTypes.bool.isRequired,
    showUncovered: PropTypes.bool.isRequired,
    showPartial: PropTypes.bool.isRequired,
  }),
  number: PropTypes.number.isRequired,
  getLineProps: PropTypes.func,
  getTokenProps: PropTypes.func,
}

export default SingleLine