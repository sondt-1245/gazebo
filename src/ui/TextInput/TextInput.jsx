import cs from 'classnames'
import defaultTo from 'lodash/defaultTo'
import uniqueId from 'lodash/uniqueId'
import PropTypes from 'prop-types'
import { forwardRef } from 'react'

import { dataMarketingType } from 'shared/propTypes'
import Icon from 'ui/Icon'

const VariantClasses = {
  default: 'rounded border',
  topRounded: 'border-t border-r border-l focus:border rounded-tl rounded-tr',
}

const styles = {
  input:
    'block border-ds-gray-tertiary px-3 text-sm w-full h-8 disabled:text-ds-gray-quaternary disabled:bg-ds-gray-primary disabled:border-ds-gray-tertiary',
  label: 'block font-semibold mb-2',
  iconWrapper:
    'absolute text-ds-gray-quaternary left-2 h-full flex items-center',
}

const TextInput = forwardRef(
  (
    { type = 'text', icon, label, placeholder, variant = 'default', ...props },
    ref
  ) => {
    const id = uniqueId('text-input')
    const { className, dataMarketing, ...newProps } = props

    // If no label, the placeholder is used as a hidden label for a11y
    const textLabel = defaultTo(label, placeholder)

    return (
      <div>
        <label
          htmlFor={id}
          className={cs(styles.label, {
            'sr-only': !label,
          })}
        >
          {textLabel}
        </label>
        <div className="relative">
          {icon && (
            <div className={styles.iconWrapper}>
              <Icon size="sm" variant="outline" name={icon} />
            </div>
          )}
          <input
            data-marketing={dataMarketing}
            ref={ref}
            id={id}
            type={type}
            className={cs(styles.input, VariantClasses[variant], {
              'pl-7': Boolean(icon),
            })}
            placeholder={placeholder}
            {...newProps}
          />
        </div>
      </div>
    )
  }
)

TextInput.displayName = 'TextInput'

TextInput.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  icon: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'topRounded']),
  dataMarketing: dataMarketingType,
}

export default TextInput
