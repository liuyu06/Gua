const enum Direction {
    Top = 0b1,    // 二进制 1
    Diag = 0b10,  // 二进制 10
    Left = 0b100  // 二进制 100
}

// 使用枚举
// 给出 Direction.Up，表示上移 需要输出什么？
const move = Direction.Top;
console.log(move); 
// const move = Direction.Down; // 等同于 const move = 2;
// 输出: 1

const directions: Direction[] = [Direction.Top, Direction.Diag, Direction.Left];
console.log(directions);   // 输出: [ 1, 2, 4 ]


// 等同于 const currentDirection = 1 | 4;
/*
    1: 0001
    4: 0100
    1 | 4 = 0101 = 5 【 | 表示 或 运算/ 组合，只要有一个为1，结果就为1, 在二进制上面两列】
    1 & 4 = 0000 = 0 【 & 表示 与 运算/ 检查，两个都为1，结果才为1】    
*/
const currentDirection = Direction.Top | Direction.Left; 
console.log((currentDirection & Direction.Top) !== 0);
console.log((currentDirection & Direction.Left) !== 0);
console.log((currentDirection & Direction.Diag) !== 0);