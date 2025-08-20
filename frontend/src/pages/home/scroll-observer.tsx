import { useEffect, useRef } from 'react';

type Props = {
  onIntersection: () => void;
};

function ScrollObserver({ onIntersection }: Props) {
  const observerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(([{ isIntersecting }]) => {
      if (!isIntersecting) return;

      onIntersection();
    });

    observer.observe(observerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [onIntersection]);

  return <span ref={observerRef} style={{ display: 'block', height: '1px' }} />;
}

export { ScrollObserver };
