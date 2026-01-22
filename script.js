document.addEventListener('DOMContentLoaded', () => {
    const drawBtn = document.getElementById('draw-btn');
    const clearBtn = document.getElementById('clear-btn');
    const exportBtn = document.getElementById('export-btn');
    const countInput = document.getElementById('count-input');
    const resultArea = document.getElementById('result-area');

    // State: Store all drawn numbers to ensure global uniqueness until clear
    const drawnNumbers = new Set();
    const MAX_NUMBER = 99;

    // Utility to get random int between min and max (inclusive)
    const getRandomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    drawBtn.addEventListener('click', () => {
        const count = parseInt(countInput.value);

        // Validation
        if (isNaN(count) || count < 1) {
            alert('請輸入至少 1 個號碼');
            countInput.value = 1;
            return;
        }
        if (count > 5) {
            alert('一次最多只能抽選 5 個號碼');
            countInput.value = 5;
            return;
        }

        // Check if we have enough numbers left
        if (drawnNumbers.size + count > MAX_NUMBER) {
            const remaining = MAX_NUMBER - drawnNumbers.size;
            if (remaining === 0) {
                alert('所有號碼 (1-99) 都已抽完！請按下 CLEAR 重置。');
            } else {
                alert(`只剩下 ${remaining} 個號碼可抽，無法一次抽選 ${count} 個。`);
            }
            return;
        }

        // Remove placeholder if it's the first draw
        const placeholder = resultArea.querySelector('.placeholder-text');
        if (placeholder) {
            placeholder.remove();
        }

        // Generate unique numbers for this batch
        const newBatch = [];
        while (newBatch.length < count) {
            const num = getRandomInt(1, MAX_NUMBER);
            // Ensure strictly unique across ALL drawn numbers
            if (!drawnNumbers.has(num)) {
                drawnNumbers.add(num);
                newBatch.push(num);
            }
        }

        // Render new balls
        // We calculate delay based on how many balls are ALREADY in the DOM to make it flow nicely,
        // or just local batch delay. Local batch delay feels more responsive for each click.
        newBatch.forEach((num, index) => {
            const ball = document.createElement('div');
            ball.className = 'ball';
            ball.textContent = num;
            ball.style.animationDelay = `${index * 0.1}s`; // Stagger animation for this batch

            // Insert at the beginning (prepend) or end (append)?
            // "Accumulate" usually implies appending.
            resultArea.appendChild(ball);
        });

        // Optional: Scroll to bottom if needed, but flex wrap handles it well.
    });

    clearBtn.addEventListener('click', () => {
        drawnNumbers.clear();
        resultArea.innerHTML = '<div class="placeholder-text">準備抽選</div>';
    });

    exportBtn.addEventListener('click', () => {
        if (drawnNumbers.size === 0) {
            alert('目前沒有任何號碼可匯出');
            return;
        }

        const numbersArray = Array.from(drawnNumbers).sort((a, b) => a - b);
        const csvContent = numbersArray.join(',');

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const second = String(now.getSeconds()).padStart(2, '0');

        const filename = `${year}${month}${day}${hour}${minute}${second}.csv`;

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });
});
