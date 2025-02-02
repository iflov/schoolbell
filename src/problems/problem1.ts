// TODO : 1, 3, 5, 7, 9 숫자를 각각 한 번씩만 사용하여 만들 수 있는 두 개의 숫자(예: 13, 579) 중에서, 그 곱이 가장 큰 조합을 찾는 스크립트를 작성해 주세요.

function findMaxProduct(): void {
    const digits = [1, 3, 5, 7, 9];
    let maxProduct = 0;
    let maxCombination: { num1: number, num2: number } = { num1: 0, num2: 0 };

    // 모든 가능한 조합을 생성하는 함수
    function generateCombinations(arr: number[], length: number): number[][] {
        if (length === 1) return arr.map(num => [num]);

        const combinations: number[][] = [];

        for (let i = 0; i < arr.length; i++) {
            const remainingElements = [...arr.slice(0, i), ...arr.slice(i + 1)];
            const subCombinations = generateCombinations(remainingElements, length - 1);

            subCombinations.forEach(subComb => {
                combinations.push([arr[i], ...subComb]);
            });
        }

        return combinations;
    }

    // 1자리부터 4자리까지의 모든 조합을 확인
    for (let len1 = 1; len1 <= 4; len1++) {
        const len2 = 5 - len1; // 남은 숫자들로 두 번째 숫자를 만듦

        // 첫 번째 숫자의 모든 조합
        const combinations1 = generateCombinations(digits, len1);

        combinations1.forEach(comb1 => {
            // 첫 번째 숫자에 사용되지 않은 숫자들
            const remainingDigits = digits.filter(d => !comb1.includes(d));

            // 두 번째 숫자의 모든 조합
            const combinations2 = generateCombinations(remainingDigits, len2);

            combinations2.forEach(comb2 => {
                // 숫자 조합을 실제 숫자로 변환
                const num1 = parseInt(comb1.join(''));
                const num2 = parseInt(comb2.join(''));

                // 곱 계산 및 최대값 업데이트
                const product = num1 * num2;
                if (product > maxProduct) {
                    maxProduct = product;
                    maxCombination = { num1, num2 };
                }
            });
        });
    }

    console.log(`최대 곱을 만드는 조합:`);
    console.log(`첫 번째 숫자: ${maxCombination.num1}`);
    console.log(`두 번째 숫자: ${maxCombination.num2}`);
    console.log(`최대 곱: ${maxProduct}`);
}

// 함수 실행
findMaxProduct();