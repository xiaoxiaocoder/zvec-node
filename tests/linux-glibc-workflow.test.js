const fs = require('fs');
const path = require('path');


describe('linux glibc build workflow', () => {
  const workflow = fs.readFileSync(
    path.join(__dirname, '..', '.github', 'workflows', 'build-linux-glibc223.yml'),
    'utf8'
  );

  it('builds linux bindings inside manylinux2014 containers', () => {
    expect(workflow).toContain('quay.io/pypa/manylinux2014_x86_64');
    expect(workflow).toContain('quay.io/pypa/manylinux2014_aarch64');
  });

  it('uses Node 16 runtime tarballs for both linux architectures', () => {
    expect(workflow).toContain('node-v16.17.0-linux-x64.tar.xz');
    expect(workflow).toContain('node-v16.17.0-linux-arm64.tar.xz');
  });

  it('checks linked native libraries before uploading artifacts', () => {
    expect(workflow).toContain('ldd packages/bindings-linux-${{ matrix.arch }}/zvec_node_binding.node');
    expect(workflow).toContain('ldd packages/bindings-linux-${{ matrix.arch }}/libzvec_diskann_plugin.so');
  });

  it('caches downloads, npm packages, and ccache artifacts', () => {
    expect(workflow).toContain('uses: actions/cache@v4');
    expect(workflow).toContain('.cache/linux-glibc/${{ matrix.arch }}/npm');
    expect(workflow).toContain('.cache/linux-glibc/${{ matrix.arch }}/cmake-js');
    expect(workflow).toContain('.cache/linux-glibc/${{ matrix.arch }}/tools');
    expect(workflow).toContain('.cache/linux-glibc/${{ matrix.arch }}/ccache');
    expect(workflow).toContain('export CMAKE_COMPILER_LAUNCHER=ccache');
    expect(workflow).toContain('ccache --show-stats');
  });

  it('runs the packaged linux binding before uploading artifacts', () => {
    expect(workflow).toContain('rm -f zvec_node_binding.node');
    expect(workflow).toContain('pack_file=$(npm pack --silent packages/bindings-linux-${{ matrix.arch }})');
    expect(workflow).toContain('npm install --prefix "$test_dir" --ignore-scripts "./$pack_file"');
    expect(workflow).toContain('TEST_BINDING_PATH="$test_dir/node_modules/@zvec/bindings-linux-${{ matrix.arch }}" node -e');
    expect(workflow).toContain('rm -f "$pack_file"');
  });
});
