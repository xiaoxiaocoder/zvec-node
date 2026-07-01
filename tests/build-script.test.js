const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');


describe('build script', () => {
  const originalEnv = { ...process.env };
  const packageRoot = path.join(__dirname, '..');
  const binaryPath = path.join(packageRoot, 'build', 'Release', 'zvec_node_binding.node');
  const platformPackageDir = path.join(packageRoot, 'packages', `bindings-${process.platform}-${process.arch}`);
  const platformBinaryPath = path.join(platformPackageDir, 'zvec_node_binding.node');
  const jiebaDictPath = path.join(packageRoot, 'build', 'Release', 'jieba_dict');

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv, CMAKE_COMPILER_LAUNCHER: 'ccache' };
    jest.spyOn(childProcess, 'execSync').mockImplementation(() => Buffer.from(''));
    jest.spyOn(fs, 'existsSync').mockImplementation((targetPath) => (
      targetPath === binaryPath ||
      targetPath === platformPackageDir ||
      targetPath === jiebaDictPath
    ));
    jest.spyOn(fs, 'copyFileSync').mockImplementation(() => undefined);
    jest.spyOn(fs, 'cpSync').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('passes ccache launcher options to cmake-js when configured', () => {
    require('../scripts/build');

    expect(childProcess.execSync).toHaveBeenCalledWith(
      expect.stringContaining('--CD=CMAKE_C_COMPILER_LAUNCHER=ccache'),
      expect.any(Object)
    );
    expect(childProcess.execSync).toHaveBeenCalledWith(
      expect.stringContaining('--CD=CMAKE_CXX_COMPILER_LAUNCHER=ccache'),
      expect.any(Object)
    );
    expect(fs.copyFileSync).toHaveBeenCalledWith(binaryPath, platformBinaryPath);
  });
});
