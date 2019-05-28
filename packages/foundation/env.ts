
export function GetEnvString(key: string) {
  const value = process.env[key] || ""
  return value
}

export function GetEnvStringOrThrow(key: string) {
  const value = GetEnvString(key)
  if (value === "") {
    throw new Error(`Environment variable ${key} does not exists`)
  }
  return value
}