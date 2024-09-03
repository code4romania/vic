import React, { useEffect, useRef, useState } from 'react';
import Button from './Button';
import DOMPurify from 'dompurify';
import { useTranslation } from 'react-i18next';

interface ContentExpanderProps {
  fullContent: string;
  maxHeight?: number;
}

/**
 * This component renders expandable content with a "Show More/Less" functionality.
 *
 * @param {string} fullContent - The full HTML content to be displayed/expanded
 * @param {number} maxHeight - The maximum height (in pixels) before content is truncated
 *
 *
 * Features:
 * - Automatically detects if content needs expansion (height > 144px by default)
 * - Truncates content with a gradient overlay when collapsed
 * - Toggles between expanded and collapsed states
 * - Sanitizes HTML content for safe rendering
 *
 * @returns {JSX.Element} Rendered ContentExpander component
 */

export const ContentExpander = ({ fullContent, maxHeight = 144 }: ContentExpanderProps) => {
  const { t } = useTranslation('general');
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // see if the content inside has a bigger height than 144px
  // we use this to decide if we should display the see more/less button
  useEffect(() => {
    if (contentRef.current) {
      setNeedsExpansion(contentRef.current.scrollHeight > maxHeight); // h-36 = 36 * 4 = 144px
    }
  }, [fullContent]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="">
      <div className="relative">
        <div
          ref={contentRef}
          className={`${needsExpansion && !isExpanded ? 'max-h-36 overflow-hidden' : ''}`}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(fullContent || ''),
          }}
        ></div>

        {/* fade to white overlay*/}
        {needsExpansion && !isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-transparent"></div>
        )}
      </div>
      {needsExpansion && (
        <Button
          label={isExpanded ? t('hide') : t('show')}
          onClick={toggleExpand}
          className="text-blue-500 hover:underline"
        ></Button>
      )}
    </div>
  );
};
