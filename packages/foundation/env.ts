



export function GetEnvString(key: string, defaultValue?: string) {
  const value = process.env[key] || defaultValue || ""

  if (value === "") {
    return defaultValue || ""
  }

  return value
}

export function GetEnvStringOrThrow(key: string, description: string = "") {
  const value = GetEnvString(key)
  if (value === "") {
    throw new Error(`Environment variable ${key} does not exists.... ${description}`)
  }
  return value
}