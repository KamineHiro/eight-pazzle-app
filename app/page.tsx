'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import styles from './page.module.css'
import Link from 'next/link'

// ランキングの型定義
type RankingRecord = {
  id: number;
  moves: number;
  date: string;
  gameType: string;
}

const EightPuzzle = () => {
  const SOLVED_STATE = useMemo(() => [1, 2, 3, 4, 5, 6, 7, 8, 0], [])
  const [board, setBoard] = useState<number[]>([])
  const [isCleared, setIsCleared] = useState(false)
  const [moveCount, setMoveCount] = useState(0)
  const [ranking, setRanking] = useState<RankingRecord[]>([])

  // 1. fetchRankingsを先に定義
  const fetchRankings = async () => {
    try {
      const response = await fetch('/api/rankings?gameType=eight')
      if (!response.ok) throw new Error('Failed to fetch rankings')
      const data = await response.json()
      setRanking(data)
    } catch (error) {
      console.error('Failed to fetch rankings:', error)
    }
  }

  // 2. handleClearを次に定義
  const handleClear = useCallback(async () => {
    setIsCleared(true)
    try {
      await fetch('/api/rankings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moves: moveCount, gameType: 'eight' })
      })
      await fetchRankings()
    } catch (error) {
      console.error('Failed to update ranking:', error)
    }
  }, [moveCount])

  // 3. その他の関数を定義
  const shuffleBoard = useCallback(() => {
    const numbers = [...SOLVED_STATE]
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]]
    }
    return numbers
  }, [SOLVED_STATE])

  // 解けるパズルを生成する関数を8パズル用に戻す
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
      return inversions % 2 === 0;
    };

    let newBoard;
    do {
      newBoard = shuffleBoard();
    } while (!isSolvable(newBoard));
    
    return newBoard;
  }, [shuffleBoard])

  // 初期化
  useEffect(() => {
    const initialize = async () => {
      const initialBoard = generateSolvableBoard();
      setBoard(initialBoard);
      await fetchRankings();
    }
    initialize();
  }, [generateSolvableBoard]) // 依存配列に追加

  // ボードの状態監視
  useEffect(() => {
    const isSolved = board.length > 0 && 
                    JSON.stringify(board) === JSON.stringify(SOLVED_STATE);
    
    if (isSolved && !isCleared) {
      handleClear();
    }
  }, [board, SOLVED_STATE, isCleared, handleClear]) // 依存配列に追加

  // リセットボタンのハンドラー
  const handleReset = () => {
    setBoard(generateSolvableBoard())
    setIsCleared(false)
    setMoveCount(0)  // 手数リセット
  }

  // タイルをクリックしたときの処理
  const handleTileClick = (index: number) => {
    if (isCleared) return // クリア後は操作を無効化
    
    const emptyIndex = board.indexOf(0)
    
    // 移動可能かチェック（上下左右に隣接しているか）
    if (!isMovable(index, emptyIndex)) return
    
    // ボードの状態を更新
    const newBoard = [...board]
    ;[newBoard[index], newBoard[emptyIndex]] = [newBoard[emptyIndex], newBoard[index]]
    setBoard(newBoard)
    setMoveCount(prev => prev + 1)  // 手数カウントアップ
  }

  // タイルが移動可能か判定する関数を3x3用に戻す
  const isMovable = (tileIndex: number, emptyIndex: number) => {
    const row = Math.floor(tileIndex / 3)
    const col = tileIndex % 3
    const emptyRow = Math.floor(emptyIndex / 3)
    const emptyCol = emptyIndex % 3

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
              <h1 className={styles.title}>8パズル</h1>
              <Link href="/fifteen" className={styles.navButton}>
                15パズルへ
              </Link>
            </div>
            <div className={styles.stats}>
              <div className={styles.moveCount}>
                手数: {moveCount}
              </div>
            </div>
            <div className={styles.board}>
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
              <div className={styles.sampleBoard}>
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

export default EightPuzzle
