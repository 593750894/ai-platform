/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#05080F',
          800: '#070B14',
          700: '#0B1020',
          600: '#121828',
          500: '#1A2140',
          400: '#2A3360'
        },
        neon: {
          cyan: '#00E5FF',
          violet: '#A855F7',
          pink: '#F472B6',
          rose: '#F43F5E',
          teal: '#22D3EE'
        },
        text: {
          DEFAULT: '#E5ECFF',
          muted: '#8A94B8',
          dim: '#5C6690'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        glow: '0 0 24px -4px rgba(0, 229, 255, 0.45)',
        'glow-violet': '0 0 30px -4px rgba(168, 85, 247, 0.55)',
        card: '0 20px 60px -30px rgba(0, 229, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.04)'
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #00E5FF 0%, #A855F7 100%)',
        'panel-gradient': 'linear-gradient(180deg, rgba(26,33,64,0.55) 0%, rgba(11,16,32,0.8) 100%)'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        pulseGlow: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(0,229,255,0.45)' },
          '50%': { boxShadow: '0 0 0 10px rgba(0,229,255,0)' }
        }
      },
      animation: {
        shimmer: 'shimmer 2.2s linear infinite',
        'pulse-glow': 'pulseGlow 1.8s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
