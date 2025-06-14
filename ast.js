/*
@Author: Aloha
@Time: 2025/6/14 16:25
@ProjectName: tongdun_ast
@FileName: ast.py
@Software: PyCharm
*/

const vm = require('vm');
const files = require('fs');
const types = require("@babel/types");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const generator = require("@babel/generator").default;


class TongDun {
    constructor(file_path) {
        this.ast = parser.parse(files.readFileSync(file_path, "utf-8"));
        this.context = vm.createContext({
            window: global
        });
        this.stringPool = null;
        this.stn = null
    }

    save_file() {
        const {code: newCode} = generator(this.ast);
        files.writeFileSync(
            './decode.js',
            newCode,
            "utf-8"
        );
    }

    ydo() {
        let htc, btx, nex, pyv = [];
        traverse(this.ast, {
            FunctionDeclaration: (path) => {
                let {id, params, body} = path.node;
                if (!types.isIdentifier(id)) return;
                if (params.length !== 2) return;
                if (body.body.length !== 1) return;
                if (!types.isReturnStatement(body.body[0])) return;
                if (!types.isBinaryExpression(body.body[0].argument)) return;
                htc = id.name;
                btx = body.body[0].argument.operator;
                pyv.push([htc, btx]);
                path.remove()
            }
        });
        pyv.forEach(res => {
            traverse(this.ast, {
                CallExpression: {
                    exit(path) {
                        let {callee, arguments: args} = path.node;
                        if (!types.isIdentifier(callee)) return;
                        if (args.length !== 2) return;
                        if (callee.name !== res[0]) return;
                        nex = types.binaryExpression(res[1], args[0], args[1]);
                        path.replaceWith(nex)
                    }
                }
            })
        })
    }

    jbz() {
        traverse(this.ast, {
            BinaryExpression: {
                exit(path) {
                    let {left, operator, right} = path.node;
                    if (!types.isNumericLiteral(left)) return;
                    if (!types.isNumericLiteral(right)) return;

                    let bts = eval(generator(path.node).code);
                    path.replaceWith(types.numericLiteral(bts));
                }
            }
        });
    }

    hea() {
        let hax, juv, jrv, kys, mtv, ltq, oif, gbx;
        traverse(this.ast, {
            CallExpression: (path) => {
                let {parentPath, node} = path;
                if (!types.isExpressionStatement(parentPath.node)) return;
                let {callee, arguments: args} = node;
                if (!types.isFunctionExpression(callee)) return;
                if (args.length === 0) return;
                if (!types.isStringLiteral(args[0])) return;
                hax = args[0].value;
                juv = callee.params[0].name;
                this.stn = juv;
                path.stop()
            }
        });
        traverse(this.ast, {
            CallExpression: (path) => {
                let {parentPath, node} = path;
                if (!types.isExpressionStatement(parentPath.node)) return;
                let {callee, arguments: args} = node;
                if (!types.isFunctionExpression(callee)) return;
                if (args.length === 0) return;
                if (!types.isFunctionExpression(args[0])) return;
                let {id, params, body} = args[0];
                if (id !== null) return;
                if (params.length !== 0) return;
                if (body.body.length < 10) return;
                jrv = body.body[0].expression.right.callee.name;
                mtv = path.get("arguments")[0];
                kys = mtv.scope.getBinding(jrv);
                ltq = generator(kys.path.node).code;
                oif = ltq + '\n' + 'var ' + juv + ` = "${hax}"` + '\n' + jrv + `("${hax}")`;
                this.stringPool = vm.runInContext(oif, this.context);
                path.stop()
            }
        })
    }

    huz() {
        traverse(this.ast, {
            MemberExpression: (path) => {
                let {object, property} = path.node;
                if (!types.isIdentifier(object)) return;
                if (!types.isNumericLiteral(property)) return;
                if (object.name !== this.stn) return;
                let gnw = this.stringPool[property.value];
                path.replaceWith(types.stringLiteral(gnw));
            }
        })
    }

    start() {
        this.ydo();
        this.jbz();
        this.hea();
        this.huz();
        this.save_file();
    }

}

console.time('处理完毕，耗时');

let td_ast = new TongDun('./fullcode.js');
td_ast.start();


console.timeEnd('处理完毕，耗时');


