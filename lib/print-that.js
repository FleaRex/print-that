'use babel';

const { CompositeDisposable, Range, Point } = require('atom');
import packageConfig from './config.json';


export default {

  config: packageConfig,
  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'print-that:printSelected': () => this.printSelected()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  printSelected() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      this.addPrintStatements(editor)
    }
  },

  addPrintStatements(editor) {
    let ranges = editor.getSelectedBufferRanges()
    let lineRanges = []
    for (var i = 0; i < ranges.length; i++) {
      lineRanges = lineRanges.concat(this.splitRangeIntoRows(editor, ranges[i]))
    }
    for (var i = 0; i < lineRanges.length; i++) {
      this.addPrintForRange(editor, lineRanges[i])
    }
  },

  addPrintForRange(editor, range) {
    if (range.isEmpty()) {
      range = this.reselectRow(editor, range)
    }
    text = this.getPrintText(editor, editor.getTextInBufferRange(range))
    editor.setTextInBufferRange(range, text)
  },

  reselectRow(editor, range) {
    return this.getWholeLineRange(editor, range.start)
  },

  splitRangeIntoRows(editor, range) {
    let start = range.start
    let end = range.end
    let endRow = end.column === 0 ? end.row - 1 : end.row
    var ranges = []
    for (let row = start.row; row <= endRow; row++) {
        ranges.push(this.getWholeLineRange(editor, row))
    }
    return ranges
  },

  getWholeLineRange(editor, row) {
    editor.setCursorBufferPosition([row, 0])
    editor.moveToFirstCharacterOfLine()
    let startPosition = editor.getCursorBufferPosition()
    editor.moveToEndOfLine()
    let endPosition = editor.getCursorBufferPosition()
    return new Range(startPosition, endPosition)
  },

  getPrintText(editor, selectedText) {
    let template = this.getPrintTemplate(editor)
    return template.replace('%', selectedText)
  },

  getPrintTemplate(editor) {
    let language = editor.getGrammar().name
    switch (language) {
      case "JavaScript":
        return atom.config.get('print-that.jsPrint')
      case "PHP":
        return atom.config.get('print-that.phpPrint')
      case "Python":
        return atom.config.get('print-that.pythonPrint')
      case "Java":
        return atom.config.get('print-that.javaPrint')
      default:
        return atom.config.get('print-that.defaultPrint')
    }

  }
};
