import clsx from 'clsx'

interface EmailFieldProps {
  email: string
  setEmail: React.Dispatch<React.SetStateAction<string>>
  errStateEmail?: string[]
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

export default function EmailField({
  email,
  setEmail,
  errStateEmail,
  setErrState,
}: EmailFieldProps) {
  const onEmailChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrState((prev) => (prev ? { ...prev, email: undefined } : undefined))
    setEmail(e.target.value.trim())
  }

  return (
    <div className=''>
      <label className='block' htmlFor='email'>
        Email
      </label>
      <input
        className={clsx(
          'block min-h-[42.3906px] w-full rounded-[5px] border-1 border-solid pl-3 text-[16px] placeholder-[#757680] shadow-[0px_1px_1px_rgba(0,0,0,0.03),0px_3px_6px_rgba(0,0,0,0.02)] transition-[background_0.15s_ease,border_0.15s_ease,box-shadow_0.15s_ease,color_0.15s_ease] focus:border-[#0570de] focus:shadow-[0px_1px_1px_rgba(0,0,0,0.03),_0px_3px_6px_rgba(0,0,0,0.02),_0_0_0_3px_hsla(210,96%,45%,25%),_0_1px_1px_0_rgba(0,0,0,0.08)] focus:outline-0 lg:min-h-[44.3906px]',
          errStateEmail && errStateEmail?.length > 0
            ? 'stripe-field-invalid-shadow border-[#df1b41] text-[#df1b41]'
            : 'border-[#e6e6e6]',
        )}
        id='email'
        name='email'
        type='email'
        onChange={onEmailChanged}
        value={email}
        autoComplete='off'
        placeholder='example@gmail.com'
        aria-describedby={errStateEmail?.length ? 'email-error' : undefined}
        aria-invalid={(errStateEmail?.length ?? 0) > 0}
      />
      <div id='email-error' aria-live='polite' aria-atomic='true'>
        {errStateEmail &&
          errStateEmail?.length > 0 &&
          errStateEmail.map((error: string, i) => (
            <p key={i} className='text-[#df1b41]'>
              {error}
            </p>
          ))}
      </div>
    </div>
  )
}
