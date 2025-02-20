'use client'

import { useState, useCallback, useEffect } from 'react'
import styles from '../page.module.css'
import Link from 'next/link'

type RankingRecord = {
  moves: number;
  date: string;
  timestamp?: number;
}

const FifteenPuzzle = () => {
  const SOLVED_STATE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0]
  const [board, setBoard] = useState<number[]>([])
  const [isCleared, setIsCleared] = useState(false)
  const [moveCount, setMoveCount] = useState(0)
  const [ranking, setRanking] = useState<RankingRecord[]>([])

  const shuffleBoard = useCallback(() => {
    const numbers = [...SOLVED_STATE]
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]]
    }
    return numbers
  }, [SOLVED_STATE])

  const generateSolvableBoard = useCallback(() => {
    const isSolvable = (board: number[]) => {
      let inversions = 0;
      for (let i = 0; i < board.length - 1; i++) {
        for (let j = i + 1; j < board.length; j++) {
          if (board[i] && board[j] && board[i] > board[j]) {
            inversions++;
          }
        }
      }
      
      // 空白マスの位置（下から数えた行数）
      const emptyIndex = board.indexOf(0);
      const emptyRow = Math.floor(emptyIndex / 4);
      const rowFromBottom = 4 - emptyRow;
      
      // 4×4の場合の解けるパズルの条件
      return (rowFromBottom % 2 === 1) === (inversions % 2 === 0);
    };

    let newBoard;
    do {
      newBoard = shuffleBoard();
    } while (!isSolvable(newBoard));
    
    return newBoard;
  }, [shuffleBoard])

  useEffect(() => {
    setBoard(generateSolvableBoard())
  }, [generateSolvableBoard])

  useEffect(() => {
    const savedRanking = localStorage.getItem('fifteenPuzzleRanking')
    if (savedRanking) {
      setRanking(JSON.parse(savedRanking))
    }
  }, [])

  useEffect(() => {
    if (board.length > 0 && JSON.stringify(board) === JSON.stringify(SOLVED_STATE) && !isCleared) {
      setIsCleared(true)
      const newRecord: RankingRecord = {
        moves: moveCount,
        date: new Date().toLocaleDateString('ja-JP'),
        timestamp: Date.now()
      }
      
      const newRanking = [...ranking, newRecord]
        .sort((a, b) => {
          if (a.moves !== b.moves) {
            return a.moves - b.moves;
          }
          return (b.timestamp || 0) - (a.timestamp || 0);
        })
        .filter((record, index, self) => 
          index === self.findIndex(r => r.moves === record.moves)
        )
        .slice(0, 5);

      setRanking(newRanking)
      localStorage.setItem('fifteenPuzzleRanking', JSON.stringify(newRanking))
    }
  }, [board, moveCount, SOLVED_STATE, isCleared, ranking])

  const handleReset = () => {
    setBoard(generateSolvableBoard())
    setIsCleared(false)
    setMoveCount(0)
  }

  const handleTileClick = (index: number) => {
    if (isCleared) return
    
    const emptyIndex = board.indexOf(0)
    if (!isMovable(index, emptyIndex)) return
    
    const newBoard = [...board]
    ;[newBoard[index], newBoard[emptyIndex]] = [newBoard[emptyIndex], newBoard[index]]
    setBoard(newBoard)
    setMoveCount(prev => prev + 1)
  }

  const isMovable = (tileIndex: number, emptyIndex: number) => {
    const row = Math.floor(tileIndex / 4)
    const col = tileIndex % 4
    const emptyRow = Math.floor(emptyIndex / 4)
    const emptyCol = emptyIndex % 4

    return (
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow)
    )
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.contentContainer}>
          <div className={styles.gameArea}>
            <div className={styles.header}>
              <h1 className={styles.title}>15パズル</h1>
              <Link href="/" className={styles.navButton}>
                8パズルへ
              </Link>
            </div>
            <div className={styles.stats}>
              <div className={styles.moveCount}>
                手数: {moveCount}
              </div>
            </div>
            <div className={`${styles.board} ${styles.boardFifteen}`}>
              {board.map((tile, index) => (
                <button
                  key={index}
                  className={`${styles.tile} ${isCleared ? styles.cleared : ''}`}
                  onClick={() => handleTileClick(index)}
                  disabled={tile === 0}
                >
                  {tile !== 0 ? tile : ''}
                </button>
              ))}
            </div>
            {isCleared && (
              <div className={styles.clearMessage}>
                🎉 {moveCount}手でクリア！ 🎉
              </div>
            )}
            <button 
              className={styles.resetButton}
              onClick={handleReset}
            >
              {isCleared ? 'もう一度遊ぶ' : 'シャッフル'}
            </button>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.rankingContainer}>
              <h2 className={styles.rankingTitle}>ベスト記録</h2>
              {ranking.length > 0 ? (
                <div className={styles.rankingList}>
                  {ranking.map((record, index) => (
                    <div key={index} className={styles.rankingItem}>
                      <span className={styles.rankingRank}>#{index + 1}</span>
                      <span className={styles.rankingMoves}>{record.moves}手</span>
                      <span className={styles.rankingDate}>{record.date}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.noRanking}>記録はまだありません</p>
              )}
            </div>

            <div className={styles.sampleContainer}>
              <p className={styles.sampleTitle}>クリア状態</p>
              <div className={`${styles.sampleBoard} ${styles.sampleBoardFifteen}`}>
                {SOLVED_STATE.map((tile, index) => (
                  <div key={index} className={styles.sampleTile}>
                    {tile !== 0 ? tile : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default FifteenPuzzle 