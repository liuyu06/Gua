function initTable() {
	const table: number[][] = [];
	const row: number[] = [0];
	for (let i = 1; i <= _maxLen; i++) {
		row.push(-i);
	}
	for (let i = 0; i <= _maxLen; i++) {
		const thisRow = row.slice(0);
		thisRow[0] = -i;
		table.push(thisRow);
	}
	return table;
}
const _maxLen = 3;
const enum Arrow { Top = 0b1, Diag = 0b10, Left = 0b100 }
// 0b1:二进制 1/ 十进制 1； 0b10:二进制 10 / 十进制 2； 0b100:二进制 100 / 十进制 4 
// _arrows[i][j] = Arrow.Top | Arrow.Left | Arrow.Diag，每个单元格的方向信息
// 例如：_arrows[i][j] & Arrow.Top 判断是否存在上箭头
// const enum ：表示枚举类型，不会生成真实对象，只是在编译时替换成常量

/*
	const enum direction { top = 1, left = 2}
	const move = direction.left 
	console.log(move)
	——> 输出为2 
	给定变量输出 2，因为在编译时，const move = direction.left 会被替换成 const move = 2
*/
const _table = initTable();
const _scores = initTable();
const _arrows = <Arrow[][]>initTable();

const _debug = false; // 表示调试信息 关闭

