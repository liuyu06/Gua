"use strict";
// Strict Mode, 防止使用未声明的变量/ 禁止一些不安全的操作
// Object.defineProperty(exports, "__esModule", { value: true });
// // 为对象添加一个属性，或修改现有属性的特性 
// exports.fuzzyScore = fuzzyScore;
// // 将 fuzzyScore 函数导出，使得 fuzzyScore 函数可以在其他文件中使用 
// exports.isPatternInWord = isPatternInWord;

// var _maxLen = 128;
// 定义一个常量 _maxLen，值为 128

var _maxLen = 3
function initTable() {
    var table = [];
    var row = [0];
    for (var i = 1; i <= _maxLen; i++) {
        row.push(-i);
    }
    // row.push（-i) 将 -i 添加到 row 数组的末尾，类似append 
    for (var i = 0; i <= _maxLen; i++) {
        var thisRow = row.slice(0);
        thisRow[0] = -i;
        // 此时thisRow = [-i, -1, -2, -3, -4] 为一个数组
        table.push(thisRow);
    }
    return table;
}

var result = initTable();
console.log(result);
// 类似print()