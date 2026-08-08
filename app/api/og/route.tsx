import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const score = searchParams.get('score') || '88';
  const roast = searchParams.get('roast') || '잠 안 자고 일했다는 겸손한 자랑보다 진짜 성과와 수치를 보여주세요.';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0f',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #1a1528 0%, #0a0a0f 100%)',
          fontFamily: 'sans-serif',
          padding: '40px',
          boxSizing: 'border-box',
        }}
      >
        {/* Main Card */}
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundColor: '#121118',
            borderRadius: '24px',
            border: '4px solid #ff2a6d',
            boxShadow: '0 0 40px rgba(255, 42, 109, 0.4)',
            padding: '36px 44px',
            boxSizing: 'border-box',
            position: 'relative',
          }}
        >
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '36px' }}>🤡</span>
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: 900,
                  color: '#ff2a6d',
                  letterSpacing: '2px',
                  fontFamily: 'monospace',
                }}
              >
                ONE-LINE ROAST
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'rgba(255, 42, 109, 0.15)',
                border: '2px solid #ff2a6d',
                borderRadius: '100px',
                padding: '8px 20px',
              }}
            >
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>
                CRINGE SCORE: <span style={{ color: '#ff2a6d' }}>{score}%</span>
              </span>
            </div>
          </div>

          {/* Quote Body */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', margin: '20px 0' }}>
            <span style={{ fontSize: '48px', color: '#ff2a6d', lineHeight: '1', fontWeight: 900 }}>“</span>
            <span
              style={{
                fontSize: roast.length > 50 ? '28px' : '34px',
                fontWeight: 700,
                color: '#ffffff',
                fontStyle: 'italic',
                lineHeight: '1.4',
                flex: 1,
              }}
            >
              {roast}
            </span>
            <span style={{ fontSize: '48px', color: '#ff2a6d', lineHeight: '1', fontWeight: 900 }}>”</span>
          </div>

          {/* Footer Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              borderTop: '2px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '20px',
            }}
          >
            <span style={{ fontSize: '20px', color: '#8b8b9e', fontFamily: 'monospace' }}>
              Diagnosed by <span style={{ color: '#ffffff', fontWeight: 700 }}>Antidote AI</span>
            </span>
            <span style={{ fontSize: '20px', color: '#ff2a6d', fontWeight: 800, fontFamily: 'monospace' }}>
              Zero Mercy
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 800,
      height: 450,
    }
  );
}
