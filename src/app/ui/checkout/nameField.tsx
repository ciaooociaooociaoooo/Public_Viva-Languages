import clsx from 'clsx'

interface NameFieldProps {
  name: string
  setName: React.Dispatch<React.SetStateAction<string>>
  errStateName?: string[]
  setErrState: React.Dispatch<
    React.SetStateAction<
      | {
          email?: string[] | undefined
          name?: string[] | undefined
        }
      | undefined
    >
  >
}

export default function NameField({
  name,
  setName,
  errStateName,
  setErrState,
}: NameFieldProps) {
  const onNameChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrState((prev) => (prev ? { ...prev, name: undefined } : undefined))
    setName(e.target.value)
  }

  return (
    <div className='mb-2'>
      <label className='block' htmlFor='name'>
        Name
      </label>
      <input
        className={clsx(
          'block min-h-[42.3906px] w-full rounded-[5px] border-1 border-solid pl-3 text-[16px] placeholder-[#757680] shadow-[0px_1px_1px_rgba(0,0,0,0.03),0px_3px_6px_rgba(0,0,0,0.02)] transition-[background_0.15s_ease,border_0.15s_ease,box-shadow_0.15s_ease,color_0.15s_ease] focus:border-[#0570de] focus:shadow-[0px_1px_1px_rgba(0,0,0,0.03),_0px_3px_6px_rgba(0,0,0,0.02),_0_0_0_3px_hsla(210,96%,45%,25%),_0_1px_1px_0_rgba(0,0,0,0.08)] focus:outline-0 lg:min-h-[44.3906px]',
          errStateName && errStateName?.length > 0
            ? 'stripe-field-invalid-shadow border-[#df1b41] text-[#df1b41]'
            : 'border-[#e6e6e6]',
        )}
        id='name'
        name='name'
        type='text'
        onChange={onNameChanged}
        value={name}
        autoComplete='off'
        placeholder='My name'
        aria-describedby={errStateName?.length ? 'name-error' : undefined}
        aria-invalid={(errStateName?.length ?? 0) > 0}
      />
      <div id='name-error' aria-live='polite' aria-atomic='true'>
        {errStateName &&
          errStateName?.length > 0 &&
          errStateName.map((error: string, i) => (
            <p key={i} className='text-[#df1b41]'>
              {error}
            </p>
          ))}
      </div>
    </div>
  )
}
