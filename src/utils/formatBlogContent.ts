/**
 * Automatically formats blog content for better readability
 * Splits long text blocks into paragraphs and adds proper spacing
 */
export function formatBlogContent(content: string): string {
  if (!content) return '';

  // If content already has paragraph tags, return as is
  if (content.includes('<p>') || content.includes('<div>')) {
    return content;
  }

  // Remove any existing HTML tags except common formatting ones
  let text = content.trim();

  // Split by double line breaks first (explicit paragraphs)
  const explicitParagraphs = text.split(/\n\n+/);
  
  const formattedParagraphs: string[] = [];

  explicitParagraphs.forEach(block => {
    // Remove single line breaks within a block
    block = block.replace(/\n/g, ' ').trim();
    
    if (!block) return;

    // Split long blocks into smaller paragraphs (every 4-6 sentences)
    const sentences = block.match(/[^.!?]+[.!?]+/g) || [block];
    
    let currentParagraph: string[] = [];
    let sentenceCount = 0;

    sentences.forEach((sentence, index) => {
      sentence = sentence.trim();
      if (!sentence) return;

      currentParagraph.push(sentence);
      sentenceCount++;

      // Create a new paragraph every 4-5 sentences, or if we detect certain patterns
      const shouldBreak = 
        sentenceCount >= 5 || // Max 5 sentences per paragraph
        (sentenceCount >= 3 && (
          // Break on transition words/phrases
          sentence.match(/\b(în plus|de asemenea|pe de altă parte|în concluzie|în primul rând|în al doilea rând|astfel|prin urmare|totuși|cu toate acestea)\b/i) ||
          // Break before questions
          sentence.trim().endsWith('?') ||
          // Break on style mentions or recommendations
          sentence.match(/\b(stil|stilul|recomandare|alegere|culori|dimensiune)\b/i)
        ));

      if (shouldBreak || index === sentences.length - 1) {
        if (currentParagraph.length > 0) {
          formattedParagraphs.push(currentParagraph.join(' '));
          currentParagraph = [];
          sentenceCount = 0;
        }
      }
    });

    // Add any remaining sentences
    if (currentParagraph.length > 0) {
      formattedParagraphs.push(currentParagraph.join(' '));
    }
  });

  // Wrap each paragraph in <p> tags with proper spacing
  return formattedParagraphs
    .filter(p => p.trim())
    .map(p => `<p class="mb-6">${p.trim()}</p>`)
    .join('\n');
}

/**
 * Process content for display - ensures proper formatting
 */
export function processBlogContentForDisplay(content: string): string {
  const formatted = formatBlogContent(content);
  
  // Additional processing for display
  return formatted
    // Ensure proper spacing after punctuation
    .replace(/([.!?])([A-ZĂÂÎȘȚ])/g, '$1 $2')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    // Preserve Romanian special characters
    .trim();
}
