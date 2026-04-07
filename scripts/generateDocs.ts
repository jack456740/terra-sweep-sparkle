import { Project, SyntaxKind, Node, FunctionDeclaration, VariableDeclaration } from 'ts-morph';
import * as fs from 'fs';

const project = new Project();
project.addSourceFilesAtPaths([
  'src/components/**/*.tsx',
  'src/pages/**/*.tsx',
  'src/App.tsx'
]);

let markdown = `# Component Documentation\n\nThis document describes all React components derived from the project, their purpose, and expected properties.\n\n`;

function extractDoc(node: FunctionDeclaration | VariableDeclaration, name: string, filePath: string) {
  let description = "No description provided.";
  
  let jsDocs = [];
  if (Node.isFunctionDeclaration(node)) {
    jsDocs = node.getJsDocs();
  } else if (Node.isVariableDeclaration(node)) {
    const statement = node.getVariableStatement();
    if (statement) jsDocs = statement.getJsDocs();
  }

  if (jsDocs.length > 0) {
     const doc = jsDocs[0];
     description = doc.getDescription().trim();
  } else {
     // fallback
     description = `${name} component.`;
  }

  const parameters = node.isKind(SyntaxKind.VariableDeclaration) 
    ? (node.getInitializerIfKind(SyntaxKind.ArrowFunction)?.getParameters() || [])
    : (node as FunctionDeclaration).getParameters();

  let propsStr = 'None';
  
  if (parameters.length > 0) {
    const p = parameters[0];
    const typeNode = p.getTypeNode();
    if (typeNode) {
       propsStr = `\`${typeNode.getText().replace(/\s+/g, ' ')}\``;
    } else {
       const type = p.getType();
       propsStr = `\`${type.getText().replace(/\s+/g, ' ')}\``;
    }

    // Try to get more detailed prop typing if it's an interface
    const type = p.getType();
    if (type.isObject() && !type.isAny()) {
        const propsArr = type.getProperties().map(pr => {
             const decl = pr.getValueDeclaration();
             const typeText = decl ? decl.getType().getText() : 'any';
             return `- **${pr.getName()}**: \`${typeText.replace(/\n| /g, '')}\``;
        });
        if (propsArr.length > 0) {
            propsStr += `\n\n**Props Detail:**\n${propsArr.join('\n')}`;
        }
    }
  }

  const relativePath = filePath.replace(/.*src[\\\/]/, 'src/');

  markdown += `## ${name}\n\n`;
  markdown += `**File:** \`${relativePath}\`\n\n`;
  markdown += `**Description:**\n${description}\n\n`;
  markdown += `**Props:**\n${propsStr}\n\n`;
  markdown += `---\n\n`;
}

// Separate components by custom and UI primitives for better readability
const customComponents: {node: any, name: string, file: string}[] = [];
const uiComponents: {node: any, name: string, file: string}[] = [];

for (const sourceFile of project.getSourceFiles()) {
  const filePath = sourceFile.getFilePath();
  const isUi = filePath.includes('components/ui') || filePath.includes('components\\ui');
  const targetList = isUi ? uiComponents : customComponents;

  const functions = sourceFile.getFunctions();
  for (const func of functions) {
    const name = func.getName();
    if (name && /^[A-Z]/.test(name)) {
      targetList.push({node: func, name, file: filePath});
    }
  }

  const variableStatements = sourceFile.getVariableStatements();
  for (const statement of variableStatements) {
    const declarations = statement.getDeclarations();
    for (const decl of declarations) {
      const name = decl.getName();
      if (name && /^[A-Z]/.test(name)) {
        const init = decl.getInitializer();
        if (init && (Node.isArrowFunction(init) || Node.isFunctionExpression(init))) {
           targetList.push({node: decl, name, file: filePath});
        }
      }
    }
  }
}

markdown += `# Application Components\n\n`;
customComponents.sort((a,b) => a.name.localeCompare(b.name)).forEach(c => extractDoc(c.node, c.name, c.file));

markdown += `# UI Primitive Components\n\n`;
uiComponents.sort((a,b) => a.name.localeCompare(b.name)).forEach(c => extractDoc(c.node, c.name, c.file));

fs.writeFileSync('C:/Users/Alvin/.gemini/antigravity/brain/ea55ca0a-fea4-475d-bd8f-940135858ae2/components_documentation.md', markdown);
console.log('Successfully generated C:/Users/Alvin/.gemini/antigravity/brain/ea55ca0a-fea4-475d-bd8f-940135858ae2/components_documentation.md');
