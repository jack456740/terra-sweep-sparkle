import { Project, SyntaxKind, Node, FunctionDeclaration, VariableDeclaration } from 'ts-morph';

const project = new Project();
project.addSourceFilesAtPaths([
  'src/components/**/*.tsx',
  'src/pages/**/*.tsx',
  'src/App.tsx'
]);

function toTitleCase(camelCase: string) {
  const result = camelCase.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function processComponent(node: FunctionDeclaration | VariableDeclaration, name: string) {
  // If it already has JSDoc, skip
  let hasJsDoc = false;
  if (Node.isFunctionDeclaration(node) && node.getJsDocs().length > 0) {
    hasJsDoc = true;
  }
  if (Node.isVariableDeclaration(node)) {
    const statement = node.getVariableStatement();
    if (statement && statement.getJsDocs().length > 0) {
      hasJsDoc = true;
    }
  }

  if (hasJsDoc) return;

  const desc = toTitleCase(name).trim();
  const description = `${desc} component.`;
  
  const parameters = node.isKind(SyntaxKind.VariableDeclaration) 
    ? (node.getInitializerIfKind(SyntaxKind.ArrowFunction)?.getParameters() || [])
    : (node as FunctionDeclaration).getParameters();

  let paramDocs = '';
  if (parameters.length > 0) {
    const p = parameters[0];
    const paramName = p.getName() || 'props';
    // Sometimes components use destructured props.
    // If it's destructured, we still call the param "props" in the tsdoc if there's no name, 
    // or whatever you like. For TSDoc standard on React components, it's usually:
    paramDocs = `\n * \n * @param ${paramName.startsWith('{') ? 'props' : paramName} - The component props.`;
  }

  const tagDoc = `/**\n * ${description}${paramDocs}\n * @returns The rendered ${desc} component.\n */\n`;

  if (Node.isFunctionDeclaration(node)) {
    // Add JSDoc to function declaration
    node.addJsDoc({
      description: `${description}${paramDocs}\n@returns The rendered ${desc} component.`
    });
  } else if (Node.isVariableDeclaration(node)) {
    const statement = node.getVariableStatement();
    if (statement) {
      statement.addJsDoc({
        description: `${description}${paramDocs}\n@returns The rendered ${desc} component.`
      });
    }
  }
}

for (const sourceFile of project.getSourceFiles()) {
  let modified = false;

  // Process function declarations
  const functions = sourceFile.getFunctions();
  for (const func of functions) {
    const name = func.getName();
    if (name && /^[A-Z]/.test(name)) { // Heuristic for React component
      processComponent(func, name);
      modified = true;
    }
  }

  // Process variable declarations (arrow functions)
  const variableStatements = sourceFile.getVariableStatements();
  for (const statement of variableStatements) {
    const declarations = statement.getDeclarations();
    for (const decl of declarations) {
      const name = decl.getName();
      if (name && /^[A-Z]/.test(name)) {
        const init = decl.getInitializer();
        if (init && (Node.isArrowFunction(init) || Node.isFunctionExpression(init))) {
          processComponent(decl, name);
          modified = true;
        } else if (init && Node.isCallExpression(init)) {
           // Maybe React.forwardRef or React.memo
           const expression = init.getExpression();
           const text = expression.getText();
           if (text.includes('forwardRef') || text.includes('memo')) {
              processComponent(decl, name);
              modified = true;
           }
        }
      }
    }
  }

  if (modified) {
    sourceFile.saveSync();
    console.log(`Updated ${sourceFile.getFilePath()}`);
  }
}
