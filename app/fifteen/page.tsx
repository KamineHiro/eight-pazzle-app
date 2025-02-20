'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import styles from '../page.module.css'
import Link from 'next/link'

type RankingRecord = {
  id: number;
  moves: number;
  date: string;
  gameType: string;
}

const FifteenPuzzle = () => {
  const SOLVED_STATE = useMemo(() => 
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0], 
  [])
  const [board, setBoard] = useState<number[]>([])
  const [isCleared, setIsCleared] = useState(false)
  const [moveCount, setMoveCount] = useState(0)
  const [ranking, setRanking] = useState<RankingRecord[]>([])

  const fetchRankings = async () => {
    try {
      const response = await fetch('/api/rankings?gameType=fifteen')
      if (!response.ok) throw new Error('Failed to fetch rankings')
      const data = await response.json()
      setRanking(data)
    } catch (error) {
      console.error('Failed to fetch rankings:', error)
    }
  }

  const handleClear = useCallback(async () => {
    setIsCleared(true)
    try {
      await fetch('/api/rankings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moves: moveCount, gameType: 'fifteen' })
      })
      await fetchRankings()
    } catch (error) {
      console.error('Failed to update ranking:', error)
    }
  }, [moveCount])

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
      
      const emptyIndex = board.indexOf(0);
      const emptyRow = Math.floor(emptyIndex / 4);
      const rowFromBottom = 4 - emptyRow;
      
      return (rowFromBottom % 2 === 1) === (inversions % 2 === 0);
    };

    let newBoard;
    do {
      newBoard = shuffleBoard();
    } while (!isSolvable(newBoard));
    
    return newBoard;
  }, [shuffleBoard])

  useEffect(() => {
    const initialize = async () => {
      const initialBoard = generateSolvableBoard();
      setBoard(initialBoard);
      await fetchRankings();
    }
    initialize();
  }, [generateSolvableBoard])

  useEffect(() => {
    const isSolved = board.length > 0 && 
                    JSON.stringify(board) === JSON.stringify(SOLVED_STATE);
    
    if (isSolved && !isCleared) {
      handleClear();
    }
  }, [board, SOLVED_STATE, isCleared, handleClear])

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
              {board.map((number, index) => (
                <button
                  key={index}
                  className={`${styles.tile} ${isCleared ? styles.cleared : ''}`}
                  onClick={() => handleTileClick(index)}
                  disabled={number === 0}
                >
                  {number === 0 ? '' : number}
                </button>
              ))}
            </div>

            {isCleared && (
              <div className={styles.clearMessage}>
                クリア！
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
                    <div key={record.id} className={styles.rankingItem}>
                      <span className={styles.rankingRank}>#{index + 1}</span>
                      <span className={styles.rankingMoves}>{record.moves}手</span>
                      <span className={styles.rankingDate}>
                        {new Date(record.date).toLocaleDateString()}
                      </span>
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