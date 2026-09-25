import { onBeforeUnmount, reactive, ref } from 'vue';

/** A touch has to rest this long before it picks a card up; sooner is a scroll. */
const HOLD_MS = 300;
/** Pixels a pointer may wander before it counts as moving. */
const MOVE_TOLERANCE = 8;
/** Distance from the top or bottom edge at which dragging scrolls the page. */
const SCROLL_EDGE = 80;
const SCROLL_STEP = 12;

/** Which drop zone the dragged card is over: a category, null for unassigned. */
export const hoveredDropZone = ref<string | null | undefined>(undefined);

/** Drop zones carry data-drop-category; an empty value means "unassigned". */
function dropZoneAt(x: number, y: number): string | null | undefined {
  const zone = document
    .elementFromPoint(x, y)
    ?.closest<HTMLElement>('[data-drop-category]');
  if (!zone) return undefined;
  return zone.dataset.dropCategory || null;
}

const startsOnControl = (event: PointerEvent) =>
  (event.target as Element).closest('input, select, button, img, a') !== null;

export function useDragToCategory(onDrop: (category: string | null) => void) {
  const isDragging = ref(false);
  const offset = reactive({ x: 0, y: 0 });
  let start = { x: 0, y: 0, scrollY: 0 };
  let holdTimer: ReturnType<typeof setTimeout> | undefined;
  let pointerType = '';

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0 || startsOnControl(event)) return;
    start = { x: event.clientX, y: event.clientY, scrollY: window.scrollY };
    pointerType = event.pointerType;
    if (pointerType !== 'mouse') holdTimer = setTimeout(pickUp, HOLD_MS);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', stop);
    window.addEventListener('touchmove', keepPageStill, { passive: false });
    document.addEventListener('selectstart', preventSelection);
  }

  function pickUp() {
    getSelection()?.removeAllRanges();
    isDragging.value = true;
  }

  /** Long presses and drags would otherwise select whatever they cross. */
  function preventSelection(event: Event) {
    event.preventDefault();
  }

  function onPointerMove(event: PointerEvent) {
    const movedX = event.clientX - start.x;
    const movedY = event.clientY - start.y;
    const hasMoved = Math.hypot(movedX, movedY) > MOVE_TOLERANCE;

    if (!isDragging.value) {
      if (!hasMoved) return;
      if (pointerType === 'mouse') pickUp();
      else return stop(); // moved before the hold finished: it is a scroll
    }

    if (event.clientY < SCROLL_EDGE) window.scrollBy(0, -SCROLL_STEP);
    if (event.clientY > window.innerHeight - SCROLL_EDGE) {
      window.scrollBy(0, SCROLL_STEP);
    }
    offset.x = movedX;
    offset.y = movedY + window.scrollY - start.scrollY;
    hoveredDropZone.value = dropZoneAt(event.clientX, event.clientY);
  }

  function onPointerUp(event: PointerEvent) {
    if (isDragging.value) {
      const category = dropZoneAt(event.clientX, event.clientY);
      if (category !== undefined) onDrop(category);
    }
    stop();
  }

  function keepPageStill(event: TouchEvent) {
    if (isDragging.value) event.preventDefault();
  }

  function stop() {
    clearTimeout(holdTimer);
    isDragging.value = false;
    offset.x = 0;
    offset.y = 0;
    hoveredDropZone.value = undefined;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', stop);
    window.removeEventListener('touchmove', keepPageStill);
    document.removeEventListener('selectstart', preventSelection);
  }

  onBeforeUnmount(stop);

  return { isDragging, offset, onPointerDown };
}
