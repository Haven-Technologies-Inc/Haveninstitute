import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get('title') || 'Haven Institute';
  const subtitle = searchParams.get('subtitle') || 'AI-Powered NCLEX Prep Platform';
  const badge = searchParams.get('badge') || '';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          backgroundImage:
            'radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
        }}
      >
        {/* Top gradient line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 600,
            height: 2,
            background:
              'linear-gradient(to right, transparent, rgba(99, 102, 241, 0.5), transparent)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 80px',
            textAlign: 'center',
          }}
        >
          {/* Logo text */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              H
            </div>
            <span
              style={{
                color: '#e4e4e7',
                fontSize: 28,
                fontWeight: 600,
              }}
            >
              Haven Institute
            </span>
          </div>

          {badge && (
            <div
              style={{
                display: 'flex',
                padding: '6px 20px',
                borderRadius: 999,
                border: '1px solid rgba(99, 102, 241, 0.3)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                color: '#818cf8',
                fontSize: 16,
                fontWeight: 500,
                marginBottom: 24,
              }}
            >
              {badge}
            </div>
          )}

          {/* Title */}
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              background: 'linear-gradient(to right, #e4e4e7, #a1a1aa)',
              backgroundClip: 'text',
              color: 'transparent',
              lineHeight: 1.15,
              maxWidth: 900,
              marginBottom: 20,
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 24,
              color: '#71717a',
              maxWidth: 700,
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </div>

          {/* Stats bar */}
          <div
            style={{
              display: 'flex',
              gap: 48,
              marginTop: 40,
            }}
          >
            {[
              { value: '95%+', label: 'Pass Rate' },
              { value: '50,000+', label: 'Questions' },
              { value: '10,000+', label: 'Students' },
            ].map((stat) => (
              <div
                key={stat.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    background: 'linear-gradient(to right, #6366f1, #a855f7)',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: 14, color: '#71717a', marginTop: 4 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom gradient line */}
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: '#52525b',
            fontSize: 16,
          }}
        >
          www.havenstudy.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
