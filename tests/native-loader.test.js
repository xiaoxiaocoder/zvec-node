describe('native binding loader', () => {
  const originalPlatform = process.platform;
  const originalArch = process.arch;

  const setProcessPlatform = (platform, arch) => {
    Object.defineProperty(process, 'platform', { value: platform });
    Object.defineProperty(process, 'arch', { value: arch });
  };

  const createBinding = () => ({
    DataType: {},
    IndexType: {},
    MetricType: {},
    QuantizeType: {},
    LogType: {},
    LogLevel: {},
    CollectionSchema: class CollectionSchema {},
    initialize: jest.fn(),
    setDefaultJiebaDictDir: jest.fn(),
    getDefaultJiebaDictDir: jest.fn(),
    createAndOpen: jest.fn(),
    open: jest.fn(),
  });

  beforeEach(() => {
    jest.resetModules();
  });

  afterEach(() => {
    jest.dontMock('fs');
    Object.defineProperty(process, 'platform', { value: originalPlatform });
    Object.defineProperty(process, 'arch', { value: originalArch });
  });

  it('loads the linux arm64 optional binding package when no bundled binary exists', () => {
    const binding = createBinding();
    setProcessPlatform('linux', 'arm64');

    jest.doMock('fs', () => ({
      existsSync: jest.fn(() => false),
    }));
    jest.doMock('@zvec/bindings-linux-arm64', () => binding, { virtual: true });

    const zvec = require('../src/index');

    expect(zvec.ZVecDataType).toBe(binding.DataType);
    expect(zvec.ZVecInitialize).toBe(binding.initialize);
  });

  it('keeps the native loader failure in the startup error message', () => {
    setProcessPlatform('linux', 'arm64');

    jest.doMock('fs', () => ({
      existsSync: jest.fn(() => false),
    }));
    jest.doMock('@zvec/bindings-linux-arm64', () => {
      throw new Error('undefined symbol: pthread_atfork');
    }, { virtual: true });

    expect(() => require('../src/index')).toThrow(
      /Failed to load prebuilt binary for linux-arm64[\s\S]*undefined symbol: pthread_atfork/
    );
  });
});
