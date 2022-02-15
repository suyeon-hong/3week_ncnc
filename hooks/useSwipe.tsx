import React, { useCallback, useEffect, useState, useRef, useMemo } from 'react';

interface useSwipeProps<T> {
  list: T[];
  windowWidth: number;
}

const useSwipe = <Type extends unknown>(payload: useSwipeProps<Type>) => {
  const { list, windowWidth } = payload;

  const ORIGIN_LIST_LENGTH = list.length;
  const COUNT_COPYIED_TOTAL = 3;

  const swipeRef = useRef<HTMLUListElement>(null);
  const lastPositionXRef = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(ORIGIN_LIST_LENGTH);
  const [itemList, setItemList] = useState<Type[]>([]);
  const [isTransition, setIsTransition] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeStartX, setSwipeStartX] = useState(0);
  const [swipeEndX, setSwipeEndX] = useState(0);
  const [draggedX, setDraggedX] = useState(0);

  const initialIndexOforiginSlide = useMemo(() => {
    return Math.floor((ORIGIN_LIST_LENGTH * COUNT_COPYIED_TOTAL) / 2);
  }, [list]);

  useEffect(() => {
    // @NOTE: 초기화 작업
    setItemList([...list, ...list, ...list]);

    if (windowWidth) {
      setPosition((initialIndexOforiginSlide - 1) * -windowWidth);
      lastPositionXRef.current = (initialIndexOforiginSlide - 1) * -windowWidth;
    }
  }, [windowWidth]);

  useEffect(() => {}, []);

  useEffect(() => {
    //@NOTE: 드래그 될 때마다 transform 위치 변경
    if (!swipeRef.current) return;
    if (swipeRef.current && isDragging) {
      setPosition(lastPositionXRef.current - (swipeStartX - swipeEndX));
    }
  }, [swipeRef.current, swipeEndX]);

  const handleTransitionEnd = useCallback(() => {
    console.log(currentIndex);

    if (currentIndex === 0 || currentIndex === ORIGIN_LIST_LENGTH * 2) {
      // @NOTE: 현재 인덱스가 복붙한 인덱스일 때 transition을 끔
      setIsTransition(false);
    }
  }, [currentIndex]);

  useEffect(() => {
    //@NOTE: 바꿔치기
    if (!swipeRef.current) return;
    let intervalId: NodeJS.Timer;

    if (!isTransition) {
      // @NOTE: Transition이 꺼지면 처음으로 옮김
      setPosition((initialIndexOforiginSlide - 1) * -windowWidth);
      lastPositionXRef.current = (initialIndexOforiginSlide - 1) * -windowWidth;
      setCurrentIndex(ORIGIN_LIST_LENGTH);
      setTimeout(() => {
        // @NOTE: 바꾸고 0.1초 후에 다시 애니메이션 넣어줌
        setIsTransition(true);
      }, 100);
    }

    if (!isDragging) {
      // @NOTE: 자동슬라이드
      intervalId = setTimeout(() => {
        shiftSlide('right');
      }, 3000);
    }

    return () => clearTimeout(intervalId);
  }, [currentIndex, isTransition, isDragging]);

  useEffect(() => {
    if (!isDragging && draggedX !== 0) {
      if (-draggedX <= -windowWidth / 4) {
        shiftSlide('right');
      } else if (-draggedX >= windowWidth / 4) {
        shiftSlide('left');
      } else {
        shiftSlide('none');
      }
    }
  }, [draggedX]);

  const setPosition = (scrolledValue: number) => {
    if (swipeRef.current) {
      swipeRef.current.style.transform = `
  		translate3d(${scrolledValue}px, 0, 0)`;
    }
  };

  const shiftSlide = (direction: string) => {
    switch (direction) {
      case 'right': {
        setPosition(lastPositionXRef.current - windowWidth);
        lastPositionXRef.current -= windowWidth;
        setCurrentIndex((prevIndex) => prevIndex + 1);
        break;
      }
      case 'left':
        setPosition(lastPositionXRef.current + windowWidth);
        lastPositionXRef.current += windowWidth;
        setCurrentIndex((prevIndex) => prevIndex - 1);
        break;
      default:
        setPosition(lastPositionXRef.current);
    }
  };

  const mouseStart = (e: React.MouseEvent<HTMLUListElement>) => {
    // @NOTE: 왼쪽 마우스 클릭일 때만
    if (e.buttons === 1) {
      setSwipeStartX(e.clientX);
      setIsDragging(true);
    }
  };

  const touchStart = (e: React.TouchEvent<HTMLUListElement>) => {
    setSwipeStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const dragMove = (e: React.MouseEvent<HTMLUListElement>) => {
    if (!isDragging) return;

    if (e.buttons === 1) {
      setSwipeEndX(e.clientX);
    }
  };

  const touchMove = (e: React.TouchEvent<HTMLUListElement>) => {
    if (!isDragging) return;

    setSwipeEndX(e.touches[0].clientX);
  };

  const dragEnd = () => {
    setIsDragging(false);
    setDraggedX(swipeStartX - swipeEndX);
  };

  return {
    COUNT_COPYIED_TOTAL,
    itemList,
    swipeRef,
    currentIndex,
    isTransition,
    mouseStart,
    touchStart,
    dragMove,
    touchMove,
    dragEnd,
    handleTransitionEnd,
  };
};

export default useSwipe;
