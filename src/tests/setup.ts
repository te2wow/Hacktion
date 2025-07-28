import '@testing-library/jest-dom';

// Mock environment variables
process.env.GITHUB_TOKEN = 'mock-token';
process.env.GITHUB_REPOSITORIES = 'https://github.com/test/repo1,https://github.com/test/repo2';