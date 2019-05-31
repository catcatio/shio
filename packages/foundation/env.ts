
export function GetEnvString(key: string) {
  const value = process.env[key] || ""
  return value
}

export function GetEnvStringOrThrow(key: string, description: string = "") {
  const value = GetEnvString(key)
  if (value === "") {
    throw new Error(`Environment variable ${key} does not exists.... ${description}`)
  }
  return value
}