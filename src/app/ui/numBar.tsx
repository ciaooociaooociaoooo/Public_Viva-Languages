'use client'

import clsx from 'clsx'
import Button from './button'

interface NumBarProps {
  value: number | ''
  setValue: React.Dispatch<React.SetStateAction<number | ''>>
  minNum?: number
  isInteger?: ConstrainBoolean
  disabled?: boolean
  setMsg?: React.Dispatch<React.SetStateAction<string>>
  handleDecrement?: () => void
  handleIncrement?: () => void
  divProps?: React.ButtonHTMLAttributes<HTMLDivElement>
  inputProps: React.InputHTMLAttributes<HTMLInputElement>
  btnProps: React.ButtonHTMLAttributes<HTMLButtonElement>
  plusBtnProps: React.ButtonHTMLAttributes<HTMLButtonElement>
  minusBtnProps: React.ButtonHTMLAttributes<HTMLButtonElement>
}

const NumBar = ({
  value,
  setValue,
  minNum = 0,
  isInteger = false,
  disabled = false,
  setMsg,
  handleDecrement,
  handleIncrement,
  divProps = {},
  inputProps = {},
  btnProps = {},
  plusBtnProps = {},
  minusBtnProps = {},
}: NumBarProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (setMsg) setMsg('')

    const val = e.target.valueAsNumber

    if (Number.isFinite(val) && val >= minNum) {
      if (isInteger) {
        if (Number.isInteger(val)) {
          setValue(val)
        }
      } else {
        setValue(val)
      }
    } else {
      setValue('')
    }
  }

  return (
    <div {...divProps} className={` ${divProps.className}`}>
      <Button
        type='button'
        {...btnProps}
        {...minusBtnProps}
        className={clsx(
          `${btnProps.className}`,
          disabled ? 'cursor-wait' : 'cursor-pointer',
        )}
        onClick={handleDecrement}
        disabled={disabled}
      >
        &#8722;
      </Button>
      <input
        type='number'
        {...inputProps}
        className={clsx(`${inputProps.className}`, disabled && 'cursor-wait')}
        value={value}
        onChange={handleInputChange}
        onWheel={(e) => (e.target as HTMLElement).blur()}
        disabled={disabled}
      />
      <Button
        type='button'
        {...btnProps}
        {...plusBtnProps}
        className={clsx(
          `${btnProps.className}`,
          disabled ? 'cursor-wait' : 'cursor-pointer',
        )}
        onClick={handleIncrement}
        disabled={disabled}
      >
        &#43;
      </Button>
    </div>
  )
}

export default NumBar
