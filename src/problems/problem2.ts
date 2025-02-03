type CellType = 'Land' | 'Sea';
type Grid = CellType[][];

function countIslands(grid: Grid): number {
    if (!grid || grid.length === 0) return 0;

    const rows = grid.length;
    const cols = grid[0].length;
    let islandCount = 0;

    // 매개변수 grid와 같은 행렬을 가진 이중배열 visited 초기화
    const visited: boolean[][] = [];
    for (let i = 0; i < rows; i++) {
        visited[i] = [];
        for (let j = 0; j < cols; j++) {
            visited[i][j] = false;
        }
    }

    // 좌표가 유효한지 체크
    function isValid(row: number, col: number): boolean {
        return row >= 0 && row < rows && col >= 0 && col < cols;
    }

    // 연결된 땅 탐색하는 함수 생성
    function isConnectedLandFindFunction(row: number, col: number): void {
        // 유효하지 않은 좌표인 경우 종료
        if (!isValid(row, col)) {
            return;
        }
        // 이미 방문한 좌표인 경우 종료
        if (visited[row][col]) {
            return;
        }
        // Sea인 경우 종료
        if (grid[row][col] === 'Sea') {
            return;
        }

        // 방문 체크
        visited[row][col] = true;

        // 8방향 체크 (상하좌우 + 대각선)
        isConnectedLandFindFunction(row - 1, col - 1);  // 왼쪽 위
        isConnectedLandFindFunction(row - 1, col);      // 위
        isConnectedLandFindFunction(row - 1, col + 1);  // 오른쪽 위
        isConnectedLandFindFunction(row, col - 1);      // 왼쪽
        isConnectedLandFindFunction(row, col + 1);      // 오른쪽
        isConnectedLandFindFunction(row + 1, col - 1);  // 왼쪽 아래
        isConnectedLandFindFunction(row + 1, col);      // 아래
        isConnectedLandFindFunction(row + 1, col + 1);  // 오른쪽 아래
    }

    // 모든 좌표 탐색
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            // 방문하지 않은 땅을 찾으면 새로운 섬 발견
            if (!visited[i][j] && grid[i][j] === 'Land') {
                isConnectedLandFindFunction(i, j);
                islandCount++;
            }
        }
    }

    return islandCount;
}

// 문제 테스트
const testGrid: Grid = [
    ['Land', 'Sea', 'Land', 'Sea', 'Sea'],
    ['Land', 'Sea', 'Sea', 'Sea', 'Sea'],
    ['Land', 'Sea', 'Land', 'Sea', 'Land'],
    ['Land', 'Sea', 'Sea', 'Land', 'Sea']
];

console.log('섬의 개수:', countIslands(testGrid));