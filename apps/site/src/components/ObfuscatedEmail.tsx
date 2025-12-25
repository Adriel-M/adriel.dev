import { Email } from 'react-obfuscate-email'

const ObfuscatedEmail = () => {
  return <Email email={import.meta.env.PUBLIC_EMAIL_ADDRESS} />
}

export default ObfuscatedEmail
