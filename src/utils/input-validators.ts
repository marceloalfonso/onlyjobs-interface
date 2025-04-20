export function blockSpaceKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === ' ') {
    e.preventDefault();
  }
}

export function blockPasteWithSpaces(
  e: React.ClipboardEvent<HTMLInputElement>
) {
  const pastedText = e.clipboardData.getData('text');

  if (pastedText.includes(' ')) {
    e.preventDefault();
  }
}
