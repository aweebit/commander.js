const commander = require('../');

// Not testing output, just testing whether an error is detected.

describe('allowUnknownOption', () => {
  // Optional. Use internal knowledge to suppress output to keep test output clean.
  let writeErrorSpy;

  beforeAll(() => {
    writeErrorSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => { });
  });

  afterEach(() => {
    writeErrorSpy.mockClear();
  });

  afterAll(() => {
    writeErrorSpy.mockRestore();
  });

  test('when specify unknown program option then error', () => {
    const program = new commander.Command();
    program
      .exitOverride()
      .option('-p, --pepper', 'add pepper');

    expect(() => {
      program.parse(['node', 'test', '-m']);
    }).toThrow();
  });

  test('when specify unknown program option and allowUnknownOption(false) then error', () => {
    const program = new commander.Command();
    program
      .exitOverride()
      .allowUnknownOption(false)
      .option('-p, --pepper', 'add pepper');

    expect(() => {
      program.parse(['node', 'test', '-m']);
    }).toThrow();
  });

  test('when specify unknown program option and allowUnknownOption() then no error', () => {
    const program = new commander.Command();
    program
      .exitOverride()
      .allowUnknownOption()
      .option('-p, --pepper', 'add pepper');

    expect(() => {
      program.parse(['node', 'test', '-m']);
    }).not.toThrow();
  });

  test('when specify unknown program option and allowUnknownOption(true) then no error', () => {
    const program = new commander.Command();
    program
      .exitOverride()
      .allowUnknownOption(true)
      .option('-p, --pepper', 'add pepper');

    expect(() => {
      program.parse(['node', 'test', '-m']);
    }).not.toThrow();
  });

  test('when specify unknown command option then error', () => {
    const program = new commander.Command();
    program
      .exitOverride()
      .command('sub')
      .option('-p, --pepper', 'add pepper')
      .action(() => { });

    expect(() => {
      program.parse(['node', 'test', 'sub', '-m']);
    }).toThrow();
  });

  test('when specify unknown command option and allowUnknownOption then no error', () => {
    const program = new commander.Command();
    program
      .exitOverride()
      .command('sub')
      .argument('[args...]') // unknown option will be passed as an argument
      .allowUnknownOption()
      .option('-p, --pepper', 'add pepper')
      .action(() => { });

    expect(() => {
      program.parse(['node', 'test', 'sub', '-m']);
    }).not.toThrow();
  });

  test('when specify unknown program option and allowUnknownOption then unknown option parsed as operand', () => {
    const program = new commander.Command();
    program
      .allowUnknownOption();
    const result = program.parseOptions(['-m']);
    expect(result).toEqual({ operands: ['-m'], unknown: [] });
  });

  test('when specify only unknown program option and allowUnknownOption and program has subcommands and no action handler then display help', () => {
    const program = new commander.Command();
    program
      .configureHelp({ formatHelp: () => '' })
      .exitOverride()
      .allowUnknownOption()
      .command('foo');
    let caughtErr;
    try {
      program.parse(['--unknown'], { from: 'user' });
    } catch (err) {
      caughtErr = err;
    }
    expect(caughtErr.code).toEqual('commander.help');
  });
});
