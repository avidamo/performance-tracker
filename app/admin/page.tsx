export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getDashboardEmployees } from '@/lib/data'

export default async function AdminPage() {
  const employees = await getDashboardEmployees()

  const activeEmployees = employees.filter((e: any) => e.status !== 'inactive')
  const placeholders = employees.filter((e: any) => e.status === 'placeholder')

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f7faf7',
        padding: '40px 24px',
        fontFamily: 'Inter, Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 1150, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              borderRadius: 999,
              background: '#dff5b2',
              color: '#142013',
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 14,
              border: '1px solid #b7df6d',
            }}
          >
            CAM Performance Tracker
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 38,
              color: '#142013',
              letterSpacing: '-0.03em',
            }}
          >
            Team Dashboard
          </h1>

          <p
            style={{
              marginTop: 10,
              marginBottom: 0,
              color: '#5f6b5f',
              fontSize: 16,
            }}
          >
            Track employee goals, notes, achievements, and monthly summaries in one place.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 16,
            marginBottom: 24,
          }}
        >
          <StatCard label="Active employees" value={activeEmployees.length} />
          <StatCard label="Total employees" value={employees.length} />
          <StatCard label="Placeholders" value={placeholders.length} />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 18,
          }}
        >
          {employees.map((employee: any) => (
            <div
              key={employee.id}
              style={{
                background: 'rgba(255,255,255,0.88)',
                border: '1px solid #e3edd1',
                borderRadius: 22,
                padding: 22,
                boxShadow: '0 12px 30px rgba(33, 45, 22, 0.06)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div style={{ marginBottom: 14 }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 24,
                    color: '#142013',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {employee.name}
                </h2>

                <p
                  style={{
                    marginTop: 8,
                    marginBottom: 0,
                    color: '#5f6b5f',
                    fontSize: 14,
                  }}
                >
                  {employee.role_title || 'Team Member'}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                  marginBottom: 18,
                }}
              >
                {employee.status && (
                  <span
                    style={{
                      padding: '6px 10px',
                      borderRadius: 999,
                      background:
                        employee.status === 'placeholder' ? '#fff7d6' : '#edf8df',
                      color:
                        employee.status === 'placeholder' ? '#7a5d00' : '#39521a',
                      fontSize: 12,
                      fontWeight: 700,
                      border:
                        employee.status === 'placeholder'
                          ? '1px solid #f1df8a'
                          : '1px solid #cfe8a4',
                    }}
                  >
                    {employee.status}
                  </span>
                )}

                {employee.email && (
                  <span
                    style={{
                      padding: '6px 10px',
                      borderRadius: 999,
                      background: '#f6f9f0',
                      color: '#556451',
                      fontSize: 12,
                      fontWeight: 600,
                      border: '1px solid #e3edd1',
                    }}
                  >
                    {employee.email}
                  </span>
                )}
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <Link
                  href={`/admin/employees/${employee.id}`}
                  style={primaryButton}
                >
                  Open manager view
                </Link>

                <Link
                  href={`/employee/${employee.id}`}
                  target="_blank"
                  style={secondaryButton}
                >
                  View employee page
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.82)',
        border: '1px solid #e3edd1',
        borderRadius: 20,
        padding: 20,
        boxShadow: '0 10px 24px rgba(33, 45, 22, 0.05)',
      }}
    >
      <div
        style={{
          fontSize: 14,
          color: '#70806c',
          marginBottom: 10,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 36,
          fontWeight: 800,
          color: '#142013',
          letterSpacing: '-0.03em',
        }}
      >
        {value}
      </div>
    </div>
  )
}

const primaryButton: React.CSSProperties = {
  display: 'inline-block',
  padding: '10px 14px',
  borderRadius: 12,
  background: '#1c2a1a',
  color: 'white',
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: 14,
}

const secondaryButton: React.CSSProperties = {
  display: 'inline-block',
  padding: '10px 14px',
  borderRadius: 12,
  background: '#dff5b2',
  color: '#142013',
  textDecoration: 'none',
  fontWeight: 700,
  fontSize: 14,
  border: '1px solid #b7df6d',
}