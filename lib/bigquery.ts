import 'server-only'
import { BigQuery } from '@google-cloud/bigquery'

let cachedClient: BigQuery | null = null

function getCredentialsFromEnv() {
  const encoded = process.env.GCP_BIGQUERY_CREDENTIALS_BASE64
  if (encoded) {
    try {
      return JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'))
    } catch {
      throw new Error('GCP_BIGQUERY_CREDENTIALS_BASE64 is not valid base64-encoded JSON')
    }
  }

  if (process.env.GCP_BIGQUERY_CREDENTIALS_JSON) {
    try {
      return JSON.parse(process.env.GCP_BIGQUERY_CREDENTIALS_JSON)
    } catch {
      throw new Error('GCP_BIGQUERY_CREDENTIALS_JSON is not valid JSON')
    }
  }

  if (process.env.GCP_BIGQUERY_CLIENT_EMAIL && process.env.GCP_BIGQUERY_PRIVATE_KEY) {
    return {
      client_email: process.env.GCP_BIGQUERY_CLIENT_EMAIL,
      private_key: process.env.GCP_BIGQUERY_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }
  }

  return null
}

export function isBigQueryConfigured() {
  return Boolean(
    process.env.BIGQUERY_PROJECT_ID &&
      process.env.BIGQUERY_DATASET &&
      process.env.BIGQUERY_EMPLOYEE_MONTHLY_VIEW,
  )
}

export function getBigQueryClient() {
  if (!isBigQueryConfigured()) {
    throw new Error('BigQuery is not configured')
  }

  if (cachedClient) return cachedClient

  const credentials = getCredentialsFromEnv()
  cachedClient = new BigQuery({
    projectId: process.env.BIGQUERY_PROJECT_ID,
    location: process.env.BIGQUERY_LOCATION || 'US',
    ...(credentials ? { credentials } : {}),
  })

  return cachedClient
}

export function getAnalyticsTableRef(viewEnvKey: 'BIGQUERY_EMPLOYEE_MONTHLY_VIEW' | 'BIGQUERY_EMPLOYEE_COACH_VIEW') {
  const project = process.env.BIGQUERY_PROJECT_ID
  const dataset = process.env.BIGQUERY_DATASET
  const view = process.env[viewEnvKey]

  if (!project || !dataset || !view) {
    throw new Error(`Missing analytics configuration for ${viewEnvKey}`)
  }

  return `\`${project}.${dataset}.${view}\``
}
