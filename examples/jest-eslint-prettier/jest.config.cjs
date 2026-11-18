module.exports = { testEnvironment: 'jsdom', transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: { jsx: 'react-jsx', esModuleInterop: true } }] }, setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'] }
