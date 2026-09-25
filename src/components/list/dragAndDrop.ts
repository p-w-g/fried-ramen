export function droppedExpenseId(event: DragEvent): number | null {
  const id = Number.parseInt(event.dataTransfer?.getData('cardID') ?? '', 10);
  return Number.isNaN(id) ? null : id;
}
